import { FormBooleanFieldInput } from '@/object-record/record-field/ui/form-types/components/FormBooleanFieldInput';
import { FormMultiTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormMultiTextFieldInput';
import { FormSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormSelectFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { GetWhatsAppConnectionsDocument } from '@/settings/workspace/graphql/whatsappConnectionOperations';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { type WorkflowSendWhatsAppMessageAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { useWhatsAppMessageForm } from '@/workflow/workflow-steps/workflow-actions/whatsapp-action/hooks/useWhatsAppMessageForm';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useEffect } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Callout } from 'twenty-ui/feedback';
import { IconPlus } from 'twenty-ui/icon';
import { type SelectOption } from 'twenty-ui/input';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

type WhatsAppConnectionOption = {
  id: string;
  name: string;
  displayPhoneNumber: string | null;
  phoneNumberId: string;
  status: 'PENDING' | 'ACTIVE' | 'AUTH_FAILED';
};

type WorkflowEditActionSendWhatsAppMessageProps = {
  action: WorkflowSendWhatsAppMessageAction;
  actionOptions:
    | {
        readonly: true;
        onActionUpdate?: undefined;
      }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowSendWhatsAppMessageAction) => void;
      };
};

const parseParameters = (value: string): string[] =>
  value
    .split(',')
    .map((parameter) => parameter.trim())
    .filter((parameter) => parameter.length > 0);

const serializeParameters = (parameters: string[] | undefined): string =>
  parameters?.join(', ') ?? '';

