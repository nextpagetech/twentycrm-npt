import { defineLogicFunction } from 'twenty-sdk/define';

import { WHATSAPP_WORKFLOW_NODE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { whatsappNodeHandler } from 'src/logic-functions/handlers/whatsapp-node-handler';
import { whatsappNodeInputSchema } from 'src/logic-functions/schemas/whatsapp-node-input.schema';
import { jsonSchemaToInputSchema } from 'src/logic-functions/utils/json-schema-to-input-schema';

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_WORKFLOW_NODE_UNIVERSAL_IDENTIFIER,
  name: 'whatsapp',
  description:
    'Send WhatsApp text or approved template messages, or parse a simple incoming order command.',
  timeoutSeconds: 30,
  workflowActionTriggerSettings: {
    label: 'WhatsApp',
    icon: 'IconBrandWhatsapp',
    inputSchema: jsonSchemaToInputSchema(whatsappNodeInputSchema),
    outputSchema: [
      {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          acceptedByMeta: { type: 'boolean' },
          operation: { type: 'string' },
          messageId: { type: 'string' },
          recipientPhoneNumber: { type: 'string' },
          providerStatus: { type: 'string' },
          templateName: { type: 'string' },
          errorCode: { type: 'string' },
          errorMessage: { type: 'string' },
          httpStatus: { type: 'number' },
          retryable: { type: 'boolean' },
          kind: { type: 'string' },
          command: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                itemId: { type: 'number' },
                quantity: { type: 'number' },
              },
            },
          },
          itemCount: { type: 'number' },
          totalQuantity: { type: 'number' },
        },
      },
    ],
  },
  handler: whatsappNodeHandler,
});
