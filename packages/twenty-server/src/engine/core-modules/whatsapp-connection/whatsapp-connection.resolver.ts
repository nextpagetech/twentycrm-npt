import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { CreateWhatsAppConnectionInput } from 'src/engine/core-modules/whatsapp-connection/dtos/create-whatsapp-connection.input';
import { UpdateWhatsAppConnectionInput } from 'src/engine/core-modules/whatsapp-connection/dtos/update-whatsapp-connection.input';
import { WhatsAppConnectionEntity } from 'src/engine/core-modules/whatsapp-connection/whatsapp-connection.entity';
import { WhatsAppConnectionService } from 'src/engine/core-modules/whatsapp-connection/whatsapp-connection.service';
import { WhatsAppConnectionValidationService } from 'src/engine/core-modules/whatsapp-connection/whatsapp-connection-validation.service';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { RequireAccessTokenGuard } from 'src/engine/guards/require-access-token.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';

@MetadataResolver(() => WhatsAppConnectionEntity)
@UseFilters(AuthGraphqlApiExceptionFilter, PermissionsGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
export class WhatsAppConnectionResolver {
  constructor(
    private readonly whatsAppConnectionService: WhatsAppConnectionService,
    private readonly whatsAppConnectionValidationService: WhatsAppConnectionValidationService,
  ) {}

  @Query(() => [WhatsAppConnectionEntity])
  async whatsAppConnections(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<WhatsAppConnectionEntity[]> {
    return this.whatsAppConnectionService.findActiveByWorkspaceId(workspace.id);
  }

  @Query(() => WhatsAppConnectionEntity, { nullable: true })
  async whatsAppConnection(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('id', { type: () => UUIDScalarType }) id: string,
  ): Promise<WhatsAppConnectionEntity | null> {
    const connection = await this.whatsAppConnectionService.findById(
      id,
      workspace.id,
    );

    return connection?.archivedAt ? null : connection;
  }

  @Mutation(() => WhatsAppConnectionEntity)
  @UseGuards(
    RequireAccessTokenGuard,
    SettingsPermissionGuard(PermissionFlagType.WORKSPACE),
  )
  async createWhatsAppConnection(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateWhatsAppConnectionInput,
  ): Promise<WhatsAppConnectionEntity> {
    return this.whatsAppConnectionService.create({
      workspaceId: workspace.id,
      ...input,
    });
  }

  @Mutation(() => WhatsAppConnectionEntity, { nullable: true })
  @UseGuards(
    RequireAccessTokenGuard,
    SettingsPermissionGuard(PermissionFlagType.WORKSPACE),
  )
  async updateWhatsAppConnection(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: UpdateWhatsAppConnectionInput,
  ): Promise<WhatsAppConnectionEntity | null> {
    const { id, ...updates } = input;

    return this.whatsAppConnectionService.update(id, workspace.id, updates);
  }

  @Mutation(() => WhatsAppConnectionEntity)
  @UseGuards(
    RequireAccessTokenGuard,
    SettingsPermissionGuard(PermissionFlagType.WORKSPACE),
  )
  async validateWhatsAppConnection(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('id', { type: () => UUIDScalarType }) id: string,
  ): Promise<WhatsAppConnectionEntity> {
    return this.whatsAppConnectionValidationService.validate({
      id,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => WhatsAppConnectionEntity, { nullable: true })
  @UseGuards(
    RequireAccessTokenGuard,
    SettingsPermissionGuard(PermissionFlagType.WORKSPACE),
  )
  async archiveWhatsAppConnection(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('id', { type: () => UUIDScalarType }) id: string,
  ): Promise<WhatsAppConnectionEntity | null> {
    return this.whatsAppConnectionService.archive(id, workspace.id);
  }
}
