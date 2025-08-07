export default interface WarehouseType {
    id: string
    kode_wh: string
    nama_wh: string
    alamat: string
    createdAt: Date
    createdBy: string
    updatedAt?: Date
    updatedBy?: string
    deletedAt?: Date
    deletedBy?: string
}

export interface WarehouseFilter {
    kode_wh?: string,
    nama_wh?: string,
    sortBy?: 'kode_wh' | 'nama_wh'
    sortOrder?: 'asc' | 'desc'
    page?: number
    limit?: number
}