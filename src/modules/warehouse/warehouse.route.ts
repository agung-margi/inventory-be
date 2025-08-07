import { Router } from 'express'
import { createWarehouse, deleteWarehouse, getAllWarehouse, updateWarehouse } from './warehouse.controller'
import { requireAdmin, requireAuth } from '../../middlewares/auth.middleware'


export const WarehouseRouter: Router = Router()
WarehouseRouter.post('/', requireAdmin, requireAuth, createWarehouse)
WarehouseRouter.put('/:id', requireAdmin, requireAuth, updateWarehouse)
WarehouseRouter.delete('/:id', requireAdmin,requireAuth, deleteWarehouse)
WarehouseRouter.get('/', requireAuth, getAllWarehouse)
WarehouseRouter.get('/:id', requireAuth, getAllWarehouse)