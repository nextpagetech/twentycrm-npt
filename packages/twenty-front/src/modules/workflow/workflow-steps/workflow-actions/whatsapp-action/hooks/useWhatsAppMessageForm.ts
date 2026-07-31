import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { type WorkflowSendWhatsAppMessageAction } from '@/workflow/types/Workflow';

export type WhatsAppMessageFormData =
  WorkflowSendWhatsAppMessageAction['settings']['input'];

type UseWhatsAppMessageFormParams = {
  action: WorkflowSendWhatsAppMessageAction;
  onActionUpdate?: (action: WorkflowSendWhatsAppMessageAction) => void;
  readonly: boolean;
};

export const useWhatsAppMessageForm = ({
  action,
  onActionUpdate,
  readonly,
}: UseWhatsAppMessageFormParams) => {
  const [formData, setFormData] = useState<WhatsAppMessageFormData>(() => ({
    ...action.settings.input,
    message:
      action.settings.input.message.type === 'TEXT'
        ? {
            type: 'TEXT',
            body: action.settings.input.message.body ?? '',
            previewUrl: action.settings.input.message.previewUrl ?? false,
          }
        : {
            type: 'TEMPLATE',
            name: action.settings.input.message.name ?? '',
            languageCode: action.settings.input.message.languageCode ?? '',
            components: action.settings.input.message.components ?? [],
          },
  }));

  const saveAction = useDebouncedCallback(
    (nextFormData: WhatsAppMessageFormData) => {
      if (readonly) {
        return;
      }

      onActionUpdate?.({
        ...action,
        settings: {
          ...action.settings,
          input: nextFormData,
        },
      });
    },
    1_000,
  );

  const updateFormData = (
    updater: (current: WhatsAppMessageFormData) => WhatsAppMessageFormData,
  ) => {
    setFormData((current) => {
      const nextFormData = updater(current);

      saveAction(nextFormData);

      return nextFormData;
    });
  };

  return {
    formData,
    updateFormData,
    saveAction,
  };
};
