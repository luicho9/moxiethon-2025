import { hashSync } from "bcrypt-ts";
import { and, eq } from "drizzle-orm";
import db from "@/lib/db";
import { clinic, patientProfile, patientStatus, user } from "@/lib/db/schema";

const PIN_SALT_ROUNDS = 10;

function hashPin(pin: string): string {
  const pepper = process.env.CREDENTIALS_PEPPER ?? "";
  return hashSync(`${pin}${pepper}`, PIN_SALT_ROUNDS);
}

export async function getUserByUsername(username: string) {
  const rows = await db
    .select()
    .from(user)
    .where(eq(user.username, username))
    .limit(1);
  return rows[0] ?? null;
}

export async function ensureDefaultClinic(): Promise<string> {
  const existing = await db.select().from(clinic).limit(1);
  if (existing[0]) {
    return existing[0].id;
  }
  const inserted = await db
    .insert(clinic)
    .values({ name: "General Clinic" })
    .returning({ id: clinic.id });
  return inserted[0].id;
}

export async function ensureNurseUser(): Promise<{
  id: string;
  clinicId: string | null;
}> {
  const nurse = await getUserByUsername("enfermera1");
  if (nurse) {
    return { id: nurse.id, clinicId: nurse.clinicId ?? null };
  }
  const clinicId = await ensureDefaultClinic();
  const [created] = await db
    .insert(user)
    .values({
      username: "enfermera1",
      role: "nurse",
      clinicId,
      pinHash: hashPin("1234"),
    })
    .returning({ id: user.id, clinicId: user.clinicId });
  return { id: created.id, clinicId: created.clinicId };
}

export async function createPatientAccount(params: {
  username: string;
  pin: string;
  clinicId: string | null;
}) {
  const [createdUser] = await db
    .insert(user)
    .values({
      username: params.username,
      role: "patient",
      clinicId: params.clinicId ?? null,
      pinHash: hashPin(params.pin),
    })
    .returning({ id: user.id });

  const [createdProfile] = await db
    .insert(patientProfile)
    .values({ userId: createdUser.id, clinicId: params.clinicId ?? null })
    .returning({ id: patientProfile.id });

  await db
    .insert(patientStatus)
    .values({ patientProfileId: createdProfile.id });

  return { userId: createdUser.id, patientProfileId: createdProfile.id };
}

export type ListedPatient = {
  userId: string;
  username: string;
  lastMood: string | null;
  medsSignal: "took" | "skipped" | "unknown";
  lastActiveAt: Date | null;
};

export async function listPatientsForClinic(
  clinicId: string | null
): Promise<ListedPatient[]> {
  const rows = await db
    .select({
      userId: user.id,
      username: user.username,
      lastMood: patientStatus.lastMood,
      medsSignal: patientStatus.medsSignal,
      lastActiveAt: patientStatus.lastActiveAt,
    })
    .from(user)
    .leftJoin(patientProfile, eq(patientProfile.userId, user.id))
    .leftJoin(
      patientStatus,
      eq(patientStatus.patientProfileId, patientProfile.id)
    )
    .where(
      and(
        eq(user.role, "patient"),
        clinicId ? eq(user.clinicId, clinicId) : (undefined as never)
      )
    );

  return rows as ListedPatient[];
}
