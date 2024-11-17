/* eslint-disable prettier/prettier */
import { ProfileGender, PrismaClient } from '@prisma/client';
import { fakerEN_IN as faker } from '@faker-js/faker';
import { State, City } from 'country-state-city';
import dayjs from 'dayjs';
import { getRandomNumber } from '../../seed.utils';
type gender = 'male' | 'female';

export default async function seedUsers(prisma: PrismaClient) {
  const data = [
    {
      username: 'dev.jobseeker1',
      firstName: 'DEV',
      lastName: 'Job Seeker 1',
      email: 'dev.jobseeker1@test.com',
    },
    {
      username: 'dev.jobseeker2',
      firstName: 'DEV',
      lastName: 'Job Seeker 2',
      email: 'dev.jobseeker2@test.com',
    },
    {
      username: 'qa.jobseeker1',
      firstName: 'QA',
      lastName: 'Job Seeker 1',
      email: 'qa.jobseeker1@test.com',
    },
    {
      username: 'qa.jobseeker2',
      firstName: 'QA',
      lastName: 'Job Seeker 2',
      email: 'qa.jobseeker2@test.com',
    },
  ];

  try {
    console.group('[User]');
    for (const [index] of Array.from({ length: 4 }).entries()) {
      const { username, firstName, lastName, email } = data[index];
      const insertEmpty = (index + 1) % 2 === 0;
      const phoneNumber = faker.phone.number().split('-').join('');
      const randomGender = ['male', 'female'][getRandomNumber(2)] as gender;
      const gender =
        index === 0
          ? 'MALE'
          : ([randomGender.toUpperCase(), 'RATHER_NOT_TO_SAY'][
              getRandomNumber(2)
            ] as ProfileGender);

      const country = 'India';
      const countryCode = 'IN';
      const states = State.getStatesOfCountry(countryCode);
      const randomState = states[getRandomNumber(states.length)];
      const cities = City.getCitiesOfState(countryCode, randomState.isoCode);
      const randomCity = cities[getRandomNumber(cities.length)];

      const existingUser = await prisma.user.findUnique({
        where: {
          phoneNumber,
        },
      });

      if (existingUser) {
        continue;
      }

      const existingProfile = await prisma.profile.findUnique({
        where: {
          email,
        },
      });

      if (existingProfile) {
        continue;
      }

      const tier1s = await prisma.tier1.findMany({
        where: {
          name: {
            in: ['Craft Series', 'Extra Series', 'Skill Series'],
          },
        },
        include: {
          tier2: {
            include: {
              tier3: true,
            },
          },
        },
      });

      await prisma.user.create({
        data: {
          phoneNumber,
          isPhoneNumberVerified: true,
          isNewUser: false,
          onboardingSlug: '',
          profile: {
            create: {
              username,
              fullName: firstName + ' ' + lastName,
              firstName,
              lastName,
              bio: [
                faker.person.bio(),
                faker.person.bio(),
                faker.person.bio(),
              ].join(''),
              email,
              isEmailVerified: true,
              password: faker.internet.password(),
              dob: faker.date.birthdate(),
              gender,
              resume: null,
              profileCompletion: getRandomNumber(10, 100).toString(),
              electivesSetAt: dayjs(
                ['2024-01-01', '2024-02-21', '2024-03-15'][getRandomNumber(3)],
              ).toISOString(),
              elective: {
                create: tier1s.flatMap((tier1) =>
                  tier1.tier2.map((tier2) => ({
                    tier1Id: tier1.id,
                    tier2Id: tier2.id,
                    tier3Id: [
                      ...Array.from(
                        { length: 3 },
                        () =>
                          tier2.tier3[getRandomNumber(tier2.tier3.length)].id,
                      ),
                    ],
                  })),
                ),
              },
              address: insertEmpty
                ? {}
                : {
                    create: {
                      line1: faker.location.streetAddress(),
                      country,
                      state: randomState.name,
                      cityDistrict: randomCity.name,
                      pincode: faker.location.zipCode({
                        format: '######',
                      }),
                    },
                  },
              workExperience: insertEmpty
                ? {}
                : {
                    create: [
                      {
                        title: faker.person.jobTitle(),
                        company: faker.company.name(),
                        from: faker.date.past().toISOString(),
                        to: [dayjs().format(), null][getRandomNumber(2)],
                      },
                    ],
                  },
              project: insertEmpty
                ? {}
                : {
                    create: [
                      {
                        title: faker.commerce.productName(),
                        description: faker.lorem.paragraph(2),
                        url: [null, faker.internet.url()][getRandomNumber(2)],
                      },
                      {
                        title: faker.commerce.productName(),
                        description: faker.lorem.paragraph(2),
                        url: [null, faker.internet.url()][getRandomNumber(2)],
                      },
                    ],
                  },
              licenseCertification: insertEmpty
                ? {}
                : {
                    create: [
                      {
                        name: faker.commerce.productName(),
                        provider: faker.company.name(),
                        from: faker.date.past().toISOString(),
                        to: dayjs().format(),
                        url: faker.internet.url(),
                      },
                      {
                        name: faker.commerce.productName(),
                        provider: faker.company.name(),
                        from: faker.date.past().toISOString(),
                        to: dayjs().format(),
                        url: faker.internet.url(),
                      },
                    ],
                  },
              education: insertEmpty
                ? {}
                : {
                    create: [
                      {
                        schoolCollage: faker.person.jobTitle(),
                        university: [null, faker.person.jobTitle()][
                          getRandomNumber(2)
                        ],
                        degree: faker.person.jobTitle(),
                        from: faker.date.past().toISOString(),
                        to: [null, dayjs().format()][getRandomNumber(2)],
                      },
                    ],
                  },
              awardAchievement: insertEmpty
                ? {}
                : {
                    create: [
                      {
                        title: faker.commerce.productName(),
                        description: faker.lorem.paragraph(2),
                        url: faker.internet.url(),
                      },
                    ],
                  },
            },
          },
        },
      });
    }

    console.log("User and it's profile data added");
  } catch (error) {
    throw error;
  }
  console.groupEnd();
}
