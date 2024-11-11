export type AdyenTerminalsResponse = {
  _links: Links
  itemsTotal: number
  pagesTotal: number
  data: TerminalData[]
}

export type AdyenStoresResponse = {
  _links: Links
  itemsTotal: number
  pagesTotal: number
  data: StoreData[]
}

interface Links {
  first: {
    href: string
  }
  last: {
    href: string
  }
  next: {
    href: string
  }
  self: {
    href: string
  }
}

export interface StoreData {
  id: string
  description: string
  reference: string
  status: string
  merchantId: string
  phoneNumber: string
  address: Address
  _links: Pick<Links, 'self'>
}

export interface Address {
  line1: string
  line2: string
  line3: string
  city: string
  postalCode: string
  stateOrProvince: string
  country: string
}

export interface TerminalData {
  id: string
  model: string
  serialNumber: string
  firmwareVersion: string
  assignment: Assignment
  connectivity: Connectivity
}

interface Assignment {
  companyId: string
  merchantId: string
  storeId: string
  status: string
  reassignmentTarget: ReassignmentTarget
}

interface ReassignmentTarget {
  inventory: boolean
}

interface Connectivity {
  cellular: Cellular
  wifi: Wifi
}

interface Cellular {
  iccid: string
}

interface Wifi {
  ipAddress: string
  macAddress: string
}
