-- CreateEnum
CREATE TYPE "Source" AS ENUM ('manual', 'ai', 'mixed', 'system');

-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('result', 'project', 'habit');

-- CreateEnum
CREATE TYPE "AiScenario" AS ENUM ('quick_quarter_plan', 'vision_to_annual_okr', 'annual_to_quarter_okr', 'quarter_to_four_week_commitments', 'weekly_focus_to_todos', 'replan_future_weeks', 'manual_local_assist');

-- CreateEnum
CREATE TYPE "AiGenerationStatus" AS ENUM ('pending', 'completed', 'failed', 'confirmed');

-- CreateEnum
CREATE TYPE "PushPlatform" AS ENUM ('ios', 'android', 'web');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "phone" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Shanghai',
    "has_completed_onboarding" BOOLEAN NOT NULL DEFAULT false,
    "preferences_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "source" "Source" NOT NULL DEFAULT 'manual',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "visions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "annual_objectives" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "objectives" JSONB NOT NULL,
    "source" "Source" NOT NULL DEFAULT 'manual',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "annual_objectives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quarters" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "quarter" INTEGER NOT NULL,
    "starts_on" DATE NOT NULL,
    "ends_on" DATE NOT NULL,
    "source" "Source" NOT NULL DEFAULT 'system',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "quarters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quarter_goals" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "quarter_id" UUID,
    "annual_objective_id" UUID,
    "title" TEXT NOT NULL,
    "goal_type" "GoalType",
    "source" "Source" NOT NULL DEFAULT 'manual',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "quarter_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "month_goals" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "month_id" TEXT NOT NULL,
    "quarter_goal_id" UUID,
    "title" TEXT NOT NULL,
    "source" "Source" NOT NULL DEFAULT 'manual',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "month_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goal_classifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "quarter_goal_id" UUID NOT NULL,
    "goal_type" "GoalType" NOT NULL,
    "confidence" DOUBLE PRECISION,
    "reason" TEXT,
    "source" "Source" NOT NULL DEFAULT 'ai',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "goal_classifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "month_plans" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "month_id" TEXT NOT NULL,
    "month_goal_id" UUID,
    "source" "Source" NOT NULL DEFAULT 'manual',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "month_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "week_plans" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "week_id" TEXT NOT NULL,
    "month_plan_id" UUID,
    "source" "Source" NOT NULL DEFAULT 'manual',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "week_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_focuses" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "week_plan_id" UUID,
    "week_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reason" TEXT,
    "invalidated_at" TIMESTAMP(3),
    "source" "Source" NOT NULL DEFAULT 'manual',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "weekly_focuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "todos" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "week_plan_id" UUID,
    "source_focus_id" UUID,
    "title" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "estimated_minutes" INTEGER,
    "user_edited" BOOLEAN NOT NULL DEFAULT false,
    "source" "Source" NOT NULL DEFAULT 'manual',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "todos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "energy_entries" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "week_plan_id" UUID,
    "week_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "score" INTEGER NOT NULL,
    "has_viewed_todos" BOOLEAN NOT NULL DEFAULT false,
    "source" "Source" NOT NULL DEFAULT 'manual',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "energy_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_settlements" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "week_plan_id" UUID,
    "week_id" TEXT NOT NULL,
    "suggested_score" INTEGER NOT NULL,
    "final_score" INTEGER NOT NULL,
    "reflection" TEXT,
    "snapshot_json" JSONB NOT NULL,
    "confirmed_at" TIMESTAMP(3) NOT NULL,
    "source" "Source" NOT NULL DEFAULT 'manual',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "weekly_settlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tree_fruits" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "week_plan_id" UUID,
    "weekly_settlement_id" UUID,
    "week_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "capsule_summary" TEXT NOT NULL,
    "source" "Source" NOT NULL DEFAULT 'system',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tree_fruits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quarter_honors" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "quarter_id" UUID,
    "average_score" DOUBLE PRECISION NOT NULL,
    "earned_at" TIMESTAMP(3) NOT NULL,
    "source" "Source" NOT NULL DEFAULT 'system',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "quarter_honors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_generations" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "scenario" "AiScenario" NOT NULL,
    "prompt_version" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "input_hash" TEXT NOT NULL,
    "input_json" JSONB NOT NULL,
    "output_json" JSONB,
    "status" "AiGenerationStatus" NOT NULL DEFAULT 'pending',
    "error_code" TEXT,
    "context_version" TEXT,
    "regenerate_from_id" UUID,
    "confirmed_at" TIMESTAMP(3),
    "source" "Source" NOT NULL DEFAULT 'ai',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ai_generations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_devices" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "device_id" TEXT NOT NULL,
    "device_name" TEXT,
    "platform" TEXT,
    "pull_cursor" TEXT,
    "last_synced_at" TIMESTAMP(3),
    "source" "Source" NOT NULL DEFAULT 'system',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "sync_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "source" "Source" NOT NULL DEFAULT 'system',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "platform" "PushPlatform" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "source" "Source" NOT NULL DEFAULT 'system',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "push_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "visions_user_id_idx" ON "visions"("user_id");

-- CreateIndex
CREATE INDEX "annual_objectives_user_id_year_idx" ON "annual_objectives"("user_id", "year");

-- CreateIndex
CREATE UNIQUE INDEX "quarters_user_id_year_quarter_key" ON "quarters"("user_id", "year", "quarter");

-- CreateIndex
CREATE INDEX "quarter_goals_user_id_quarter_id_idx" ON "quarter_goals"("user_id", "quarter_id");

-- CreateIndex
CREATE INDEX "month_goals_user_id_month_id_idx" ON "month_goals"("user_id", "month_id");

