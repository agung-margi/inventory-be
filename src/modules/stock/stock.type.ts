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
