-- ============================================================================
-- TasteLab — Initial Migration
-- Generated to match prisma/schema.prisma exactly. Running `npm run db:migrate`
-- against a fresh database will produce this same structure via Prisma; this
-- file is provided so the schema can also be reviewed/applied directly as SQL.
-- ============================================================================

-- Enums
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'KITCHEN');
CREATE TYPE "FoodType" AS ENUM ('FOOD', 'DRINK');
CREATE TYPE "ReviewVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- ============================================================================
-- AUTH TABLES (Better Auth compatible)
-- ============================================================================

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "idToken" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "accounts_providerId_accountId_key" ON "accounts"("providerId", "accountId");
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

CREATE TABLE "verifications" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "verifications_identifier_idx" ON "verifications"("identifier");

-- ============================================================================
-- BRAND / TENANCY
-- ============================================================================

CREATE TABLE "brands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "brands_slug_key" ON "brands"("slug");

CREATE TABLE "kitchen_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kitchen_profiles_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "kitchen_profiles_userId_key" ON "kitchen_profiles"("userId");
CREATE INDEX "kitchen_profiles_brandId_idx" ON "kitchen_profiles"("brandId");

-- ============================================================================
-- CATALOG
-- ============================================================================

CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "categories_brandId_slug_key" ON "categories"("brandId", "slug");
CREATE INDEX "categories_brandId_idx" ON "categories"("brandId");

CREATE TABLE "foods" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "FoodType" NOT NULL DEFAULT 'FOOD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "foods_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "foods_brandId_slug_key" ON "foods"("brandId", "slug");
CREATE INDEX "foods_brandId_idx" ON "foods"("brandId");
CREATE INDEX "foods_categoryId_idx" ON "foods"("categoryId");

CREATE TABLE "food_images" (
    "id" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "food_images_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "food_images_foodId_idx" ON "food_images"("foodId");

-- ============================================================================
-- DYNAMIC NUTRITION SYSTEM
-- ============================================================================

CREATE TABLE "nutrition_types" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "defaultUnit" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nutrition_types_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "nutrition_types_brandId_name_key" ON "nutrition_types"("brandId", "name");
CREATE INDEX "nutrition_types_brandId_idx" ON "nutrition_types"("brandId");

CREATE TABLE "food_nutrition" (
    "id" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "nutritionTypeId" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "food_nutrition_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "food_nutrition_foodId_nutritionTypeId_key" ON "food_nutrition"("foodId", "nutritionTypeId");
CREATE INDEX "food_nutrition_foodId_idx" ON "food_nutrition"("foodId");

-- ============================================================================
-- RATINGS & REVIEWS
-- ============================================================================

CREATE TABLE "ratings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ratings_userId_foodId_key" ON "ratings"("userId", "foodId");
CREATE INDEX "ratings_foodId_idx" ON "ratings"("foodId");

CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "ratingId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "visibility" "ReviewVisibility" NOT NULL DEFAULT 'PUBLIC',
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "reviews_ratingId_key" ON "reviews"("ratingId");
CREATE UNIQUE INDEX "reviews_userId_foodId_key" ON "reviews"("userId", "foodId");
CREATE INDEX "reviews_foodId_idx" ON "reviews"("foodId");
CREATE INDEX "reviews_userId_idx" ON "reviews"("userId");

-- ============================================================================
-- FOREIGN KEYS & CASCADE RULES
-- ============================================================================

ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "kitchen_profiles" ADD CONSTRAINT "kitchen_profiles_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "kitchen_profiles" ADD CONSTRAINT "kitchen_profiles_brandId_fkey"
    FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "categories" ADD CONSTRAINT "categories_brandId_fkey"
    FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "foods" ADD CONSTRAINT "foods_brandId_fkey"
    FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "foods" ADD CONSTRAINT "foods_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "food_images" ADD CONSTRAINT "food_images_foodId_fkey"
    FOREIGN KEY ("foodId") REFERENCES "foods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "nutrition_types" ADD CONSTRAINT "nutrition_types_brandId_fkey"
    FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "food_nutrition" ADD CONSTRAINT "food_nutrition_foodId_fkey"
    FOREIGN KEY ("foodId") REFERENCES "foods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "food_nutrition" ADD CONSTRAINT "food_nutrition_nutritionTypeId_fkey"
    FOREIGN KEY ("nutritionTypeId") REFERENCES "nutrition_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ratings" ADD CONSTRAINT "ratings_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_foodId_fkey"
    FOREIGN KEY ("foodId") REFERENCES "foods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_foodId_fkey"
    FOREIGN KEY ("foodId") REFERENCES "foods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_ratingId_fkey"
    FOREIGN KEY ("ratingId") REFERENCES "ratings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Rating value constrained to 1-5 (application-level enforcement via Zod is
-- primary; this DB check is defense-in-depth against direct SQL writes).
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_value_range_check"
    CHECK ("value" >= 1 AND "value" <= 5);
