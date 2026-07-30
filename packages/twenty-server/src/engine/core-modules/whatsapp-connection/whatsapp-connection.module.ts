import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WhatsAppConnectionEntity } from 'src/engine/core-modules/whatsapp-connection/whatsapp-connection.entity';
import { WhatsAppConnectionResolver } from 'src/engine/core-modules/whatsapp-connection/whatsapp-connection.resolver';
import { WhatsAppConnectionService } from 'src/engine/core-modules/whatsapp-connection/whatsapp-connection.service';
import { WhatsAppConnectionValidationService } from 'src/engine/core-modules/whatsapp-connection/whatsapp-connection-validation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WhatsAppConnectionEntity]),
    SecretEncryptionModule,
    SecureHttpClientModule,
    PermissionsModule,
    TokenModule,
  ],
  providers: [
    WhatsAppConnectionService,
    WhatsAppConnectionValidationService,
    WhatsAppConnectionResolver,
    provideWorkspaceScopedRepository(WhatsAppConnectionEntity),
  ],
  exports: [
    WhatsAppConnectionService,
    WhatsAppConnectionValidationService,
    TypeOrmModule,
  ],
})
export class WhatsAppConnectionModule {}
