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


export interface PermintaanType {
  id: number
  tanggal: Date
  tujuanWh: string
  pemintaId: string
  status: string
  project?: string
  catatan: string
  createdAt: Date
  createdBy: string
  items: {
    designator: string
    qty: number
  }[]
}

export interface PermintaanFilter {
  id?: string
  tanggal?: string
  tujuanWh?: string
  status?: string
  project?: string
  sortBy?: 'tanggal' | 'tujuanWh' | 'status' | 'project'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

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
