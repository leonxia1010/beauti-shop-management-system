-- CreateEnum
CREATE TYPE "public"."exception_type" AS ENUM ('VALIDATION_ERROR', 'BUSINESS_RULE_VIOLATION', 'DATA_ANOMALY', 'SUSPICIOUS_ACTIVITY');

-- CreateEnum
CREATE TYPE "public"."exception_severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "public"."exception_records" (
    "id" TEXT NOT NULL,
    "table_name" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "exception_type" "public"."exception_type" NOT NULL,
    "severity" "public"."exception_severity" NOT NULL,
    "message" TEXT NOT NULL,
    "field_name" TEXT,
    "field_value" TEXT,
    "rule_name" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_by" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exception_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exception_records_table_name_idx" ON "public"."exception_records"("table_name");

-- CreateIndex
CREATE INDEX "exception_records_record_id_idx" ON "public"."exception_records"("record_id");

-- CreateIndex
CREATE INDEX "exception_records_store_id_idx" ON "public"."exception_records"("store_id");

-- CreateIndex
CREATE INDEX "exception_records_severity_idx" ON "public"."exception_records"("severity");

-- CreateIndex
CREATE INDEX "exception_records_resolved_idx" ON "public"."exception_records"("resolved");

-- CreateIndex
CREATE INDEX "exception_records_created_at_idx" ON "public"."exception_records"("created_at");
