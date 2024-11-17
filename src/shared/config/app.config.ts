export const envConfig = {
  env: process.env.SERVER_ENV,
  db: {
    host: process.env.DBHOST,
    port: process.env.DBPORT,
    name: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
  },
  S3: {
    uploadProfileImgBucket: process.env.PROFILE_IMAGE_BUCKET,
    userResumeBucket: process.env.USER_RESUME_BUCKET,
    creativePotentialBucket: process.env.CREATIVE_POTENTIAL_BUCKET,
    feedbackImageBucket: process.env.FEEDBACK_IMAGE_BUCKET,
    awsRegion: process.env.AWS_REGION,
    timeOut: process.env.OBJECT_EXPIRE_TIME_OUT,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  },

  node_mailer: {
    email: process.env.EMAIL,
    password: process.env.EMAIL_APP_PASSWORD,
  },

  subDomain:
    process.env.SERVER_ENV === 'DEV'
      ? 'dv.'
      : process.env.SERVER_ENV === 'STAG'
        ? 'sg.'
        : '',
  image: process.env.PEXELS_API_KEY,

  vapidKeys: {
    email: process.env.EMAIL,
    publicKey: process.env.PUBLIC_VAPID_KEY || '',
    privateKey: process.env.PRIVATE_VAPID_KEY || '',
  },
};
