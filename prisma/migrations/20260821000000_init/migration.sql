◇ injected env (6) from .env.local // tip: ⌘ multiple files { path: ['.env.local', '.env'] }
Loaded Prisma config from prisma.config.ts.

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Postcode" (
    "id" TEXT NOT NULL,
    "postcode" TEXT NOT NULL,
    "locality" TEXT NOT NULL,
    "town" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "island" TEXT NOT NULL DEFAULT 'Mauritius',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Postcode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Postcode_postcode_idx" ON "Postcode"("postcode");

-- CreateIndex
CREATE INDEX "Postcode_town_idx" ON "Postcode"("town");

-- CreateIndex
CREATE INDEX "Postcode_locality_idx" ON "Postcode"("locality");

