import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';

import { type WorkflowSendWhatsAppMessageAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledMessage = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.5;
  padding: ${themeCssVariables.spacing[2]};
`;

type WorkflowEditActionSendWhatsAppMessageProps = {
  action: WorkflowSendWhatsAppMessageAction;
  actionOptions: {
    readonly?: boolean;
    onActionUpdate?: (action: WorkflowSendWhatsAppMessageAction) => void;
  };
};

export const WorkflowEditActionSendWhatsAppMessage = ({
  action,
  actionOptions,
}: WorkflowEditActionSendWhatsAppMessageProps) => {
  const { t } = useLingui();

  return (
    <>
      <WorkflowStepBody>
        <StyledMessage>
          {t`WhatsApp connection and message configuration will be available after the workspace connection module is enabled.`}
        </StyledMessage>
      </WorkflowStepBody>
      {!actionOptions.readonly && <WorkflowStepFooter stepId={action.id} />}
    </>
  );
};
