import { WorkflowActionType } from 'twenty-shared/workflow';

import {
  type WorkflowAction,
  type WorkflowSendWhatsAppMessageAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const isWorkflowSendWhatsAppMessageAction = (
  action: WorkflowAction,
): action is WorkflowSendWhatsAppMessageAction =>
  action.type === WorkflowActionType.SEND_WHATSAPP_MESSAGE;
