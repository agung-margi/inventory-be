export interface StockType {
  id: number
  kode_wh: string
  designator: string
  satuan: string
  available: number
  transit?: number
  createdAt: Date
  createdBy: string
}



export interface StockFilter {
    kode_wh?: string,
    designator?: string,
    satuan?: string,
    available?: number,
    transit?: number,
    sortBy?: 'kode_wh' | 'designator' | 'satuan' | 'available' | 'transit'
    sortOrder?: 'asc' | 'desc'
    page?: number
    limit?: number
}