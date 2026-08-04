type WhatsAppNodeInput = {
  operation: 'SEND_TEXT' | 'SEND_TEMPLATE' | 'PARSE_ORDER';
  recipientPhoneNumber?: unknown;
  messageBody?: unknown;
  previewUrl?: boolean;
  templateName?: unknown;
  languageCode?: unknown;
  templateHeaderParameters?: unknown;
  templateBodyParameters?: unknown;
  templateButtonSubType?: 'URL' | 'QUICK_REPLY';
  templateButtonIndex?: unknown;
  templateButtonParameterType?: 'TEXT' | 'PAYLOAD';
  templateButtonParameters?: unknown;
  continueOnError?: boolean;
  incomingMessage?: string;
};

type MetaMessageResponse = {
  contacts?: Array<{ wa_id?: string }>;
  messages?: Array<{ id?: string; message_status?: string }>;
  error?: {
    message?: string;
    type?: string;
    code?: number;
    error_subcode?: number;
    fbtrace_id?: string;
  };
};

type WhatsAppNodeErrorOptions = {
  errorCode?: string;
  httpStatus?: number;
  retryable?: boolean;
};

class WhatsAppNodeError extends Error {
  errorCode?: string;
  httpStatus?: number;
  retryable: boolean;

  constructor(message: string, options: WhatsAppNodeErrorOptions = {}) {
    super(message);
    this.name = WhatsAppNodeError.name;
    this.errorCode = options.errorCode;
    this.httpStatus = options.httpStatus;
    this.retryable = options.retryable ?? false;
  }
}

const normalizeScalarValue = (
  value: unknown,
  label: string,
  errorCode: string,
): string => {
  if (typeof value === 'string') {
    const normalized = value.trim();
    if (normalized.length > 0) return normalized;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value === 'boolean') {
    return String(value);
  }

  throw new WhatsAppNodeError(`${label} resolved to an empty or invalid value`, {
    errorCode,
  });
};

const normalizeParameterArray = (
  value: unknown,
  label: string,
): string[] => {
  if (value === undefined || value === null) return [];

  // Twenty can resolve a single dynamic chip as a scalar even when the
  // workflow field is configured as an array. Treat it as a one-item list.
  const values = Array.isArray(value) ? value : [value];

  return values.map((item, index) =>
    normalizeScalarValue(
      item,
      `${label} ${index + 1}`,
      'EMPTY_TEMPLATE_PARAMETER',
    ),
  );
};

const getPhoneCandidate = (value: unknown): string => {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new WhatsAppNodeError(
      'Recipient phone number resolved to an empty or invalid value',
      { errorCode: 'INVALID_RECIPIENT' },
    );
  }

  const phone = value as Record<string, unknown>;
  const primaryPhoneNumber = phone.primaryPhoneNumber;
  const primaryPhoneCallingCode = phone.primaryPhoneCallingCode;

  if (
    typeof primaryPhoneNumber === 'string' ||
    typeof primaryPhoneNumber === 'number'
  ) {
    const primary = String(primaryPhoneNumber).trim();
    const callingCode =
      typeof primaryPhoneCallingCode === 'string' ||
      typeof primaryPhoneCallingCode === 'number'
        ? String(primaryPhoneCallingCode).trim()
        : '';

    if (callingCode && !primary.startsWith('+')) {
      const callingDigits = callingCode.replace(/\D/g, '');
      const primaryDigits = primary.replace(/\D/g, '');
      if (callingDigits && !primaryDigits.startsWith(callingDigits)) {
        return `${callingDigits}${primaryDigits}`;
      }
    }

    return primary;
  }

  for (const key of ['phoneNumber', 'number', 'value']) {
    const candidate = phone[key];
    if (typeof candidate === 'string' || typeof candidate === 'number') {
      return String(candidate);
    }
  }

  throw new WhatsAppNodeError(
    'Recipient phone number object does not contain a primary phone number',
    { errorCode: 'INVALID_RECIPIENT' },
  );
};

