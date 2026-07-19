-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "bodyAr" TEXT,
ADD COLUMN     "titleAr" TEXT;

-- AlterTable
ALTER TABLE "Creator" ADD COLUMN     "bioAr" TEXT,
ADD COLUMN     "nameAr" TEXT,
ADD COLUMN     "roleAr" TEXT;

-- AlterTable
ALTER TABLE "SchoolProfile" ADD COLUMN     "missionAr" TEXT,
ADD COLUMN     "nameAr" TEXT;
