import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import { getNowWIB } from '../../utils/date'
import { PenerimaanFilter, PenerimaanType } from './penerimaan.type'

const prisma = new PrismaClient()


export const saveTransaksiPenerimaan = async (payload: PenerimaanType, userId: string) => {
  const newTransaksi = await prisma.$transaction(async (tx) => {
    // simpan header transaksi
    const header = await tx.penerimaan.create({
      data: {
        id: uuidv4(),
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
      })
    }
    return header
  })
  return newTransaksi
}
export const getAllPenerimaanService = async (filters: PenerimaanFilter) => {
  const { tanggal, pengirimanId, jenis, status, sortBy = 'tanggal', sortOrder = 'desc', page = 1, limit = 10 } = filters

  const penerimaan = await prisma.penerimaan.findMany({
      where: {
        ...(tanggal && { tanggal: { equals: tanggal } }),
        ...(pengirimanId && { pengirimanId: { contains: pengirimanId, mode: 'insensitive' } }),
        ...(jenis && { jenis: { contains: jenis, mode: 'insensitive' } }),
        ...(status && { status: { contains: status, mode: 'insensitive' } }),
        deletedAt: null
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      skip: (page - 1) * limit,
      take: limit
    }),
    total = await prisma.penerimaan.count({
      where: {
        ...(tanggal && { tanggal: { equals: tanggal } }),
        ...(pengirimanId && { pengirimanId: { contains: pengirimanId, mode: 'insensitive' } }),
        ...(jenis && { jenis: { contains: jenis, mode: 'insensitive' } }),
        ...(status && { status: { contains: status, mode: 'insensitive' } }),
        deletedAt: null
      }
    })

  return {
    data: penerimaan,
    meta: {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit)
    }
  }
}

export const confirmPenerimaanTAGService = async (payload: PenerimaanType, userId: string) => {
  return prisma.$transaction(async (tx) => {
    // 1. Ambil data pengiriman beserta detailnya
    const pengiriman = await tx.pengiriman.findFirst({
      where: {
        pengirimanId: payload.pengirimanId,
        keWh: payload.warehouseId,
        dariWh: payload.sumber
      },
      include: { detail: true }
    })

    if (!pengiriman) {
      throw new Error('Pengiriman tidak ditemukan')
    }

    if (payload.jenis !== 'antar gudang') {
      throw new Error('Jenis pengiriman tidak sesuai')
    }

    // 2. Update stok
    for (const item of pengiriman.detail) {
      // Kurangi transit di pengirim
      await tx.stock.update({
        where: {
          kode_wh_designator: {
            kode_wh: pengiriman.dariWh,
            designator: item.designator
          }
        },
        data: {
          transit: { decrement: item.qty }
        }
      })

      // Tambah available di penerima
      const stockTujuan = await tx.stock.findUnique({
        where: {
          kode_wh_designator: {
            kode_wh: pengiriman.keWh,
            designator: item.designator
          }
        }
      })

      if (stockTujuan) {
        await tx.stock.update({
          where: {
            kode_wh_designator: {
              kode_wh: pengiriman.keWh,
              designator: item.designator
            }
          },
          data: {
            available: { increment: item.qty }
          }
        })
      } else {
        // Auto create kalau belum ada stok di penerima
        const itemData = await tx.item.findUnique({
          where: { designator: item.designator },
          select: { satuan: true }
        })

        if (!itemData) throw new Error(`Item ${item.designator} tidak ditemukan`)

        await tx.stock.create({
          data: {
            kode_wh: pengiriman.keWh,
            designator: item.designator,
            satuan: itemData.satuan,
            available: item.qty,
            transit: 0,
            createdBy: userId
          }
        })
      }
    }

    // 3. Update status pengiriman jadi DITERIMA
    await tx.pengiriman.update({
      where: { pengirimanId: pengiriman.pengirimanId },
      data: {
        status: 'completed',
        updatedAt: getNowWIB(),
        updatedBy: userId
      }
    })

    return { status: true, message: 'Penerimaan antar gudang berhasil dikonfirmasi' }
  })
}