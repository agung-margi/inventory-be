import { Request, Response } from 'express'
import { createTransaksiOutValidation, PenerimaanValidation, PermintaanValidation, TAGValidation } from './transaksi.validator'
import { approvePermintaanService, confirmPenerimaanTAGService, createTAGService, getAllPenerimaanService, getAllPengeluaranService, getAllPermintaanService, getAllTAGService, getPengeluaranByIdService, getPermintaanByIdService, saveTransaksiPenerimaan, saveTransaksiPermintaan, TransaksiOutService } from './transaksi.service'
import { Console } from 'console'

export const createTransaksiOut = async (req: Request, res: Response) => {
    const {error, value} = createTransaksiOutValidation(req.body)

    if (error) {
    return res.status(400).json({
      status: false,
      statusCode: 400,
      message: error.details[0].message
    })
}
try {
    const userId = res.locals.user.id
    if (!userId) {
      return res.status(401).json({ status: false, statusCode: 401, message: 'Unathorized' })
    }

    await TransaksiOutService(value, userId)
    res.status(201).json({
      status: true,
      statusCode: 201,
      message: 'Transaksi berhasil dibuat'
    })
  } catch (error) {
    console.log(error);
    res.status(422).json({
      status: false,
      statusCode: 422,
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const createPenerimaan = async (req: Request, res: Response) => {
  const {error, value} = PenerimaanValidation(req.body)

  if (error) {
    return res.status(400).json({
      status: false,
      statusCode: 400,
      message: error.details[0].message
    })
  }

  try {
    const userId = res.locals.user.id
    if (!userId) {
      return res.status(401).json({ status: false, statusCode: 401, message: 'Unathorized' })
    }

    await saveTransaksiPenerimaan(value, userId)
    res.status(201).json({
      status: true,
      statusCode: 201,
      message: 'Penerimaan berhasil dibuat'
    })
  } catch (error) {
    res.status(422).json({
      status: false,
      statusCode: 422,
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const createPermintaan = async (req: Request, res: Response) => {
   const {error, value} = PermintaanValidation(req.body)

  if (error) {
    return res.status(400).json({
      status: false,
      statusCode: 400,
      message: error.details[0].message
    })
  }

  try {
    const userId = res.locals.user.id
    if (!userId) {
      return res.status(401).json({ status: false, statusCode: 401, message: 'Unathorized' })
    }

    await saveTransaksiPermintaan(value, userId)
    res.status(201).json({
      status: true,
      statusCode: 201,
      message: 'Permintaan berhasil dibuat'
    })
  } catch (error) {
    res.status(422).json({
      status: false,
      statusCode: 422,
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const getAllPermintaan = async(req: Request, res: Response) => {
  const {
    params: {id}
  } = req

  const userId = res.locals.user.id
  if (!userId) {
    return res.status(401).json({ status: false, statusCode: 401, message: 'Unathorized' })
  }

  try {
    if(id) {
      const permintaan = await getPermintaanByIdService(id)

      if (!permintaan) {
        return res.status(404).json({
          status: false,
          statusCode: 404,
          message: 'Permintaan tidak ditemukan'
        })
      }

      return res.status(200).json({
        status: true,
        statusCode: 200,
        message: 'Permintaan ditampilkan',
        data: permintaan
      })
    }
const filters={
  tanggal: req.query.tanggal ? String(req.query.tanggal) : undefined,
  tujuanWh: req.query.tujuanWh ? String(req.query.tujuanWh) : undefined,
  status: req.query.status ? String(req.query.status) : undefined,
  project: req.query.project ? String(req.query.project) : undefined,
  sortBy: req.query.sortBy as any,
  sortOrder: req.query.sortOrder as any,
  page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10
}
    
    const result = await getAllPermintaanService(filters)

    if (!result) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: 'Permintaan tidak ditemukan'
      })
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      data: result
    })

  } catch (error) {
    res.status(422).json({
      status: false,
      statusCode: 422,
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const approvePermintaan = async (req: Request, res: Response) => {
  const { id } = req.params
  const userId = res.locals.user.id

  if (!userId) {
    return res.status(401).json({ status: false, statusCode: 401, message: 'Unathorized' })
  }

  try {
    await approvePermintaanService(id, userId)
    res.status(200).json({
      status: true,
      statusCode: 200,
      message: 'Permintaan berhasil disetujui'
    })
  } catch (error) {
    res.status(422).json({
      status: false,
      statusCode: 422,
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const createTAG = async (req: Request, res: Response) => {
  const { error, value } = TAGValidation(req.body)

  if (error) {
    return res.status(400).json({
      status: false,
      statusCode: 400,
      message: error.details[0].message
    })
  }

  try {
    const userId = res.locals.user.id
    if (!userId) {
      return res.status(401).json({ status: false, statusCode: 401, message: 'Unathorized' })
    }

    await createTAGService(value, userId)
    res.status(201).json({
      status: true,
      statusCode: 201,
      message: 'TAG berhasil dibuat'
    })
  } catch (error) {
    res.status(422).json({
      status: false,
      statusCode: 422,
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const confirmTAG = async (req: Request, res: Response) => {
  const {error, value} = PenerimaanValidation(req.body)

  if (error) {
    return res.status(400).json({
      status: false,
      statusCode: 400,
      message: error.details[0].message
    })
  }

  try {
    const userId = res.locals.user.id
    if (!userId) {
      return res.status(401).json({ status: false, statusCode: 401, message: 'Unathorized' })
    }

    await confirmPenerimaanTAGService(value, userId)
    console.log(value)
    res.status(201).json({
      status: true,
      statusCode: 201,
      message: 'Penerimaan berhasil dibuat'
    })
  } catch (error) {
    res.status(422).json({
      status: false,
      statusCode: 422,
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}


export const getAllTAG = async(req: Request, res: Response) => {
  const {
    params: {id}
  } = req

  const userId = res.locals.user.id
  if (!userId) {
    return res.status(401).json({ status: false, statusCode: 401, message: 'Unathorized' })
  }

  try {
const filters={
  tanggal: req.query.tanggal ? new Date(String(req.query.tanggal)) : undefined,
  dariWh: req.query.dariWh ? String(req.query.dariWh) : undefined,
  keWh: req.query.keWh ? String(req.query.keWh) : undefined,
  mover: req.query.mover ? String(req.query.mover) : undefined,
  status: req.query.status ? String(req.query.status) : undefined,
  sortBy: req.query.sortBy as any,
  sortOrder: req.query.sortOrder as any,
  page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10
}
    
    const result = await getAllTAGService(filters)

    if (!result) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: 'Data TAG tidak ditemukan'
      })
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      data: result
    })

  } catch (error) {
    res.status(422).json({
      status: false,
      statusCode: 422,
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const getAllPengeluaran = async (req: Request, res: Response) => {
  const userId = res.locals.user.id
  if (!userId) {
    return res.status(401).json({ status: false, statusCode: 401, message: 'Unathorized' })
  }

  try {
    const {
    params: { id }
  } = req

  if (id) {
    const pengeluaran = await getPengeluaranByIdService(id)
    if (!pengeluaran) {
      return res.status(404).json({ status: false, statusCode: 404, message: 'Pengeluaran tidak ditemukan' })
    }
    return res.status(200).json({ status: true, statusCode: 200, data: pengeluaran })
  }

    const filters = {
      tanggal: req.query.tanggal ? new Date(String(req.query.tanggal)) : undefined,
      warehouseId: req.query.warehouseId ? String(req.query.warehouseId) : undefined,
      petugasId: req.query.petugasId ? String(req.query.petugasId) : undefined,
      penerimaId: req.query.penerimaId ? String(req.query.penerimaId) : undefined,
      keterangan: req.query.keterangan ? String(req.query.keterangan) : undefined,
      sortBy: req.query.sortBy as any,
      sortOrder: req.query.sortOrder as any,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10
    }

    const result = await getAllPengeluaranService(filters)

    if (!result) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: 'Data pengeluaran tidak ditemukan'
      })
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      data: result
    })

  } catch (error) {
    res.status(422).json({
      status: false,
      statusCode: 422,
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const getAllPenerimaan = async (req: Request, res: Response) => {
  const userId = res.locals.user.id
  if (!userId) {
    return res.status(401).json({ status: false, statusCode: 401, message: 'Unathorized' })
  }

  try {
    const filters = {
      tanggal: req.query.tanggal ? new Date(String(req.query.tanggal)) : undefined,
      pengirimanId: req.query.pengirimanId ? String(req.query.pengirimanId) : undefined,
      jenis: req.query.jenis ? String(req.query.jenis) : undefined,
      status: req.query.status ? String(req.query.status) : undefined,
      sortBy: req.query.sortBy as any,
      sortOrder: req.query.sortOrder as any,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10
    }

    const result = await getAllPenerimaanService(filters)

    if (!result) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: 'Data penerimaan tidak ditemukan'
      })
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      data: result
    })

  } catch (error) {
    res.status(422).json({
      status: false,
      statusCode: 422,
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}


