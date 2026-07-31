import { type WorkflowRunStepLog } from 'twenty-shared/workflow';

import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type WorkflowSendWhatsAppMessageActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/whatsapp/types/workflow-send-whatsapp-message-action-input.type';

const extractString = (output: ToolOutput, key: string): string | undefined => {
  if (!output.result || typeof output.result !== 'object') {
    return undefined;
  }

  const value = (output.result as Record<string, unknown>)[key];

  return typeof value === 'string' ? value : undefined;
};

const maskPhoneNumber = (phoneNumber: string): string => {
  const normalized = phoneNumber.replace(/\D/g, '');

  if (normalized.length <= 4) {
    return '*'.repeat(normalized.length);
  }

  return `${'*'.repeat(normalized.length - 4)}${normalized.slice(-4)}`;
};

export const buildWhatsAppStepLog = ({
  input,
  output,
  durationMs,
}: {
  input: WorkflowSendWhatsAppMessageActionInput;
  output: ToolOutput;
  durationMs: number;
}): WorkflowRunStepLog => ({
  details: {
    type: 'WHATSAPP',
    status: output.success ? 'SUCCESS' : 'ERROR',
    connectionId:
      extractString(output, 'connectionId') ?? input.whatsAppConnectionId,
    recipientPhoneNumber: maskPhoneNumber(
      extractString(output, 'recipientPhoneNumber') ??
        input.recipientPhoneNumber,
    ),
    messageType: input.message.type,
    templateName:
      input.message.type === 'TEMPLATE' ? input.message.name : undefined,
    messageId: extractString(output, 'messageId'),
    providerStatus: extractString(output, 'providerStatus'),
    error: output.error,
    durationMs,
  },
  entries: [],
  sizeBytes: 0,
});
