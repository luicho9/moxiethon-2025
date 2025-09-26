/** biome-ignore-all lint/style/noMagicNumbers: <explanation> */
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
  pin: z
    .string()
    .min(4, "PIN must be at least 4 digits")
    .max(12, "PIN too long"),
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
      pin: String(formData.get("pin") ?? ""),
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

    const { username, pin } = parsed.data;

    await createPatientAccount({
      username,
      pin,
      clinicId: session.clinicId,
    });

    revalidatePath("/dashboard");

    return {
      status: "success",
      username,
      pin,
    };
  } catch {
    // Log error in production logging system
    return { status: "failed", message: "Error creating patient account" };
  }
}
