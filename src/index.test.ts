import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import { fetchApiData } from './index'
import { drizzle } from 'drizzle-orm/node-postgres'

vi.mock('axios')
vi.mock('drizzle-orm/postgres-js', () => ({
  drizzle: vi.fn()
}))

describe('API and Database Operations', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchApiData', () => {
    it('should successfully fetch data from API', async () => {
      const mockData = [
        { id: 1, name: 'Test 1', value: 'Value 1' },
        { id: 2, name: 'Test 2', value: 'Value 2' }
      ]

      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockData })

      const result = await fetchApiData()
      
      expect(result).toEqual(mockData)
      expect(axios.get).toHaveBeenCalledWith(process.env.API_URL)
    })

    it('should handle API errors', async () => {
      vi.mocked(axios.get).mockRejectedValueOnce(new Error('API Error'))

      await expect(fetchApiData()).rejects.toThrow('API Error')
    })
  })

//   describe('updateDatabase', () => {
//     it('should successfully update database', async () => {
//       const mockDb = {
//         transaction: vi.fn((callback) => callback(mockDb)),
//         select: vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => []) })) })) })),
//         insert: vi.fn(() => ({ values: vi.fn() })),
//         update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn() })) }))
//       }

//       vi.mocked(drizzle).mockReturnValue(mockDb as any)

//       const mockData = [
//         { id: 1, name: 'Test 1', value: 'Value 1' }
//       ]

//       await updateDatabase(mockData)

//       expect(mockDb.transaction).toHaveBeenCalled()
//       expect(mockDb.select).toHaveBeenCalled()
//       expect(mockDb.insert).toHaveBeenCalled()
//     })

//     it('should handle database errors', async () => {
//       const mockDb = {
//         transaction: vi.fn().mockRejectedValue(new Error('DB Error'))
//       }

//       vi.mocked(drizzle).mockReturnValue(mockDb as any)

//       const mockData = [
//         { id: 1, name: 'Test 1', value: 'Value 1' }
//       ]

//       await expect(updateDatabase(mockData)).rejects.toThrow('DB Error')
//     })
//   })
}) 