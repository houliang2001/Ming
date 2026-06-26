-- CreateTable
CREATE TABLE `dailyfortune` (
    `id` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NULL,
    `score` INTEGER NOT NULL,
    `keyword` VARCHAR(191) NOT NULL,
    `luckyColor` VARCHAR(191) NULL,
    `suitable` JSON NOT NULL,
    `avoid` JSON NOT NULL,
    `quote` TEXT NOT NULL,
    `advice` TEXT NOT NULL,
    `fortuneDate` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `dailyfortune_clientId_idx` ON `dailyfortune`(`clientId`);

-- CreateIndex
CREATE INDEX `dailyfortune_fortuneDate_idx` ON `dailyfortune`(`fortuneDate`);
