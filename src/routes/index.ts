import { Application, Router } from 'express'
import { UserRouter } from '../modules/user/user.route'
import { HealthRouter } from '../modules/health/health.routes'
import { ProductRouter } from '../modules/product/product.route'

const version = '/api/v1'

const _routes: Array<[string, Router]> = [
  ['/health', HealthRouter],
  ['/auth', UserRouter],
  ['/products', ProductRouter]
]

export const routes = (app: Application) => {
  _routes.forEach(([path, router]) => {
    app.use(`${version}${path}`, router)
  })
}
