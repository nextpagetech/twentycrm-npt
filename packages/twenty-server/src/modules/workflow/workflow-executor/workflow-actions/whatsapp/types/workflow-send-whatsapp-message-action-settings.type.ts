import { type WorkflowSendWhatsAppMessageActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/whatsapp/types/workflow-send-whatsapp-message-action-input.type';
import { type BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';

export type WorkflowSendWhatsAppMessageActionSettings =
  BaseWorkflowActionSettings & {
    input: WorkflowSendWhatsAppMessageActionInput;
  };
