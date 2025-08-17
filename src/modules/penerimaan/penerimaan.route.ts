import { Router } from 'express'
import { requireAdmin, requireAuth, requireManager, requireAdminOrStaffSO, requireUser } from '../../middlewares/auth.middleware'
import { createPenerimaan, getAllPenerimaan } from './penerimaan.controller'


export const PenerimaanRouter: Router = Router()
PenerimaanRouter.post('/', requireAuth, requireAdminOrStaffSO, createPenerimaan)
PenerimaanRouter.get('/', requireAuth, requireAdminOrStaffSO, getAllPenerimaan)