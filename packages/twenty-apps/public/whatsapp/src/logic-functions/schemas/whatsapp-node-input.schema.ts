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
        'Required for send operations. Supports a complete phone value or a phone-field object containing primaryPhoneNumber.',
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
      description: 'Exact language code from Meta, for example en_US or en.',
    },
    templateHeaderParameters: {
      type: 'array',
      label: 'Template header parameters',
      items: { type: 'string' },
      description:
        'Ordered text parameters for a template header. Leave empty when the header has no variables.',
    },
    templateBodyParameters: {
      type: 'array',
      label: 'Template body parameters',
      items: { type: 'string' },
      description:
        'Ordered values for the template body. Numbers and booleans are converted to text automatically.',
    },
    templateButtonSubType: {
      type: 'string',
      label: 'Template button subtype',
      enum: ['URL', 'QUICK_REPLY'],
      description:
        'Use URL for dynamic URL, copy-code, or OTP buttons. Use QUICK_REPLY for quick-reply buttons.',
    },
    templateButtonIndex: {
      type: 'integer',
      label: 'Template button index',
      description: 'Zero-based button position. The first button is 0.',
    },
    templateButtonParameterType: {
      type: 'string',
      label: 'Template button parameter type',
      enum: ['TEXT', 'PAYLOAD'],
      description:
        'URL buttons require TEXT. QUICK_REPLY buttons require PAYLOAD.',
    },
    templateButtonParameters: {
      type: 'array',
      label: 'Template button parameters',
      items: { type: 'string' },
      description:
        'Ordered values required by the selected template button. For OTP copy-code/autofill templates, enter the OTP here as well as in the body parameters.',
    },
    continueOnError: {
      type: 'boolean',
      label: 'Continue workflow on error',
      description:
        'Return success=false and error details instead of stopping the workflow when validation or Meta sending fails.',
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
