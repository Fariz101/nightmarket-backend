/*
  Warnings:

  - A unique constraint covering the columns `[customerId,productId]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `cartitem` DROP FOREIGN KEY `CartItem_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `cartitem` DROP FOREIGN KEY `CartItem_productId_fkey`;

-- DropIndex
DROP INDEX `CartItem_customerId_key` ON `cartitem`;

-- DropIndex
DROP INDEX `CartItem_productId_key` ON `cartitem`;

-- CreateIndex
CREATE UNIQUE INDEX `CartItem_customerId_productId_key` ON `CartItem`(`customerId`, `productId`);

-- AddForeignKey
ALTER TABLE `Customer` ADD CONSTRAINT `Customer_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Seller` ADD CONSTRAINT `Seller_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
