import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function generateDocId<
  T extends keyof typeof prisma
>(
  prefix: string,
  warehouseCode: string,
  model: T,
  dateField: string = 'tanggal',
  whField: string = 'warehouseId'
) {
  const today = new Date();
  const yyyymmdd = today.toISOString().slice(0,10).replace(/-/g, '');

  // Hitung jumlah transaksi hari ini di warehouse
  const delegate = prisma[model] as { count: (args: any) => Promise<number> };
  const countToday = await delegate.count({
    where: {
      [whField]: warehouseCode,
      [dateField]: {
        gte: new Date(`${today.toISOString().slice(0,10)}T00:00:00.000Z`),
        lt:  new Date(`${today.toISOString().slice(0,10)}T23:59:59.999Z`)
      }
    }
  });

  const sequence = String(countToday + 1).padStart(4, '0');

  return `${prefix}-${warehouseCode}-${yyyymmdd}${sequence}`;
}