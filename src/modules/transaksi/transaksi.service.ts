import { PrismaClient } from '@prisma/client'
import TransaksiType, {  } from './transaksi.type'
import { v4 as uuidv4 } from 'uuid'
import { getNowWIB } from '../../utils/date'

const prisma = new PrismaClient()

export const saveTransaksi = async (payload: TransaksiType, userId: string) => {
    const newTransaksi = await prisma.$transaction(async (tx) => {
        // 1. VALIDASI SEMUA ITEM
    for (const item of payload.items) {
        const stock = await tx.stock.findFirst({
        where: {
            kode_wh: payload.from_wh,
            designator: item.designator,
        },
        });

        if (!stock) {
        throw new Error(`Stok untuk designator "${item.designator}" tidak ditemukan di warehouse.`);
        }

        if (stock.available < item.qty) {
        throw new Error(`Stok untuk designator "${item.designator}" tidak mencukupi. Tersedia: ${stock.available}, Diminta: ${item.qty}`);
        }
    }

        // simpan header transaksi
    const header = await tx.transaksi.create({
        data: {
            tanggal: getNowWIB(),
            from_wh: payload.from_wh,
            to_user: payload.to_user,
            tipe_transaksi: 221,
            status: 'Completed',
            petugas: userId,
            confirmAt: getNowWIB(),
            confirmBy: userId,
            createdAt: getNowWIB(),
            createdBy: userId,
        }
    })
    // simpan detail transaksi
    const details = payload.items.map(item => ({
        id: uuidv4(),
        id_transaksi: header.id,
        tanggal: getNowWIB(),
        kode_wh: payload.from_wh,
        jenis_transaksi: "221",
        designator: item.designator,
        qty: item.qty,
        createdAt: getNowWIB(),
        createdBy: userId,
    }))
    await tx.transaksiDetail.createMany({
        data: details
    })

    // 4. UPDATE STOK
  for (const item of payload.items) {
    await tx.stock.updateMany({
      where: {
        kode_wh: payload.from_wh,
        designator: item.designator,
      },
      data: {
        available: {
          decrement: item.qty
        },
        updatedAt: getNowWIB(),
        updatedBy: userId
      }
    });
  }

    return header

})
    return newTransaksi}