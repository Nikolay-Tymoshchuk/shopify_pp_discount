/*
  Warnings:

  - You are about to alter the column `shopId` on the `Funnel` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - The primary key for the `Shop` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Shop` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `shopId` on the `Statistic` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Funnel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "shopId" BIGINT NOT NULL,
    "triggerId" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "discount" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Funnel_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Funnel" ("createdAt", "discount", "id", "name", "offerId", "shopId", "triggerId", "updatedAt") SELECT "createdAt", "discount", "id", "name", "offerId", "shopId", "triggerId", "updatedAt" FROM "Funnel";
DROP TABLE "Funnel";
ALTER TABLE "new_Funnel" RENAME TO "Funnel";
CREATE TABLE "new_Shop" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "domain" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL
);
INSERT INTO "new_Shop" ("contactEmail", "domain", "id", "name") SELECT "contactEmail", "domain", "id", "name" FROM "Shop";
DROP TABLE "Shop";
ALTER TABLE "new_Shop" RENAME TO "Shop";
CREATE UNIQUE INDEX "Shop_domain_key" ON "Shop"("domain");
CREATE TABLE "new_Statistic" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shopId" BIGINT NOT NULL,
    "totalRevenue" REAL NOT NULL,
    "totalDiscount" REAL NOT NULL,
    "totalOrders" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Statistic_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Statistic" ("createdAt", "id", "shopId", "totalDiscount", "totalOrders", "totalRevenue", "updatedAt") SELECT "createdAt", "id", "shopId", "totalDiscount", "totalOrders", "totalRevenue", "updatedAt" FROM "Statistic";
DROP TABLE "Statistic";
ALTER TABLE "new_Statistic" RENAME TO "Statistic";
CREATE UNIQUE INDEX "Statistic_shopId_key" ON "Statistic"("shopId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
