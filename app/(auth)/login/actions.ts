/** biome-ignore-all lint/style/noMagicNumbers: <explanation> */

"use server";

import { compareSync } from "bcrypt-ts";
import { cookies } from "next/headers";
import { z } from "zod";

import { ensureNurseUser, getUserByUsername } from "@/lib/db/queries";

export type LoginActionState =
  | { status: "idle" }
  | { status: "invalid_data"; message: string }
  | { status: "failed"; message: string }
  | { status: "success"; role: "nurse" | "patient" };

const loginSchema = z.object({
  username: z.string().min(3, "Usuario demasiado corto"),
  pin: z.string().min(4, "PIN inválido").max(12, "PIN inválido"),
});

export async function usernamePinLogin(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  try {
    const parsed = loginSchema.safeParse({
      username: String(formData.get("username") ?? ""),
      pin: String(formData.get("pin") ?? ""),
    });

    if (!parsed.success) {
      return { status: "invalid_data", message: "Datos inválidos" };
    }

    const { username, pin } = parsed.data;

    // Auto-seed nurse user if not exists
    await ensureNurseUser();

    const foundUser = await getUserByUsername(username);
    if (!foundUser) {
      return { status: "failed", message: "Usuario o PIN incorrectos" };
    }

    // PIN-only authentication
    const pepper = process.env.CREDENTIALS_PEPPER ?? "";
    const isValid = compareSync(`${pin}${pepper}`, foundUser.pinHash);

    if (!isValid) {
      return { status: "failed", message: "Usuario o PIN incorrectos" };
    }

    // Minimal session cookie (new project should replace with robust session handling)
    (await cookies()).set(
      "session",
      JSON.stringify({
        userId: foundUser.id,
        role: foundUser.role,
        clinicId: foundUser.clinicId,
      }),
      {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      }
    );

    return { status: "success", role: foundUser.role };
  } catch {
    return { status: "failed", message: "Error al iniciar sesión" };
  }
}
