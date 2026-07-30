import { Injectable } from '@nestjs/common';

import { IsNull } from 'typeorm';

import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WhatsAppConnectionEntity } from 'src/engine/core-modules/whatsapp-connection/whatsapp-connection.entity';

export type CreateWhatsAppConnectionInput = {
  workspaceId: string;
  name: string;
  phoneNumberId: string;
  whatsAppBusinessAccountId: string;
  accessToken: string;
  apiVersion: string;
};

export type UpdateWhatsAppConnectionInput = {
  name?: string;
  phoneNumberId?: string;
  whatsAppBusinessAccountId?: string;
  accessToken?: string;
  apiVersion?: string;
};

@Injectable()
export class WhatsAppConnectionService {
  constructor(
    @InjectWorkspaceScopedRepository(WhatsAppConnectionEntity)
    private readonly whatsAppConnectionRepository: WorkspaceScopedRepository<WhatsAppConnectionEntity>,
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  async create(
    input: CreateWhatsAppConnectionInput,
  ): Promise<WhatsAppConnectionEntity> {
    const accessToken = this.secretEncryptionService.encryptVersioned(
      input.accessToken as PlaintextString,
      { workspaceId: input.workspaceId },
    );

    return this.whatsAppConnectionRepository.save(input.workspaceId, {
      name: input.name,
      phoneNumberId: input.phoneNumberId,
      whatsAppBusinessAccountId: input.whatsAppBusinessAccountId,
      accessToken,
      apiVersion: input.apiVersion,
      status: 'PENDING',
      displayPhoneNumber: null,
      lastValidatedAt: null,
      authFailedAt: null,
      archivedAt: null,
    });
  }

  async findActiveByWorkspaceId(
    workspaceId: string,
  ): Promise<WhatsAppConnectionEntity[]> {
    return this.whatsAppConnectionRepository.find(workspaceId, {
      where: { archivedAt: IsNull() },
      order: { createdAt: 'ASC' },
    });
  }

  async findById(
    id: string,
    workspaceId: string,
  ): Promise<WhatsAppConnectionEntity | null> {
    return this.whatsAppConnectionRepository.findOne(workspaceId, {
      where: { id },
    });
  }

  async findActiveByIdOrThrow(
    id: string,
    workspaceId: string,
  ): Promise<WhatsAppConnectionEntity> {
    const connection = await this.findById(id, workspaceId);

    if (!connection || connection.archivedAt) {
      throw new Error('WhatsApp connection not found');
    }

    return connection;
  }

  async update(
    id: string,
    workspaceId: string,
    input: UpdateWhatsAppConnectionInput,
  ): Promise<WhatsAppConnectionEntity | null> {
    const existingConnection = await this.findById(id, workspaceId);

    if (!existingConnection || existingConnection.archivedAt) {
      return null;
    }

    const accessToken = input.accessToken
      ? this.secretEncryptionService.encryptVersioned(
          input.accessToken as PlaintextString,
          { workspaceId },
        )
      : undefined;

    await this.whatsAppConnectionRepository.update(
      workspaceId,
      { id },
      {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.phoneNumberId !== undefined
          ? { phoneNumberId: input.phoneNumberId }
          : {}),
        ...(input.whatsAppBusinessAccountId !== undefined
          ? { whatsAppBusinessAccountId: input.whatsAppBusinessAccountId }
          : {}),
        ...(input.apiVersion !== undefined
          ? { apiVersion: input.apiVersion }
          : {}),
        ...(accessToken !== undefined ? { accessToken } : {}),
        status: 'PENDING',
        authFailedAt: null,
      },
    );

    return this.findById(id, workspaceId);
  }

  async archive(
    id: string,
    workspaceId: string,
  ): Promise<WhatsAppConnectionEntity | null> {
    const connection = await this.findById(id, workspaceId);

    if (!connection) {
      return null;
    }

    await this.whatsAppConnectionRepository.update(
      workspaceId,
      { id },
      { archivedAt: new Date() },
    );

    return this.findById(id, workspaceId);
  }

  async markValidated({
    id,
    workspaceId,
    displayPhoneNumber,
  }: {
    id: string;
    workspaceId: string;
    displayPhoneNumber: string | null;
  }): Promise<void> {
    await this.whatsAppConnectionRepository.update(
      workspaceId,
      { id },
      {
        status: 'ACTIVE',
        displayPhoneNumber,
        lastValidatedAt: new Date(),
        authFailedAt: null,
      },
    );
  }

  async markAuthFailed(id: string, workspaceId: string): Promise<void> {
    await this.whatsAppConnectionRepository.update(
      workspaceId,
      { id },
      {
        status: 'AUTH_FAILED',
        authFailedAt: new Date(),
      },
    );
  }

  decryptAccessToken(
    connection: WhatsAppConnectionEntity,
    workspaceId: string,
  ): string {
    if (connection.workspaceId !== workspaceId) {
      throw new Error('WhatsApp connection does not belong to this workspace');
    }

    return this.secretEncryptionService.decryptVersionedOrThrow(
      connection.accessToken,
      { workspaceId },
    );
  }
}
