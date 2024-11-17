import { PrismaClient } from '@prisma/client';

export default async function seedHearAboutSetting(
  prisma: PrismaClient,
  hearAboutSettingData,
) {
  console.group('[How did you hear about us Setting]');
  const data = [];

  for (let i = 0; i < hearAboutSettingData.length; i++) {
    data.push({
      name: hearAboutSettingData[i],
    });
  }

  try {
    await prisma.hearAbtUsSetting.createMany({
      data,
      skipDuplicates: true,
    });

    console.log('hear about us added');
  } catch (error) {
    throw error;
  }
  console.groupEnd();
}
