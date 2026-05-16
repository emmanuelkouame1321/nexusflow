-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "createdBy" INTEGER;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
