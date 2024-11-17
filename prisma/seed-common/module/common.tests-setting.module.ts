import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

interface CSVData {
  resultFlairSeries: any[];
  resultAssetSeries: any[];
  resultCraftSeries: any[];
  resultExtraSeries: any[];
  resultSkillSeries: any[];
  resultTraitSeries: any[];
}

async function parseCSVToJson(basePath: string): Promise<CSVData> {
  const resultFlairSeries: any[] = [];
  const resultAssetSeries: any[] = [];
  const resultCraftSeries: any[] = [];
  const resultExtraSeries: any[] = [];
  const resultSkillSeries: any[] = [];
  const resultTraitSeries: any[] = [];

  const parseCsv = (filePath: string, resultArray: any[]) => {
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => resultArray.push(data))
        .on('end', () => resolve(resultArray))
        .on('error', (error) => reject(error));
    });
  };

  await Promise.all([
    parseCsv(path.join(basePath, 'Flair Series.csv'), resultFlairSeries),
    parseCsv(path.join(basePath, 'Asset Series.csv'), resultAssetSeries),
    parseCsv(path.join(basePath, 'Craft Series.csv'), resultCraftSeries),
    parseCsv(path.join(basePath, 'Extra Series.csv'), resultExtraSeries),
    parseCsv(path.join(basePath, 'Skill Series.csv'), resultSkillSeries),
    parseCsv(path.join(basePath, 'Trait Series.csv'), resultTraitSeries),
  ]);

  return {
    resultFlairSeries,
    resultAssetSeries,
    resultCraftSeries,
    resultExtraSeries,
    resultSkillSeries,
    resultTraitSeries,
  };
}

async function processSeriesData(
  seriesData: any[],
  tier3Data: any[],
  prisma: any,
  seriesName: string,
) {
  const testsdata: any = [];
  const invalidData = [];

  seriesData.forEach((csvData) => {
    const csvTier3Name = csvData['Tier 3']?.trim();

    if (!csvTier3Name) {
      console.warn('No Tier 3 name found in CSV data:', csvData);
      return;
    }

    const matchingTier3 = tier3Data.find(
      (tier3) => tier3.name.trim().toLowerCase() === csvTier3Name.toLowerCase(),
    );

    if (matchingTier3 && matchingTier3.id) {
      testsdata.push({
        tier3Id: matchingTier3.id,
        abstract: csvData['Abstract'],
        brief: csvData['Brief'],
        level: csvData['Level'],
        totalQuestion: parseInt(csvData['Number of Questions'], 10),
      });
    } else {
      invalidData.push(`Mismatched Tier 3: "${csvTier3Name}"`);
    }
  });

  if (testsdata.length > 0) {
    await prisma.tests.createMany({ data: testsdata });
    console.log(` ${seriesName}: ${testsdata.length} items`);
  } else {
    console.warn('No valid test data to insert.');
  }

  invalidData.length && console.log(invalidData);
}

export default async function seedTestSetting(prisma, basePath: string) {
  console.group('[Tests]');
  try {
    const {
      resultFlairSeries,
      resultAssetSeries,
      resultCraftSeries,
      resultExtraSeries,
      resultSkillSeries,
      resultTraitSeries,
    } = await parseCSVToJson(basePath);

    const tier3Data = await prisma.tier3.findMany({});

    await processSeriesData(
      resultFlairSeries,
      tier3Data,
      prisma,
      'Flair Series',
    );
    await processSeriesData(
      resultAssetSeries,
      tier3Data,
      prisma,
      'Asset Series',
    );
    await processSeriesData(
      resultCraftSeries,
      tier3Data,
      prisma,
      'Craft Series',
    );
    await processSeriesData(
      resultExtraSeries,
      tier3Data,
      prisma,
      'Extra Series',
    );
    await processSeriesData(
      resultSkillSeries,
      tier3Data,
      prisma,
      'Skill Series',
    );
    await processSeriesData(
      resultTraitSeries,
      tier3Data,
      prisma,
      'Trait Series',
    );
  } catch (error) {
    console.error('Error while saving tests data:', error);
    throw new Error(`Error while saving tests data: ${error}`);
  }
  console.groupEnd();
}
