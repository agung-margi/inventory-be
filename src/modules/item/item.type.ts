export default interface ItemType {
    id: string
    designator: string
    nama_item: string
    kategori: string
    satuan?: string
    createdAt: Date
    createdBy: string
    updatedAt?: Date
    updatedBy?: string
    deletedAt?: Date
    deletedBy?: string
}

export interface ItemFilter {
    designator?: string,
    nama_item?: string,
    kategori?:string,
    sortBy?: 'designator' | 'nama_item' | 'kategori'
    sortOrder?: 'asc' | 'desc'
    page?: number
    limit?: number
}