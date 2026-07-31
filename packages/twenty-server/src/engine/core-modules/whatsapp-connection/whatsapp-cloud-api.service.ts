import { Injectable } from '@nestjs/common';

import { isAxiosError } from 'axios';
import {
  type WorkflowSendWhatsAppMessageActionInput,
  type WorkflowWhatsAppTemplateComponent,
} from 'twenty-shared/workflow';

import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { WhatsAppCloudApiException } from 'src/engine/core-modules/whatsapp-connection/exceptions/whatsapp-cloud-api.exception';
import { WhatsAppConnectionService } from 'src/engine/core-modules/whatsapp-connection/whatsapp-connection.service';

type MetaMessageResponse = {
  messaging_product?: string;
  contacts?: Array<{
    input?: string;
    wa_id?: string;
  }>;
  messages?: Array<{
    id?: string;
    message_status?: string;
  }>;
};

type MetaErrorResponse = {
  error?: {
    message?: string;
    type?: string;
    code?: number;
    error_subcode?: number;
    fbtrace_id?: string;
  };
};

export type SendWhatsAppMessageResult = {
  success: true;
  messageId: string;
  recipientPhoneNumber: string;
  messageType: 'TEXT' | 'TEMPLATE';
  connectionId: string;
  providerStatus?: string;
};

const normalizeRecipientPhoneNumber = (phoneNumber: string): string => {
  const normalized = phoneNumber.trim().replace(/[\s()+.-]/g, '');

  if (!/^\d{7,15}$/.test(normalized)) {
    throw new WhatsAppCloudApiException(
      'Recipient phone number must contain 7 to 15 digits including country code',
      { code: 'INVALID_RECIPIENT', retryable: false },
    );
  }

  return normalized;
};

const buildTemplateComponents = (
  components: WorkflowWhatsAppTemplateComponent[],
) =>
  components.map((component) => {
    const parameters = component.parameters.map((value) => ({
      type: 'text' as const,
      text: value,
    }));

    if (component.type === 'BUTTON') {
      return {
        type: 'button' as const,
        sub_type: component.subType.toLowerCase(),
        index: String(component.index),
        parameters,
      };
    }

    return {
      type: component.type.toLowerCase() as 'header' | 'body',
      parameters,
    };
  });

@Injectable()
export class WhatsAppCloudApiService {
  constructor(
    private readonly whatsAppConnectionService: WhatsAppConnectionService,
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {}

  async sendMessage({
    input,
    workspaceId,
  }: {
    input: WorkflowSendWhatsAppMessageActionInput;
    workspaceId: string;
  }): Promise<SendWhatsAppMessageResult> {
    const connection =
      await this.whatsAppConnectionService.findActiveByIdOrThrow(
        input.whatsAppConnectionId,
        workspaceId,
      );

    if (connection.status !== 'ACTIVE') {
      throw new WhatsAppCloudApiException(
        'WhatsApp connection must be validated before it can send messages',
        { code: 'CONNECTION_NOT_ACTIVE', retryable: false },
      );
    }

    const recipientPhoneNumber = normalizeRecipientPhoneNumber(
      input.recipientPhoneNumber,
    );
    const accessToken = this.whatsAppConnectionService.decryptAccessToken(
      connection,
      workspaceId,
    );

    const payload =
      input.message.type === 'TEXT'
        ? {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: recipientPhoneNumber,
            type: 'text',
            text: {
              preview_url: input.message.previewUrl,
              body: input.message.body,
            },
          }
        : {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: recipientPhoneNumber,
            type: 'template',
            template: {
              name: input.message.name,
              language: {
                code: input.message.languageCode,
              },
              components: buildTemplateComponents(input.message.components),
            },
          };

    const client = this.secureHttpClientService.getHttpClient(
      {
        timeout: 15_000,
        retries: 0,
      },
      {
        workspaceId,
        source: 'whatsapp',
      },
    );

    try {
      const response = await client.post<MetaMessageResponse>(
        `https://graph.facebook.com/${connection.apiVersion}/${connection.phoneNumberId}/messages`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const message = response.data.messages?.[0];

      if (!message?.id) {
        throw new WhatsAppCloudApiException(
          'Meta accepted the request but did not return a WhatsApp message ID',
          { code: 'MISSING_MESSAGE_ID', retryable: false },
        );
      }

      return {
        success: true,
        messageId: message.id,
        recipientPhoneNumber:
          response.data.contacts?.[0]?.wa_id ?? recipientPhoneNumber,
        messageType: input.message.type,
        connectionId: connection.id,
        providerStatus: message.message_status,
      };
    } catch (error) {
      if (error instanceof WhatsAppCloudApiException) {
        throw error;
      }

      if (isAxiosError<MetaErrorResponse>(error)) {
        const status = error.response?.status;
        const metaError = error.response?.data?.error;
        const code = metaError?.code?.toString();
        const retryable =
          status === 408 ||
          status === 429 ||
          (typeof status === 'number' && status >= 500) ||
          !error.response;

        if (status === 401 || status === 403) {
          await this.whatsAppConnectionService.markAuthFailed(
            connection.id,
            workspaceId,
          );
        }

        throw new WhatsAppCloudApiException(
          metaError?.message ?? 'Meta WhatsApp Cloud API request failed',
          {
            code,
            status,
            retryable,
          },
        );
      }

      throw new WhatsAppCloudApiException(
        error instanceof Error
          ? error.message
          : 'Meta WhatsApp Cloud API request failed',
        { retryable: false },
      );
    }
  }
}
