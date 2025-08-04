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
