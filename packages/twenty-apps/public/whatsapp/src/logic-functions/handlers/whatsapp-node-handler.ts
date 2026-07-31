type WhatsAppNodeInput = {
  operation: 'SEND_TEXT' | 'SEND_TEMPLATE' | 'PARSE_ORDER';
  recipientPhoneNumber?: string;
  messageBody?: string;
  previewUrl?: boolean;
  templateName?: string;
  languageCode?: string;
  templateBodyParameters?: string[];
  incomingMessage?: string;
};

type MetaMessageResponse = {
  contacts?: Array<{ wa_id?: string }>;
  messages?: Array<{ id?: string; message_status?: string }>;
  error?: { message?: string; code?: number };
};

const normalizePhoneNumber = (value: string): string => {
  const normalized = value.trim().replace(/[\s()+.-]/g, '');
  if (!/^\d{7,15}$/.test(normalized)) {
    throw new Error(
      'Recipient phone number must contain 7 to 15 digits including country code',
    );
  }
  return normalized;
};

const getConfig = () => {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const apiVersion = process.env.WHATSAPP_API_VERSION?.trim() || 'v23.0';

  if (!accessToken || !phoneNumberId) {
    throw new Error(
      'WhatsApp is not configured. Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in the app settings.',
    );
  }
  if (!/^v\d+\.\d+$/.test(apiVersion)) {
    throw new Error('WHATSAPP_API_VERSION must look like v23.0');
  }
  return { accessToken, phoneNumberId, apiVersion };
};

const parseOrder = (rawMessage: string) => {
  const message = rawMessage.trim();
  const command = message.toUpperCase();
  if (['MENU', 'HELP', 'TRACK', 'CONFIRM', 'CANCEL'].includes(command)) {
    return { success: true, operation: 'PARSE_ORDER', kind: 'COMMAND', command };
  }

  const parts = message.split(',').map((value) => value.trim()).filter(Boolean);
  const items = parts.map((part) => {
    const match = part.match(/^(\d+)\s*[xX*]\s*(\d+)$/);
    if (!match) throw new Error(`Invalid order item: ${part}`);
    const itemId = Number(match[1]);
    const quantity = Number(match[2]);
    if (itemId < 1 || quantity < 1) throw new Error(`Invalid order item: ${part}`);
    return { itemId, quantity };
  });

  if (items.length === 0) {
    return { success: true, operation: 'PARSE_ORDER', kind: 'UNKNOWN', command: null };
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

export const whatsappNodeHandler = async (parameters: WhatsAppNodeInput) => {
  if (parameters.operation === 'PARSE_ORDER') {
    return parseOrder(parameters.incomingMessage ?? '');
  }

  const { accessToken, phoneNumberId, apiVersion } = getConfig();
  const to = normalizePhoneNumber(parameters.recipientPhoneNumber ?? '');
  const payload =
    parameters.operation === 'SEND_TEXT'
      ? {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'text',
          text: {
            preview_url: parameters.previewUrl ?? false,
            body: parameters.messageBody?.trim() || '',
          },
        }
      : {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'template',
          template: {
            name: parameters.templateName?.trim() || '',
            language: { code: parameters.languageCode?.trim() || 'en_US' },
            components:
              parameters.templateBodyParameters?.length
                ? [
                    {
                      type: 'body',
                      parameters: parameters.templateBodyParameters.map((text) => ({
                        type: 'text',
                        text,
                      })),
                    },
                  ]
                : undefined,
          },
        };

  if (parameters.operation === 'SEND_TEXT' && !parameters.messageBody?.trim()) {
    throw new Error('Text message is required for SEND_TEXT');
  }
  if (parameters.operation === 'SEND_TEMPLATE' && !parameters.templateName?.trim()) {
    throw new Error('Template name is required for SEND_TEMPLATE');
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
    throw new Error(
      data.error?.message || `Meta WhatsApp API returned HTTP ${response.status}`,
    );
  }

  const messageId = data.messages?.[0]?.id;
  if (!messageId) throw new Error('Meta did not return a WhatsApp message ID');

  return {
    success: true,
    operation: parameters.operation,
    messageId,
    recipientPhoneNumber: data.contacts?.[0]?.wa_id ?? to,
    providerStatus: data.messages?.[0]?.message_status,
  };
};
