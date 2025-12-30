import 'dotenv/config';
import prisma from './lib/prisma';

async function main() {
  const estates = await prisma.realEState.findMany({
    take: 5,
    select: {
      mahalla: true,
      districtName: true,
      address: true
    }
  });
  console.log('RealEstate Samples:', JSON.stringify(estates, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
