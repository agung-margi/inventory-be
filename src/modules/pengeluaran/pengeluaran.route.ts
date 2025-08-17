import { Router } from 'express'
import { createTransaksiOut, getAllPengeluaran} from './pengeluaran.controller'
import { requireAuth, requireAdminOrStaffSO } from '../../middlewares/auth.middleware'


export const PengeluaranRouter: Router = Router()
PengeluaranRouter.post('/', requireAuth, requireAdminOrStaffSO, createTransaksiOut)
PengeluaranRouter.get('/', requireAuth, requireAdminOrStaffSO, getAllPengeluaran)
PengeluaranRouter.get('/:id', requireAuth, requireAdminOrStaffSO, getAllPengeluaran)
PengeluaranRouter.post('/', requireAuth, requireAdminOrStaffSO, createTransaksiOut)

