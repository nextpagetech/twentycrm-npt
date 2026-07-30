import { z } from 'zod';

import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';

const workflowWhatsAppTemplateParametersSchema = z
  .array(z.string())
  .optional()
  .default([]);

const workflowWhatsAppTemplateHeaderComponentSchema = z.object({
  type: z.literal('HEADER'),
  parameters: workflowWhatsAppTemplateParametersSchema,
});

const workflowWhatsAppTemplateBodyComponentSchema = z.object({
  type: z.literal('BODY'),
  parameters: workflowWhatsAppTemplateParametersSchema,
});

const workflowWhatsAppTemplateButtonComponentSchema = z.object({
  type: z.literal('BUTTON'),
  subType: z.enum(['QUICK_REPLY', 'URL']),
  index: z.number().int().nonnegative(),
  parameters: workflowWhatsAppTemplateParametersSchema,
});

export const workflowWhatsAppTemplateComponentSchema = z.discriminatedUnion(
  'type',
  [
    workflowWhatsAppTemplateHeaderComponentSchema,
    workflowWhatsAppTemplateBodyComponentSchema,
    workflowWhatsAppTemplateButtonComponentSchema,
  ],
);

export const workflowWhatsAppTextMessageSchema = z.object({
  type: z.literal('TEXT'),
  body: z.string(),
  previewUrl: z.boolean().optional().default(false),
});

export const workflowWhatsAppTemplateMessageSchema = z.object({
  type: z.literal('TEMPLATE'),
  name: z.string(),
  languageCode: z.string(),
  components: z
    .array(workflowWhatsAppTemplateComponentSchema)
    .optional()
    .default([]),
});

export const workflowWhatsAppMessageSchema = z.discriminatedUnion('type', [
  workflowWhatsAppTextMessageSchema,
  workflowWhatsAppTemplateMessageSchema,
]);

export const workflowSendWhatsAppMessageActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      whatsAppConnectionId: z.string(),
      recipientPhoneNumber: z.string(),
      message: workflowWhatsAppMessageSchema,
    }),
  });

export type WorkflowWhatsAppTemplateComponent = z.infer<
  typeof workflowWhatsAppTemplateComponentSchema
>;

export type WorkflowWhatsAppMessage = z.infer<
  typeof workflowWhatsAppMessageSchema
>;

export type WorkflowSendWhatsAppMessageActionInput = z.infer<
  typeof workflowSendWhatsAppMessageActionSettingsSchema
>['input'];
