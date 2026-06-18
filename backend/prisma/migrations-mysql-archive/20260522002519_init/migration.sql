-- CreateTable
CREATE TABLE `Role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `description` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Role_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdminUser` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(120) NOT NULL,
    `email` VARCHAR(180) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `roleId` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AdminUser_email_key`(`email`),
    INDEX `AdminUser_email_idx`(`email`),
    INDEX `AdminUser_roleId_idx`(`roleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Campaign` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(180) NOT NULL,
    `slug` VARCHAR(200) NOT NULL,
    `welcomeText` TEXT NULL,
    `rulesText` TEXT NULL,
    `status` ENUM('ACTIVE', 'CLOSED', 'DRAFT', 'PAUSED', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `logoText` VARCHAR(80) NULL,
    `primaryColor` VARCHAR(7) NULL,
    `startsAt` DATETIME(3) NULL,
    `endsAt` DATETIME(3) NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Campaign_slug_key`(`slug`),
    INDEX `Campaign_slug_idx`(`slug`),
    INDEX `Campaign_status_idx`(`status`),
    INDEX `Campaign_deletedAt_idx`(`deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Employee` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campaignId` INTEGER NOT NULL,
    `fullName` VARCHAR(180) NOT NULL,
    `documentId` VARCHAR(50) NOT NULL,
    `email` VARCHAR(180) NULL,
    `phone` VARCHAR(30) NULL,
    `shippingAddress` VARCHAR(255) NULL,
    `shippingCity` VARCHAR(100) NULL,
    `status` ENUM('PENDING', 'IN_PROGRESS', 'CONFIRMED', 'BLOCKED') NOT NULL DEFAULT 'PENDING',
    `confirmedAt` DATETIME(3) NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `Employee_campaignId_idx`(`campaignId`),
    INDEX `Employee_status_idx`(`status`),
    INDEX `Employee_documentId_idx`(`documentId`),
    INDEX `Employee_deletedAt_idx`(`deletedAt`),
    UNIQUE INDEX `Employee_campaignId_documentId_key`(`campaignId`, `documentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Beneficiary` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `fullName` VARCHAR(180) NOT NULL,
    `age` INTEGER NOT NULL DEFAULT 0,
    `gender` ENUM('male', 'female') NOT NULL DEFAULT 'male',
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `Beneficiary_employeeId_idx`(`employeeId`),
    INDEX `Beneficiary_gender_idx`(`gender`),
    INDEX `Beneficiary_deletedAt_idx`(`deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Gift` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campaignId` INTEGER NOT NULL,
    `name` VARCHAR(180) NOT NULL,
    `reference` VARCHAR(50) NOT NULL,
    `shortDescription` TEXT NULL,
    `technicalDescription` TEXT NULL,
    `dimensions` VARCHAR(100) NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `minAge` INTEGER NOT NULL DEFAULT 0,
    `maxAge` INTEGER NOT NULL DEFAULT 13,
    `allowedGender` ENUM('all', 'male', 'female') NOT NULL DEFAULT 'all',
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `Gift_campaignId_idx`(`campaignId`),
    INDEX `Gift_status_idx`(`status`),
    INDEX `Gift_allowedGender_idx`(`allowedGender`),
    INDEX `Gift_deletedAt_idx`(`deletedAt`),
    UNIQUE INDEX `Gift_campaignId_reference_key`(`campaignId`, `reference`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GiftImage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `giftId` INTEGER NOT NULL,
    `imageUrl` VARCHAR(500) NOT NULL,
    `altText` VARCHAR(180) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `GiftImage_giftId_idx`(`giftId`),
    INDEX `GiftImage_sortOrder_idx`(`sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SupportRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campaignId` INTEGER NULL,
    `employeeId` INTEGER NULL,
    `documentId` VARCHAR(50) NULL,
    `type` ENUM('NOT_FOUND', 'BENEFICIARY_DATA_INCORRECT', 'MISSING_BENEFICIARY', 'AGE_GENDER_INCORRECT', 'GIFT_SELECTION_PROBLEM', 'OTHER') NOT NULL,
    `message` TEXT NOT NULL,
    `status` ENUM('OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED', 'REJECTED') NOT NULL DEFAULT 'OPEN',
    `internalNote` TEXT NULL,
    `verifiedEmployee` BOOLEAN NOT NULL DEFAULT false,
    `resolvedAt` DATETIME(3) NULL,
    `resolvedById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SupportRequest_campaignId_idx`(`campaignId`),
    INDEX `SupportRequest_employeeId_idx`(`employeeId`),
    INDEX `SupportRequest_status_idx`(`status`),
    INDEX `SupportRequest_type_idx`(`type`),
    INDEX `SupportRequest_documentId_idx`(`documentId`),
    INDEX `SupportRequest_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SupportRequestHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `supportRequestId` INTEGER NOT NULL,
    `previousStatus` ENUM('OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED', 'REJECTED') NULL,
    `newStatus` ENUM('OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED', 'REJECTED') NOT NULL,
    `previousInternalNote` TEXT NULL,
    `newInternalNote` TEXT NULL,
    `changedById` INTEGER NULL,
    `changedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SupportRequestHistory_supportRequestId_idx`(`supportRequestId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Selection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campaignId` INTEGER NOT NULL,
    `employeeId` INTEGER NOT NULL,
    `status` ENUM('CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'CONFIRMED',
    `confirmedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `cancelledAt` DATETIME(3) NULL,
    `cancelledById` INTEGER NULL,
    `cancellationReason` VARCHAR(500) NULL,
    `employeeNameSnapshot` VARCHAR(180) NOT NULL,
    `employeeDocumentIdSnapshot` VARCHAR(50) NOT NULL,
    `campaignNameSnapshot` VARCHAR(180) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Selection_campaignId_idx`(`campaignId`),
    INDEX `Selection_employeeId_idx`(`employeeId`),
    INDEX `Selection_status_idx`(`status`),
    INDEX `Selection_confirmedAt_idx`(`confirmedAt`),
    UNIQUE INDEX `Selection_campaignId_employeeId_key`(`campaignId`, `employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SelectionItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `selectionId` INTEGER NOT NULL,
    `campaignId` INTEGER NOT NULL,
    `employeeId` INTEGER NOT NULL,
    `beneficiaryId` INTEGER NOT NULL,
    `giftId` INTEGER NOT NULL,
    `beneficiaryNameSnapshot` VARCHAR(180) NOT NULL,
    `beneficiaryAgeSnapshot` INTEGER NOT NULL,
    `beneficiaryGenderSnapshot` VARCHAR(10) NOT NULL,
    `giftNameSnapshot` VARCHAR(180) NOT NULL,
    `giftReferenceSnapshot` VARCHAR(50) NOT NULL,
    `giftImageUrlSnapshot` VARCHAR(500) NULL,
    `confirmedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SelectionItem_selectionId_idx`(`selectionId`),
    INDEX `SelectionItem_campaignId_idx`(`campaignId`),
    INDEX `SelectionItem_employeeId_idx`(`employeeId`),
    INDEX `SelectionItem_beneficiaryId_idx`(`beneficiaryId`),
    INDEX `SelectionItem_giftId_idx`(`giftId`),
    UNIQUE INDEX `SelectionItem_selectionId_beneficiaryId_key`(`selectionId`, `beneficiaryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockMovement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `giftId` INTEGER NOT NULL,
    `campaignId` INTEGER NOT NULL,
    `selectionItemId` INTEGER NULL,
    `movementType` ENUM('SELECTION_CONFIRMATION', 'ADMIN_ADJUSTMENT', 'RESTOCK', 'CORRECTION') NOT NULL,
    `quantityChange` INTEGER NOT NULL,
    `previousStock` INTEGER NOT NULL,
    `newStock` INTEGER NOT NULL,
    `reason` VARCHAR(500) NULL,
    `createdById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `StockMovement_giftId_idx`(`giftId`),
    INDEX `StockMovement_campaignId_idx`(`campaignId`),
    INDEX `StockMovement_selectionItemId_idx`(`selectionItemId`),
    INDEX `StockMovement_movementType_idx`(`movementType`),
    INDEX `StockMovement_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmailLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campaignId` INTEGER NULL,
    `employeeId` INTEGER NULL,
    `selectionId` INTEGER NULL,
    `supportRequestId` INTEGER NULL,
    `recipientEmail` VARCHAR(180) NULL,
    `emailType` ENUM('CONFIRMATION', 'SUPPORT_NOTIFICATION', 'ADMIN_NOTIFICATION', 'OTHER') NOT NULL,
    `status` ENUM('SIMULATED', 'PENDING', 'SENT', 'FAILED') NOT NULL DEFAULT 'SIMULATED',
    `subject` VARCHAR(255) NULL,
    `details` TEXT NULL,
    `providerMessageId` VARCHAR(255) NULL,
    `sentAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `EmailLog_campaignId_idx`(`campaignId`),
    INDEX `EmailLog_employeeId_idx`(`employeeId`),
    INDEX `EmailLog_selectionId_idx`(`selectionId`),
    INDEX `EmailLog_supportRequestId_idx`(`supportRequestId`),
    INDEX `EmailLog_emailType_idx`(`emailType`),
    INDEX `EmailLog_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AdminUser` ADD CONSTRAINT `AdminUser_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Campaign` ADD CONSTRAINT `Campaign_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `AdminUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Campaign` ADD CONSTRAINT `Campaign_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `AdminUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `AdminUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `AdminUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Beneficiary` ADD CONSTRAINT `Beneficiary_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Beneficiary` ADD CONSTRAINT `Beneficiary_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `AdminUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Beneficiary` ADD CONSTRAINT `Beneficiary_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `AdminUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gift` ADD CONSTRAINT `Gift_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gift` ADD CONSTRAINT `Gift_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `AdminUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gift` ADD CONSTRAINT `Gift_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `AdminUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GiftImage` ADD CONSTRAINT `GiftImage_giftId_fkey` FOREIGN KEY (`giftId`) REFERENCES `Gift`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupportRequest` ADD CONSTRAINT `SupportRequest_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupportRequest` ADD CONSTRAINT `SupportRequest_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupportRequest` ADD CONSTRAINT `SupportRequest_resolvedById_fkey` FOREIGN KEY (`resolvedById`) REFERENCES `AdminUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupportRequestHistory` ADD CONSTRAINT `SupportRequestHistory_supportRequestId_fkey` FOREIGN KEY (`supportRequestId`) REFERENCES `SupportRequest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupportRequestHistory` ADD CONSTRAINT `SupportRequestHistory_changedById_fkey` FOREIGN KEY (`changedById`) REFERENCES `AdminUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Selection` ADD CONSTRAINT `Selection_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Selection` ADD CONSTRAINT `Selection_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Selection` ADD CONSTRAINT `Selection_cancelledById_fkey` FOREIGN KEY (`cancelledById`) REFERENCES `AdminUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SelectionItem` ADD CONSTRAINT `SelectionItem_selectionId_fkey` FOREIGN KEY (`selectionId`) REFERENCES `Selection`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SelectionItem` ADD CONSTRAINT `SelectionItem_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SelectionItem` ADD CONSTRAINT `SelectionItem_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SelectionItem` ADD CONSTRAINT `SelectionItem_beneficiaryId_fkey` FOREIGN KEY (`beneficiaryId`) REFERENCES `Beneficiary`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SelectionItem` ADD CONSTRAINT `SelectionItem_giftId_fkey` FOREIGN KEY (`giftId`) REFERENCES `Gift`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockMovement` ADD CONSTRAINT `StockMovement_giftId_fkey` FOREIGN KEY (`giftId`) REFERENCES `Gift`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockMovement` ADD CONSTRAINT `StockMovement_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockMovement` ADD CONSTRAINT `StockMovement_selectionItemId_fkey` FOREIGN KEY (`selectionItemId`) REFERENCES `SelectionItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockMovement` ADD CONSTRAINT `StockMovement_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `AdminUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmailLog` ADD CONSTRAINT `EmailLog_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmailLog` ADD CONSTRAINT `EmailLog_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmailLog` ADD CONSTRAINT `EmailLog_selectionId_fkey` FOREIGN KEY (`selectionId`) REFERENCES `Selection`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmailLog` ADD CONSTRAINT `EmailLog_supportRequestId_fkey` FOREIGN KEY (`supportRequestId`) REFERENCES `SupportRequest`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
