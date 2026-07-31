import { describe, expect, it } from 'vitest';

import { whatsappNodeHandler } from 'src/logic-functions/handlers/whatsapp-node-handler';

describe('whatsappNodeHandler', () => {
  it('parses supported commands', async () => {
    await expect(
      whatsappNodeHandler({ operation: 'PARSE_ORDER', incomingMessage: 'menu' }),
    ).resolves.toMatchObject({
      success: true,
      kind: 'COMMAND',
      command: 'MENU',
    });
  });

  it('parses item and quantity pairs', async () => {
    await expect(
      whatsappNodeHandler({
        operation: 'PARSE_ORDER',
        incomingMessage: '1x2, 3x1',
      }),
    ).resolves.toMatchObject({
      success: true,
      kind: 'ORDER',
      items: [
        { itemId: 1, quantity: 2 },
        { itemId: 3, quantity: 1 },
      ],
      itemCount: 2,
      totalQuantity: 3,
    });
  });

  it('rejects malformed order entries', async () => {
    await expect(
      whatsappNodeHandler({
        operation: 'PARSE_ORDER',
        incomingMessage: 'one pizza',
      }),
    ).rejects.toThrow('Invalid order item');
  });
});
