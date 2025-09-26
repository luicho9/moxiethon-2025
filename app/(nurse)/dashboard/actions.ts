/** biome-ignore-all lint/style/noMagicNumbers: PIN length constants */
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireNurseSession } from "@/lib/auth";
import { createPatientAccount } from "@/lib/db/queries";

export type CreatePatientActionState =
  | { status: "idle" }
  | { status: "invalid_data"; message: string }
  | { status: "failed"; message: string }
  | { status: "success"; username: string; pin: string };

const createPatientSchema = z.object({
  username: z
    .string()
    .min(3, "Username too short")
    .max(48, "Username too long"),
  diseases: z.string().optional(),
  medications: z.string().optional(),
  religion: z.string().optional(),
  family: z.string().optional(),
  preferences: z.string().optional(),
});

export async function createPatientAction(
  _prevState: CreatePatientActionState,
  formData: FormData
): Promise<CreatePatientActionState> {
  try {
    const session = await requireNurseSession();

    const parsed = createPatientSchema.safeParse({
      username: String(formData.get("username") ?? ""),
      diseases: String(formData.get("diseases") ?? ""),
      medications: String(formData.get("medications") ?? ""),
      religion: String(formData.get("religion") ?? ""),
      family: String(formData.get("family") ?? ""),
      preferences: String(formData.get("preferences") ?? ""),
    });

    if (!parsed.success) {
      return {
        status: "invalid_data",
        message: parsed.error.issues
          .map((e: { message: string }) => e.message)
          .join(", "),
      };
    }

    const { username, diseases, medications, religion, family, preferences } =
      parsed.data;

    const result = await createPatientAccount({
      username,
      clinicId: session.clinicId,
      diseases,
      medications,
      religion,
      family,
      preferences,
    });

    revalidatePath("/dashboard");

    return {
      status: "success",
      username,
      pin: result.pin,
    };
  } catch {
    // Log error in production logging system
    return { status: "failed", message: "Error creating patient account" };
  }
}
