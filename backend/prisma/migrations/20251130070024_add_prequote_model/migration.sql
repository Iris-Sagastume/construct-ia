/*
  Warnings:

  - You are about to alter the column `piscina` on the `HouseDesign` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `HouseDesign` MODIFY `piscina` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `PreQuote` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ticket` VARCHAR(191) NOT NULL,
    `estimatedCostLps` INTEGER NOT NULL,
    `builder` VARCHAR(191) NULL,
    `ferreteria` VARCHAR(191) NULL,
    `bankName` VARCHAR(191) NULL,
    `bankRate` DOUBLE NULL,
    `contactEmail` VARCHAR(191) NOT NULL,
    `contactPhone` VARCHAR(191) NOT NULL,
    `contactMode` VARCHAR(191) NOT NULL,
    `contactPlace` VARCHAR(191) NULL,
    `contactVirtualOption` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDIENTE',
    `userId` INTEGER NULL,
    `houseDesignId` INTEGER NOT NULL,

    UNIQUE INDEX `PreQuote_ticket_key`(`ticket`),
    INDEX `PreQuote_contactEmail_idx`(`contactEmail`),
    INDEX `PreQuote_userId_idx`(`userId`),
    INDEX `PreQuote_houseDesignId_idx`(`houseDesignId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PreQuote` ADD CONSTRAINT `PreQuote_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PreQuote` ADD CONSTRAINT `PreQuote_houseDesignId_fkey` FOREIGN KEY (`houseDesignId`) REFERENCES `HouseDesign`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
