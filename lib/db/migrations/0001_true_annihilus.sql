DROP INDEX "idx_patient_profile_user";--> statement-breakpoint
DROP INDEX "idx_patient_profile_clinic";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "pin_hash" SET DEFAULT '';--> statement-breakpoint

UPDATE "user"
SET pin_hash = ''
WHERE pin_hash IS NULL;--> statement-breakpoint

ALTER TABLE "user" ALTER COLUMN "pin_hash" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_patient_profile_user_v1" ON "patient_profile" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_patient_profile_clinic_v1" ON "patient_profile" USING btree ("clinic_id");--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "password_hash";