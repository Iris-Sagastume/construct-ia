// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // 1) Asegura compañías y recupera sus IDs
  const a = await prisma.company.upsert({
    where: { tenantId: "tenant-a" },
    update: { name: "Constructora A" },
    create: { tenantId: "tenant-a", name: "Constructora A" },
  });

  const b = await prisma.company.upsert({
    where: { tenantId: "tenant-b" },
    update: { name: "Constructora B" },
    create: { tenantId: "tenant-b", name: "Constructora B" },
  });

  // 2) Proyectos (ahora con companyId obligatorio)
  await prisma.project.createMany({
    data: [
      {
        tenantId: "tenant-a",
        companyId: a.id,
        name: "Edificio Centro",
        description: "Torre de oficinas",
      },
      {
        tenantId: "tenant-a",
        companyId: a.id,
        name: "Plaza Norte",
        description: "Centro comercial",
      },
      {
        tenantId: "tenant-b",
        companyId: b.id,
        name: "Residencial Las Palmas",
        description: "Viviendas",
      },
    ],
    // Solo salta duplicados si tienes índices únicos que los cubran
    skipDuplicates: true,
  });
}

main()
  .then(() => console.log("Datos insertados correctamente"))
  .catch((e) => {
    console.error("Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
