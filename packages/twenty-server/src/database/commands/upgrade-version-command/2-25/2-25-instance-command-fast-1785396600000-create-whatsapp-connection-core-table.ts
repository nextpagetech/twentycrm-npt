import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.25.0', 1785396600000)
export class CreateWhatsAppConnectionCoreTableFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "core"."whatsAppConnection" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "workspaceId" uuid NOT NULL,
        "name" character varying NOT NULL,
        "phoneNumberId" character varying NOT NULL,
        "whatsAppBusinessAccountId" character varying NOT NULL,
        "displayPhoneNumber" character varying,
        "accessToken" character varying NOT NULL,
        "apiVersion" character varying NOT NULL,
        "status" character varying NOT NULL DEFAULT 'PENDING',
        "lastValidatedAt" TIMESTAMP WITH TIME ZONE,
        "authFailedAt" TIMESTAMP WITH TIME ZONE,
        "archivedAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_f8cddcc9e83bf9a9523ffe5f014" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_whatsAppConnection_accessToken_encrypted"
          CHECK ("accessToken" LIKE 'enc:v2:%'),
        CONSTRAINT "FK_0a2f3a6fbacc7f120b0b9b2335e"
          FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE
      )`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_WHATSAPP_CONNECTION_WORKSPACE_ID"
        ON "core"."whatsAppConnection" ("workspaceId")`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_WHATSAPP_CONNECTION_WORKSPACE_PHONE_NUMBER_ID"
        ON "core"."whatsAppConnection" ("workspaceId", "phoneNumberId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE IF EXISTS "core"."whatsAppConnection"`,
    );
  }
}
