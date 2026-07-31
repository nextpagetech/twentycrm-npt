import { Injectable } from '@nestjs/common';

import { WorkflowActionType } from 'twenty-shared/workflow';
import { v4 } from 'uuid';

import { WorkflowVersionStepOperationsWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-operations.workspace-service';

type StepCreationArguments = Parameters<
  WorkflowVersionStepOperationsWorkspaceService['runStepCreationSideEffectsAndBuildStep']
>[0];

type StepCreationResult = Awaited<
  ReturnType<
    WorkflowVersionStepOperationsWorkspaceService['runStepCreationSideEffectsAndBuildStep']
  >
>;

@Injectable()
export class WhatsAppWorkflowVersionStepOperationsWorkspaceService extends WorkflowVersionStepOperationsWorkspaceService {
  override async runStepCreationSideEffectsAndBuildStep(
    args: StepCreationArguments,
  ): Promise<StepCreationResult> {
    if (args.type !== WorkflowActionType.SEND_WHATSAPP_MESSAGE) {
      return super.runStepCreationSideEffectsAndBuildStep(args);
    }

    return {
      builtStep: {
        id: args.id ?? v4(),
        position: args.position,
        valid: false,
        nextStepIds: [],
        name: 'Send WhatsApp Message',
        type: WorkflowActionType.SEND_WHATSAPP_MESSAGE,
        settings: {
          outputSchema: {},
          errorHandlingOptions: {
            continueOnFailure: { value: false },
            retryOnFailure: { value: false },
          },
          input: {
            whatsAppConnectionId: '',
            recipientPhoneNumber: '',
            message: {
              type: 'TEXT',
              body: '',
              previewUrl: false,
            },
          },
        },
      },
    };
  }
}
