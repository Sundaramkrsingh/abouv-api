/* eslint-disable prettier/prettier */
import { PrismaClient } from '@prisma/client';
import { Tier1Data } from '../data/common.tier1.data';
import { parseCSVToJson } from '../../seed-csv-utils';

export default async function seedFacets(prisma: PrismaClient, csvFilePath) {
  console.group('[FACETS Setting]');
  try {
    await prisma.tier1.createMany({
      data: Tier1Data,
      skipDuplicates: true,
    });

    const facetData = await parseCSVToJson(csvFilePath);

    await insertDataToDB(prisma, facetData);

    console.log('FACETS added successfully');
  } catch (error) {
    console.error('Error while seeding facets:', error);
    throw error;
  }
  console.groupEnd();
}

async function insertDataToDB(prisma, data: Record<string, any>[]) {
  let currentTier1: any = null;
  let currentTier2: any = null;

  for (const row of data) {
    if (row['Tier 1']) {
      currentTier1 = await prisma.tier1.findUnique({
        where: { name: row['Tier 1'] },
      });
    }

    if (row['Tier 2']) {
      currentTier2 = await prisma.tier2.upsert({
        where: { name: row['Tier 2'] },
        update: {},
        create: {
          name: row['Tier 2'],
          tier1Id: currentTier1.id,
          descriptions: row['Tier 2 description'],
        },
      });
    }

    if (row['Tier 3']) {
      await prisma.tier3.upsert({
        where: {
          name_tier2Id: {
            name: row['Tier 3'],
            tier2Id: currentTier2.id,
          },
        },
        update: {},
        create: {
          name: row['Tier 3'],
          tier2Id: currentTier2.id,
          descriptionShort: row['Tier 3 description short'],
          descriptionLong: row['Tier 3 description long'],
        },
      });
    }
  }
}
