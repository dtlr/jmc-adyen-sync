export type AdyenTerminalsResponse = {
  _links: Links
  itemsTotal: number
  pagesTotal: number
  data: TerminalData[]
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
