export interface PengeluaranType {
  id: number
  tanggal: Date
  warehouseId: string
  petugasId: string
  penerimaId: string
  keterangan?: string
  permintaanId: string
  status: string
  createdAt: Date
  createdBy: string
  items: {
    designator: string
    qty: number
    keterangan?: string
    satuan?: string
  }[]
}

export interface PengeluaranFilter {
  tanggal?: Date
  warehouseId?: string
  petugasId?: string
  penerimaId?: string
  keterangan?: string
  status?: string
  sortBy?: 'tanggal' | 'tujuanWh' | 'status' | 'project'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}
