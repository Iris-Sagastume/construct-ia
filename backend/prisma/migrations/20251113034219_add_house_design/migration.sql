-- CreateTable
CREATE TABLE `HouseDesign` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tipoCasa` VARCHAR(191) NOT NULL,
    `areaVaras` INTEGER NOT NULL,
    `habitaciones` INTEGER NOT NULL,
    `banos` INTEGER NOT NULL,
    `departamento` VARCHAR(191) NOT NULL,
    `municipio` VARCHAR(191) NOT NULL,
    `colonia` VARCHAR(191) NOT NULL,
    `piscina` BOOLEAN NOT NULL,
    `notasAdicionales` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `estimatedCostUsd` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
