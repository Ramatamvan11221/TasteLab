/**
 * Usage: npx tsx scripts/promote-kitchen.ts <email>
 *
 * Better Auth owns credential/password creation, so the recommended flow is:
 *   1. Register a normal account at /register with the email you want to use
 *      for Kitchen access.
 *   2. Run this script with that email to flip the User.role to KITCHEN and
 *      attach a KitchenProfile pointing at the seeded "tastelab" brand.
 *   3. Log in again (or refresh) — the account now has Kitchen dashboard access.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npx tsx scripts/promote-kitchen.ts <email>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`No user found with email ${email}. Register at /register first.`);
    process.exit(1);
  }

  const brand = await prisma.brand.findUnique({ where: { slug: "tastelab" } });
  if (!brand) {
    console.error('Seeded brand "tastelab" not found. Run `npm run db:seed` first.');
    process.exit(1);
  }

  await prisma.user.update({ where: { id: user.id }, data: { role: "KITCHEN" } });

  await prisma.kitchenProfile.upsert({
    where: { userId: user.id },
    update: { brandId: brand.id },
    create: { userId: user.id, brandId: brand.id },
  });

  console.log(`✅ ${email} is now a Kitchen user for brand "${brand.name}".`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
