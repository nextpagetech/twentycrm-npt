import { Field, ObjectType } from '@nestjs/graphql';
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { type WhatsAppConnectionStatus } from 'src/engine/core-modules/whatsapp-connection/types/whatsapp-connection-status.type';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

@Entity({ name: 'whatsAppConnection', schema: 'core' })
@ObjectType('WhatsAppConnection')
@Index('IDX_WHATSAPP_CONNECTION_WORKSPACE_ID', ['workspaceId'])
@Index(
  'IDX_WHATSAPP_CONNECTION_WORKSPACE_PHONE_NUMBER_ID',
  ['workspaceId', 'phoneNumberId'],
  { unique: true },
)
@Check(
  'CHK_whatsAppConnection_accessToken_encrypted',
  `"accessToken" LIKE 'enc:v2:%'`,
)
export class WhatsAppConnectionEntity extends WorkspaceRelatedEntity {
  @Field(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Field()
  @Column({ type: 'varchar', nullable: false })
  phoneNumberId: string;

  @Field()
  @Column({ type: 'varchar', nullable: false })
  whatsAppBusinessAccountId: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', nullable: true })
  displayPhoneNumber: string | null;

  @Column({ type: 'varchar', nullable: false })
  accessToken: EncryptedString;

  @Field()
  @Column({ type: 'varchar', nullable: false })
  apiVersion: string;

  @Field()
  @Column({ type: 'varchar', nullable: false, default: 'PENDING' })
  status: WhatsAppConnectionStatus;

  @Field(() => Date, { nullable: true })
  @Column({ type: 'timestamptz', nullable: true })
  lastValidatedAt: Date | null;

  @Field(() => Date, { nullable: true })
  @Column({ type: 'timestamptz', nullable: true })
  authFailedAt: Date | null;

  @Field(() => Date, { nullable: true })
  @Column({ type: 'timestamptz', nullable: true })
  archivedAt: Date | null;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
