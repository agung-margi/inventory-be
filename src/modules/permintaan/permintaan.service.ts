
import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
const prisma = new PrismaClient()
import { getNowWIB } from "../../utils/date"
import { generatePermintaanId } from '../../utils/gemerateIDDoc'
import { PermintaanFilter, PermintaanType } from './permintaan.type'


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
