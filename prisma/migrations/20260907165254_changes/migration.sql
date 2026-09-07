/*
  Warnings:

  - You are about to drop the column `isVerifiedOrg` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VolunteerAssignment` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'HOSPITAL';

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_actorId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "VolunteerAssignment" DROP CONSTRAINT "VolunteerAssignment_assignedById_fkey";

-- DropForeignKey
ALTER TABLE "VolunteerAssignment" DROP CONSTRAINT "VolunteerAssignment_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isVerifiedOrg";

-- DropTable
DROP TABLE "AuditLog";

-- DropTable
DROP TABLE "Notification";

-- DropTable
DROP TABLE "VolunteerAssignment";
