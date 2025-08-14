import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import { getNowWIB } from '../../utils/date'
import { StockFilter, StockType } from './stock.type'
const prisma = new PrismaClient()

export const getAllStockService = async (filters: StockFilter) => {
  const { kode_wh, designator,satuan, available, transit, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = filters

  const skip = (page - 1) * limit

  const [stock, total] = await Promise.all([
    prisma.stock.findMany({
      where: {
        ...(kode_wh && { kode_wh: { contains: kode_wh, mode: 'insensitive' } }),
        ...(designator && { designator: { contains: designator, mode: 'insensitive' }}),
        ...(satuan && { satuan: { contains: satuan, mode: 'insensitive' }}),
        ...(available && { available: { gte: available  }}),
        ...(transit && { transit: { gte: transit }}),
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
        ...(designator && { designator: { contains: designator, mode: 'insensitive' }}),
        ...(satuan && { satuan: { contains: satuan, mode: 'insensitive' }}),
        ...(available && { available: { gte: available , mode: 'insensitive' }}),
        ...(transit && { transit: { gte: transit , mode: 'insensitive' }}),
        deletedAt: null
      }
    })
  ])
  return {
    data: stock,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }
}

