-- DropForeignKey
ALTER TABLE "Travel" DROP CONSTRAINT "Travel_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Travel" DROP CONSTRAINT "Travel_userId_fkey";

-- AddForeignKey
ALTER TABLE "Travel" ADD CONSTRAINT "Travel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Travel" ADD CONSTRAINT "Travel_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
