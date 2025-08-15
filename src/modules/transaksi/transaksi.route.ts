import { Router } from 'express'
import { approvePermintaan, confirmTAG, createPenerimaan, createPermintaan, createTAG, createTransaksiOut, getAllPenerimaan, getAllPengeluaran, getAllPermintaan, getAllTAG } from './transaksi.controller'
import { requireAdmin, requireAuth, requireManager, requireAdminOrStaffSO, requireUser } from '../../middlewares/auth.middleware'


export const TransaksiRouter: Router = Router()
TransaksiRouter.post('/pengeluaran', requireAuth, requireAdminOrStaffSO,createTransaksiOut)
TransaksiRouter.get('/pengeluaran', requireAuth, requireAdminOrStaffSO, getAllPengeluaran)
TransaksiRouter.post('/penerimaan', requireAuth, requireAdminOrStaffSO, createPenerimaan)
TransaksiRouter.get('/penerimaan', requireAuth, requireAdminOrStaffSO, getAllPenerimaan)
TransaksiRouter.post('/permintaan', requireAuth, requireUser, createPermintaan)
TransaksiRouter.put('/permintaan/:id/approve', requireAuth, requireManager, approvePermintaan)
TransaksiRouter.get('/permintaan/:id', requireAuth, getAllPermintaan)
TransaksiRouter.get('/permintaan', requireAuth, getAllPermintaan)
TransaksiRouter.post('/tag', requireAuth, requireAdminOrStaffSO, createTAG)
TransaksiRouter.post('/tag/confirm', requireAuth, requireAdminOrStaffSO, confirmTAG)
TransaksiRouter.get('/tag', requireAuth,  requireAdminOrStaffSO, getAllTAG)
TransaksiRouter.get('/pengeluaran/:id', requireAuth, requireAdminOrStaffSO, getAllPengeluaran)
TransaksiRouter.get('/tag/:id', requireAuth, requireAdminOrStaffSO, getAllTAG)