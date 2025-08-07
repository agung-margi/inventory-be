import { PrismaClient } from '@prisma/client'
import WarehouseType, { WarehouseFilter } from './warehouse.type'
import { v4 as uuidv4 } from 'uuid'
import { getNowWIB } from '../../utils/date'

const prisma = new PrismaClient()

const generateKodeWH = async () =>{
    const lastWarehouse = await prisma.warehouse.findFirst({
        orderBy: {
    kode_wh: 'desc',
  },
  where: {
    kode_wh: {
      startsWith: 'WH',
    },
  },
})
let nextNumber = 1




if (lastWarehouse?.kode_wh) {
    const lastNumber = parseInt(lastWarehouse.kode_wh.replace('WH',''))
    nextNumber = lastNumber + 1
}

// format code WH0001 dan seterusnya

const newKodeWH = `WH${nextNumber.toString().padStart(4, '0')}`
return newKodeWH
}


export const createWHService = async (payload: WarehouseType, userId: string) => {
    const kode_wh = await generateKodeWH()

    const newWarehouse =  await prisma.warehouse.create({
        data : {
            id: uuidv4(),
            kode_wh: kode_wh,
            nama_wh : payload.nama_wh,
            alamat : payload.alamat,
            createdAt:getNowWIB(),
            createdBy: userId,
            
        }
    })
    return newWarehouse
}

export const updateWHService = async (id:string, payload: WarehouseType, userId: string) => {

  if (!id) {
    throw new Error('Warehouse ID is required')
  }

  const existingWH = await prisma.warehouse.findUnique({
    where: {
      id
    }
  })

  if (!existingWH) {
    throw new Error('Warehouse tidak ditemukan')
  }

  // UPDATE
  const updateWH = await prisma.warehouse.update({
    where: {id},
    data: {
      nama_wh: payload.nama_wh,
      alamat: payload.alamat,
      updatedAt: getNowWIB(),
      updatedBy: userId,
    }
  })

  return updateWH
}

export const deleteWHService = async (id: string, userId: string) => {
  if (!id) {
    throw new Error('Warehouse ID is required')
  }

  const warehouse = await prisma.warehouse.findUnique({
    where: { id }
  })

  if (!warehouse) {
    throw new Error('Warehouse tidak ditemukan')
  }

  const deleteWarehouse = await prisma.warehouse.update({
    where: {id},
    data:{
      deletedAt: getNowWIB(),
      deletedBy: userId
    }
  })
  return deleteWarehouse
}

export const getWHByIdService = async (id: string) => {
  if (!id) {
    throw new Error('Warehouse ID is required')
  } else {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id }
    })
    return {
      data: warehouse
    }
  }
}

export const getAllWHService = async (filters: WarehouseFilter) => {
  const { kode_wh, nama_wh, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = filters

  const skip = (page - 1) * limit

  const [warehouse, total] = await Promise.all([
    prisma.warehouse.findMany({
      where: {
        ...(kode_wh && { kode_wh: { contains: kode_wh, mode: 'insensitive' } }),
        ...(nama_wh && { nama_wh: { contains: nama_wh, mode: 'insensitive' }}),
        deletedAt: null
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit
    }),
    // total warehouse
    prisma.warehouse.count({
      where: {
        ...(kode_wh && { kode_wh: { contains: kode_wh, mode: 'insensitive' } }),
        ...(nama_wh && { nama_wh: { contains: nama_wh, mode: 'insensitive' }}),
        deletedAt: null
      }
    })
  ])
  return {
    data: warehouse,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }
}

