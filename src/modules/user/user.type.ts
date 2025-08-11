export default interface UserType {
  id: string
  name?: string
  email: string
  phone?: string
  password: string
  confirm_password?: string
  isAdmin: boolean
  createdAt: Date
  createdBy: string
  updatedAt?: Date
  updatedBy?: string
  deletedAt?: Date
  deletedBy?: string
}


export interface UserFilter {
  nama?: string
  email?: string
  kode_wh?: string
  phone?: string
  role?: string
  sortBy?: 'nama' | 'kode_wh' | 'role'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}