export const WorkflowEditActionSendWhatsAppMessage = ({
  action,
  actionOptions,
}: WorkflowEditActionSendWhatsAppMessageProps) => {
  const { formData, updateFormData, saveAction } = useWhatsAppMessageForm({
    action,
    onActionUpdate:
      actionOptions.readonly === true
        ? undefined
        : actionOptions.onActionUpdate,
    readonly: actionOptions.readonly === true,
  });

  const { data, loading } = useQuery<{
    whatsAppConnections: WhatsAppConnectionOption[];
  }>(GetWhatsAppConnectionsDocument);

  const connections = data?.whatsAppConnections ?? [];
  const selectedConnection = connections.find(
    (connection) => connection.id === formData.whatsAppConnectionId,
  );

  const connectionOptions: SelectOption<string>[] = connections.map(
    (connection) => ({
      label: `${connection.name} — ${
        connection.displayPhoneNumber ?? connection.phoneNumberId
      }${connection.status === 'ACTIVE' ? '' : ` (${connection.status})`}`,
      value: connection.id,
    }),
  );

  const navigateSettings = useNavigateSettings();
  const { closeSidePanelMenu } = useSidePanelMenu();

  useEffect(() => {
    return () => {
      saveAction.flush();
    };
  }, [saveAction]);

  const setConnectionId = (whatsAppConnectionId: string | null) => {
    updateFormData((current) => ({
      ...current,
      whatsAppConnectionId: whatsAppConnectionId ?? '',
    }));
  };

  const setMessageType = (messageType: string | null) => {
    updateFormData((current) => ({
      ...current,
      message:
        messageType === 'TEMPLATE'
          ? {
              type: 'TEMPLATE',
              name: '',
              languageCode: 'en_US',
              components: [],
            }
          : {
              type: 'TEXT',
              body: '',
              previewUrl: false,
            },
    }));
  };

  const updateTemplateParameters = (
    componentType: 'HEADER' | 'BODY',
    parameterText: string,
  ) => {
    updateFormData((current) => {
      if (current.message.type !== 'TEMPLATE') {
        return current;
      }

      const components = current.message.components.filter(
        (component) => component.type !== componentType,
      );
      const parameters = parseParameters(parameterText);

      if (parameters.length > 0) {
        components.push({ type: componentType, parameters });
      }

      return {
        ...current,
        message: {
          ...current.message,
          components,
        },
      };
    });
  };

  const updateButtonParameters = (parameterText: string) => {
    updateFormData((current) => {
      if (current.message.type !== 'TEMPLATE') {
        return current;
      }

      const existingButton = current.message.components.find(
        (component) => component.type === 'BUTTON',
      );
      const components = current.message.components.filter(
        (component) => component.type !== 'BUTTON',
      );
      const parameters = parseParameters(parameterText);

      if (parameters.length > 0) {
        components.push({
          type: 'BUTTON',
          subType:
            existingButton?.type === 'BUTTON'
              ? existingButton.subType
              : 'QUICK_REPLY',
          index:
            existingButton?.type === 'BUTTON' ? existingButton.index : 0,
          parameters,
        });
      }

      return {
        ...current,
        message: {
          ...current.message,
          components,
        },
      };
    });
  };

  const templateMessage =
    formData.message.type === 'TEMPLATE' ? formData.message : null;
  const headerParameters = templateMessage?.components.find(
    (component) => component.type === 'HEADER',
  )?.parameters;
  const bodyParameters = templateMessage?.components.find(
    (component) => component.type === 'BODY',
  )?.parameters;
  const buttonComponent = templateMessage?.components.find(
    (component) => component.type === 'BUTTON',
  );

  return (
    !loading && (
      <>
        <WorkflowStepBody>
          {connections.length === 0 && (
            <Callout
              variant="error"
              title={t`No WhatsApp connection is available`}
              description={t`Add and validate a Meta WhatsApp Cloud API connection in workspace settings before using this action.`}
              action={{
                label: t`Add connection`,
                onClick: () => {
                  closeSidePanelMenu();
                  navigateSettings(
                    SettingsPath.WorkspaceCommunications,
                    undefined,
                    undefined,
                    undefined,
                    'whatsapp',
                  );
                },
              }}
            />
          )}

          <FormSelectFieldInput
            key={`whatsapp-connection-${formData.whatsAppConnectionId || 'none'}`}
            label={t`WhatsApp connection`}
            hint={t`Choose the workspace Meta WhatsApp Cloud API connection used to send this message`}
            defaultValue={formData.whatsAppConnectionId}
            options={connectionOptions}
            onChange={setConnectionId}
            readonly={actionOptions.readonly}
            callToActionButton={{
              Icon: IconPlus,
              text: t`Add connection`,
              onClick: () => {
                closeSidePanelMenu();
                navigateSettings(
                  SettingsPath.WorkspaceCommunications,
                  undefined,
                  undefined,
                  undefined,
                  'whatsapp',
                );
              },
            }}
          />

          {isDefined(selectedConnection) &&
            selectedConnection.status !== 'ACTIVE' && (
              <Callout
                variant="error"
                title={t`This WhatsApp connection is not active`}
                description={t`Open workspace settings and test the connection before publishing this workflow.`}
              />
            )}

          <FormTextFieldInput
            label={t`Recipient phone number`}
            hint={t`Use international format with country code, for example 919876543210`}
            placeholder={t`Enter a phone number`}
            defaultValue={formData.recipientPhoneNumber}
            onChange={(recipientPhoneNumber) => {
              updateFormData((current) => ({
                ...current,
                recipientPhoneNumber,
              }));
            }}
            VariablePicker={WorkflowVariablePicker}
            readonly={actionOptions.readonly}
          />

          <FormSelectFieldInput
            label={t`Message type`}
            defaultValue={formData.message.type}
            options={[
              { label: t`Text`, value: 'TEXT' },
              { label: t`Approved template`, value: 'TEMPLATE' },
            ]}
            onChange={setMessageType}
            readonly={actionOptions.readonly}
          />

          {formData.message.type === 'TEXT' ? (
            <>
              <FormTextFieldInput
                label={t`Message`}
                placeholder={t`Enter the WhatsApp message`}
                defaultValue={formData.message.body}
                multiline
                onChange={(body) => {
                  updateFormData((current) => ({
                    ...current,
                    message: {
                      type: 'TEXT',
                      body,
                      previewUrl:
                        current.message.type === 'TEXT'
                          ? current.message.previewUrl
                          : false,
                    },
                  }));
                }}
                VariablePicker={WorkflowVariablePicker}
                readonly={actionOptions.readonly}
              />
              <FormBooleanFieldInput
                label={t`Preview links`}
                defaultValue={formData.message.previewUrl}
                onChange={(previewUrl) => {
                  updateFormData((current) => ({
                    ...current,
                    message: {
                      type: 'TEXT',
                      body:
                        current.message.type === 'TEXT'
                          ? current.message.body
                          : '',
                      previewUrl:
                        typeof previewUrl === 'boolean' ? previewUrl : false,
                    },
                  }));
                }}
                readonly={actionOptions.readonly}
              />
            </>
          ) : (
            <>
              <FormTextFieldInput
                label={t`Template name`}
                hint={t`Use the exact approved template name from Meta`}
                placeholder={t`E.g. order_update`}
                defaultValue={formData.message.name}
                onChange={(name) => {
                  updateFormData((current) =>
                    current.message.type === 'TEMPLATE'
                      ? {
                          ...current,
                          message: { ...current.message, name },
                        }
                      : current,
                  );
                }}
                VariablePicker={WorkflowVariablePicker}
                readonly={actionOptions.readonly}
              />
              <FormTextFieldInput
                label={t`Template language`}
                placeholder={t`E.g. en_US`}
                defaultValue={formData.message.languageCode}
                onChange={(languageCode) => {
                  updateFormData((current) =>
                    current.message.type === 'TEMPLATE'
                      ? {
                          ...current,
                          message: { ...current.message, languageCode },
                        }
                      : current,
                  );
                }}
                VariablePicker={WorkflowVariablePicker}
                readonly={actionOptions.readonly}
              />
              <FormMultiTextFieldInput
                label={t`Header parameters`}
                placeholder={t`Enter header values in template order`}
                defaultValue={serializeParameters(headerParameters)}
                onChange={(value) => updateTemplateParameters('HEADER', value)}
                VariablePicker={WorkflowVariablePicker}
                readonly={actionOptions.readonly}
              />
              <FormMultiTextFieldInput
                label={t`Body parameters`}
                placeholder={t`Enter body values in template order`}
                defaultValue={serializeParameters(bodyParameters)}
                onChange={(value) => updateTemplateParameters('BODY', value)}
                VariablePicker={WorkflowVariablePicker}
                readonly={actionOptions.readonly}
              />
              <FormSelectFieldInput
                label={t`Button type`}
                defaultValue={
                  buttonComponent?.type === 'BUTTON'
                    ? buttonComponent.subType
                    : 'QUICK_REPLY'
                }
                options={[
                  { label: t`Quick reply`, value: 'QUICK_REPLY' },
                  { label: t`URL`, value: 'URL' },
                ]}
                onChange={(subType) => {
                  updateFormData((current) => {
                    if (current.message.type !== 'TEMPLATE') {
                      return current;
                    }

                    const currentButton = current.message.components.find(
                      (component) => component.type === 'BUTTON',
                    );
                    const components = current.message.components.filter(
                      (component) => component.type !== 'BUTTON',
                    );

                    if (
                      currentButton?.type === 'BUTTON' &&
                      currentButton.parameters.length > 0
                    ) {
                      components.push({
                        ...currentButton,
                        subType: subType === 'URL' ? 'URL' : 'QUICK_REPLY',
                      });
                    }

                    return {
                      ...current,
                      message: { ...current.message, components },
                    };
                  });
                }}
                readonly={actionOptions.readonly}
              />
              <FormTextFieldInput
                label={t`Button index`}
                hint={t`Zero-based button position in the approved template`}
                defaultValue={
                  buttonComponent?.type === 'BUTTON'
                    ? String(buttonComponent.index)
                    : '0'
                }
                onChange={(value) => {
                  updateFormData((current) => {
                    if (current.message.type !== 'TEMPLATE') {
                      return current;
                    }

                    const currentButton = current.message.components.find(
                      (component) => component.type === 'BUTTON',
                    );

                    if (currentButton?.type !== 'BUTTON') {
                      return current;
                    }

                    const index = Number.parseInt(value, 10);
                    const components = current.message.components.map(
                      (component) =>
                        component.type === 'BUTTON'
                          ? {
                              ...component,
                              index: Number.isNaN(index) ? 0 : Math.max(0, index),
                            }
                          : component,
                    );

                    return {
                      ...current,
                      message: { ...current.message, components },
                    };
                  });
                }}
                readonly={actionOptions.readonly}
              />
              <FormMultiTextFieldInput
                label={t`Button parameters`}
                placeholder={t`Enter button values in template order`}
                defaultValue={
                  buttonComponent?.type === 'BUTTON'
                    ? serializeParameters(buttonComponent.parameters)
                    : ''
                }
                onChange={updateButtonParameters}
                VariablePicker={WorkflowVariablePicker}
                readonly={actionOptions.readonly}
              />
            </>
          )}
        </WorkflowStepBody>
        {!actionOptions.readonly && <WorkflowStepFooter stepId={action.id} />}
      </>
    )
  );
};
