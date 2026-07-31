import { defineApplication } from 'twenty-sdk/define';

import {
  APPLICATION_UNIVERSAL_IDENTIFIER,
  WHATSAPP_ACCESS_TOKEN_VARIABLE_UNIVERSAL_IDENTIFIER,
  WHATSAPP_API_VERSION_VARIABLE_UNIVERSAL_IDENTIFIER,
  WHATSAPP_PHONE_NUMBER_ID_VARIABLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'Twenty WhatsApp',
  description:
    'A native WhatsApp workflow node for sending text or approved template messages and parsing simple order commands.',
  author: 'NextPageTech',
  category: 'Communication',
  websiteUrl: 'https://developers.facebook.com/docs/whatsapp/cloud-api',
  emailSupport: 'support@nextpagetech.com',
  applicationVariables: {
    WHATSAPP_ACCESS_TOKEN: {
      universalIdentifier: WHATSAPP_ACCESS_TOKEN_VARIABLE_UNIVERSAL_IDENTIFIER,
      description: 'Meta WhatsApp Cloud API access token.',
      isSecret: true,
    },
    WHATSAPP_PHONE_NUMBER_ID: {
      universalIdentifier: WHATSAPP_PHONE_NUMBER_ID_VARIABLE_UNIVERSAL_IDENTIFIER,
      description: 'Meta WhatsApp phone number ID used to send messages.',
      isSecret: false,
    },
    WHATSAPP_API_VERSION: {
      universalIdentifier: WHATSAPP_API_VERSION_VARIABLE_UNIVERSAL_IDENTIFIER,
      description: 'Meta Graph API version, for example v23.0.',
      isSecret: false,
    },
  },
});
