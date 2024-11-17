import { ConflictException, NotAcceptableException } from '@nestjs/common';
import {
  decrypt,
  encrypt,
  encryptOptionsText,
} from './encryption/crypto.utils';
import { shuffle, shuffleWithStick } from './seed.utils';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { v4 as uuidv4 } from 'uuid';
import { S3Service } from 'src/s3/s3.service';
import { envConfig } from '../src/shared/config/app.config';
import { getPexelsImage } from './seed-dev/module/dev.get-images.module';

function includesKeys(keys: string[], requiredKeys: string[]): boolean {
  return requiredKeys.every((key) => keys.includes(key));
}

export enum CsvType {
  MCQ,
  MCQPSY,
  MCQPSYOPTION,
}

//config to validate csv headings
const csvConfig = [
  {
    code: CsvType.MCQ,
    headers: [
      'Question',
      'Answer',
      'Option 2',
      'Option 3',
      'Option 4',
      'DL',
      'QTags',
      'Trivia',
      'QTrait',
      'Taxonomy',
      'Stick',
      'Image Url',
    ],
    length: 16,
  },
  {
    code: CsvType.MCQPSY,
    headers: ['Trait'],
    length: 6,
  },
  {
    code: CsvType.MCQPSYOPTION,
    headers: [
      'Implementer',
      'Innovator',
      'Encourager',
      'Analytic',
      'Coordinator',
    ],
    length: 10,
  },
];

function getCsvType(parsedData: any): CsvType | null {
  const keys = Object.keys(parsedData[0]);
  const matchingConfig = csvConfig.find(
    (type) => includesKeys(keys, type.headers) && keys.length === type.length,
  );

  return matchingConfig ? matchingConfig.code : null;
}

function getInvalidTiersAndQuestion(
  checkTierOne,
  checkTierTwo,
  checkTierThree,
  checkQuestion,
  question,
) {
  const result = [];

  const checks = [
    {
      condition: !checkTierOne,
      message: `Mismatched Tier 1: ${question['Tier 1']}`,
    },
    {
      condition: !checkTierTwo,
      message: `Mismatched Tier 2: ${question['Tier 2']}`,
    },
    {
      condition: !checkTierThree,
      message: `Mismatched Tier 3: ${question['Tier 3']}`,
    },
    {
      condition: checkQuestion,
      message: `Duplicate Question in DB: ${question['Question']}`,
    },
  ];

  checks.forEach(({ condition, message }) => {
    if (condition) {
      result.push(message);
    }
  });

  return [...new Set(result)];
}

export async function saveCSVSToDB(
  prisma,
  s3Service: S3Service,
  filePath: string,
) {
  const parsedData = await parseCSVToJson(filePath);
  const csvType = getCsvType(parsedData);

  switch (csvType) {
    case CsvType.MCQ:
      return await saveMCQCSVToDB(prisma, s3Service, parsedData);
    case CsvType.MCQPSY:
      return await saveMCQPSYCSVToDB(prisma, parsedData);
    case CsvType.MCQPSYOPTION:
      return await saveMCQPSYOOptionCSCVToDB(prisma, parsedData);
    default:
      throw new NotAcceptableException('Invalid CSV file');
  }
}

