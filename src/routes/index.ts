import { Application, Router } from 'express'
import { UserRouter } from '../modules/user/user.route'
import { HealthRouter } from '../modules/health/health.routes'
import { WarehouseRouter } from '../modules/warehouse/warehouse.route'
import { ItemRouter } from '../modules/item/item.route'
import { TransaksiRouter } from '../modules/pengeluaran/transaksi.route'
import { StockRouter } from '../modules/stock/stock.route'
import { TAGRouter } from '../modules/tag/tag.router'
import { PenerimaanRouter } from '../modules/penerimaan/penerimaan.route'
import { PermintaanRouter } from '../modules/permintaan/permintaan.route'
import { PengeluaranRouter } from '../modules/pengeluaran/pengeluaran.route'
const version = '/api/v1'

const _routes: Array<[string, Router]> = [
  ['/health', HealthRouter],
  ['/auth', UserRouter],
  ['/warehouse', WarehouseRouter],
  ['/item', ItemRouter],
  ['/stock', StockRouter],
  ['/tag', TAGRouter],
  ['/penerimaan', PenerimaanRouter],
  ['/permintaan', PermintaanRouter],
  ['/pengeluaran', PengeluaranRouter]
]

export const routes = (app: Application) => {
  _routes.forEach(([path, router]) => {
    app.use(`${version}${path}`, router)
  })
}
