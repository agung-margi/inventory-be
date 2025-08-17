
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