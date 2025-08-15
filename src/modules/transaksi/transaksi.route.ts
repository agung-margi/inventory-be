import { Router } from 'express'
import { approvePermintaan, confirmTAG, createPenerimaan, createPermintaan, createTAG, createTransaksiOut, getAllPenerimaan, getAllPengeluaran, getAllPermintaan, getAllTAG } from './transaksi.controller'
import { requireAdmin, requireAuth, requireManager, requireStaffSO, requireUser } from '../../middlewares/auth.middleware'


export const TransaksiRouter: Router = Router()
TransaksiRouter.post('/pengeluaran', requireAuth, requireStaffSO,createTransaksiOut)
TransaksiRouter.get('/pengeluaran', requireAuth, requireStaffSO, getAllPengeluaran)
TransaksiRouter.post('/penerimaan', requireAuth, requireStaffSO, createPenerimaan)
TransaksiRouter.get('/penerimaan', requireAuth, getAllPenerimaan)
TransaksiRouter.post('/permintaan', requireAuth, requireUser, createPermintaan)
TransaksiRouter.put('/permintaan/:id/approve', requireAuth, requireManager, approvePermintaan)
TransaksiRouter.get('/permintaan/:id', requireAuth, getAllPermintaan)
TransaksiRouter.get('/permintaan', requireAuth, getAllPermintaan)
TransaksiRouter.post('/tag', requireAuth, requireStaffSO, createTAG)
TransaksiRouter.post('/tag/confirm', requireAuth, requireAdmin, confirmTAG)
TransaksiRouter.get('/tag', requireAuth, requireAdmin, getAllTAG)
TransaksiRouter.get('/pengeluaran/:id', requireAuth, getAllPengeluaran)