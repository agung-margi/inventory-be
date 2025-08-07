import { Router } from 'express'
import { createItem, deleteItem, getAllItem, updateItem } from './item.controller'
import { requireAdmin, requireAuth } from '../../middlewares/auth.middleware'


export const ItemRouter: Router = Router()
ItemRouter.post('/', requireAdmin, requireAuth, createItem)
ItemRouter.put('/:id', requireAdmin, requireAuth, updateItem)
ItemRouter.delete('/:id', requireAdmin,requireAuth, deleteItem)
ItemRouter.get('/', requireAuth, getAllItem)
ItemRouter.get('/:id', requireAuth, getAllItem)