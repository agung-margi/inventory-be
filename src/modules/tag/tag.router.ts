import { Router } from 'express'
import { requireAuth, requireAdminOrStaffSO } from '../../middlewares/auth.middleware'
import { confirmTAG, createTAG, getAllTAG } from './tag.controller'


export const TAGRouter: Router = Router()
TAGRouter.post('/tag', requireAuth, requireAdminOrStaffSO, createTAG)
TAGRouter.get('/tag/:id', requireAuth, requireAdminOrStaffSO, getAllTAG)
TAGRouter.get('/tag', requireAuth,  requireAdminOrStaffSO, getAllTAG)
TAGRouter.post('/tag/confirm', requireAuth, requireAdminOrStaffSO, confirmTAG)
