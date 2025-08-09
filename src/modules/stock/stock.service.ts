import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import { getNowWIB } from '../../utils/date'
import { StockType } from './stock.type'
const prisma = new PrismaClient()

export const saveStock = async (payload: StockType, userId: string) => {
  const newStock = await prisma.stock.create({
    data: {
      id: uuidv4(),
      kode_wh: payload.kode_wh,
      designator: payload.designator,
      satuan: payload.satuan,
      available: payload.available,
      createdAt: getNowWIB(),
      createdBy: userId
    }
  })
  return newStock
}
