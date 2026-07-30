import { Field, InputType } from '@nestjs/graphql';
import {
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpdateWhatsAppConnectionInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  phoneNumberId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  whatsAppBusinessAccountId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  accessToken?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^v\d+\.\d+$/)
  apiVersion?: string;
}
