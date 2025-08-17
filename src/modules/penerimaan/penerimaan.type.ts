
export interface PenerimaanType {
  id: number
  tanggal: Date
  pengirimanId: string
  warehouseId: string
  petugasId: string
  penerimaId: string
  sumber: string
  jenis: string
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

export interface PenerimaanFilter {
  tanggal?: Date
  pengirimanId?: string
  jenis?: string
  status?: string
  createdAt?: Date
  createdBy?: string
  sortBy?: 'tanggal' | 'pengirimanId' | 'jenis' | 'status'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}


