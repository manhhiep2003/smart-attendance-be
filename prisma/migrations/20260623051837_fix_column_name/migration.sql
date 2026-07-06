/*
  Warnings:

  - You are about to drop the column `verifiedAt` on the `attendance_records` table. All the data in the column will be lost.
  - You are about to drop the column `qrUpdatedAt` on the `sessions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "attendance_records" DROP COLUMN "verifiedAt",
ADD COLUMN     "verified_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "qrUpdatedAt",
ADD COLUMN     "qr_updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
