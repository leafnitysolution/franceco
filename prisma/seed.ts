import { ensureLocationsSeeded } from '../src/lib/seedHelper';
import { db } from '../src/lib/db';

async function main() {
  console.log('Seeding database manually for FranceGo (PostgreSQL mode)...');
  await ensureLocationsSeeded(true);
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
