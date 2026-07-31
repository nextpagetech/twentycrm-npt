import { type InputJsonSchema } from 'twenty-sdk/logic-function';

export const whatsappNodeInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    operation: {
      type: 'string',
      label: 'Operation',
      enum: ['SEND_TEXT', 'SEND_TEMPLATE', 'PARSE_ORDER'],
      description:
        'Choose whether to send a text message, send an approved template, or parse a simple WhatsApp order command.',
    },
    recipientPhoneNumber: {
      type: 'string',
      label: 'Recipient phone number',
      description:
        'Required for send operations. Include country code, for example 919876543210.',
    },
    messageBody: {
      type: 'string',
      label: 'Text message',
      multiline: true,
      description: 'Required when operation is SEND_TEXT.',
    },
    previewUrl: {
      type: 'boolean',
      label: 'Preview links',
      description: 'Enable link previews for SEND_TEXT.',
    },
    templateName: {
      type: 'string',
      label: 'Template name',
      description: 'Required when operation is SEND_TEMPLATE.',
    },
    languageCode: {
      type: 'string',
      label: 'Template language code',
      description: 'For example en_US.',
    },
    templateBodyParameters: {
      type: 'array',
      label: 'Template body parameters',
      items: { type: 'string' },
      description: 'Ordered text parameters for the template body.',
    },
    incomingMessage: {
      type: 'string',
      label: 'Incoming message',
      multiline: true,
      description:
        'Required when operation is PARSE_ORDER. Recognizes MENU, HELP, TRACK, CONFIRM, CANCEL and item formats such as 1x2, 3x1.',
    },
  },
  required: ['operation'],
  additionalProperties: false,
};
