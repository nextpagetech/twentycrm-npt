import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WhatsAppConnectionEntity } from 'src/engine/core-modules/whatsapp-connection/whatsapp-connection.entity';
import { WhatsAppConnectionService } from 'src/engine/core-modules/whatsapp-connection/whatsapp-connection.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WhatsAppConnectionEntity]),
    SecretEncryptionModule,
  ],
  providers: [
    WhatsAppConnectionService,
    provideWorkspaceScopedRepository(WhatsAppConnectionEntity),
  ],
  exports: [WhatsAppConnectionService, TypeOrmModule],
})
export class WhatsAppConnectionModule {}
