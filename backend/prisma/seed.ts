import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.company.upsert({
    where: { tenantId: "tenant-a" },
    update: {},
    create: { tenantId: "tenant-a", name: "Constructora A" },
  });

  await prisma.company.upsert({
    where: { tenantId: "tenant-b" },
    update: {},
    create: { tenantId: "tenant-b", name: "Constructora B" },
  });

  await prisma.project.createMany({
    data: [
      { tenantId: "tenant-a", name: "Edificio Centro", description: "Torre de oficinas" },
      { tenantId: "tenant-a", name: "Plaza Norte", description: "Centro comercial" },
      { tenantId: "tenant-b", name: "Residencial Las Palmas", description: "Viviendas" }
    ],
    skipDuplicates: true,
  });
}

main()
  .then(() => console.log("✅ Datos insertados correctamente"))
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
