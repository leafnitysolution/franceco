import { ensureLocationsSeeded } from '../src/lib/seedHelper';
import { db } from '../src/lib/db';

async function main() {
  console.log('Seeding database for FranceGo (safe upsert mode — bookings preserved)...');
  await ensureLocationsSeeded();
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
