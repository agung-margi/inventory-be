import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import { getNowWIB } from '../../utils/date'
import {
  PengeluaranType,
  PengeluaranFilter,
} from './transaksi.type'
import { generateOutID, } from '../../utils/gemerateIDDoc'

const prisma = new PrismaClient()

export const TransaksiOutService = async (payload: PengeluaranType, userId: string) => {
  const newTransaksi = await prisma.$transaction(async (tx) => {
    // 1. Ambil permintaan terkait
    const permintaan = await tx.permintaan.findUnique({
      where: { id: payload.permintaanId, deletedAt: null },
      select: { pemintaId: true, status: true }
    })

    if (!permintaan) {
      throw new Error(`Permintaan dengan ID ${payload.permintaanId} tidak ditemukan`)
    }

    // **Cek jika status sudah completed**
    if (permintaan.status === 'completed') {
      throw new Error(`Permintaan dengan ID ${payload.permintaanId} sudah selesai dan tidak bisa diproses lagi`)
    }
    // 2. VALIDASI SEMUA ITEM
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
        pengeluaranId: await generateOutID(),
        tanggal: getNowWIB(),
        warehouseId: payload.warehouseId,
        petugasId: userId,
        penerimaId: permintaan.pemintaId,
        keterangan: payload.keterangan,
        permintaanId: payload.permintaanId,
        status: 'completed',
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
  // Kurangi stok di warehouse
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

  // Tambah stok ke teknisi
  const existingTechStock = await tx.technicianStock.findFirst({
    where: {
      userId: permintaan.pemintaId,
      designator: item.designator
    }
  })

  if (existingTechStock) {
    await tx.technicianStock.update({
      where: { id: existingTechStock.id },
      data: {
        available: { increment: item.qty },
        updatedAt: getNowWIB(),
        updatedBy: userId
      }
    })
  } else {
    await tx.technicianStock.create({
      data: {
        userId: permintaan.pemintaId,
        designator: item.designator,
        available: item.qty,
        createdAt: getNowWIB(),
        createdBy: userId
      }
    })
  }
}

    return header
  })
  return newTransaksi
}


export const getAllPengeluaranService = async (filters: PengeluaranFilter) => {
  const {
    tanggal,
    warehouseId,
    petugasId,
    penerimaId,
    keterangan,
    status,
    sortBy = 'tanggal',
    sortOrder = 'desc',
    page = 1,
    limit = 10
  } = filters

  // Ambil pengeluaran
  const pengeluaran = await prisma.pengeluaran.findMany({
    where: {
      ...(warehouseId && { warehouseId: { contains: warehouseId, mode: 'insensitive' } }),
      ...(petugasId && { petugasId: { contains: petugasId, mode: 'insensitive' } }),
      ...(penerimaId && { penerimaId: { contains: penerimaId, mode: 'insensitive' } }),
      ...(keterangan && { keterangan: { contains: keterangan, mode: 'insensitive' } }),
      ...(status && { status: { contains: status, mode: 'insensitive' } }),
      deletedAt: null
    },
    orderBy: { [sortBy]: sortOrder },
    skip: (page - 1) * limit,
    take: limit
  })

  // ambil id unik
  const petugasIds = [...new Set(pengeluaran.map((p) => p.petugasId))]
  const penerimaIds = [...new Set(pengeluaran.map((p) => p.penerimaId))]

  // query user sekali saja
  const users = await prisma.user.findMany({
    where: {
      id: { in: [...petugasIds, ...penerimaIds] }
    },
    select: { id: true, nama: true }
  })

  // mapping data
  const pengeluaranWithNama = pengeluaran.map((p) => ({
    ...p,
    petugasNama: users.find((u) => u.id === p.petugasId)?.nama || null,
    penerimaNama: users.find((u) => u.id === p.penerimaId)?.nama || null
  }))

  const total = await prisma.pengeluaran.count({
    where: {
      ...(tanggal && { tanggal: { equals: tanggal } }),
      ...(warehouseId && { warehouseId: { contains: warehouseId, mode: 'insensitive' } }),
      ...(petugasId && { petugasId: { contains: petugasId, mode: 'insensitive' } }),
      ...(penerimaId && { penerimaId: { contains: penerimaId, mode: 'insensitive' } }),
      ...(keterangan && { keterangan: { contains: keterangan, mode: 'insensitive' } }),
      ...(status && { status: { contains: status, mode: 'insensitive' } }),
      deletedAt: null
    }
  })

  return {
    data: pengeluaranWithNama,
    meta: {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit)
    }
  }
}



export const getPengeluaranByIdService = async (id: string) => {
  // Ambil data pengeluaran
  const pengeluaran = await prisma.pengeluaran.findUnique({
    where: { id },
    include: {
      // Ambil detail item
      detail: true
    }
  })

  if (!pengeluaran) {
    throw new Error('Pengeluaran tidak ditemukan')
  }

  // Ambil petugas
  const petugas = await prisma.user.findUnique({
    where: { id: pengeluaran.createdBy },
    select: { id: true, nama: true }
  })

  // Ambil penerima
  const penerima = await prisma.user.findUnique({
    where: { id: pengeluaran.penerimaId },
    select: { id: true, nama: true }
  })

  // Ambil warehouse
  const warehouse = await prisma.warehouse.findUnique({
    where: { kode_wh: pengeluaran.warehouseId },
    select: { kode_wh: true, nama_wh: true }
  })

  return {
    ...pengeluaran,
    petugas,
    penerima,
    warehouse
  }
}

