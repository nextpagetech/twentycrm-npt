export const WHATSAPP_CONNECTION_STATUSES = [
  'PENDING',
  'ACTIVE',
  'AUTH_FAILED',
] as const;

export type WhatsAppConnectionStatus =
  (typeof WHATSAPP_CONNECTION_STATUSES)[number];
