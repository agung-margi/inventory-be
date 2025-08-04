export default interface ProductType {
  id: string
  name: string
  speed: number
  price: number
  description: string
  isAvailable: boolean
  createdAt: Date
  createdBy: string
  updatedAt?: Date
  updatedBy?: string
  deletedAt?: Date
  deletedBy?: string
}

export interface ProductFilter {
  name?: string
  speed?: number
  price?: number
  sortBy?: 'name' | 'speed' | 'price'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}
