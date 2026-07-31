import { z } from 'zod';

import { baseWorkflowActionSchema } from './base-workflow-action-schema';
import { workflowSendWhatsAppMessageActionSettingsSchema } from './send-whatsapp-message-action-settings-schema';

export const workflowSendWhatsAppMessageActionSchema =
  baseWorkflowActionSchema.extend({
    type: z.literal('SEND_WHATSAPP_MESSAGE'),
    settings: workflowSendWhatsAppMessageActionSettingsSchema,
  });
