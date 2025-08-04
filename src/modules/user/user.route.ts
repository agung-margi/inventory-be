import { Router } from 'express'
import { createSession, getMe, refreshSession, regiterUser } from './user.controller'
import { requireAuth } from '../../middlewares/auth.middleware'

export const UserRouter: Router = Router()
UserRouter.post('/register', regiterUser)
UserRouter.post('/login', createSession)
UserRouter.post('/refresh', refreshSession)
UserRouter.get('/me', requireAuth, getMe)