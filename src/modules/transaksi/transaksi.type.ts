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
    designator: string; 
    qty: number;
    keterangan?: string;
    satuan?: string;
  }[];
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
    designator: string; 
    qty: number;
    keterangan?: string;
    satuan?: string;
  }[];
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
    designator: string; 
    qty: number;
  }[];
}


export interface PermintaanFilter {
    id?: string,
    tanggal?: string,
    tujuanWh?:string,
    status?: string,
    project?: string,
    sortBy?: 'tanggal' | 'tujuanWh' | 'status' | 'project'
    sortOrder?: 'asc' | 'desc'
    page?: number
    limit?: number
}