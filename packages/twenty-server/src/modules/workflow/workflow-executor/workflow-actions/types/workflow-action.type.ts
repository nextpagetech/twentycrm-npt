import { WorkflowActionType } from 'twenty-shared/workflow';

import { type WorkflowAiAgentActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/types/workflow-ai-agent-action-settings.type';
import { type WorkflowCodeActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/code/types/workflow-code-action-settings.type';
import { type WorkflowCreateCalendarEventActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/create-calendar-event/types/workflow-create-calendar-event-action-settings.type';
import { type WorkflowDelayActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/delay/types/workflow-delay-action-settings.type';
import { type WorkflowFilterActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/types/workflow-filter-action-settings.type';
import { type WorkflowFormActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/form/types/workflow-form-action-settings.type';
import { type WorkflowHttpRequestActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/http-request/types/workflow-http-request-action-settings.type';
import { type WorkflowIfElseActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/if-else/types/workflow-if-else-action-settings.type';
import { type WorkflowIteratorActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/types/workflow-iterator-action-settings.type';
import { type WorkflowLogicFunctionActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/logic-function/types/workflow-logic-function-action-settings.type';
import { type WorkflowSendEmailActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/types/workflow-send-email-action-settings.type';
import {
  type WorkflowCreateRecordActionSettings,
  type WorkflowDeleteRecordActionSettings,
  type WorkflowFindRecordsActionSettings,
  type WorkflowPickRecordActionSettings,
  type WorkflowUpdateRecordActionSettings,
  type WorkflowUpsertRecordActionSettings,
} from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-settings.type';
import { type WorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';
import { type WorkflowSendWhatsAppMessageActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/whatsapp/types/workflow-send-whatsapp-message-action-settings.type';

type BaseWorkflowAction<
  TType extends WorkflowActionType,
  TSettings extends WorkflowActionSettings,
> = {
  id: string;
  name: string;
  type: TType;
  settings: TSettings;
  position?: {
    x: number;
    y: number;
  };
  valid: boolean;
  nextStepIds?: string[];
};

export type WorkflowCodeAction = BaseWorkflowAction<
  WorkflowActionType.CODE,
  WorkflowCodeActionSettings
>;

export type WorkflowLogicFunctionAction = BaseWorkflowAction<
  WorkflowActionType.LOGIC_FUNCTION,
  WorkflowLogicFunctionActionSettings
>;

export type WorkflowSendEmailAction = BaseWorkflowAction<
  WorkflowActionType.SEND_EMAIL,
  WorkflowSendEmailActionSettings
>;

export type WorkflowSendWhatsAppMessageAction = BaseWorkflowAction<
  WorkflowActionType.SEND_WHATSAPP_MESSAGE,
  WorkflowSendWhatsAppMessageActionSettings
>;

export type WorkflowDraftEmailAction = BaseWorkflowAction<
  WorkflowActionType.DRAFT_EMAIL,
  WorkflowSendEmailActionSettings
>;

export type WorkflowCreateCalendarEventAction = BaseWorkflowAction<
  WorkflowActionType.CREATE_CALENDAR_EVENT,
  WorkflowCreateCalendarEventActionSettings
>;

export type WorkflowCreateRecordAction = BaseWorkflowAction<
  WorkflowActionType.CREATE_RECORD,
  WorkflowCreateRecordActionSettings
>;

export type WorkflowUpdateRecordAction = BaseWorkflowAction<
  WorkflowActionType.UPDATE_RECORD,
  WorkflowUpdateRecordActionSettings
>;

export type WorkflowDeleteRecordAction = BaseWorkflowAction<
  WorkflowActionType.DELETE_RECORD,
  WorkflowDeleteRecordActionSettings
>;

export type WorkflowUpsertRecordAction = BaseWorkflowAction<
  WorkflowActionType.UPSERT_RECORD,
  WorkflowUpsertRecordActionSettings
>;

export type WorkflowFindRecordsAction = BaseWorkflowAction<
  WorkflowActionType.FIND_RECORDS,
  WorkflowFindRecordsActionSettings
>;

export type WorkflowPickRecordAction = BaseWorkflowAction<
  WorkflowActionType.PICK_RECORD,
  WorkflowPickRecordActionSettings
>;

export type WorkflowFormAction = BaseWorkflowAction<
  WorkflowActionType.FORM,
  WorkflowFormActionSettings
>;

export type WorkflowFilterAction = BaseWorkflowAction<
  WorkflowActionType.FILTER,
  WorkflowFilterActionSettings
>;

export type WorkflowIfElseAction = BaseWorkflowAction<
  WorkflowActionType.IF_ELSE,
  WorkflowIfElseActionSettings
>;

export type WorkflowHttpRequestAction = BaseWorkflowAction<
  WorkflowActionType.HTTP_REQUEST,
  WorkflowHttpRequestActionSettings
>;

export type WorkflowAiAgentAction = BaseWorkflowAction<
  WorkflowActionType.AI_AGENT,
  WorkflowAiAgentActionSettings
>;

export type WorkflowIteratorAction = BaseWorkflowAction<
  WorkflowActionType.ITERATOR,
  WorkflowIteratorActionSettings
>;

export type WorkflowEmptyAction = BaseWorkflowAction<
  WorkflowActionType.EMPTY,
  WorkflowActionSettings
>;

export type WorkflowDelayAction = BaseWorkflowAction<
  WorkflowActionType.DELAY,
  WorkflowDelayActionSettings
>;

export type WorkflowAction =
  | WorkflowCodeAction
  | WorkflowLogicFunctionAction
  | WorkflowSendEmailAction
  | WorkflowSendWhatsAppMessageAction
  | WorkflowDraftEmailAction
  | WorkflowCreateCalendarEventAction
  | WorkflowCreateRecordAction
  | WorkflowUpdateRecordAction
  | WorkflowDeleteRecordAction
  | WorkflowUpsertRecordAction
  | WorkflowFindRecordsAction
  | WorkflowPickRecordAction
  | WorkflowFormAction
  | WorkflowFilterAction
  | WorkflowIfElseAction
  | WorkflowHttpRequestAction
  | WorkflowAiAgentAction
  | WorkflowIteratorAction
  | WorkflowEmptyAction
  | WorkflowDelayAction;
