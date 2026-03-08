-- CreateEnum
CREATE TYPE "Role" AS ENUM ('LEARNER', 'GUIDE', 'DUAL', 'ADMIN');

-- CreateEnum
CREATE TYPE "SessionLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "TemplateType" AS ENUM ('SKILL_BREAKDOWN', 'QUICK_START', 'PRACTICAL_DRILL', 'CONCEPT_TO_ACTION');

-- CreateEnum
CREATE TYPE "BadgeType" AS ENUM ('TOP_GUIDE', 'RISING_STAR', 'VERIFIED', 'PERFECT_SCORE', 'FOUNDER', 'ACTIVE_LEARNER', 'STREAK');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'LEARNER',
    "bio" TEXT,
    "location" TEXT,
    "avatar_url" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3),
    "response_time" TEXT,
    "completion_rate" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "stripe_account_id" TEXT,
    "stripe_customer_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "level" "SessionLevel" NOT NULL DEFAULT 'BEGINNER',
    "template" "TemplateType" NOT NULL DEFAULT 'SKILL_BREAKDOWN',
    "remote" BOOLEAN NOT NULL DEFAULT true,
    "local" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "trending" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "total_booked" INTEGER NOT NULL DEFAULT 0,
    "average_rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "takeaway" TEXT NOT NULL,
    "follow_up_exercise" TEXT NOT NULL,
    "next_available" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "category_id" TEXT NOT NULL,
    "guide_id" TEXT NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_steps" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,

    CONSTRAINT "session_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_materials" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,

    CONSTRAINT "session_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_tags" (
    "id" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,

    CONSTRAINT "session_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "learner_id" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "meeting_link" TEXT,
    "notes" TEXT,
    "recap" TEXT,
    "calendar_event_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "platform_fee" DECIMAL(10,2) NOT NULL,
    "guide_earning" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "stripe_payment_intent_id" TEXT,
    "stripe_charge_id" TEXT,
    "refunded_at" TIMESTAMP(3),
    "refund_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "earnings" (
    "id" TEXT NOT NULL,
    "guide_id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paid_out" BOOLEAN NOT NULL DEFAULT false,
    "paid_out_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "earnings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "learner_id" TEXT NOT NULL,
    "guide_id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "outcome_achieved" BOOLEAN NOT NULL DEFAULT false,
    "comment" TEXT NOT NULL,
    "helpful_count" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templates" (
    "id" "TemplateType" NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "session_count" INTEGER NOT NULL DEFAULT 0,
    "best_for" TEXT[],

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_steps" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "tip" TEXT NOT NULL,
    "template_id" "TemplateType" NOT NULL,

    CONSTRAINT "template_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_badges" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "badge" "BadgeType" NOT NULL,
    "awarded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_skills" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "skill" TEXT NOT NULL,

    CONSTRAINT "user_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_paths" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skill_paths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_path_sessions" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "skill_path_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,

    CONSTRAINT "skill_path_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_skill_paths" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "skill_path_id" TEXT NOT NULL,
    "completed_sessions" INTEGER NOT NULL DEFAULT 0,
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "user_skill_paths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guide_availability" (
    "id" TEXT NOT NULL,
    "guide_id" TEXT NOT NULL,
    "slots" JSONB NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guide_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "sessions_guide_id_idx" ON "sessions"("guide_id");

-- CreateIndex
CREATE INDEX "sessions_category_id_idx" ON "sessions"("category_id");

-- CreateIndex
CREATE INDEX "sessions_featured_idx" ON "sessions"("featured");

-- CreateIndex
CREATE INDEX "sessions_trending_idx" ON "sessions"("trending");

-- CreateIndex
CREATE INDEX "session_steps_session_id_idx" ON "session_steps"("session_id");

-- CreateIndex
CREATE INDEX "session_materials_session_id_idx" ON "session_materials"("session_id");

-- CreateIndex
CREATE INDEX "session_tags_session_id_idx" ON "session_tags"("session_id");

-- CreateIndex
CREATE INDEX "bookings_learner_id_idx" ON "bookings"("learner_id");

-- CreateIndex
CREATE INDEX "bookings_session_id_idx" ON "bookings"("session_id");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payments_booking_id_key" ON "payments"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripe_payment_intent_id_key" ON "payments"("stripe_payment_intent_id");

-- CreateIndex
CREATE INDEX "payments_stripe_payment_intent_id_idx" ON "payments"("stripe_payment_intent_id");

-- CreateIndex
CREATE UNIQUE INDEX "earnings_payment_id_key" ON "earnings"("payment_id");

-- CreateIndex
CREATE INDEX "earnings_guide_id_idx" ON "earnings"("guide_id");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_booking_id_key" ON "reviews"("booking_id");

-- CreateIndex
CREATE INDEX "reviews_session_id_idx" ON "reviews"("session_id");

-- CreateIndex
CREATE INDEX "reviews_guide_id_idx" ON "reviews"("guide_id");

-- CreateIndex
CREATE INDEX "reviews_learner_id_idx" ON "reviews"("learner_id");

-- CreateIndex
CREATE INDEX "template_steps_template_id_idx" ON "template_steps"("template_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_badges_user_id_badge_key" ON "user_badges"("user_id", "badge");

-- CreateIndex
CREATE UNIQUE INDEX "user_skills_user_id_skill_key" ON "user_skills"("user_id", "skill");

-- CreateIndex
CREATE UNIQUE INDEX "skill_path_sessions_skill_path_id_session_id_key" ON "skill_path_sessions"("skill_path_id", "session_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_skill_paths_user_id_skill_path_id_key" ON "user_skill_paths"("user_id", "skill_path_id");

-- CreateIndex
CREATE UNIQUE INDEX "guide_availability_guide_id_key" ON "guide_availability"("guide_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_guide_id_fkey" FOREIGN KEY ("guide_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_steps" ADD CONSTRAINT "session_steps_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_materials" ADD CONSTRAINT "session_materials_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_tags" ADD CONSTRAINT "session_tags_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_learner_id_fkey" FOREIGN KEY ("learner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "earnings" ADD CONSTRAINT "earnings_guide_id_fkey" FOREIGN KEY ("guide_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "earnings" ADD CONSTRAINT "earnings_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_learner_id_fkey" FOREIGN KEY ("learner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_guide_id_fkey" FOREIGN KEY ("guide_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_steps" ADD CONSTRAINT "template_steps_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_path_sessions" ADD CONSTRAINT "skill_path_sessions_skill_path_id_fkey" FOREIGN KEY ("skill_path_id") REFERENCES "skill_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_path_sessions" ADD CONSTRAINT "skill_path_sessions_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_skill_paths" ADD CONSTRAINT "user_skill_paths_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_skill_paths" ADD CONSTRAINT "user_skill_paths_skill_path_id_fkey" FOREIGN KEY ("skill_path_id") REFERENCES "skill_paths"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guide_availability" ADD CONSTRAINT "guide_availability_guide_id_fkey" FOREIGN KEY ("guide_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
