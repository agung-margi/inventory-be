import { Application, Router } from 'express'
import { UserRouter } from '../modules/user/user.route'
import { HealthRouter } from '../modules/health/health.routes'
import { WarehouseRouter } from '../modules/warehouse/warehouse.route'
import { ItemRouter } from '../modules/item/item.route'

const version = '/api/v1'

const _routes: Array<[string, Router]> = [
  ['/health', HealthRouter],
  ['/auth', UserRouter],
  ['/warehouse', WarehouseRouter],
  ['/item', ItemRouter],
]

export const routes = (app: Application) => {
  _routes.forEach(([path, router]) => {
    app.use(`${version}${path}`, router)
  })
}
