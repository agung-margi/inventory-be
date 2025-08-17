import { Router } from 'express'

import {
  requireAuth,
  requireManager,
  requireUser
} from '../../middlewares/auth.middleware'
import { approvePermintaan, createPermintaan, getAllPermintaan } from './permintaan.controller'

export const PermintaanRouter: Router = Router()
PermintaanRouter.post('/', requireAuth, requireUser, createPermintaan)
PermintaanRouter.get('/:id', requireAuth, getAllPermintaan)
PermintaanRouter.get('/', requireAuth, getAllPermintaan)
PermintaanRouter.put('/:id/approve', requireAuth, requireManager, approvePermintaan)

