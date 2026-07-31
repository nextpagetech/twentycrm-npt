import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useMutation, useQuery } from '@apollo/client/react';
import { useEffect, useMemo, useState } from 'react';

import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTableListSection } from '@/settings/components/SettingsTableListSection';
import {
  ArchiveWhatsAppConnectionDocument,
  CreateWhatsAppConnectionDocument,
  GetWhatsAppConnectionsDocument,
  UpdateWhatsAppConnectionDocument,
  ValidateWhatsAppConnectionDocument,
} from '@/settings/workspace/graphql/whatsappConnectionOperations';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { IconCheck, IconDeviceFloppy, IconPlugConnected, IconTrash, IconX } from 'twenty-ui/icon';
import { H2Title } from 'twenty-ui/typography';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export type WhatsAppConnection = {
  id: string;
  name: string;
  phoneNumberId: string;
  whatsAppBusinessAccountId: string;
  displayPhoneNumber: string | null;
  apiVersion: string;
  status: 'PENDING' | 'ACTIVE' | 'AUTH_FAILED';
  lastValidatedAt: string | null;
  authFailedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type WhatsAppConnectionFormValues = {
  name: string;
  phoneNumberId: string;
  whatsAppBusinessAccountId: string;
  accessToken: string;
  apiVersion: string;
};

const EMPTY_FORM: WhatsAppConnectionFormValues = {
  name: '',
  phoneNumberId: '',
  whatsAppBusinessAccountId: '',
  accessToken: '',
  apiVersion: 'v23.0',
};

const StyledForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledStatus = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledName = styled.span`
  color: ${themeCssVariables.font.color.primary};
`;

const WhatsAppConnectionNameCell = ({ item }: { item: WhatsAppConnection }) => (
  <StyledName>{item.name}</StyledName>
);

const WhatsAppConnectionPhoneCell = ({ item }: { item: WhatsAppConnection }) => (
  <StyledStatus>{item.displayPhoneNumber ?? item.phoneNumberId}</StyledStatus>
);

const WhatsAppConnectionStatusCell = ({ item }: { item: WhatsAppConnection }) => (
  <StyledStatus>{item.status.replace('_', ' ')}</StyledStatus>
);

export const SettingsWorkspaceWhatsAppSection = () => {
  const { t } = useLingui();
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formValues, setFormValues] = useState<WhatsAppConnectionFormValues>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  const { data, loading, refetch } = useQuery<{
    whatsAppConnections: WhatsAppConnection[];
  }>(GetWhatsAppConnectionsDocument);

  const connections = data?.whatsAppConnections ?? [];
  const selectedConnection = useMemo(
    () => connections.find((connection) => connection.id === selectedConnectionId),
    [connections, selectedConnectionId],
  );

  useEffect(() => {
    if (!selectedConnection) {
      return;
    }

    setFormValues({
      name: selectedConnection.name,
      phoneNumberId: selectedConnection.phoneNumberId,
      whatsAppBusinessAccountId: selectedConnection.whatsAppBusinessAccountId,
      accessToken: '',
      apiVersion: selectedConnection.apiVersion,
    });
  }, [selectedConnection]);

  const [createConnection] = useMutation(CreateWhatsAppConnectionDocument);
  const [updateConnection] = useMutation(UpdateWhatsAppConnectionDocument);
  const [validateConnection] = useMutation(ValidateWhatsAppConnectionDocument);
  const [archiveConnection] = useMutation(ArchiveWhatsAppConnectionDocument);

  const resetForm = () => {
    setSelectedConnectionId(null);
    setIsCreating(false);
    setFormValues(EMPTY_FORM);
  };

  const canSave =
    formValues.name.trim().length > 0 &&
    formValues.phoneNumberId.trim().length > 0 &&
    formValues.whatsAppBusinessAccountId.trim().length > 0 &&
    /^v\d+\.\d+$/.test(formValues.apiVersion.trim()) &&
    (!isCreating || formValues.accessToken.trim().length > 0);

  const handleSave = async () => {
    if (!canSave) {
      return;
    }

    setIsSaving(true);
    try {
      if (isCreating) {
        await createConnection({
          variables: {
            input: {
              name: formValues.name.trim(),
              phoneNumberId: formValues.phoneNumberId.trim(),
              whatsAppBusinessAccountId:
                formValues.whatsAppBusinessAccountId.trim(),
              accessToken: formValues.accessToken.trim(),
              apiVersion: formValues.apiVersion.trim(),
            },
          },
        });
        enqueueSuccessSnackBar({ message: t`WhatsApp connection created` });
      } else if (selectedConnectionId) {
        await updateConnection({
          variables: {
            input: {
              id: selectedConnectionId,
              name: formValues.name.trim(),
              phoneNumberId: formValues.phoneNumberId.trim(),
              whatsAppBusinessAccountId:
                formValues.whatsAppBusinessAccountId.trim(),
              apiVersion: formValues.apiVersion.trim(),
              ...(formValues.accessToken.trim().length > 0
                ? { accessToken: formValues.accessToken.trim() }
                : {}),
            },
          },
        });
        enqueueSuccessSnackBar({ message: t`WhatsApp connection updated` });
      }

      await refetch();
      resetForm();
    } catch {
      enqueueErrorSnackBar({ message: t`Could not save the WhatsApp connection` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleValidate = async () => {
    if (!selectedConnectionId) {
      return;
    }

    setIsSaving(true);
    try {
      await validateConnection({ variables: { id: selectedConnectionId } });
      await refetch();
      enqueueSuccessSnackBar({ message: t`WhatsApp connection is valid` });
    } catch {
      await refetch();
      enqueueErrorSnackBar({
        message: t`Meta could not validate the WhatsApp connection`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!selectedConnectionId) {
      return;
    }

    setIsSaving(true);
    try {
      await archiveConnection({ variables: { id: selectedConnectionId } });
      await refetch();
      resetForm();
      enqueueSuccessSnackBar({ message: t`WhatsApp connection removed` });
    } catch {
      enqueueErrorSnackBar({ message: t`Could not remove the WhatsApp connection` });
    } finally {
      setIsSaving(false);
    }
  };

  const isFormVisible = isCreating || selectedConnectionId !== null;

  return (
    <>
      <SettingsTableListSection<WhatsAppConnection>
        title={t`WhatsApp connections`}
        description={t`Connect Meta WhatsApp Cloud API accounts for workspace workflows`}
        items={connections}
        columns={[
          { label: t`Name`, Cell: WhatsAppConnectionNameCell },
          { label: t`Phone`, Cell: WhatsAppConnectionPhoneCell },
          { label: t`Status`, align: 'right', Cell: WhatsAppConnectionStatusCell },
        ]}
        gridAutoColumns="1fr 1fr 1fr"
        showRowChevron
        onRowClick={(connection) => {
          setIsCreating(false);
          setSelectedConnectionId(connection.id);
        }}
        footerButtonLabel={t`Add WhatsApp connection`}
        onFooterButtonClick={() => {
          setSelectedConnectionId(null);
          setIsCreating(true);
          setFormValues(EMPTY_FORM);
        }}
      />

      {loading && <StyledStatus>{t`Loading WhatsApp connections…`}</StyledStatus>}

      {isFormVisible && (
        <Section>
          <H2Title
            title={isCreating ? t`New WhatsApp connection` : t`Edit WhatsApp connection`}
            description={t`The access token is encrypted and is never shown again after saving.`}
          />
          <StyledForm>
            <SettingsTextInput
              instanceId="whatsapp-connection-name"
              label={t`Connection name`}
              value={formValues.name}
              onChange={(name) => setFormValues((values) => ({ ...values, name }))}
              fullWidth
            />
            <SettingsTextInput
              instanceId="whatsapp-phone-number-id"
              label={t`Phone Number ID`}
              value={formValues.phoneNumberId}
              onChange={(phoneNumberId) =>
                setFormValues((values) => ({ ...values, phoneNumberId }))
              }
              fullWidth
            />
            <SettingsTextInput
              instanceId="whatsapp-business-account-id"
              label={t`WhatsApp Business Account ID`}
              value={formValues.whatsAppBusinessAccountId}
              onChange={(whatsAppBusinessAccountId) =>
                setFormValues((values) => ({
                  ...values,
                  whatsAppBusinessAccountId,
                }))
              }
              fullWidth
            />
            <SettingsTextInput
              instanceId="whatsapp-access-token"
              label={isCreating ? t`Access token` : t`Replace access token`}
              placeholder={isCreating ? undefined : t`Leave empty to keep the current token`}
              type="password"
              autoComplete="new-password"
              value={formValues.accessToken}
              onChange={(accessToken) =>
                setFormValues((values) => ({ ...values, accessToken }))
              }
              fullWidth
            />
            <SettingsTextInput
              instanceId="whatsapp-api-version"
              label={t`Graph API version`}
              placeholder="v23.0"
              value={formValues.apiVersion}
              onChange={(apiVersion) =>
                setFormValues((values) => ({ ...values, apiVersion }))
              }
              fullWidth
            />
            <StyledActions>
              <Button
                Icon={IconDeviceFloppy}
                title={t`Save`}
                disabled={!canSave || isSaving}
                onClick={handleSave}
              />
              <Button
                Icon={IconX}
                title={t`Cancel`}
                variant="secondary"
                disabled={isSaving}
                onClick={resetForm}
              />
              {!isCreating && (
                <Button
                  Icon={selectedConnection?.status === 'ACTIVE' ? IconCheck : IconPlugConnected}
                  title={t`Test connection`}
                  variant="secondary"
                  disabled={isSaving}
                  onClick={handleValidate}
                />
              )}
              {!isCreating && (
                <Button
                  Icon={IconTrash}
                  title={t`Remove`}
                  variant="secondary"
                  accent="danger"
                  disabled={isSaving}
                  onClick={handleArchive}
                />
              )}
            </StyledActions>
          </StyledForm>
        </Section>
      )}
    </>
  );
};
