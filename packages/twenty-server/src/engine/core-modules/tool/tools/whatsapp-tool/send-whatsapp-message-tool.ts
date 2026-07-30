import { Injectable, Logger } from '@nestjs/common';

import {
  type WorkflowSendWhatsAppMessageActionInput,
  workflowSendWhatsAppMessageActionSettingsSchema,
} from 'twenty-shared/workflow';

import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
import { WhatsAppCloudApiException } from 'src/engine/core-modules/whatsapp-connection/exceptions/whatsapp-cloud-api.exception';
import { WhatsAppCloudApiService } from 'src/engine/core-modules/whatsapp-connection/whatsapp-cloud-api.service';

@Injectable()
export class SendWhatsAppMessageTool implements Tool {
  private readonly logger = new Logger(SendWhatsAppMessageTool.name);

  description =
    'Send a text or approved template message through a workspace Meta WhatsApp Cloud API connection.';
  inputSchema = workflowSendWhatsAppMessageActionSettingsSchema.shape.input;

  constructor(
    private readonly whatsAppCloudApiService: WhatsAppCloudApiService,
  ) {}

  async execute(
    parameters: WorkflowSendWhatsAppMessageActionInput,
    context: ToolExecutionContext,
  ): Promise<ToolOutput> {
    try {
      const result = await this.whatsAppCloudApiService.sendMessage({
        input: parameters,
        workspaceId: context.workspaceId,
      });

      return {
        success: true,
        message: 'WhatsApp message accepted by Meta',
        result,
      };
    } catch (error) {
      if (error instanceof WhatsAppCloudApiException) {
        return {
          success: false,
          message: 'Failed to send WhatsApp message',
          error: error.message,
          status: error.status,
          result: {
            success: false,
            errorCode: error.code,
            errorMessage: error.message,
            retryable: error.retryable,
          },
        };
      }

      this.logger.error(
        `Failed to send WhatsApp message: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return {
        success: false,
        message: 'Failed to send WhatsApp message',
        error:
          error instanceof Error
            ? error.message
            : 'Failed to send WhatsApp message',
        result: {
          success: false,
          errorMessage:
            error instanceof Error
              ? error.message
              : 'Failed to send WhatsApp message',
          retryable: false,
        },
      };
    }
  }
}
