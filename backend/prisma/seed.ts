import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
  const c = await db.company.create({
    data: { name: 'Demo Constructora', taxId: 'DEM-001' }
  });
  await db.user.create({
    data: { email: 'admin@demo.com', password: 'admin123', role: 'ADMIN', companyId: c.id }
  });
  await db.project.create({
    data: { name: 'Edificio Central', status: 'PLANIFICACION', companyId: c.id }
  });
  console.log('Seed listo. companyId:', c.id);
}
main().finally(() => db.$disconnect());
