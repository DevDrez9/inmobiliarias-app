-- AlterTable
ALTER TABLE `user` ADD COLUMN `facebookAccessToken` TEXT NULL,
    ADD COLUMN `facebookPageId` VARCHAR(191) NULL,
    ADD COLUMN `facebookPageName` VARCHAR(191) NULL;
