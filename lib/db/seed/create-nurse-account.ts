import 'dotenv/config';
import db from '@/lib/db';
import { clinic, user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { hashSync } from 'bcrypt-ts';

async function main() {
  const name = 'Clinica Los Primos';
  const username = 'enfermera1';
  const password = 'enfermera1234';
  const pepper = process.env.CREDENTIALS_PEPPER ?? '';

  const [existingClinic] = await db.select().from(clinic).where(eq(clinic.name, name)).limit(1);
  const clinicId = existingClinic?.id ??
    (await db.insert(clinic).values({ name }).returning({ id: clinic.id }))[0].id;

  const [existing] = await db.select().from(user).where(eq(user.username, username)).limit(1);
  if (existing) {
    console.log('Nurse exists:', existing.username);
    return;
  }

  const passwordHash = hashSync(password + pepper, 10);
  await db.insert(user).values({
    username,
    role: 'nurse',
    clinicId,
    passwordHash,
  });

  console.log('Nurse created. Username:', username, 'Password:', password);
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});