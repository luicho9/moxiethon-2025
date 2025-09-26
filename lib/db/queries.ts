import { hashSync } from "bcrypt-ts";
import { and, asc, eq } from "drizzle-orm";
import db from "@/lib/db";
import {
  chat,
  clinic,
  message,
  patientProfile,
  patientStatus,
  user,
} from "@/lib/db/schema";

const PIN_SALT_ROUNDS = 10;
const MIN_PIN_VALUE = 1000;
const MAX_PIN_RANGE = 9000;

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
  const defaultPin = "1234";
  const pinHashValue = hashPin(defaultPin);

  const [created] = await db
    .insert(user)
    .values({
      username: "enfermera1",
      role: "nurse",
      clinicId,
      pinHash: pinHashValue,
    })
    .returning({ id: user.id, clinicId: user.clinicId });
  return { id: created.id, clinicId: created.clinicId };
}

export async function createPatientAccount(params: {
  username: string;
  clinicId: string | null;
  diseases?: string;
  medications?: string;
  religion?: string;
  family?: string;
  preferences?: string;
}) {
  // Generate a random 4-digit PIN
  const pin = Math.floor(
    MIN_PIN_VALUE + Math.random() * MAX_PIN_RANGE
  ).toString();
  const pinHashValue = hashPin(pin);

  const [createdUser] = await db
    .insert(user)
    .values({
      username: params.username,
      role: "patient",
      clinicId: params.clinicId ?? null,
      pinHash: pinHashValue,
    })
    .returning({ id: user.id });

  // Prepare profile data, converting empty strings to null
  const profileData: {
    userId: string;
    clinicId: string | null;
    diseases?: unknown;
    medications?: unknown;
    religion?: string | null;
    family?: unknown;
    preferences?: unknown;
  } = {
    userId: createdUser.id,
    clinicId: params.clinicId ?? null,
  };

  // Add optional fields only if they have values
  if (params.diseases?.trim()) {
    profileData.diseases = params.diseases.trim();
  }
  if (params.medications?.trim()) {
    profileData.medications = params.medications.trim();
  }
  if (params.religion?.trim()) {
    profileData.religion = params.religion.trim();
  }
  if (params.family?.trim()) {
    profileData.family = params.family.trim();
  }
  if (params.preferences?.trim()) {
    profileData.preferences = params.preferences.trim();
  }

  const [createdProfile] = await db
    .insert(patientProfile)
    .values(profileData)
    .returning({ id: patientProfile.id });

  await db
    .insert(patientStatus)
    .values({ patientProfileId: createdProfile.id });

  return { userId: createdUser.id, patientProfileId: createdProfile.id, pin };
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

export type PatientForSelector = {
  userId: string;
  username: string;
  profile: {
    diseases: unknown;
    medications: unknown;
    religion: string | null;
    family: unknown;
    preferences: unknown;
  } | null;
  status: {
    lastMood: string | null;
    medsSignal: "took" | "skipped" | "unknown";
    concerns: unknown;
    dailySummary: string | null;
  } | null;
};

export async function getPatientsForSelector(
  clinicId: string | null
): Promise<PatientForSelector[]> {
  const rows = await db
    .select({
      userId: user.id,
      username: user.username,
      diseases: patientProfile.diseases,
      medications: patientProfile.medications,
      religion: patientProfile.religion,
      family: patientProfile.family,
      preferences: patientProfile.preferences,
      lastMood: patientStatus.lastMood,
      medsSignal: patientStatus.medsSignal,
      concerns: patientStatus.concerns,
      dailySummary: patientStatus.dailySummary,
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

  return rows.map((row) => ({
    userId: row.userId,
    username: row.username,
    profile:
      row.diseases ||
      row.medications ||
      row.religion ||
      row.family ||
      row.preferences
        ? {
            diseases: row.diseases,
            medications: row.medications,
            religion: row.religion,
            family: row.family,
            preferences: row.preferences,
          }
        : null,
    status: {
      lastMood: row.lastMood,
      medsSignal: row.medsSignal ?? "unknown",
      concerns: row.concerns,
      dailySummary: row.dailySummary,
    },
  }));
}

// Chat-related functions
export async function getChatById(id: string) {
  const rows = await db.select().from(chat).where(eq(chat.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createChat(params: {
  id: string;
  userId: string;
  title: string;
}) {
  const [created] = await db
    .insert(chat)
    .values({
      id: params.id,
      userId: params.userId,
      title: params.title,
    })
    .returning();
  return created;
}

export async function getMessagesByChatId(chatId: string) {
  const rows = await db
    .select()
    .from(message)
    .where(eq(message.chatId, chatId))
    .orderBy(asc(message.createdAt));
  return rows;
}

export async function saveMessage(params: {
  id: string;
  chatId: string;
  role: string;
  parts: { type: string; text: string }[];
  attachments: { type: string; url: string }[];
}) {
  const [created] = await db
    .insert(message)
    .values({
      id: params.id,
      chatId: params.chatId,
      role: params.role,
      parts: params.parts,
      attachments: params.attachments,
    })
    .returning();
  return created;
}

// Patient management functions
export async function getUserById(userId: string) {
  const rows = await db
    .select({
      id: user.id,
      username: user.username,
      role: user.role,
      clinicId: user.clinicId,
      createdAt: user.createdAt,
      // Profile data
      diseases: patientProfile.diseases,
      medications: patientProfile.medications,
      religion: patientProfile.religion,
      family: patientProfile.family,
      preferences: patientProfile.preferences,
      // Status data
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
    .where(eq(user.id, userId))
    .limit(1);

  return rows[0] ?? null;
}

export async function updateUserProfile(
  userId: string,
  profileData: {
    name?: string;
    diseases?: string;
    medications?: string;
    religion?: string;
    family?: string;
    preferences?: string;
    emergencyContact?: string;
    notes?: string;
  }
) {
  // First, get the patient profile ID
  const userWithProfile = await db
    .select({
      profileId: patientProfile.id,
    })
    .from(user)
    .leftJoin(patientProfile, eq(patientProfile.userId, user.id))
    .where(eq(user.id, userId))
    .limit(1);

  if (!userWithProfile[0]?.profileId) {
    throw new Error("Patient profile not found");
  }

  // Update the profile with non-empty values
  const updateData: Record<string, unknown> = {};

  if (profileData.diseases?.trim()) {
    updateData.diseases = profileData.diseases.trim();
  }
  if (profileData.medications?.trim()) {
    updateData.medications = profileData.medications.trim();
  }
  if (profileData.religion?.trim()) {
    updateData.religion = profileData.religion.trim();
  }
  if (profileData.family?.trim()) {
    updateData.family = profileData.family.trim();
  }
  if (profileData.preferences?.trim()) {
    updateData.preferences = profileData.preferences.trim();
  }

  if (Object.keys(updateData).length > 0) {
    await db
      .update(patientProfile)
      .set(updateData)
      .where(eq(patientProfile.id, userWithProfile[0].profileId));
  }
}

export async function deleteUser(userId: string) {
  // Delete the user - cascading deletes will handle profile and status
  await db.delete(user).where(eq(user.id, userId));
}