const normalizePhoneNumber = (value: unknown): string => {
  const normalized = getPhoneCandidate(value)
    .trim()
    .replace(/[\s()+.-]/g, '');

  if (!/^\d{7,15}$/.test(normalized)) {
    throw new WhatsAppNodeError(
      'Recipient phone number must contain 7 to 15 digits including country code',
      { errorCode: 'INVALID_RECIPIENT' },
    );
  }

  return normalized;
};

const normalizeButtonIndex = (value: unknown): number => {
  if (value === undefined || value === null || value === '') return 0;

  const index = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(index) || index < 0) {
    throw new WhatsAppNodeError(
      'Template button index must be a non-negative whole number',
      { errorCode: 'INVALID_BUTTON_INDEX' },
    );
  }

  return index;
};

const getConfig = () => {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const apiVersion = process.env.WHATSAPP_API_VERSION?.trim() || 'v23.0';

  if (!accessToken || !phoneNumberId) {
    throw new WhatsAppNodeError(
      'WhatsApp is not configured. Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in the app settings.',
      { errorCode: 'WHATSAPP_NOT_CONFIGURED' },
    );
  }
  if (!/^v\d+\.\d+$/.test(apiVersion)) {
    throw new WhatsAppNodeError('WHATSAPP_API_VERSION must look like v23.0', {
      errorCode: 'INVALID_API_VERSION',
    });
  }
  return { accessToken, phoneNumberId, apiVersion };
};

const parseOrder = (rawMessage: string) => {
  const message = rawMessage.trim();
  const command = message.toUpperCase();
  if (['MENU', 'HELP', 'TRACK', 'CONFIRM', 'CANCEL'].includes(command)) {
    return { success: true, operation: 'PARSE_ORDER', kind: 'COMMAND', command };
  }

  const parts = message
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const items = parts.map((part) => {
    const match = part.match(/^(\d+)\s*[xX*]\s*(\d+)$/);
    if (!match) throw new Error(`Invalid order item: ${part}`);
    const itemId = Number(match[1]);
    const quantity = Number(match[2]);
    if (itemId < 1 || quantity < 1)
      throw new Error(`Invalid order item: ${part}`);
    return { itemId, quantity };
  });

  if (items.length === 0) {
    return {
      success: true,
      operation: 'PARSE_ORDER',
      kind: 'UNKNOWN',
      command: null,
    };
  }

  return {
    success: true,
    operation: 'PARSE_ORDER',
    kind: 'ORDER',
    command: null,
    items,
    itemCount: items.length,
    totalQuantity: items.reduce((total, item) => total + item.quantity, 0),
  };
};

const isRetryableStatus = (status: number): boolean =>
  status === 408 || status === 429 || status >= 500;

const toStructuredError = (error: unknown) => {
  if (error instanceof WhatsAppNodeError) {
    return {
      errorCode: error.errorCode,
      errorMessage: error.message,
      httpStatus: error.httpStatus,
      retryable: error.retryable,
    };
  }

  if (error instanceof Error) {
    return {
      errorCode: 'WHATSAPP_REQUEST_FAILED',
      errorMessage: error.message,
      httpStatus: undefined,
      retryable: error.name === 'AbortError' || error.name === 'TimeoutError',
    };
  }

  return {
    errorCode: 'WHATSAPP_REQUEST_FAILED',
    errorMessage: 'WhatsApp request failed',
    httpStatus: undefined,
    retryable: false,
  };
};