export async function saveMCQCSVToDB(
  prisma,
  s3Service: S3Service,
  parsedData: any[],
) {
  try {
    const [
      tierOneList,
      tierTwoList,
      tierThreeList,
      questionList,
      tagList,
      traitList,
      taxonomyList,
    ] = await Promise.all([
      prisma.tier1.findMany(),
      prisma.tier2.findMany(),
      prisma.tier3.findMany(),
      prisma.mCQQA.findMany(),
      prisma.questionTag.findMany(),
      prisma.questionTrait.findMany(),
      prisma.taxonomy.findMany(),
    ]);

    const uniqueTags = Array.from(
      new Set(parsedData.flatMap((question) => question?.QTags?.split(','))),
    ).map((tag) => tag.trim());

    const uniqueTraits = Array.from(
      new Set(
        parsedData
          .flatMap((question) => question['QTrait'].trim())
          .filter((trait) => trait),
      ),
    );

    const uniqueTaxonamy = Array.from(
      new Set(
        parsedData
          .flatMap((question) => question['Taxonomy'].trim())
          .filter((taxonomy) => taxonomy),
      ),
    );

    await addNewTags(prisma, uniqueTags, tagList);
    await addNewQuestionTraits(prisma, uniqueTraits, traitList);
    await addNewTaxonomy(prisma, uniqueTaxonamy, taxonomyList);

    const updatedTags = await prisma.questionTag.findMany();
    const updatedTraits = await prisma.questionTrait.findMany();
    const updatedTaxonomy = await prisma.taxonomy.findMany();

    const tagMap: Map<string, number> = new Map(
      updatedTags?.map((tag) => [tag?.name, tag?.id]),
    );
    const traitMap: Map<string, number> = new Map(
      updatedTraits?.map((trait) => [trait?.name, trait?.id]),
    );
    const taxonomyMap: Map<string, number> = new Map(
      updatedTaxonomy?.map((taxo) => [taxo?.name, taxo?.id]),
    );

    const questionToBeAdded = [];
    const invalidQuestion = [];

    const questionListDecrypted = questionList.map((question) => ({
      ...question,
      text: decrypt(question.text), // Decrypt the text field
    }));

    const generateUUID = () => uuidv4();

    let totalUrls = 0;
    let successfulUploads = 0;

    // Count total URLs to be processed
    parsedData.forEach((question) => {
      if (question['Image Url'] && question['Image Url'].trim() !== '') {
        totalUrls += 1;
      }
    });

    console.log(`Total URLs to be processed: ${totalUrls}`);

    for (const question of parsedData) {
      const checkTierOne = tierOneList.find(
        (tier) => tier.name.toLowerCase() === question['Tier 1'].toLowerCase(),
      );
      const checkTierTwo = tierTwoList.find(
        (tier) => tier.name.toLowerCase() === question['Tier 2'].toLowerCase(),
      );
      const checkTierThree = tierThreeList.find(
        (tier) => tier.name.toLowerCase() === question['Tier 3'].toLowerCase(),
      );
      const checkQuestion = questionListDecrypted.find(
        (mcq) => mcq.text.toLowerCase() === question.Question.toLowerCase(),
      );
      const tagIds = question?.QTags.split(',')
        .map((tag) => tag?.trim())
        .map((tagName) => tagMap?.get(tagName));

      if (checkTierOne && checkTierTwo && checkTierThree && !checkQuestion) {
        const optionId1 = generateUUID();
        const optionId2 = generateUUID();
        const optionId3 = generateUUID();
        const optionId4 = generateUUID();

        let imageS3Key = null;
        if (question['Image Url'] && question['Image Url'].trim() !== '') {
          if (envConfig.env === 'DEV') {
            imageS3Key = await getPexelsImage();
          } else {
            try {
              imageS3Key = await s3Service.uploadImageFromDriveUrlToS3(
                question['Image Url'],
              );
              successfulUploads += 1;
              console.log(
                `Successfully uploaded image for question. Current progress: ${successfulUploads}/${totalUrls}`,
              );
            } catch (uploadError) {
              console.error(
                `Error uploading image for question, ${uploadError}`,
              );
            }
          }
        }

        const questionInput = {
          type: 'MCQ',
          tier1Id: checkTierOne.id,
          tier2Id: checkTierTwo.id,
          tier3Id: checkTierThree.id,
          staticDL: Number(question?.DL),
          dynamicDL: Number(question?.DL),
          tags: tagIds,
          qTraitId: traitMap.get(question['QTrait']),
          taxonomyId: taxonomyMap.get(question['Taxonomy']),
          isPublished: true,
          avgTime: 0,
          accuracy: 0,
          timeLimit: 0,
          isActive: true,
          mCQQA: {
            text: question.Question,
            options: shuffleWithStick(
              [
                { id: optionId1, text: question.Answer, position: 1 },
                { id: optionId2, text: question['Option 2'], position: 2 },
                { id: optionId3, text: question['Option 3'], position: 3 },
                { id: optionId4, text: question['Option 4'], position: 4 },
              ],
              Number(question?.Stick),
            ),
            answer: optionId1,
            triviaContent: question.Trivia,
            stick: Number(question?.Stick) || null,
            imageUrl: imageS3Key,
          },
        };
        questionToBeAdded.push(questionInput);
      } else {
        invalidQuestion.push(
          ...getInvalidTiersAndQuestion(
            checkTierOne,
            checkTierTwo,
            checkTierThree,
            checkQuestion,
            question,
          ),
        );
      }
    }

    if (envConfig.env != 'DEV') {
      console.log(
        `Image upload process completed. Successfully uploaded ${successfulUploads} out of ${totalUrls} URLs.`,
      );
    }

    await saveQuestionsToDb(prisma, questionToBeAdded, CsvType.MCQ);

    return {
      questionToBeAdded,
      invalidQuestion,
    };
  } catch (error) {
    throw new Error(`Error in saveCSVToDB: ${error}`);
  }
}

