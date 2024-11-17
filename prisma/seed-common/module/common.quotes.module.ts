/* eslint-disable prettier/prettier */
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

async function parseCSVToJson(
  csvFilePath: string,
): Promise<Record<string, any>[]> {
  const result = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(path.resolve(csvFilePath))
      .pipe(
        csv({
          headers: ['quote'],
          skipLines: 1,
        }),
      )
      .on('data', (data) => {
        if (data.quote && data.quote.trim()) {
          result.push({ quote: data.quote.trim() });
        }
      })
      .on('end', () => {
        resolve(result);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

async function saveQuoteToDb(prisma, quoteList: any) {
  let currentItem = null;
  try {
    for (const item of quoteList) {
      currentItem = item;
      if (item.quote) {
        await prisma.quote.create({
          data: {
            quote: item.quote,
            displayCount: 0,
          },
        });
      } else {
        console.warn('Skipping item with no quote:', item);
      }
    }

    if (quoteList.length) {
      console.log('Quotes added');
    }
  } catch (error) {
    console.error(
      'Error generated for quote: ',
      JSON.stringify(currentItem, null, 2),
    );
    throw new Error(`Error Saving Quote in DB : ${error}`);
  }
}

export default async function seedQuoteData(prisma, csvFilePath: string) {
  console.group('[Quotes]');
  try {
    const parsedData = await parseCSVToJson(csvFilePath);

    const existingQuotes = await prisma.quote.findMany();
    const existingQuoteMap = new Map(
      existingQuotes.map((quote) => [quote.quote, quote.id]),
    );

    const quoteToBeAdded = [];
    const duplicateQuotes = [];

    parsedData.forEach((quote) => {
      if (quote.quote && !existingQuoteMap.has(quote.quote)) {
        quoteToBeAdded.push(quote);
      } else if (quote.quote) {
        duplicateQuotes.push(quote);
      }
    });

    console.log('Quotes to add:', quoteToBeAdded.length);
    console.log('Duplicate quotes:', duplicateQuotes.length);

    await saveQuoteToDb(prisma, quoteToBeAdded);
  } catch (error) {
    throw new Error(`Error while saving quotes: ${error}`);
  }
  console.groupEnd();
}
