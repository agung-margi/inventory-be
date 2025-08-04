export default interface CustomerType {
  id: string
    name: string
    email: string
    phone: string
    address: string
    createdAt: Date
    createdBy: string
    updatedAt?: Date
    updatedBy?: string
    deletedAt?: Date
    deletedBy?: string
}