async function saveMCQPSYCSVToDB(prisma, parsedData: any[]) {
  try {
    const [
      tierOneList,
      tierTwoList,
      tierThreeList,
      questionList,
      traitTypeList,
    ] = await Promise.all([
      prisma.tier1.findMany(),
      prisma.tier2.findMany(),
      prisma.tier3.findMany(),
      prisma.mCQPsychometricQA.findMany(),
      prisma.traitType.findMany(),
    ]);

    const questionListDecrypted = questionList.map((question) => ({
      ...question,
      text: decrypt(question.text), // Decrypt the text field
    }));

    const traitTypeMap: Map<string, number> = new Map(
      traitTypeList?.map((trait) => [trait.name, trait.id]),
    );

    //create trait type if not exist
    const uniqueTraitData = new Map<string, number>();

    parsedData.forEach((question) => {
      const traitName = question['Trait'];
      const tier3 = tierThreeList.find(
        (tier) => tier.name.toLowerCase() === question['Tier 3'].toLowerCase(),
      );

      if (tier3 && !uniqueTraitData.has(traitName)) {
        uniqueTraitData.set(traitName, tier3.id);
      }
    });

    await createTraitTypes(prisma, uniqueTraitData, traitTypeMap);
    const updatedTraitType = await prisma.traitType.findMany();
    updatedTraitType.forEach((trait) => traitTypeMap.set(trait.name, trait.id));

    const questionToBeAdded = [];
    const invalidQuestion = [];

    parsedData.forEach((question) => {
      const checkTierOne = tierOneList.find(
        (tier) => tier.name.toLowerCase() === question['Tier 1'].toLowerCase(),
      );
      const checkTierTwo = tierTwoList.find(
        (tier) => tier.name.toLowerCase() === question['Tier 2'].toLowerCase(),
      );
      const checkTierThree = tierThreeList.find(
        (tier) => tier.name.toLowerCase() === question['Tier 3'].toLowerCase(),
      );
      const checkQuestion = questionListDecrypted.find(
        (mcq) => mcq.text.toLowerCase() === question.Question.toLowerCase(),
      );

      if (checkTierOne && checkTierTwo && checkTierThree && !checkQuestion) {
        const questionInput = {
          type: 'MCQPSY',
          tier1Id: checkTierOne.id,
          tier2Id: checkTierTwo.id,
          tier3Id: checkTierThree.id,
          tags: [],
          isPublished: true,
          avgTime: 0,
          accuracy: 0,
          timeLimit: 0,
          isActive: true,
          MCQPsychometricQA: {
            text: question.Question,
            traitTypeId: traitTypeMap.get(question['Trait']),
          },
        };
        questionToBeAdded.push(questionInput);
      } else {
        invalidQuestion.push(
          ...getInvalidTiersAndQuestion(
            checkTierOne,
            checkTierTwo,
            checkTierThree,
            checkQuestion,
            question,
          ),
        );
      }
    });

    await saveQuestionsToDb(prisma, questionToBeAdded, CsvType.MCQPSY);

    return {
      questionToBeAdded,
      invalidQuestion,
    };
  } catch (error) {
    throw new Error(`Error while saving questions: ${error}`);
  }
}

