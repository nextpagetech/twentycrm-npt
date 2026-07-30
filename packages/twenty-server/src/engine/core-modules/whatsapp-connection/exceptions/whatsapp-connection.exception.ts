import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum WhatsAppConnectionExceptionCode {
  CONNECTION_NOT_FOUND = 'CONNECTION_NOT_FOUND',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  PHONE_NUMBER_NOT_FOUND = 'PHONE_NUMBER_NOT_FOUND',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
}

const getUserFriendlyMessage = (
  code: WhatsAppConnectionExceptionCode,
): MessageDescriptor => {
  switch (code) {
    case WhatsAppConnectionExceptionCode.CONNECTION_NOT_FOUND:
      return msg`WhatsApp connection not found.`;
    case WhatsAppConnectionExceptionCode.AUTHENTICATION_FAILED:
      return msg`Meta rejected the WhatsApp access token. Replace the token and try again.`;
    case WhatsAppConnectionExceptionCode.PHONE_NUMBER_NOT_FOUND:
      return msg`The Phone Number ID does not belong to the configured WhatsApp Business Account.`;
    case WhatsAppConnectionExceptionCode.VALIDATION_FAILED:
      return msg`The WhatsApp connection could not be validated. Check the connection details and try again.`;
    default:
      assertUnreachable(code);
  }
};

export class WhatsAppConnectionException extends CustomException<WhatsAppConnectionExceptionCode> {
  constructor(
    message: string,
    code: WhatsAppConnectionExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage: userFriendlyMessage ?? getUserFriendlyMessage(code),
    });
  }
}
