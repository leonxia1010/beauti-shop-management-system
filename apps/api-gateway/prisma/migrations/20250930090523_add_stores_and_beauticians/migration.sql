-- AlterTable
ALTER TABLE "public"."cost_entries" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "entry_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "public"."stores" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."beauticians" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beauticians_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stores_code_key" ON "public"."stores"("code");

-- CreateIndex
CREATE UNIQUE INDEX "beauticians_employee_id_key" ON "public"."beauticians"("employee_id");

-- CreateIndex
CREATE INDEX "cost_entries_entry_date_idx" ON "public"."cost_entries"("entry_date");

-- CreateIndex
CREATE INDEX "cost_entries_deleted_at_idx" ON "public"."cost_entries"("deleted_at");

-- AddForeignKey
ALTER TABLE "public"."service_sessions" ADD CONSTRAINT "service_sessions_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."service_sessions" ADD CONSTRAINT "service_sessions_beautician_id_fkey" FOREIGN KEY ("beautician_id") REFERENCES "public"."beauticians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cost_entries" ADD CONSTRAINT "cost_entries_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
