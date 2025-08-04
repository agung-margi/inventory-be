import { PrismaClient } from '@prisma/client'
import ProductType, { ProductFilter } from './product.type'
import { v4 as uuidv4 } from 'uuid'
// import { ProductFilter } from './product.type'

const prisma = new PrismaClient()

export const saveProductService = async (payload: ProductType, userId: string) => {
  // checkProductExist
  const productExist = await prisma.products.findUnique({
    where: { name: payload.name },
    select: { id: true }
  })
  if (productExist) throw new Error('Produk sudah ada')
  const newProduct = await prisma.products.create({
    data: {
      id: uuidv4(),
      name: payload.name,
      speed: payload.speed,
      price: payload.price,
      description: payload.description,
      createdBy: userId
    }
  })
  return newProduct
}

export const getProductsService = async (filters: ProductFilter) => {
  const { name, speed, price, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = filters

  const skip = (page - 1) * limit

  const [products, total] = await Promise.all([
    prisma.products.findMany({
      where: {
        ...(name && { name: { contains: name, mode: 'insensitive' } }),
        ...(speed && { speed }),
        ...(price && { price }),
        deletedAt: null
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit
    }),
    // total product
    prisma.products.count({
      where: {
        ...(name && { name: { contains: name, mode: 'insensitive' } }),
        ...(speed && { speed }),
        ...(price && { price })
      }
    })
  ])
  return {
    data: products,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }
}

export const getProductByIdService = async (id: string) => {
  if (!id) {
    throw new Error('Product ID is required')
  } else {
    const product = await prisma.products.findUnique({
      where: { id }
    })
    return {
      data: product
    }
  }
}

export const updateProductService = async (id: string, payload: ProductType, userId: string) => {
  if (!id) {
    throw new Error('Product ID is required')
  }
  const product = await prisma.products.findUnique({
    where: { id }
  })
  if (!product) {
    throw new Error('Produk tidak ditemukan')
  }
  const updatedProduct = await prisma.products.update({
    where: { id },
    data: {
      name: payload.name,
      speed: payload.speed,
      price: payload.price,
      description: payload.description,
      updatedBy: userId
    }
  })
  return updatedProduct
}

export const deleteProductService = async (id: string, userId: string) => {
  if (!id) {
    throw new Error('Product ID is required')
  }
  const product = await prisma.products.findUnique({
    where: { id }
  })
  if (!product) {
    throw new Error('Produk tidak ditemukan')
  }
  const deletedProduct = await prisma.products.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      deletedBy: userId
    }
  })
  return deletedProduct
}