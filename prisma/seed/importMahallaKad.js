
import prisma from '@/lib/prisma';
import path from 'path';
import xlsx from "xlsx";




async function main() {
  const filePath = path.join(
  process.cwd(),
  "prisma",
  "data",
  "mahallas.xlsx"
);

const workbook = xlsx.readFile(filePath);

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet);

  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    const { code, uzKadName, geoCode, nameUz, oneId } = row;

    if (!code) {
      skipped++;
      continue;
    }

    const result = await prisma.mahalla.updateMany({
      where: { code: String(code) },
      data: {
        uzKadName: uzKadName?.toString().trim(),
        geoCode: geoCode?.toString().trim(),
        nameUz: nameUz?.toString().trim(),
        oneId: oneId?.toString().trim(),
      },
    });

    if (result.count === 0) {
      skipped++;
    } else {
      updated++;
    }
  }

  console.log(`✅ Updated: ${updated}`);
  console.log(`⚠️ Skipped: ${skipped}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
