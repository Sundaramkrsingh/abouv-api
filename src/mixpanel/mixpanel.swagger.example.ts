export const trackDtoSwaggerExample = {
  ['Intro landing example']: {
    value: [
      {
        event: 'Onboarding: Intro',
        properties: {
          distinct_id: 'Anonymous User',
        },
      },
    ],
  },
  ['Signup completion example']: {
    value: [
      {
        event: 'Onboarding: Signup Completed',
        properties: {
          distinct_id: 1,
        },
      },
    ],
  },
  ['Home example']: {
    value: [
      {
        event: 'Session Started',
        properties: {
          distinct_id: 1,
        },
      },
      {
        event: 'Feature: Home',
        properties: {
          distinct_id: 1,
        },
      },
    ],
  },
};
