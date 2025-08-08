export default interface TransaksiType {
  id: number
  tanggal: Date
  from_wh: string
  to_wh?: string
  to_user?: string
  tipe_transaksi: number
  status: string
  petugas: string
  penerima?: string
  confirmAt?: Date
  confirmBy?: string
  createdAt: Date
  createdBy: string
  items: {
    designator: string; 
    qty: number; 
  }[];
}