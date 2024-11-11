import axios from 'axios'
import { drizzle } from 'drizzle-orm/node-postgres'
import dotenv from 'dotenv'
import { AdyenStoresResponse, AdyenTerminalsResponse, StoreData, TerminalData } from './types.js'
import url from 'node:url'
import { devDevicePersonalization } from './db/schema.js'
import { eq } from 'drizzle-orm'
// Load environment variables
dotenv.config()

// Database configuration
const connectionString =
  process.env.DATABASE_URL ||
  `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`

const db = drizzle({ connection: connectionString, casing: 'snake_case' })
const posWrkIds = ['21', '22', '23', '24', '25', '26', '27', '28', '29']

const storeRefPattern = /^([A-Z]+)(\d+)$/
const parseStoreRef = (reference: string) => {
  const match = reference.match(storeRefPattern)
  if (!match) return null

  const [_, letters, numbers] = match
  return {
    prefix: letters,
    number: numbers,
  }
}
const findDifference = (arr1: string[], arr2: string[]): string[] => {
  return arr1.filter((item) => !arr2.includes(item))
}

export const fetchAdyenData = async ({
  type = 'stores',
  page = 1,
  pageSize = 100,
}: {
  type?: 'stores' | 'terminals'
  page?: number
  pageSize?: number
} = {}) => {
  try {
    let pagesTotal: number
    let data: (StoreData | TerminalData)[] = []

    do {
      const query =
        type === 'stores'
          ? `https://${process.env.ADYEN_ENDPOINT}/v3/stores?pageNumber=${page}&pageSize=${pageSize}`
          : `https://${process.env.ADYEN_ENDPOINT}/v3/terminals?pageNumber=${page}&pageSize=${pageSize}`
      const response = await axios.get<AdyenStoresResponse | AdyenTerminalsResponse>(query, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-key': process.env.ADYEN_KEY,
        },
      })
      pagesTotal = response.data.pagesTotal
      const apiData = response.data.data
      data = data.concat(apiData)
      page++
    } while (pagesTotal > page)

    return data
  } catch (error) {
    console.error('Error fetching API data:', error)
    throw error
  }
}

export const updateDatabase = async (data: [string, string, string][]) => {
  const dbEnv = process.env.DB_NAME?.split('-')[1]
  try {
    // Using a transaction
    await db.transaction(async (tx) => {
      for (const item of data) {
        // Check if record exists
        const existing = await tx
          .select()
          .from(devDevicePersonalization)
          .where(eq(devDevicePersonalization.deviceName, item[0]))
          .limit(1)
        const dbExistingWorkstations = await tx
          .select({ deviceId: devDevicePersonalization.deviceId })
          .from(devDevicePersonalization)
          .where(eq(devDevicePersonalization.businessUnitId, item[2]))
        const existingWorkstationIds = dbExistingWorkstations.map(
          (workstation) => workstation.deviceId?.split('-')[1],
        )
        if (existing.length > 0) {
          // Update
          await tx
            .update(devDevicePersonalization)
            .set({
              serverUrl: `https://${item[1].charAt(0).toLowerCase()}m${dbEnv?.charAt(0).toLowerCase()}.jdna.io`,
              appId: 'pos',
              deviceId: item[2] + '-' + existing[0]!.deviceId?.split('-')[1]!.padStart(3, '0'),
              businessUnitId: item[2],
              tagBusinessUnitId: item[2],
            })
            .where(eq(devDevicePersonalization.deviceName, item[0]))
        } else {

          const newWorkstationId = findDifference(
            posWrkIds,
            existingWorkstationIds.filter(Boolean) as string[],
          )[0]?.padStart(3, '0')
          if (!newWorkstationId) throw new Error('No new workstation ID found')
          // Insert
          await tx.insert(devDevicePersonalization).values({
            deviceName: item[0],
            serverUrl:`https://${item[1].charAt(0).toLowerCase()}m${dbEnv?.charAt(0).toLowerCase()}.jdna.io`,
            deviceId: `${item[2]}-${newWorkstationId}`,
            appId: 'pos',
            businessUnitId: item[2],
            tagBusinessUnitId: item[2],
          })
        }
      }
    })

    console.log(`Successfully updated ${data.length} records`)
  } catch (error) {
    console.error('Error updating database:', error)
    throw error
  }
}

async function main() {
  try {
    const stores = (await fetchAdyenData()) as StoreData[]
    const terminals = (await fetchAdyenData({ type: 'terminals' })) as TerminalData[]
    const mposDevices = terminals.filter(
      (terminal) =>
        terminal.model === 'S1E2L' && terminal.assignment.status.toLowerCase() === 'boarded',
    )
    const jmData: [string, string, string][] = []
    for (const mposDevice of mposDevices) {
      const store = stores.find((store) => store.id === mposDevice.assignment.storeId)
      if (!store?.reference) throw new Error(`Store ${mposDevice.assignment.storeId} not found`)
      const storeRef = parseStoreRef(store.reference)
      if (!storeRef?.prefix || !storeRef?.number)
        throw new Error(
          `Store ${store.id} reference, ${store.reference}, is not in the expected format.`,
        )
      jmData.push([mposDevice.id, storeRef?.prefix, storeRef?.number])
    }
    await updateDatabase(jmData)
    console.log('Cron job completed successfully')
  } catch (error) {
    console.error('Cron job failed:', error)
    process.exit(1)
  }
}

// Convert CommonJS module check to ESM
if (import.meta.url === url.pathToFileURL(process.argv[1]!).href) {
  main()
}
