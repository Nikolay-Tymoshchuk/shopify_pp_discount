/*
  Warnings:

  - You are about to drop the column `offerName` on the `Funnel` table. All the data in the column will be lost.
  - You are about to drop the column `triggerName` on the `Funnel` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Funnel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "shopId" INTEGER NOT NULL,
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
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
