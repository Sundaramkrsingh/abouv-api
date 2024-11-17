import * as Mixpanel from 'mixpanel';

// https://github.com/mixpanel/mixpanel-node

export const mixpanelClient = Mixpanel.init(
  process.env.MIXPANEL_TOKEN,
  process.env.NODE_ENV === 'development'
    ? {
        debug: true,
        protocol: 'http',
      }
    : {},
);
