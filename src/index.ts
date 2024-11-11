import axios from 'axios'
import { drizzle } from 'drizzle-orm/node-postgres'
import dotenv from 'dotenv'
import { AdyenTerminalsResponse } from './types'
import url from 'node:url'

// Load environment variables
dotenv.config()

// Database configuration
const connectionString =
  process.env.DATABASE_URL ||
  `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`

const db = drizzle({ connection: connectionString, casing: 'snake_case' })

export async function fetchApiData(): Promise<AdyenTerminalsResponse[]> {
  try {
    const response = await axios.get<AdyenTerminalsResponse[]>(
      `https://${process.env.ADYEN_ENDPOINT}/v3/terminals`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-key': process.env.ADYEN_KEY,
        },
      },
    )
    return response.data
  } catch (error) {
    console.error('Error fetching API data:', error)
    throw error
  }
}

// export async function updateDatabase(data: ApiData[]): Promise<void> {
//   try {
//     // Using a transaction
//     await db.transaction(async (tx) => {
//       for (const item of data) {
//         // Check if record exists
//         const existing = await tx.select()
//           .from(yourTable)
//           .where(eq(yourTable.id, item.id))
//           .limit(1);

//         if (existing.length > 0) {
//           // Update
//           await tx.update(yourTable)
//             .set({
//               name: item.name,
//               value: item.value
//             })
//             .where(eq(yourTable.id, item.id));
//         } else {
//           // Insert
//           await tx.insert(yourTable)
//             .values({
//               id: item.id,
//               name: item.name,
//               value: item.value
//             });
//         }
//       }
//     });

//     console.log(`Successfully updated ${data.length} records`);
//   } catch (error) {
//     console.error('Error updating database:', error);
//     throw error;
//   }
// }

async function main() {
  try {
    const data = await fetchApiData()
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
