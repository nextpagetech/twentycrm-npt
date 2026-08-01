import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { whatsappNodeHandler } from 'src/logic-functions/handlers/whatsapp-node-handler';

const createFetchResponse = ({
  ok,
  status,
  data,
}: {
  ok: boolean;
  status: number;
  data: unknown;
}) => ({
  ok,
  status,
  json: async () => data,
});

describe('whatsappNodeHandler', () => {
  beforeEach(() => {
    process.env.WHATSAPP_ACCESS_TOKEN = 'test-access-token';
    process.env.WHATSAPP_PHONE_NUMBER_ID = '123456789';
    process.env.WHATSAPP_API_VERSION = 'v23.0';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    delete process.env.WHATSAPP_ACCESS_TOKEN;
    delete process.env.WHATSAPP_PHONE_NUMBER_ID;
    delete process.env.WHATSAPP_API_VERSION;
  });

  it('parses supported commands', async () => {
    await expect(
      whatsappNodeHandler({ operation: 'PARSE_ORDER', incomingMessage: 'menu' }),
    ).resolves.toMatchObject({
      success: true,
      kind: 'COMMAND',
      command: 'MENU',
    });
  });

  it('parses item and quantity pairs', async () => {
    await expect(
      whatsappNodeHandler({
        operation: 'PARSE_ORDER',
        incomingMessage: '1x2, 3x1',
      }),
    ).resolves.toMatchObject({
      success: true,
      kind: 'ORDER',
      items: [
        { itemId: 1, quantity: 2 },
        { itemId: 3, quantity: 1 },
      ],
      itemCount: 2,
      totalQuantity: 3,
    });
  });

  it('rejects malformed order entries', async () => {
    await expect(
      whatsappNodeHandler({
        operation: 'PARSE_ORDER',
        incomingMessage: 'one pizza',
      }),
    ).rejects.toThrow('Invalid order item');
  });

  it('converts a dynamic numeric body parameter to text', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createFetchResponse({
        ok: true,
        status: 200,
        data: {
          contacts: [{ wa_id: '918885344518' }],
          messages: [{ id: 'wamid.body-parameter' }],
        },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      whatsappNodeHandler({
        operation: 'SEND_TEMPLATE',
        recipientPhoneNumber: '+91 88853 44518',
        templateName: 'welcome_customer',
        languageCode: 'en_US',
        templateBodyParameters: [45334],
      }),
    ).resolves.toMatchObject({
      success: true,
      acceptedByMeta: true,
      messageId: 'wamid.body-parameter',
    });

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const payload = JSON.parse(String(request.body));

    expect(payload.template.components).toEqual([
      {
        type: 'body',
        parameters: [{ type: 'text', text: '45334' }],
      },
    ]);
  });

  it('builds body and URL button components for an OTP template', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createFetchResponse({
        ok: true,
        status: 200,
        data: {
          contacts: [{ wa_id: '918885344518' }],
          messages: [{ id: 'wamid.otp' }],
        },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await whatsappNodeHandler({
      operation: 'SEND_TEMPLATE',
      recipientPhoneNumber: '918885344518',
      templateName: 'otp_verification_1',
      languageCode: 'en',
      templateBodyParameters: [45334],
      templateButtonSubType: 'URL',
      templateButtonIndex: 0,
      templateButtonParameterType: 'TEXT',
      templateButtonParameters: [45334],
    });

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const payload = JSON.parse(String(request.body));

    expect(payload.template.components).toEqual([
      {
        type: 'body',
        parameters: [{ type: 'text', text: '45334' }],
      },
      {
        type: 'button',
        sub_type: 'url',
        index: '0',
        parameters: [{ type: 'text', text: '45334' }],
      },
    ]);
  });

  it('extracts a phone number from a dynamic phone-field object', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createFetchResponse({
        ok: true,
        status: 200,
        data: {
          contacts: [{ wa_id: '918885344518' }],
          messages: [{ id: 'wamid.phone-object' }],
        },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await whatsappNodeHandler({
      operation: 'SEND_TEMPLATE',
      recipientPhoneNumber: {
        primaryPhoneNumber: '8885344518',
        primaryPhoneCallingCode: '+91',
      },
      templateName: 'welcome_customer',
      languageCode: 'en_US',
    });

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const payload = JSON.parse(String(request.body));

    expect(payload.to).toBe('918885344518');
  });

  it('returns a structured Meta error when continue on error is enabled', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createFetchResponse({
        ok: false,
        status: 400,
        data: {
          error: {
            code: 131008,
            message: '(#131008) Required parameter is missing',
          },
        },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      whatsappNodeHandler({
        operation: 'SEND_TEMPLATE',
        recipientPhoneNumber: '918885344518',
        templateName: 'wrong_template_name',
        languageCode: 'en_US',
        continueOnError: true,
      }),
    ).resolves.toMatchObject({
      success: false,
      acceptedByMeta: false,
      errorCode: '131008',
      errorMessage: '(#131008) Required parameter is missing',
      httpStatus: 400,
      retryable: false,
      templateName: 'wrong_template_name',
      recipientPhoneNumber: '918885344518',
    });
  });

  it('returns a local validation error for an empty dynamic parameter', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      whatsappNodeHandler({
        operation: 'SEND_TEMPLATE',
        recipientPhoneNumber: '918885344518',
        templateName: 'welcome_customer',
        languageCode: 'en_US',
        templateBodyParameters: [null],
        continueOnError: true,
      }),
    ).resolves.toMatchObject({
      success: false,
      errorCode: 'EMPTY_TEMPLATE_PARAMETER',
      errorMessage:
        'Template body parameter 1 resolved to an empty or invalid value',
      retryable: false,
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('still throws when continue on error is disabled', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createFetchResponse({
        ok: false,
        status: 400,
        data: {
          error: {
            code: 132001,
            message: 'Template name does not exist',
          },
        },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      whatsappNodeHandler({
        operation: 'SEND_TEMPLATE',
        recipientPhoneNumber: '918885344518',
        templateName: 'wrong_template_name',
        languageCode: 'en_US',
      }),
    ).rejects.toThrow('Template name does not exist');
  });
});
