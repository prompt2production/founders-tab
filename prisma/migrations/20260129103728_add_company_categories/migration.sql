-- CreateTable
CREATE TABLE "CompanyCategory" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'Tag',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompanyCategory_companyId_isActive_idx" ON "CompanyCategory"("companyId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyCategory_companyId_value_key" ON "CompanyCategory"("companyId", "value");

-- AddForeignKey
ALTER TABLE "CompanyCategory" ADD CONSTRAINT "CompanyCategory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Convert category column from enum to text (preserving data)
-- First, add a temporary text column
ALTER TABLE "Expense" ADD COLUMN "category_temp" TEXT;

-- Copy the enum values to the temp column (casting enum to text)
UPDATE "Expense" SET "category_temp" = "category"::TEXT;

-- Drop the original enum column
ALTER TABLE "Expense" DROP COLUMN "category";

-- Rename the temp column to category
ALTER TABLE "Expense" RENAME COLUMN "category_temp" TO "category";

-- Make the column required (NOT NULL)
ALTER TABLE "Expense" ALTER COLUMN "category" SET NOT NULL;

-- Drop the Category enum
DROP TYPE "Category";

-- Seed default categories for all existing companies
-- Uses gen_random_uuid() for CUID-like IDs (PostgreSQL 13+)
INSERT INTO "CompanyCategory" ("id", "companyId", "value", "label", "icon", "isDefault", "isActive", "sortOrder", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::TEXT,
    c.id,
    cat.value,
    cat.label,
    cat.icon,
    true,
    true,
    cat.sort_order,
    NOW(),
    NOW()
FROM "Company" c
CROSS JOIN (
    VALUES
        ('FOOD', 'Food & Dining', 'Utensils', 0),
        ('TRANSPORT', 'Transport', 'Car', 1),
        ('SOFTWARE', 'Software', 'Monitor', 2),
        ('HARDWARE', 'Hardware', 'Laptop', 3),
        ('OFFICE', 'Office', 'Building', 4),
        ('TRAVEL', 'Travel', 'Plane', 5),
        ('MARKETING', 'Marketing', 'Megaphone', 6),
        ('SERVICES', 'Services', 'Briefcase', 7),
        ('OTHER', 'Other', 'MoreHorizontal', 8)
) AS cat(value, label, icon, sort_order)
WHERE NOT EXISTS (
    SELECT 1 FROM "CompanyCategory" cc
    WHERE cc."companyId" = c.id
);
