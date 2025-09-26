import { cookies } from "next/headers";

export type Session = {
  userId: string;
  role: "nurse" | "patient";
  clinicId: string | null;
};

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const raw = jar.get("session")?.value;
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Session;
    if (
      typeof parsed?.userId === "string" &&
      (parsed?.role === "nurse" || parsed?.role === "patient")
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export async function requireNurseSession(): Promise<Session> {
  const session = await getSession();
  if (!session || session.role !== "nurse") {
    throw new Error("unauthorized");
  }
  return session;
}

export async function requirePatientSession(): Promise<Session> {
  const session = await getSession();
  if (!session || session.role !== "patient") {
    throw new Error("unauthorized");
  }
  return session;
}
