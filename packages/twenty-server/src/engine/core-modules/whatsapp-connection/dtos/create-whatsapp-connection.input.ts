import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

@InputType()
export class CreateWhatsAppConnectionInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  name: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  phoneNumberId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  whatsAppBusinessAccountId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @Field()
  @IsString()
  @Matches(/^v\d+\.\d+$/)
  apiVersion: string;
}