async function saveMCQPSYOOptionCSCVToDB(prisma, parsedData: any[]) {
  try {
    const [
      tierOneList,
      tierTwoList,
      tierThreeList,
      questionList,
      traitTypeList,
    ] = await Promise.all([
      prisma.tier1.findMany(),
      prisma.tier2.findMany(),
      prisma.tier3.findMany(),
      prisma.mCQPsychometricOptionsQA.findMany(),
      prisma.traitType.findMany(),
    ]);

    const traitTypes = [
      'Implementer',
      'Innovator',
      'Encourager',
      'Analytic',
      'Coordinator',
    ];
    const tier3Name = 'Leadership Strength';

    const tier3Id = tierThreeList.find((tier) => tier.name === tier3Name)?.id;
    const existingTraitTypes = traitTypeList.map((trait) => trait.name);
    const newTraitTypes = traitTypes.filter(
      (trait) => !existingTraitTypes.includes(trait),
    );

    if (newTraitTypes.length > 0) {
      await prisma.traitType.createMany({
        data: newTraitTypes.map((name) => ({ name, tier3Id })),
        skipDuplicates: true,
      });
      console.log(`Added ${newTraitTypes.length} new trait types`);
    }

    const updatedTraitTypeList = await prisma.traitType.findMany();
    const traitTypeMap = new Map(
      updatedTraitTypeList.map((trait) => [trait.name, trait.id]),
    );

    const questionListDecrypted = questionList.map((question) => ({
      ...question,
      text: decrypt(question.text), // Decrypt the text field
    }));

    const questionToBeAdded = [];
    const invalidQuestion = [];

    parsedData.forEach((question) => {
      const checkTierOne = tierOneList.find(
        (tier) => tier.name.toLowerCase() === question['Tier 1'].toLowerCase(),
      );
      const checkTierTwo = tierTwoList.find(
        (tier) => tier.name.toLowerCase() === question['Tier 2'].toLowerCase(),
      );
      const checkTierThree = tierThreeList.find(
        (tier) => tier.name.toLowerCase() === question['Tier 3'].toLowerCase(),
      );
      const checkQuestion = questionListDecrypted.find(
        (mcq) => mcq.text.toLowerCase() === question.Question.toLowerCase(),
      );

      if (checkTierOne && checkTierTwo && checkTierThree && !checkQuestion) {
        const questionInput = {
          type: 'MCQPSYOPTION',
          tier1Id: checkTierOne.id,
          tier2Id: checkTierTwo.id,
          tier3Id: checkTierThree.id,
          staticDL: Number(question?.D1),
          dynamicDL: Number(question?.D1),
          tags: [],
          isPublished: true,
          avgTime: 0,
          accuracy: 0,
          timeLimit: 0,
          isActive: true,
          mCQPsychometricOptionsQA: {
            text: question.Question,
            options: shuffle(
              traitTypes.map((trait, index) => ({
                id: traitTypeMap.get(trait),
                text: question[trait],
                position: index + 1,
              })),
            ),
          },
        };
        questionToBeAdded.push(questionInput);
      } else {
        invalidQuestion.push(
          ...getInvalidTiersAndQuestion(
            checkTierOne,
            checkTierTwo,
            checkTierThree,
            checkQuestion,
            question,
          ),
        );
      }
    });

    await saveQuestionsToDb(prisma, questionToBeAdded, CsvType.MCQPSYOPTION);

    return {
      questionToBeAdded,
      invalidQuestion,
    };
  } catch (error) {
    throw new Error(`Error while saving questions: ${error}`);
  }
}

async function createTraitTypes(
  prisma,
  uniqueTraitData: Map<string, number>,
  traitTypeMap: Map<string, number>,
) {
  try {
    const existingTraitTypes = Array.from(traitTypeMap.keys());
    //create newTraitTypes by removing existingTraitTypes from uniqueTraitData Map
    const newTraitTypes = Array.from(uniqueTraitData.keys()).filter(
      (trait) => !existingTraitTypes.includes(trait),
    );
    const createdTraitTypes = await prisma.traitType.createMany({
      data: newTraitTypes.map((trait) => ({
        name: trait,
        tier3Id: uniqueTraitData.get(trait),
      })),
    });
    return createdTraitTypes;
  } catch (error) {
    throw new Error(`Error Creating Trait Types : ${error}`);
  }
}

