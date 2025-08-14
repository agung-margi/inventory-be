import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import { getNowWIB } from '../../utils/date'
import { PengeluaranType, PenerimaanType, PermintaanType, PermintaanFilter, TAGType, TAGFilter, PengeluaranFilter, PenerimaanFilter } from './transaksi.type'
import { generateDocId, generateOutID, generatePermintaanId, generateTAGID } from '../../utils/gemerateIDDoc'

const prisma = new PrismaClient()

export const TransaksiOutService = async (payload: PengeluaranType, userId: string) => {
  const newTransaksi = await prisma.$transaction(async (tx) => {
    // 1. Ambil permintaan terkait
    const permintaan = await tx.permintaan.findUnique({
      where: { id: payload.permintaanId, deletedAt: null },
      select: { pemintaId: true }
    })

    if (!permintaan) {
      throw new Error(`Permintaan dengan ID ${payload.permintaanId} tidak ditemukan`)
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

    // 5. UPDATE STATUS PERMINTAAN MENJADI CLOSED
    await tx.permintaan.update({
      where: { id: payload.permintaanId },
      data: {
        status: 'completed',
        updatedAt: getNowWIB(),
        updatedBy: userId
      }
    })

    return header
  })
  return newTransaksi
}

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

export const saveTransaksiPermintaan = async (payload: PermintaanType, userId: string) => {
  const id = await generatePermintaanId()
  console.log('Generated Permintaan ID:', id)

  const newTransaksi = await prisma.$transaction(async (tx) => {
    // simpan header transaksi
    const header = await tx.permintaan.create({
      data: {
        id,
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

export const completePermintaanService = async (id: string, userId: string) => {
  const updatedTransaksi = await prisma.$transaction(async (tx) => {
    // Update the status of the permintaan
    const permintaan = await tx.permintaan.update({
      where: { id },
      data: { status: 'completed', updatedAt: getNowWIB(), updatedBy: userId }
    })
    return permintaan
  })
  return updatedTransaksi
}
export const getAllPermintaanService = async (filters: PermintaanFilter) => {
  const {
    id,
    tanggal,
    tujuanWh,
    status,
    project,
    sortBy = 'tanggal',
    sortOrder = 'desc',
    page = 1,
    limit = 10
  } = filters

  const permintaan = await prisma.permintaan.findMany({
      where: {
        ...(tanggal && { tanggal: { equals: tanggal } }),
        ...(tujuanWh && { tujuanWh: { contains: tujuanWh, mode: 'insensitive' } }),
        ...(status && { status: { contains: status, mode: 'insensitive' } }),
        ...(project && { project: { contains: project, mode: 'insensitive' } })
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      skip: (page - 1) * limit,
      take: limit
    }),
    total = await prisma.permintaan.count({
      where: {
        ...(tanggal && { tanggal: { equals: tanggal } }),
        ...(tujuanWh && { tujuanWh: { contains: tujuanWh, mode: 'insensitive' } }),
        ...(status && { status: { contains: status, mode: 'insensitive' } }),
        ...(project && { project: { contains: project, mode: 'insensitive' } }),
        deletedAt: null
      }
    })

  return {
    data: permintaan,
    meta: {
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
      detail: true,
      peminta: {
        select: {
          id: true,
          nama: true
        }
      }
    }
  })
  return permintaan
}

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


export const getAllTAGService = async (filters: TAGFilter) => {
  const {
    dariWh,
    keWh,
    mover,
    status,
    tanggal,
    sortBy = 'tanggal',
    sortOrder = 'desc',
    page = 1,
    limit = 10
  } = filters

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

  const pengiriman = await prisma.pengiriman.findMany({
      where: {
        ...(warehouseId && { warehouseId: { contains: warehouseId, mode: 'insensitive' } }),
        ...(petugasId && { petugasId: { contains: petugasId, mode: 'insensitive' } }),
        ...(penerimaId && { penerimaId: { contains: penerimaId, mode: 'insensitive' } }),
        ...(keterangan && { keterangan: { contains: keterangan, mode: 'insensitive' } }),
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
        ...(warehouseId && { warehouseId: { contains: warehouseId, mode: 'insensitive' } }),
        ...(petugasId && { petugasId: { contains: petugasId, mode: 'insensitive' } }),
        ...(penerimaId && { penerimaId: { contains: penerimaId, mode: 'insensitive' } }),
        ...(keterangan && { keterangan: { contains: keterangan, mode: 'insensitive' } }),
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


export const getAllPenerimaanService = async (filters: PenerimaanFilter) => {
  const {
    tanggal,
    pengirimanId,
    jenis,
    status,
    sortBy = 'tanggal',
    sortOrder = 'desc',
    page = 1,
    limit = 10
  } = filters

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