-- CreateIndex
CREATE INDEX "goal_classifications_user_id_quarter_goal_id_idx" ON "goal_classifications"("user_id", "quarter_goal_id");

-- CreateIndex
CREATE INDEX "month_plans_user_id_month_id_idx" ON "month_plans"("user_id", "month_id");

-- CreateIndex
CREATE UNIQUE INDEX "week_plans_user_id_week_id_key" ON "week_plans"("user_id", "week_id");

-- CreateIndex
CREATE INDEX "weekly_focuses_user_id_week_id_idx" ON "weekly_focuses"("user_id", "week_id");

-- CreateIndex
CREATE INDEX "todos_user_id_date_idx" ON "todos"("user_id", "date");

-- CreateIndex
CREATE INDEX "energy_entries_user_id_week_id_idx" ON "energy_entries"("user_id", "week_id");

-- CreateIndex
CREATE UNIQUE INDEX "energy_entries_user_id_date_key" ON "energy_entries"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_settlements_week_plan_id_key" ON "weekly_settlements"("week_plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_settlements_user_id_week_id_key" ON "weekly_settlements"("user_id", "week_id");

-- CreateIndex
CREATE UNIQUE INDEX "tree_fruits_week_plan_id_key" ON "tree_fruits"("week_plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "tree_fruits_weekly_settlement_id_key" ON "tree_fruits"("weekly_settlement_id");

-- CreateIndex
CREATE INDEX "tree_fruits_user_id_week_id_idx" ON "tree_fruits"("user_id", "week_id");

-- CreateIndex
CREATE INDEX "quarter_honors_user_id_quarter_id_idx" ON "quarter_honors"("user_id", "quarter_id");

-- CreateIndex
CREATE INDEX "ai_generations_user_id_scenario_status_idx" ON "ai_generations"("user_id", "scenario", "status");

-- CreateIndex
CREATE UNIQUE INDEX "sync_devices_user_id_device_id_key" ON "sync_devices"("user_id", "device_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "push_tokens_token_key" ON "push_tokens"("token");

-- CreateIndex
CREATE INDEX "push_tokens_user_id_idx" ON "push_tokens"("user_id");

-- AddForeignKey
ALTER TABLE "visions" ADD CONSTRAINT "visions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "annual_objectives" ADD CONSTRAINT "annual_objectives_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quarters" ADD CONSTRAINT "quarters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quarter_goals" ADD CONSTRAINT "quarter_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quarter_goals" ADD CONSTRAINT "quarter_goals_quarter_id_fkey" FOREIGN KEY ("quarter_id") REFERENCES "quarters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quarter_goals" ADD CONSTRAINT "quarter_goals_annual_objective_id_fkey" FOREIGN KEY ("annual_objective_id") REFERENCES "annual_objectives"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "month_goals" ADD CONSTRAINT "month_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "month_goals" ADD CONSTRAINT "month_goals_quarter_goal_id_fkey" FOREIGN KEY ("quarter_goal_id") REFERENCES "quarter_goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_classifications" ADD CONSTRAINT "goal_classifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_classifications" ADD CONSTRAINT "goal_classifications_quarter_goal_id_fkey" FOREIGN KEY ("quarter_goal_id") REFERENCES "quarter_goals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "month_plans" ADD CONSTRAINT "month_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "month_plans" ADD CONSTRAINT "month_plans_month_goal_id_fkey" FOREIGN KEY ("month_goal_id") REFERENCES "month_goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "week_plans" ADD CONSTRAINT "week_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "week_plans" ADD CONSTRAINT "week_plans_month_plan_id_fkey" FOREIGN KEY ("month_plan_id") REFERENCES "month_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_focuses" ADD CONSTRAINT "weekly_focuses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_focuses" ADD CONSTRAINT "weekly_focuses_week_plan_id_fkey" FOREIGN KEY ("week_plan_id") REFERENCES "week_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todos" ADD CONSTRAINT "todos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todos" ADD CONSTRAINT "todos_week_plan_id_fkey" FOREIGN KEY ("week_plan_id") REFERENCES "week_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todos" ADD CONSTRAINT "todos_source_focus_id_fkey" FOREIGN KEY ("source_focus_id") REFERENCES "weekly_focuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "energy_entries" ADD CONSTRAINT "energy_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "energy_entries" ADD CONSTRAINT "energy_entries_week_plan_id_fkey" FOREIGN KEY ("week_plan_id") REFERENCES "week_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_settlements" ADD CONSTRAINT "weekly_settlements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_settlements" ADD CONSTRAINT "weekly_settlements_week_plan_id_fkey" FOREIGN KEY ("week_plan_id") REFERENCES "week_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tree_fruits" ADD CONSTRAINT "tree_fruits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tree_fruits" ADD CONSTRAINT "tree_fruits_week_plan_id_fkey" FOREIGN KEY ("week_plan_id") REFERENCES "week_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tree_fruits" ADD CONSTRAINT "tree_fruits_weekly_settlement_id_fkey" FOREIGN KEY ("weekly_settlement_id") REFERENCES "weekly_settlements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quarter_honors" ADD CONSTRAINT "quarter_honors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quarter_honors" ADD CONSTRAINT "quarter_honors_quarter_id_fkey" FOREIGN KEY ("quarter_id") REFERENCES "quarters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_generations" ADD CONSTRAINT "ai_generations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_generations" ADD CONSTRAINT "ai_generations_regenerate_from_id_fkey" FOREIGN KEY ("regenerate_from_id") REFERENCES "ai_generations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_devices" ADD CONSTRAINT "sync_devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_tokens" ADD CONSTRAINT "push_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
