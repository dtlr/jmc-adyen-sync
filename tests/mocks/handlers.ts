import { HttpResponse, http } from 'msw'
import { StoresReturn } from './mocks'

export const handlers = [
  http.get(`https://${process.env.ADYEN_ENDPOINT!}/v3/stores`, () =>
    HttpResponse.json(StoresReturn),
  ),
  http.get(`https://${process.env.ADYEN_ENDPOINT!}/v3/terminals`, () =>
    HttpResponse.json({ data: [] }),
  ),
]
