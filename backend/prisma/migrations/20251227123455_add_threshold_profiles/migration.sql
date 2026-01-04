-- CreateEnum
CREATE TYPE "threshold_mode" AS ENUM ('MANUAL', 'AI_N8N');

-- CreateTable
CREATE TABLE "machine_threshold_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID,
    "machine_id" UUID NOT NULL,
    "mode" "threshold_mode" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "ai_request" JSONB,
    "ai_response" JSONB,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "machine_threshold_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "thresholds_machine_active_idx" ON "machine_threshold_profiles"("machine_id", "active");

-- CreateIndex
CREATE INDEX "thresholds_tenant_created_idx" ON "machine_threshold_profiles"("tenant_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "machine_threshold_profiles" ADD CONSTRAINT "machine_threshold_profiles_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "machine_threshold_profiles" ADD CONSTRAINT "machine_threshold_profiles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "machine_threshold_profiles" ADD CONSTRAINT "machine_threshold_profiles_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
