/*
  Warnings:

  - You are about to drop the column `dishId` on the `ingredients` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ingredients" DROP CONSTRAINT "ingredients_dishId_fkey";

-- AlterTable
ALTER TABLE "ingredients" DROP COLUMN "dishId",
ADD COLUMN     "dish_id" TEXT;

-- AddForeignKey
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_dish_id_fkey" FOREIGN KEY ("dish_id") REFERENCES "dishes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
