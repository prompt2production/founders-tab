-- CreateEnum
CREATE TYPE "ExpenseStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED');

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "status" "ExpenseStatus" NOT NULL DEFAULT 'PENDING_APPROVAL';
