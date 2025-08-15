import { Router } from 'express'
import { createSession, getAllUser, getMe, logout, refreshSession, registerUser } from './user.controller'
import { requireAdmin, requireAuth } from '../../middlewares/auth.middleware'

export const UserRouter: Router = Router()
UserRouter.post('/register', registerUser)
UserRouter.post('/login', createSession)
UserRouter.post('/logout', logout)
UserRouter.post('/refresh', refreshSession)
UserRouter.get('/me', requireAuth, getMe)
UserRouter.get('/user', requireAuth, requireAdmin, getAllUser)