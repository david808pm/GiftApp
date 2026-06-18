-- AlterTable
ALTER TABLE `AdminUser` ADD COLUMN `companyId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Campaign` ADD COLUMN `companyId` INTEGER NULL;

-- CreateTable
CREATE TABLE `Company` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(180) NOT NULL,
    `slug` VARCHAR(200) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Company_slug_key`(`slug`),
    INDEX `Company_slug_idx`(`slug`),
    INDEX `Company_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `AdminUser_companyId_idx` ON `AdminUser`(`companyId`);

-- CreateIndex
CREATE INDEX `Campaign_companyId_idx` ON `Campaign`(`companyId`);

-- AddForeignKey
ALTER TABLE `AdminUser` ADD CONSTRAINT `AdminUser_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Campaign` ADD CONSTRAINT `Campaign_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
