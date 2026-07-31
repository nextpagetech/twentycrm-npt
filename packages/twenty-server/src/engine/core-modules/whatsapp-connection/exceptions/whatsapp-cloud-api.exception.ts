export type WhatsAppCloudApiExceptionOptions = {
  code?: string;
  status?: number;
  retryable: boolean;
};

export class WhatsAppCloudApiException extends Error {
  code?: string;
  status?: number;
  retryable: boolean;

  constructor(message: string, options: WhatsAppCloudApiExceptionOptions) {
    super(message);
    this.name = WhatsAppCloudApiException.name;
    this.code = options.code;
    this.status = options.status;
    this.retryable = options.retryable;
  }
}