export const whatsappNodeHandler = async (parameters: WhatsAppNodeInput) => {
  if (parameters.operation === 'PARSE_ORDER') {
    return parseOrder(parameters.incomingMessage ?? '');
  }

  let normalizedRecipientPhoneNumber: string | undefined;
  let normalizedTemplateName: string | undefined;

  try {
    const { accessToken, phoneNumberId, apiVersion } = getConfig();
    normalizedRecipientPhoneNumber = normalizePhoneNumber(
      parameters.recipientPhoneNumber,
    );

    let payload: Record<string, unknown>;

    if (parameters.operation === 'SEND_TEXT') {
      const messageBody = normalizeScalarValue(
        parameters.messageBody,
        'Text message',
        'MISSING_TEXT_MESSAGE',
      );

      payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: normalizedRecipientPhoneNumber,
        type: 'text',
        text: {
          preview_url: parameters.previewUrl ?? false,
          body: messageBody,
        },
      };
    } else {
      normalizedTemplateName = normalizeScalarValue(
        parameters.templateName,
        'Template name',
        'MISSING_TEMPLATE_NAME',
      );
      const languageCode =
        parameters.languageCode === undefined || parameters.languageCode === null
          ? 'en_US'
          : normalizeScalarValue(
              parameters.languageCode,
              'Template language code',
              'MISSING_LANGUAGE_CODE',
            );
      const headerParameters = normalizeParameterArray(
        parameters.templateHeaderParameters,
        'Template header parameter',
      );
      const bodyParameters = normalizeParameterArray(
        parameters.templateBodyParameters,
        'Template body parameter',
      );
      const buttonParameters = normalizeParameterArray(
        parameters.templateButtonParameters,
        'Template button parameter',
      );

      const components: Array<Record<string, unknown>> = [];

      if (headerParameters.length > 0) {
        components.push({
          type: 'header',
          parameters: headerParameters.map((text) => ({ type: 'text', text })),
        });
      }

      if (bodyParameters.length > 0) {
        components.push({
          type: 'body',
          parameters: bodyParameters.map((text) => ({ type: 'text', text })),
        });
      }

      if (buttonParameters.length > 0) {
        const buttonSubType = parameters.templateButtonSubType ?? 'URL';
        const expectedParameterType =
          buttonSubType === 'QUICK_REPLY' ? 'PAYLOAD' : 'TEXT';
        const buttonParameterType =
          parameters.templateButtonParameterType ?? expectedParameterType;

        if (buttonParameterType !== expectedParameterType) {
          throw new WhatsAppNodeError(
            `${buttonSubType} buttons require ${expectedParameterType} parameters`,
            { errorCode: 'INVALID_BUTTON_PARAMETER_TYPE' },
          );
        }

        components.push({
          type: 'button',
          sub_type: buttonSubType.toLowerCase(),
          index: String(normalizeButtonIndex(parameters.templateButtonIndex)),
          parameters: buttonParameters.map((value) =>
            buttonParameterType === 'PAYLOAD'
              ? { type: 'payload', payload: value }
              : { type: 'text', text: value },
          ),
        });
      }

      payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: normalizedRecipientPhoneNumber,
        type: 'template',
        template: {
          name: normalizedTemplateName,
          language: { code: languageCode },
          components: components.length > 0 ? components : undefined,
        },
      };
    }

    const response = await fetch(
      `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15_000),
      },
    );

    const data = (await response.json()) as MetaMessageResponse;
    if (!response.ok) {
      throw new WhatsAppNodeError(
        data.error?.message ||
          `Meta WhatsApp API returned HTTP ${response.status}`,
        {
          errorCode: data.error?.code
            ? String(data.error.code)
            : 'META_API_ERROR',
          httpStatus: response.status,
          retryable: isRetryableStatus(response.status),
        },
      );
    }

    const messageId = data.messages?.[0]?.id;
    if (!messageId) {
      throw new WhatsAppNodeError(
        'Meta accepted the request but did not return a WhatsApp message ID',
        { errorCode: 'MISSING_MESSAGE_ID' },
      );
    }

    return {
      success: true,
      acceptedByMeta: true,
      operation: parameters.operation,
      messageId,
      recipientPhoneNumber:
        data.contacts?.[0]?.wa_id ?? normalizedRecipientPhoneNumber,
      providerStatus: data.messages?.[0]?.message_status,
      templateName: normalizedTemplateName,
    };
  } catch (error) {
    if (!parameters.continueOnError) throw error;

    const structuredError = toStructuredError(error);

    return {
      success: false,
      acceptedByMeta: false,
      operation: parameters.operation,
      recipientPhoneNumber: normalizedRecipientPhoneNumber,
      templateName: normalizedTemplateName,
      ...structuredError,
    };
  }
};
