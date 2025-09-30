-- CreateEnum
CREATE TYPE "public"."audit_action" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "public"."payment_method" AS ENUM ('cash', 'transfer', 'other');

-- CreateTable
CREATE TABLE "public"."service_sessions" (
    "id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "beautician_id" TEXT NOT NULL,
    "service_date" DATE NOT NULL,
    "gross_revenue" DECIMAL(12,2) NOT NULL,
    "payment_method" "public"."payment_method" NOT NULL,
    "beautician_share" DECIMAL(12,2),
    "subsidy" DECIMAL(12,2),
    "net_revenue" DECIMAL(12,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "entry_channel" TEXT,
    "exception_flag" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "service_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cost_entries" (
    "id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "payer" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "allocation_rule_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "cost_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" TEXT NOT NULL,
    "table_name" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "action" "public"."audit_action" NOT NULL,
    "old_values" JSONB,
    "new_values" JSONB,
    "changed_by" TEXT NOT NULL,
    "request_id" TEXT,
    "store_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "service_sessions_store_id_idx" ON "public"."service_sessions"("store_id");

-- CreateIndex
CREATE INDEX "service_sessions_service_date_idx" ON "public"."service_sessions"("service_date");

-- CreateIndex
CREATE INDEX "service_sessions_beautician_id_idx" ON "public"."service_sessions"("beautician_id");

-- CreateIndex
CREATE INDEX "service_sessions_store_id_service_date_idx" ON "public"."service_sessions"("store_id", "service_date");

-- CreateIndex
CREATE INDEX "cost_entries_store_id_idx" ON "public"."cost_entries"("store_id");

-- CreateIndex
CREATE INDEX "cost_entries_category_idx" ON "public"."cost_entries"("category");

-- CreateIndex
CREATE INDEX "cost_entries_created_at_idx" ON "public"."cost_entries"("created_at");

-- CreateIndex
CREATE INDEX "cost_entries_store_id_category_idx" ON "public"."cost_entries"("store_id", "category");

-- CreateIndex
CREATE INDEX "audit_logs_table_name_idx" ON "public"."audit_logs"("table_name");

-- CreateIndex
CREATE INDEX "audit_logs_record_id_idx" ON "public"."audit_logs"("record_id");

-- CreateIndex
CREATE INDEX "audit_logs_changed_by_idx" ON "public"."audit_logs"("changed_by");

-- CreateIndex
CREATE INDEX "audit_logs_store_id_idx" ON "public"."audit_logs"("store_id");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "public"."audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_table_name_record_id_idx" ON "public"."audit_logs"("table_name", "record_id");
