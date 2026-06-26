-- AlterTable
ALTER TABLE `report` ADD COLUMN `clientId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `report_clientId_idx` ON `report`(`clientId`);
