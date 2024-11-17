import { PrismaClient } from '@prisma/client';

export default async function seedRoleSetting(
  prisma: PrismaClient,
  roleSettingData,
) {
  console.group('[Current Role Setting]');
  const data = [];

  for (let i = 0; i < roleSettingData.length; i++) {
    data.push({
      name: roleSettingData[i],
    });
  }

  try {
    await prisma.roleSetting.createMany({
      data,
      skipDuplicates: true,
    });

    console.log('Roles added');
  } catch (error) {
    throw error;
  }
  console.groupEnd();
}
