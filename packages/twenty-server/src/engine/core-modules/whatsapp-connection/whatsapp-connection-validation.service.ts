import { Injectable } from '@nestjs/common';

import { isAxiosError } from 'axios';

import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import {
  WhatsAppConnectionException,
  WhatsAppConnectionExceptionCode,
} from 'src/engine/core-modules/whatsapp-connection/exceptions/whatsapp-connection.exception';
import { WhatsAppConnectionEntity } from 'src/engine/core-modules/whatsapp-connection/whatsapp-connection.entity';
import { WhatsAppConnectionService } from 'src/engine/core-modules/whatsapp-connection/whatsapp-connection.service';

type MetaPhoneNumber = {
  id: string;
  display_phone_number?: string;
  verified_name?: string;
};

type MetaPhoneNumbersResponse = {
  data?: MetaPhoneNumber[];
};

@Injectable()
export class WhatsAppConnectionValidationService {
  constructor(
    private readonly whatsAppConnectionService: WhatsAppConnectionService,
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {}

  async validate({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<WhatsAppConnectionEntity> {
    const connection =
      await this.whatsAppConnectionService.findActiveByIdOrThrow(
        id,
        workspaceId,
      );
    const accessToken = this.whatsAppConnectionService.decryptAccessToken(
      connection,
      workspaceId,
    );

    const client = this.secureHttpClientService.getHttpClient(
      {
        timeout: 10_000,
        retries: 1,
      },
      {
        workspaceId,
        source: 'whatsapp',
      },
    );

    try {
      const response = await client.get<MetaPhoneNumbersResponse>(
        `https://graph.facebook.com/${connection.apiVersion}/${connection.whatsAppBusinessAccountId}/phone_numbers`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            fields: 'id,display_phone_number,verified_name',
          },
        },
      );

      const phoneNumber = response.data.data?.find(
        (item) => item.id === connection.phoneNumberId,
      );

      if (!phoneNumber) {
        throw new WhatsAppConnectionException(
          'Configured Phone Number ID was not returned by Meta for this WhatsApp Business Account',
          WhatsAppConnectionExceptionCode.PHONE_NUMBER_NOT_FOUND,
        );
      }

      await this.whatsAppConnectionService.markValidated({
        id,
        workspaceId,
        displayPhoneNumber: phoneNumber.display_phone_number ?? null,
      });

      return this.whatsAppConnectionService.findActiveByIdOrThrow(
        id,
        workspaceId,
      );
    } catch (error) {
      if (error instanceof WhatsAppConnectionException) {
        throw error;
      }

      if (isAxiosError(error)) {
        const status = error.response?.status;

        if (status === 401 || status === 403) {
          await this.whatsAppConnectionService.markAuthFailed(id, workspaceId);

          throw new WhatsAppConnectionException(
            'Meta rejected the WhatsApp access token',
            WhatsAppConnectionExceptionCode.AUTHENTICATION_FAILED,
          );
        }
      }

      throw new WhatsAppConnectionException(
        'Failed to validate WhatsApp connection with Meta',
        WhatsAppConnectionExceptionCode.VALIDATION_FAILED,
      );
    }
  }
}
