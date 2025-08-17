
import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import { getNowWIB } from '../../utils/date'
import { TAGFilter, TAGType } from './tag.tpye'
import { generateTAGID } from '../../utils/gemerateIDDoc'

const prisma = new PrismaClient()

export const createTAGService = async (payload: TAGType, userId: string) => {
  const newTAG = await prisma.$transaction(async (tx) => {
    // 1. Buat pengiriman + detail (nested create)
    const tag = await tx.pengiriman.create({
      data: {
        id: uuidv4(),
        pengirimanId: await generateTAGID(),
        dariWh: payload.dariWh,
        keWh: payload.keWh,
        petugasId: payload.petugasId,
        mover: payload.mover,
        status: payload.status,
        catatan: payload.catatan,
        tanggal: payload.tanggal,
        createdAt: getNowWIB(),
        createdBy: userId,
        detail: {
          create: payload.items.map((item) => ({
            designator: item.designator,
            qty: item.qty,
            keterangan: item.keterangan,
            createdAt: getNowWIB(),
            createdBy: userId
          }))
        }
      },
      include: { detail: true }
    })

    // 2. Update stok untuk setiap item (di warehouse pengirim saja)
    for (const item of payload.items) {
      // Cek stok asal
      const stockAsal = await tx.stock.findUnique({
        where: {
          kode_wh_designator: {
            kode_wh: payload.dariWh,
            designator: item.designator
          }
        }
      })

      if (!stockAsal || stockAsal.available < item.qty) {
        throw new Error(`Stok tidak cukup untuk ${item.designator} di ${payload.dariWh}`)
      }

      // Kurangi available, tambah transit di pengirim
      await tx.stock.update({
        where: {
          kode_wh_designator: {
            kode_wh: payload.dariWh,
            designator: item.designator
          }
        },
        data: {
          available: { decrement: item.qty },
          transit: { increment: item.qty }
        }
      })
    }

    return tag
  })

  return newTAG
}

export const getAllTAGService = async (filters: TAGFilter) => {
  const { dariWh, keWh, mover, status, tanggal, sortBy = 'tanggal', sortOrder = 'desc', page = 1, limit = 10 } = filters

  const pengiriman = await prisma.pengiriman.findMany({
      where: {
        ...(tanggal && { tanggal: { equals: tanggal } }),
        ...(dariWh && { dariWh: { contains: dariWh, mode: 'insensitive' } }),
        ...(keWh && { keWh: { contains: keWh, mode: 'insensitive' } }),
        ...(mover && { mover: { contains: mover, mode: 'insensitive' } }),
        ...(status && { status: { contains: status, mode: 'insensitive' } }),
        deletedAt: null
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      skip: (page - 1) * limit,
      take: limit
    }),
    total = await prisma.pengiriman.count({
      where: {
        ...(tanggal && { tanggal: { equals: tanggal } }),
        ...(dariWh && { dariWh: { contains: dariWh, mode: 'insensitive' } }),
        ...(keWh && { keWh: { contains: keWh, mode: 'insensitive' } }),
        ...(mover && { mover: { contains: mover, mode: 'insensitive' } }),
        ...(status && { status: { contains: status, mode: 'insensitive' } }),
        deletedAt: null
      }
    })

  return {
    data: pengiriman,
    meta: {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit)
    }
  }
}

export const getTAGByid = async (id: string) => {
  // Ambil data TAG
  const tag = await prisma.pengiriman.findUnique({
    where: { id },
    include: {
      // Ambil detail item
      detail: true
    }
  });

  if (!tag) {
    throw new Error('TAG tidak ditemukan');
  }

  // Ambil petugas
  const petugas = await prisma.user.findUnique({
    where: { id: tag.createdBy },
    select: { id: true, nama: true }
  });

  // Ambil warehouse pengirim (dariWh)
  const pengirimWH = await prisma.warehouse.findUnique({
    where: { kode_wh: tag.dariWh },
    select: { kode_wh: true, nama_wh: true }
  });

  // Ambil warehouse penerima (keWh)
  const penerimaWH = await prisma.warehouse.findUnique({
    where: { kode_wh: tag.keWh },
    select: { kode_wh: true, nama_wh: true }
  });

  return {
    ...tag,
    petugas,
    pengirimWH,
    penerimaWH
  };
};
