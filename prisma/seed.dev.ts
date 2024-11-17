/* eslint-disable prettier/prettier */
import { PrismaClient } from '@prisma/client';
import { S3Service } from '../src/s3/s3.service';
import seedGradeSetting from './seed-common/module/common.grade-setting.module';
import seedTrumpSetting from './seed-common/module/common.trumps-setting.module';
import seedGoalSetting from './seed-common/module/common.goal-setting.module';
import seedCarrerIssuesSetting from './seed-common/module/common.career-issue-setting.module';
import seedRoleSetting from './seed-common/module/common.role-setting.module';
import seedHearAboutSetting from './seed-common/module/common.hear-about-us-setting.module';
import seedQuotesData from './seed-common/module/common.quotes.module';
import seedTestsSetting from './seed-common/module/common.tests-setting.module';
import seedFacets from './seed-common/module/common.facets.module';
import seedStageSetting from './seed-common/module/common.stage-setting.module';

import seedUsers from './seed-dev/module/dev.user.module';
import seedQuestions from './seed-dev/module/dev.question.module';
// import seedReportsData from './seed-dev/module/dev.reports.module';
// import seedUserStats from './seed-dev/module/dev.user-stats.module';

import { gradeSettingData } from './seed-common/data/common.grade-setting.data';
import { trumpSettingData } from './seed-common/data/common.trump-setting.data';
import { goalSettingData } from './seed-common/data/common.goal-setting.data';
import { carrerIssueSettingData } from './seed-common/data/common.carrer-issue-setting.data';
import { roleSettingData } from './seed-common/data/common.role-setting.data';
import { hearAboutSettingData } from './seed-common/data/common.hear-about-us-setting.data';

const prisma = new PrismaClient();

async function main() {
  if (process.env.SERVER_ENV === 'PROD') {
    throw new Error('This seed script runs only in DEV & STAG env.');
  }

  console.time('Seeding took');
  console.group('Start Seeding...');

  await seedFacets(prisma, 'prisma/seed-common/data/common.facets.data.csv');
  await seedStageSetting(
    prisma,
    'prisma/seed-common/data/common.stage-setting.data.csv',
  );
  await seedGradeSetting(prisma, gradeSettingData);
  await seedTrumpSetting(prisma, trumpSettingData);
  await seedGoalSetting(prisma, goalSettingData);
  await seedCarrerIssuesSetting(prisma, carrerIssueSettingData);
  await seedRoleSetting(prisma, roleSettingData);
  await seedHearAboutSetting(prisma, hearAboutSettingData);
  await seedUsers(prisma);

  if (process.env.SERVER_ENV !== 'STAG') {
    await seedQuestions(prisma, new S3Service());
    // await seedReportsData(prisma);
    // await seedUserStats(prisma);
  }

  await seedQuotesData(
    prisma,
    'prisma/seed-common/data/common.quotes.data.csv',
  );
  await seedTestsSetting(prisma, 'prisma/seed-common/data/tests');

  console.groupEnd();
  console.log('Seeding Finished!!!');
  console.timeEnd('Seeding took');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
