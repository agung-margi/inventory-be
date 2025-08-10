import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import { getNowWIB } from '../../utils/date'
import {PengeluaranType, PenerimaanType, PermintaanType, PermintaanFilter} from './transaksi.type'
import { generateDocId } from '../../utils/gemerateIDDoc'

const prisma = new PrismaClient()

export const TransaksiOutService = async (payload: PengeluaranType, userId: string) => {

  
const pengeluaranId = await generateDocId(
  'OUT', 
  payload.warehouseId, 
  'pengeluaran'
);

  const newTransaksi = await prisma.$transaction(async (tx) => {
    // 1. VALIDASI SEMUA ITEM
    for (const item of payload.items) {
      const stock = await tx.stock.findFirst({
        where: {
          kode_wh: payload.warehouseId,
          designator: item.designator
        }
      })

      if (!stock) {
        throw new Error(`Stok untuk designator "${item.designator}" tidak ditemukan di warehouse.`)
      }

      if (stock.available < item.qty) {
        throw new Error(
          `Stok untuk designator "${item.designator}" tidak mencukupi. Tersedia: ${stock.available}, Diminta: ${item.qty}`
        )
      }
    }

    // simpan header transaksi
    const header = await tx.pengeluaran.create({
      data: {
        pengeluaranId: pengeluaranId,
        tanggal: getNowWIB(),
        warehouseId : payload.warehouseId,
        petugasId: userId,
        penerimaId: payload.penerimaId,
        keterangan: payload.keterangan,
        permintaanId: payload.permintaanId,
        status: 'Completed',
        createdAt: getNowWIB(),
        createdBy: userId
      }
    })
    // simpan detail transaksi
    const details = payload.items.map((item) => ({
      id: uuidv4(),
      pengeluaranId: header.id,
      designator: item.designator,
      qty: item.qty,
      keterangan: '',
      createdAt: getNowWIB(),
      createdBy: userId
    }))
    await tx.pengeluaranDetail.createMany({
      data: details
    })

    // 4. UPDATE STOK
    for (const item of payload.items) {
      await tx.stock.updateMany({
        where: {
          kode_wh: payload.warehouseId,
          designator: item.designator
        },
        data: {
          available: {
            decrement: item.qty
          },
          updatedAt: getNowWIB(),
          updatedBy: userId
        }
      })
    }

    return header
  })
  return newTransaksi
}

export const saveTransaksiPenerimaan = async (payload: PenerimaanType, userId: string) => {
  const newTransaksi = await prisma.$transaction(async (tx) => {
    // simpan header transaksi
    const header = await tx.penerimaan.create({
      data: {
        tanggal: getNowWIB(),
        tujuanWh: payload.warehouseId,
        sumber: payload.sumber,
        jenis: payload.jenis,
        status: 'Completed',
        penerimaId: userId,
        keterangan: payload.keterangan,
        createdAt: getNowWIB(),
        createdBy: userId
      }
    })

    // simpan detail transaksi
    const details = payload.items.map((item) => ({
      id: uuidv4(),
      penerimaanId: header.id,
      designator: item.designator,
      qty: item.qty,
      keterangan: item.keterangan ?? '',
      createdAt: getNowWIB(),
      createdBy: userId
    }))
    await tx.penerimaanDetail.createMany({
      data: details
    })
    // 4. UPDATE STOK
    for (const item of payload.items) {
      await tx.stock.upsert({
        where: {
          // pastikan di model Prisma ada unique constraint untuk kombinasi kode_wh + designator
          kode_wh_designator: {
            kode_wh: payload.warehouseId,
            designator: item.designator
          }
        },
        update: {
          available: { increment: item.qty },
          updatedAt: getNowWIB(),
          updatedBy: userId
        },
        create: {
          kode_wh: payload.warehouseId,
          designator: item.designator,
          available: item.qty,
          satuan: item.satuan ?? '', // Ensure satuan is always a string
          createdAt: getNowWIB(),
          createdBy: userId
        }
      });
    }
    return header
  })
  return newTransaksi
}

export const saveTransaksiPermintaan = async (payload: PermintaanType, userId: string) => {
  const newTransaksi = await prisma.$transaction(async (tx) => {
    // simpan header transaksi
    const header = await tx.permintaan.create({
      data: {
        tanggal: getNowWIB(),
        tujuanWh: payload.tujuanWh,
        pemintaId: userId,
        status: 'pending',
        project: payload.project,
        catatan: payload.catatan,
        createdAt: getNowWIB(),
        createdBy: userId
      }
    })

    // simpan detail transaksi
    const details = payload.items.map((item) => ({
      id: uuidv4(),
      permintaanId: header.id,
      designator: item.designator,
      qty: item.qty,
      createdAt: getNowWIB(),
      createdBy: userId
    }))
    await tx.permintaanDetail.createMany({
      data: details
    })

    return header
  })
  return newTransaksi
}

export const approvePermintaanService = async (id: string, userId: string) => {
  const updatedTransaksi = await prisma.$transaction(async (tx) => {
    // Update the status of the permintaan
    const permintaan = await tx.permintaan.update({
      where: { id },
      data: { status: 'approved', updatedAt: getNowWIB(), updatedBy: userId }
    })
    return permintaan
  })
  return updatedTransaksi
}

export const getAllPermintaanService = async (filters: PermintaanFilter) =>{
  const {
    id,
    tanggal,
    tujuanWh,
    status,
    project,
    sortBy ='tanggal',
    sortOrder = 'desc',
    page = 1,
    limit = 10
  } = filters

  const permintaan = await prisma.permintaan.findMany({
    where: {
      ...(tanggal && {tanggal: {equals: tanggal}}),
      ...(tujuanWh && {tujuanWh: {contains: tujuanWh, mode: 'insensitive'}}),
      ...(status && {status: {contains: status, mode: 'insensitive'}}),
      ...(project && {project: {contains: project, mode: 'insensitive'}})
    },
    orderBy: {
      [sortBy]: sortOrder
    },
    skip: (page - 1) * limit,
    take: limit
  }),
  total = await prisma.permintaan.count({
    where: {
      ...(tanggal && {tanggal: {equals: tanggal}}),
      ...(tujuanWh && {tujuanWh: {contains: tujuanWh, mode: 'insensitive'}}),
      ...(status && {status: {contains: status, mode: 'insensitive'}}),
      ...(project && {project: {contains: project, mode: 'insensitive'}}),
      deletedAt: null
    }
  })

  return {
    data: permintaan,
    meta : {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit)
    }
  }
}


export const getPermintaanByIdService = async (id: string) => {
  const permintaan = await prisma.permintaan.findUnique({
    where: { id, deletedAt: null },
    include: {
      detail: true
    }
  })
  return permintaan
}
