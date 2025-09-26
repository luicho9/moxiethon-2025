/** biome-ignore-all lint/suspicious/noConsole: <explanation> */
import "dotenv/config";
import { hashSync } from "bcrypt-ts";
import { eq } from "drizzle-orm";
import db from "@/lib/db";
import { clinic, user } from "@/lib/db/schema";

const NURSE_CONFIG = {
  clinicName: "Clinica Los Primos",
  username: "enfermera2",
  pin: "1234",
};

async function main() {
  const { clinicName, username, pin } = NURSE_CONFIG;
  const pepper = process.env.CREDENTIALS_PEPPER ?? "";

  console.log(`Creating nurse: ${username} with PIN: ${pin}`);

  const [existingClinic] = await db
    .select()
    .from(clinic)
    .where(eq(clinic.name, clinicName))
    .limit(1);
  const clinicId =
    existingClinic?.id ??
    (
      await db
        .insert(clinic)
        .values({ name: clinicName })
        .returning({ id: clinic.id })
    )[0].id;

  console.log(`Using clinic: ${clinicName} (ID: ${clinicId})`);

  const [existing] = await db
    .select()
    .from(user)
    .where(eq(user.username, username))
    .limit(1);
  if (existing) {
    console.log(`Nurse already exists: ${existing.username}`);
    console.log("To create a new nurse, change the username in NURSE_CONFIG");
    return;
  }

  const pinHash = hashSync(pin + pepper, 10);
  await db.insert(user).values({
    username,
    role: "nurse",
    clinicId,
    pinHash,
  });

  console.log("Nurse created successfully!");
  console.log(`Username: ${username}`);
  console.log(`PIN: ${pin}`);
  console.log(`Clinic: ${clinicName}`);
  console.log("");
  console.log("The nurse can now login at /login with these credentials.");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
