/* eslint-disable prettier/prettier */
import { fakerEN_IN as faker } from '@faker-js/faker';
import dayjs from 'dayjs';
import { ProfileGender } from '@prisma/client';
import { getRandomNumber } from 'prisma/seed.utils';

type gender = 'male' | 'female';
const randomGender = ['male', 'female'][getRandomNumber(2)] as gender;

export const addEmailDtoSwaggerExample = {
  example1: {
    value: {
      email: faker.internet.email(),
    },
  },
};

export const basicDtoSwaggerExample = {
  example1: {
    value: {
      firstName: faker.person.firstName(randomGender),
      lastName: faker.person.lastName(randomGender),
      bio: [faker.person.bio(), faker.person.bio(), faker.person.bio()].join(
        '',
      ),
      dob: faker.date.birthdate(),
      gender: [randomGender.toUpperCase(), 'RATHER_NOT_TO_SAY'][
        getRandomNumber(2)
      ] as ProfileGender,
    },
  },
};

export const passwordDtoSwaggerExample = {
  example1: {
    value: {
      password: faker.internet.password(),
    },
  },
};

export const addressDtoSwaggerExample = {
  example1: {
    value: {
      line1: faker.location.streetAddress(),
      country: 'India',
      state: 'Rajasthan',
      cityDistrict: 'Jaipur',
      pincode: faker.location.zipCode({
        format: '######',
      }),
    },
  },
};

export const updateNotifPreferenceExample = {
  example: {
    value: {
      notificationType: 'email',
      status: true,
    },
  },
};

export const workExperienceDtoSwaggerExample = {
  example1: {
    value: {
      title: faker.person.jobTitle(),
      company: faker.company.name(),
      from: faker.date.past().toISOString(),
      to: dayjs().format(),
    },
  },
};

export const projectDtoSwaggerExample = {
  example1: {
    value: {
      title: faker.commerce.productName(),
      description: faker.lorem.paragraph(2),
      url: faker.internet.url(),
    },
  },
};

export const licenseCertificationDtoSwaggerExample = {
  example1: {
    value: {
      name: faker.commerce.productName(),
      provider: faker.company.name(),
      from: faker.date.past().toISOString(),
      to: dayjs().format(),
      url: faker.internet.url(),
    },
  },
};

export const educationDtoSwaggerExample = {
  example1: {
    value: {
      schoolCollage: faker.person.jobTitle(),
      university: faker.person.jobTitle(),
      degree: faker.person.jobTitle(),
      from: faker.date.past().toISOString(),
      to: dayjs().format(),
    },
  },
};

export const awardAchievementDtoSwaggerExample = {
  example1: {
    value: {
      title: faker.commerce.productName(),
      description: faker.lorem.paragraph(2),
      url: faker.internet.url(),
    },
  },
};

export const uploadProfileImageSwaggerExample = {
  example1: {
    value: {
      file: faker.image.avatar(),
    },
  },
};

export const updateOnboardingProfileInfoSwaggerExample = {
  example1: {
    value: {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      pincode: faker.location.zipCode(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    },
  },
};

// Example for electiveDtoSwaggerSchema
export const electiveDtoSwaggerExample = {
  example1: {
    value: {
      tier3Id: [getRandomNumber(1, 150), getRandomNumber(150, 298)],
    },
  },
};

export const uploadResumeSwaggerExample = {
  example1: {
    value: {
      file: faker.image.avatar(),
    },
  },
};

// Example for goalDtoSwaggerSchema
export const goalDtoSwaggerExample = {
  example1: {
    value: {
      goals: [
        getRandomNumber(1, 4),
        getRandomNumber(5, 8),
        getRandomNumber(9, 10),
      ],
    },
  },
};

export const updateOnboardingStatusDtoSwaggerExample = {
  example1: {
    value: {
      onboardingSlug: '/onboarding?category=hear',
    },
  },
};

export const verifyEmailDtoSwaggerExample = {
  example1: {
    value: {
      otpCode: '1234',
    },
  },
};

export const pushNotificationsDtoSwaggerExample = {
  example1: {
    value: {
      flag: true,
    },
  },
};

export const careerIssuesDtoSwaggerExample = {
  example1: {
    value: {
      careerIssues: [1, 2, 3],
    },
  },
};

export const pushNotificationSubscriptionDtoSwaggerExample = {
  example1: {
    value: {
      subscription: {
        endpoint:
          'https://fcm.googleapis.com/fcm/send/ePaNNQz_qho:APA91bEG5JxuA-USiH2G8rCFSqeZJR2k1veHlT6NW5Gd3hDx2KX4fOGRxmVq9J3oxh4aRDERrc7Uzo45mHgQJIAJnnWt0fQaBZpq_tLpp7Dd7LwY1nEaYGCWxxvER5QTQVqpf5hBwoMl',
        expirationTime: null,
        keys: {
          p256dh:
            'BMUkL2BxoyPrJkg4QedbtOM8kEqLzJTeb_eppkbC42las_HoCRgY3cJc8D1njnX9fQFAJZNuxFmozaBRczzvrEE',
          auth: '2i3ur283h832d',
        },
      },
    },
  },
};
