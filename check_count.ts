import 'dotenv/config';
import prisma from './lib/prisma';

async function main() {
  const count = await prisma.realEState.count();
  console.log(`RealEstate count: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
