import { PrismaClient } from '@prisma/client';

const generateSettingExample = (setting, type) => {
  return {
    type,
    text: setting.text,
    codeName: setting.codeName,
  };
};

export default async function seedTrumpSetting(
  prisma: PrismaClient,
  trumpSettingData,
) {
  console.group('[Trumps Setting]');
  const data = [];

  for (const trump of trumpSettingData) {
    data.push(generateSettingExample(trump, 'POWER_UPS'));
  }

  try {
    await prisma.trumpSetting.createMany({
      data,
      skipDuplicates: true,
    });

    console.log('Trumps added');
  } catch (error) {
    throw error;
  }
  console.groupEnd();
}
