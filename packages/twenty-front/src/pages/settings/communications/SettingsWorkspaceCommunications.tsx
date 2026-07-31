import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext, useState } from 'react';

import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsDiscoveryHeroCard } from '@/settings/components/SettingsDiscoveryHeroCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsWorkspaceEmailGroupSection } from '@/settings/workspace/components/SettingsWorkspaceEmailGroupSection';
import { SettingsWorkspaceWhatsAppSection } from '@/settings/workspace/components/SettingsWorkspaceWhatsAppSection';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  IconBrandWhatsapp,
  IconMail,
  IconMailX,
  IconPhone,
} from 'twenty-ui/icon';
import { Section } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import coverDark from '~/pages/settings/communications/assets/cover-dark.png';
import coverLight from '~/pages/settings/communications/assets/cover-light.png';

const COMMUNICATIONS_TABS_INSTANCE_ID = 'settings-communications-tabs';

const StyledCardsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

export const SettingsWorkspaceCommunications = () => {
  const { theme } = useContext(ThemeContext);
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const [activeTabId, setActiveTabId] = useState('emails');

  const isEmailGroupFeatureEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_EMAIL_GROUP_ENABLED,
  );

  return (
    <SettingsPageLayout
      title={t`Communication`}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
        },
        { children: t`Communication` },
      ]}
    >
      <SettingsPageContainer>
        <TabList
          componentInstanceId={COMMUNICATIONS_TABS_INSTANCE_ID}
          onChangeTab={setActiveTabId}
          tabs={[
            { id: 'emails', title: t`Emails`, Icon: IconMail },
            {
              id: 'whatsapp',
              title: t`WhatsApp`,
              Icon: IconBrandWhatsapp,
            },
            {
              id: 'calls',
              title: t`Calls`,
              Icon: IconPhone,
              disabled: true,
              pill: t`Soon`,
            },
          ]}
        />

        {activeTabId === 'whatsapp' && <SettingsWorkspaceWhatsAppSection />}

        {activeTabId === 'emails' && isEmailGroupFeatureEnabled && (
          <>
            <Section>
              <SettingsDiscoveryHeroCard
                lightSrc={coverLight}
                darkSrc={coverDark}
                instanceIdPrefix="settings-communications-hero"
                tabs={[]}
              />
            </Section>
            <SettingsWorkspaceEmailGroupSection />
            <Section>
              <H2Title
                title={t`Unsubscribe`}
                description={t`Manage unsubscribers, opt-out topics, and the page recipients see`}
              />
              <StyledCardsColumn>
                <SettingsCard
                  Icon={
                    <IconMailX
                      size={theme.icon.size.lg}
                      stroke={theme.icon.stroke.md}
                    />
                  }
                  title={t`Manage unsubscribe`}
                  onClick={() => navigateSettings(SettingsPath.Unsubscribe)}
                />
              </StyledCardsColumn>
            </Section>
          </>
        )}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
