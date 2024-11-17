export const addEmailDtoSwaggerSchema = {
  type: 'object',
  properties: {
    email: { type: 'string' },
  },
};

export const basicDtoSwaggerSchema = {
  type: 'object',
  properties: {
    avatar: { type: 'string' },
    username: { type: 'string' },
    fullName: { type: 'string' },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    bio: { type: 'string' },
    dob: { type: 'string' },
    gender: { type: 'string' },
    electiveSetAt: { type: 'string' },
  },
};

export const notificationPreferenceSwaggerSchema = {
  type: 'object',
  properties: {
    notificationType: { type: 'string' },
    status: { type: 'boolean' },
  },
};

export const passwordDtoSwaggerSchema = {
  type: 'object',
  properties: {
    password: { type: 'string' },
  },
};

export const addressDtoSwaggerSchema = {
  type: 'object',
  properties: {
    line: { type: 'string' },
    country: { type: 'string' },
    state: { type: 'string' },
    cityDistrict: { type: 'string' },
    pincode: { type: 'string' },
  },
};

export const workExperienceDtoSwaggerSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      company: { type: 'string' },
      from: { type: 'string' },
      to: { type: 'string' },
    },
  },
};

export const projectDtoSwaggerSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      url: { type: 'string' },
    },
  },
};

export const licenseCertificationDtoSwaggerSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      provider: { type: 'string' },
      from: { type: 'string' },
      to: { type: 'string' },
      url: { type: 'string' },
    },
  },
};

export const educationDtoSwaggerSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      schoolCollage: { type: 'string' },
      university: { type: 'string' },
      degree: { type: 'string' },
      from: { type: 'string' },
      to: { type: 'string' },
    },
  },
};

export const awardAchievementDtoSwaggerSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      url: { type: 'string' },
    },
  },
};

export const uploadProfileImageSwaggerSchema = {
  type: 'object',
  properties: {
    file: {
      type: 'string',
      format: 'binary',
      description:
        'The profile image file (JPEG, JPG, PNG format, max size 2MB)',
    },
  },
};

export const uploadResumeSwaggerSchema = {
  type: 'object',
  properties: {
    file: {
      type: 'string',
      format: 'binary',
      description: 'Resume file in (PDF or DOC format, max size 2MB)',
    },
  },
};

export const electiveDtoSwaggerSchema = {
  type: 'object',
  properties: {
    tier1Id: { type: 'integer' },
    tier2Id: { type: 'integer' },
    tier3Id: {
      type: 'array',
      items: {
        type: 'integer',
      },
    },
  },
};

export const goalDtoSwaggerSchema = {
  type: 'object',
  properties: {
    goal: {
      type: 'array',
      items: {
        type: 'integer',
      },
    },
  },
};

export const updateOnboardingProfileInfoSwaggerSchema = {
  type: 'object',
  properties: {
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    pincode: { type: 'integer' },
    email: { type: 'string', format: 'email' },
    password: { type: 'string' },
  },
};

export const updateOnboardingStatusDtoSwaggerSchema = {
  type: 'object',
  properties: {
    onboardingSlug: { type: 'string' },
  },
};

export const verifyEmailDtoSwaggerSchema = {
  type: 'object',
  properties: {
    otpCode: { type: 'string' },
  },
};

export const pushNotificationsDtoSwaggerSchema = {
  type: 'object',
  properties: {
    flag: { type: 'boolean' },
  },
};

export const careerIssuesDtoSwaggerSchema = {
  type: 'object',
  properties: {
    careerIssues: {
      type: 'array',
      items: {
        type: 'integer',
      },
    },
  },
};

export const pushNotificationSubscriptionDtoSwaggerSchema = {
  type: 'object',
  properties: {
    subscription: {
      type: 'object',
      properties: {
        endpoint: { type: 'string' },
        expirationTime: { oneOf: [{ type: 'string' }, { type: 'null' }] },
        keys: {
          type: 'object',
          properties: {
            p256dh: { type: 'string' },
            auth: { type: 'string' },
          },
        },
      },
    },
  },
};
