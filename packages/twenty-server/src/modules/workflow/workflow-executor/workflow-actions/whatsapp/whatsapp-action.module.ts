import { Module } from '@nestjs/common';

import { ToolModule } from 'src/engine/core-modules/tool/tool.module';
import { SendWhatsAppMessageWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/whatsapp/send-whatsapp-message.workflow-action';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';

@Module({
  imports: [ToolModule, WorkflowRunModule],
  providers: [SendWhatsAppMessageWorkflowAction],
  exports: [SendWhatsAppMessageWorkflowAction],
})
export class WhatsAppActionModule {}
