export interface TAGType {
  id: number
  dariWh: string
  keWh: string
  petugasId: string
  mover: string
  status: string
  catatan?: string
  tanggal: Date
  items: {
    satuan: any
    designator: string
    qty: number
    keterangan?: string
  }[]
}


export interface TAGFilter {
  dariWh?: string
  keWh?: string
  mover?: string
  status?: string
  tanggal?: Date
  sortBy?: 'tangga'|'dariWh' | 'keWh' | 'mover' | 'status'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}