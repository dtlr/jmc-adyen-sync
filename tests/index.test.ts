import { suite, test, expect, vi, describe, afterEach, beforeAll, afterAll } from 'vitest'
import axios from 'axios'
import { fetchAdyenData } from '../src/index'
import { server } from './mocks/node'

// const mocks = vi.hoisted(() => ({
//   get: vi.fn(),
// }))

// vi.mock('axios', async () => {
//   const actual = await vi.importActual<typeof axios>('axios')
//   const mockAxios = {
//     default: {
//       ...actual.defaults,
//       get: mocks.get,
//     },
//   }
//   return mockAxios
// })

suite('API and Database Operations', () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
  })
  afterEach(() => {
    server.resetHandlers()
  })
  afterAll(() => {
    server.close()
  })

  describe('fetchAdyenData', async () => {
    test('should call get with the correct URL', async () => {
      const mockData = [
        { id: 1, name: 'Test 1', value: 'Value 1' },
        { id: 2, name: 'Test 2', value: 'Value 2' },
      ]

      // mocks.get.mockResolvedValueOnce({ data: mockData })

      const result = await fetchAdyenData()

      expect(result).toEqual(mockData)
    })

    test('should handle API errors', async () => {
      // vi.mocked(axios.get).mockRejectedValueOnce(new Error('API Error'))

      await expect(fetchAdyenData()).rejects.toThrow('API Error')
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