export async function parseCSVToJson(
  filepath: string,
): Promise<Record<string, any>[]> {
  const result = [];

  return await new Promise((resolve, reject) => {
    fs.createReadStream(path.resolve(filepath))
      .pipe(csv())
      .on('data', (data) => result.push(data))
      .on('end', () => {
        resolve(result);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

async function addNewTags(prisma, uniqueTags: string[], tagList) {
  try {
    const existingTags = tagList?.map((tag) => tag?.name);
    const newTags = uniqueTags.filter((tag) => !existingTags.includes(tag));

    const createdTags = await prisma.questionTag.createMany({
      data: newTags.map((tagName) => ({
        name: tagName,
      })),
      skipDuplicates: true,
    });
    return createdTags;
  } catch (error) {
    throw new Error(`Error Adding New Tags to DB : ${error}`);
  }
}

async function addNewQuestionTraits(prisma, uniqueTraits: string[], traitList) {
  try {
    const existingTraits = traitList?.map((trait) => trait?.name);
    const newTraits = uniqueTraits.filter(
      (trait) => !existingTraits.includes(trait),
    );

    const createdTraits = await prisma.questionTrait.createMany({
      data: newTraits.map((traitName) => ({
        name: traitName,
      })),
      skipDuplicates: true,
    });
    return createdTraits;
  } catch (error) {
    throw new Error(`Error Adding New QTrait to DB : ${error}`);
  }
}

async function addNewTaxonomy(prisma, uniqueTaxos: string[], taxoList) {
  try {
    const existingTaxos = taxoList?.map((taxo) => taxo?.name);
    const newTaxos = uniqueTaxos.filter(
      (taxo) => !existingTaxos.includes(taxo),
    );

    const createdTaxos = await prisma.taxonomy.createMany({
      data: newTaxos.map((taxoName) => ({
        name: taxoName,
      })),
      skipDuplicates: true,
    });
    return createdTaxos;
  } catch (error) {
    throw new Error(`Error Adding New Taxonomy to DB : ${error}`);
  }
}

async function saveQuestionsToDb(prisma, questionList: any, csvType: CsvType) {
  let currentItem = null;
  try {
    for (const item of questionList) {
      currentItem = item;

      let specificData = {};

      switch (csvType) {
        case CsvType.MCQ:
          specificData = {
            staticDL: item.staticDL,
            dynamicDL: item.dynamicDL,
            qTraitId: item.qTraitId,
            taxonomyId: item.taxonomyId,
            mCQQA: {
              create: {
                text: encrypt(item.mCQQA?.text),
                options: encryptOptionsText(item.mCQQA?.options),
                answer: item.mCQQA?.answer,
                triviaContent: encrypt(item.mCQQA?.triviaContent),
                stick: item.mCQQA?.stick,
                imageUrl: item.mCQQA?.imageUrl,
              },
            },
          };
          break;
        case CsvType.MCQPSY:
          specificData = {
            mCQPsychometricQA: {
              create: {
                text: encrypt(item.MCQPsychometricQA?.text),
                traitTypeId: item.MCQPsychometricQA?.traitTypeId,
              },
            },
          };
          break;
        case CsvType.MCQPSYOPTION:
          specificData = {
            staticDL: item.staticDL,
            dynamicDL: item.dynamicDL,
            mCQPsychometricOptionsQA: {
              create: {
                text: encrypt(item.mCQPsychometricOptionsQA?.text),
                options: encryptOptionsText(
                  item.mCQPsychometricOptionsQA?.options,
                ),
              },
            },
          };
          break;
      }

      await prisma.question.create({
        data: {
          type: item.type,
          tier1Id: item.tier1Id,
          tier2Id: item.tier2Id,
          tier3Id: item.tier3Id,
          tags: item.tags,
          isPublished: item.isPublished,
          avgTime: item.avgTime,
          accuracy: item.accuracy,
          timeLimit: item.timeLimit,
          isActive: item.isActive,
          ...specificData,
        },
      });
    }

    if (questionList.length) {
      return 'Questions added';
    }
  } catch (error) {
    console.error(
      'Error generated for question: ',
      JSON.stringify(currentItem, null, 2),
    );
    throw new Error(`Error Saving Question in DB : ${error}`);
  }
}

async function saveQuestionToDb(prisma, question: any, csvType: CsvType) {
  let specificData = {};
  switch (csvType) {
    case CsvType.MCQ:
      specificData = {
        staticDL: question.staticDL,
        dynamicDL: question.dynamicDL,
        qTraitId: question.qTraitId,
        taxonomyId: question.taxonomyId,
        mCQQA: {
          create: {
            text: encrypt(question.mCQQA?.text),
            options: encryptOptionsText(question.mCQQA?.options),
            answer: question.mCQQA?.answer,
            triviaContent: encrypt(question.mCQQA?.triviaContent),
            stick: question.mCQQA?.stick,
            imageUrl: question.mCQQA?.imageUrl,
          },
        },
      };
      break;
    case CsvType.MCQPSY:
      specificData = {
        mCQPsychometricQA: {
          create: {
            text: encrypt(question.mCQPsychometricQA?.text),
            traitTypeId: question.mCQPsychometricQA?.traitTypeId,
          },
        },
      };
      break;
    case CsvType.MCQPSYOPTION:
      specificData = {
        staticDL: question.staticDL,
        dynamicDL: question.dynamicDL,
        mCQPsychometricOptionsQA: {
          create: {
            text: encrypt(question.mCQPsychometricOptionsQA?.text),
            options: encryptOptionsText(
              question.mCQPsychometricOptionsQA?.options,
            ),
          },
        },
      };
      break;
  }
  return await prisma.question.create({
    data: {
      type: 'MCQ',
      tier1Id: question.tier1Id,
      tier2Id: question.tier2Id,
      tier3Id: question.tier3Id,
      tags: question.tags,
      isPublished: question.isPublished,
      avgTime: question.avgTime,
      accuracy: question.accuracy,
      timeLimit: question.timeLimit,
      isActive: question.isActive,
      ...specificData,
    },
  });
}

export function saveQuestion(prisma, question) {
  if (question.mCQQA) {
    return saveQuestionToDb(prisma, question, CsvType.MCQ);
  }
  if (question.mCQPsychometricQA) {
    return saveQuestionToDb(prisma, question, CsvType.MCQPSY);
  }
  if (question.mCQPsychometricOptionsQA) {
    return saveQuestionToDb(prisma, question, CsvType.MCQPSYOPTION);
  }
}

export function getUpdateData(question, existingQuestion) {
  const updatedData: any = { ...question };

  if (question.mCQQA) {
    const { options: formattedOptions, answerID } = formatOptions(
      question.mCQQA.options,
      question.mCQQA.answer,
      question.mCQQA.stick,
    );
    updatedData.mCQQA = existingQuestion.mCQQA
      ? {
          update: {
            text: encrypt(question.mCQQA.text),
            options: encryptOptionsText(formattedOptions),
            answer: answerID,
            triviaContent: encrypt(question.mCQQA.triviaContent),
          },
        }
      : {
          create: {
            text: encrypt(question.mCQQA.text),
            options: encryptOptionsText(question.mCQQA.options),
            answer: question.mCQQA.answer,
            triviaContent: encrypt(question.mCQQA.triviaContent),
          },
        };
  } else if (question.mCQPsychometricQA) {
    updatedData.mCQPsychometricQA = existingQuestion.mCQPsychometricQA
      ? {
          update: {
            text: encrypt(question.mCQPsychometricQA.text),
            traitTypeId: question.mCQPsychometricQA.traitTypeId,
          },
        }
      : {
          create: {
            text: encrypt(question.mCQPsychometricQA.text),
            traitTypeId: question.mCQPsychometricQA.traitTypeId,
          },
        };
  } else if (question.mCQPsychometricOptionsQA) {
    const shuffledOptions = shuffleWithStick(
      question.mCQPsychometricOptionsQA.options,
      question.mCQPsychometricOptionsQA.stick,
    );
    updatedData.mCQPsychometricOptionsQA =
      existingQuestion.mCQPsychometricOptionsQA
        ? {
            update: {
              text: encrypt(question.mCQPsychometricOptionsQA.text),
              options: encryptOptionsText(shuffledOptions),
            },
          }
        : {
            create: {
              text: encrypt(question.mCQPsychometricOptionsQA.text),
              options: encryptOptionsText(shuffledOptions),
            },
          };
  }

  return updatedData;
}

export function formatOptions(options, answerIndex, stick) {
  const generateUUID = () => uuidv4();
  options = options.map((option) => {
    return {
      ...option,
      id: generateUUID(),
    };
  });

  const answerID = options[answerIndex].id;

  options = shuffleWithStick(options, stick);
  return { options, answerID };
}

//fetch all questions decrypt text and check if question already exists
export async function checkExisting(
  type: string,
  createQuestionDto: any,
  prisma: any,
) {
  if (createQuestionDto[type]) {
    const existingQuestions = await prisma[type].findMany();

    const inputText = createQuestionDto[type].text;

    for (const question of existingQuestions) {
      const decryptedText = decrypt(question.text);
      if (decryptedText === inputText) {
        throw new ConflictException('Question already exists');
      }
    }
  }
}
