import { PrismaClient } from '@prisma/client'
import ItemType, { ItemFilter } from './item.type'
import { v4 as uuidv4 } from 'uuid'
import { getNowWIB } from '../../utils/date'

const prisma = new PrismaClient()

export const createItemService = async (payload: ItemType, userId: string) => {
  
  const existingItem = await prisma.item.findUnique({
    where: {
      designator: payload.designator
    }
  })

  if (existingItem) {
    throw new Error('Item dengan designator ini sudah ada')
  }

  const existingItemByName = await prisma.item.findUnique({
    where: {
      nama_item: payload.nama_item
    }
  })

  if (existingItemByName) {
    throw new Error('Item dengan nama ini sudah ada')
  }

  if (existingItem) {
    throw new Error('Item dengan designator ini sudah ada')
  }

    const newItem =  await prisma.item.create({
        data : {
            id: uuidv4(),
            designator: payload.designator,
            nama_item : payload.nama_item,
            kategori : payload.kategori,
            satuan: payload.satuan ?? '',
            harga: 0,
            createdAt:getNowWIB(),
            createdBy: userId,
        }
    })
    return newItem
}

export const updateItemService = async (id:string, payload: ItemType, userId: string) => {

  if (!id) {
    throw new Error('Warehouse ID is required')
  }

  const existingItem = await prisma.warehouse.findUnique({
    where: {
      id
    }
  })

  if (!existingItem) {
    throw new Error('Warehouse tidak ditemukan')
  }

  // UPDATE
  const updateItem = await prisma.item.update({
    where: {id},
    data: {
      designator: payload.designator,
      nama_item: payload.nama_item,
      kategori: payload.kategori,
      updatedAt: getNowWIB(),
      updatedBy: userId,
    }
  })

  return updateItem
}

export const deleteItemService = async (id: string, userId: string) => {
  if (!id) {
    throw new Error('Item ID is required')
  }

  const item = await prisma.item.findUnique({
    where: { id }
  })

  if (!item) {
    throw new Error('Item tidak ditemukan')
  }

  const deleteItem = await prisma.item.update({
    where: {id},
    data:{
      deletedAt: getNowWIB(),
      deletedBy: userId
    }
  })
  return deleteItem
}

export const getItemByIdService = async (id: string) => {
  if (!id) {
    throw new Error('Item ID is required')
  } else {
    const item = await prisma.item.findUnique({
      where: { id, deletedAt: null }
    })
    return {
      data: item
    }
  }
}

export const getAllItemService = async (filters: ItemFilter) => {
  const { designator, nama_item,kategori, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = filters

  const skip = (page - 1) * limit

  const [item, total] = await Promise.all([
    prisma.item.findMany({
      where: {
        ...(designator && { designator: { contains: designator, mode: 'insensitive' } }),
        ...(nama_item && { nama_item: { contains: nama_item, mode: 'insensitive' }}),
        ...(kategori && { kategori: { contains: kategori, mode: 'insensitive' }}),
        deletedAt: null
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit
    }),
    // total warehouse
    prisma.item.count({
      where: {
        ...(designator && { designator: { contains: designator, mode: 'insensitive' } }),
        ...(nama_item && { nama_item: { contains: nama_item, mode: 'insensitive' }}),
        ...(kategori && { kategori: { contains: kategori, mode: 'insensitive' }}),
        deletedAt: null
      }
    })
  ])
  return {
    data: item,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }
}

