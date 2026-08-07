# Twenty WhatsApp Workflow App

An open-source WhatsApp Cloud API integration for [Twenty CRM](https://github.com/twentyhq/twenty), maintained by [NextPageTech](https://github.com/nextpagetech).

It adds a native **WhatsApp** workflow action to Twenty for sending text messages, sending Meta-approved template messages, and parsing simple incoming order commands.

## Features

- Send free-form text messages through the Meta WhatsApp Cloud API.
- Send approved WhatsApp templates with header, body, and button parameters.
- Use static values or dynamic Twenty workflow fields.
- Accept phone fields as strings, numbers, or Twenty phone objects.
- Normalize and validate international phone numbers.
- Return the Meta message ID and acceptance status.
- Optionally return structured errors without stopping the workflow.
- Parse the commands `MENU`, `HELP`, `TRACK`, `CONFIRM`, and `CANCEL`.
- Parse simple order input such as `101x2, 205x1`.

## Requirements

- A compatible Twenty CRM server with application and logic-function support.
- Node.js 24 or later.
- Yarn 4.
- A Meta developer account and WhatsApp Business application.
- A WhatsApp Cloud API access token.
- A WhatsApp phone number ID.
- Approved Meta templates when using `SEND_TEMPLATE`.

## Configuration

Install the app and configure these application variables in Twenty:

| Variable | Required | Secret | Description |
| --- | --- | --- | --- |
| `WHATSAPP_ACCESS_TOKEN` | Yes | Yes | Meta WhatsApp Cloud API access token. |
| `WHATSAPP_PHONE_NUMBER_ID` | Yes | No | Meta phone number ID used to send messages. |
| `WHATSAPP_API_VERSION` | No | No | Meta Graph API version. Defaults to `v23.0`. |

Never commit real tokens, credentials, customer phone numbers, or production configuration to this repository.

## Local development

From this directory:

```bash
corepack enable
yarn install --immutable
yarn lint
yarn typecheck
yarn test:unit
```

Connect the CLI to a Twenty development server:

```bash
yarn twenty remote add --api-url https://your-twenty-server.example.com --as development
yarn twenty dev
```

For a one-time build and sync:

```bash
yarn twenty dev --once
```

See the official [Twenty app quick-start documentation](https://docs.twenty.com/developers/extend/apps/getting-started/quick-start) for server setup and CLI authorization.

## Using the workflow action

After installing and configuring the app:

1. Open a workflow in Twenty.
2. Add an action.
3. Select **WhatsApp**.
4. Choose an operation.
5. Map the recipient and message/template fields.
6. Test the workflow with a WhatsApp test recipient.
7. Activate the workflow after confirming the Meta response.

### `SEND_TEXT`

Required inputs:

- Recipient phone number, including country code.
- Message body.

Optional inputs:

- Link preview.
- Continue on error.

Free-form messages remain subject to Meta's WhatsApp messaging-window and policy rules.

### `SEND_TEMPLATE`

Required inputs:

- Recipient phone number, including country code.
- Approved Meta template name.

Optional inputs include language code, header parameters, body parameters, and URL or quick-reply button parameters. Parameter order must match the approved Meta template.

### `PARSE_ORDER`

Accepts either a supported command or comma-separated order items such as:

```text
101x2, 205x1
```

This parser only converts the input into structured workflow output. It does not create CRM records or orders by itself.

## Outputs and delivery status

For send operations, the action can return:

- Success and Meta acceptance flags.
- Meta message ID.
- Normalized recipient phone number.
- Provider status.
- Template name.
- Structured error code, message, HTTP status, and retryability.

A successful API response means Meta accepted the request. It does not guarantee final delivery. Delivery confirmation requires WhatsApp webhook handling, which is outside the current app scope.

## Security notes

- Store the access token only in Twenty's secret application variable.
- Use a dedicated Meta system-user token with the minimum required permissions.
- Rotate exposed or expired tokens immediately.
- Do not print authorization headers or tokens in workflow logs.
- Validate your Meta webhook separately before processing inbound messages.

## Current limitations

- Uses the Meta WhatsApp Cloud API only.
- Does not currently process delivery-status webhooks.
- Does not provide an inbound webhook endpoint.
- Does not upload or send media.
- The order parser supports only the documented simple command format.

## License and attribution

The WhatsApp app package declares the MIT license in its `package.json`. The surrounding Twenty CRM repository retains Twenty's original licensing terms, including AGPL-3.0 coverage and separately marked enterprise files. Refer to the repository's root `LICENSE` before redistributing the complete CRM.

Twenty CRM is developed by [Twenty](https://github.com/twentyhq/twenty). This integration is maintained independently by NextPageTech and is not presented as an official Twenty or Meta product.
