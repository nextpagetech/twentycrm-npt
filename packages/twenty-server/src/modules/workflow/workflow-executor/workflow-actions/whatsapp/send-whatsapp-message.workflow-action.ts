import { Injectable } from '@nestjs/common';

import { type WorkflowRunStepLog } from 'twenty-shared/workflow';

import { SendWhatsAppMessageTool } from 'src/engine/core-modules/tool/tools/whatsapp-tool/send-whatsapp-message-tool';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { ToolBackedWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/tool-backed/tool-backed.workflow-action';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { isWorkflowSendWhatsAppMessageAction } from 'src/modules/workflow/workflow-executor/workflow-actions/whatsapp/guards/is-workflow-send-whatsapp-message-action.guard';
import { type WorkflowSendWhatsAppMessageActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/whatsapp/types/workflow-send-whatsapp-message-action-input.type';
import { buildWhatsAppStepLog } from 'src/modules/workflow/workflow-executor/workflow-actions/whatsapp/utils/build-whatsapp-step-log.util';
import { WorkflowRunStepLogWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run-step-log.workspace-service';

@Injectable()
export class SendWhatsAppMessageWorkflowAction extends ToolBackedWorkflowAction<WorkflowSendWhatsAppMessageActionInput> {
  constructor(
    private readonly sendWhatsAppMessageTool: SendWhatsAppMessageTool,
    workflowRunStepLogService: WorkflowRunStepLogWorkspaceService,
  ) {
    super(SendWhatsAppMessageWorkflowAction.name, workflowRunStepLogService);
  }

  protected getTool(): Tool {
    return this.sendWhatsAppMessageTool;
  }

  protected assertStep(step: WorkflowAction): void {
    if (!isWorkflowSendWhatsAppMessageAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not a send-WhatsApp-message action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }
  }

  protected buildStepLog({
    input,
    output,
    durationMs,
  }: {
    input: WorkflowSendWhatsAppMessageActionInput;
    output: ToolOutput;
    durationMs: number;
  }): WorkflowRunStepLog {
    return buildWhatsAppStepLog({ input, output, durationMs });
  }
}
