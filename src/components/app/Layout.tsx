import { Helmet } from 'react-helmet';
import { Outlet, useMatch } from 'react-router-dom';
import { FooterSlot } from '@edx/frontend-component-footer';
import { getConfig } from '@edx/frontend-platform/config';
import { ErrorBoundary } from 'react-error-boundary';

import { isSystemMaintenanceAlertOpen, useEnterpriseCustomer } from './data';
import { useStylesForCustomBrandColors } from '../layout/data/hooks';
import NotFoundPage from '../NotFoundPage';
import { SiteHeader } from '../site-header';
import { EnterpriseBanner } from '../enterprise-banner';
import { SystemWideWarningBanner } from '../system-wide-banner';
import { EnterprisePage } from '../enterprise-page';
import AppErrorBoundary from './AppErrorBoundary';

export const TITLE_TEMPLATE = '%s - edX';
export const DEFAULT_TITLE = 'edX';

const Layout = () => {
  const config = getConfig();
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const licenseActivationRouteMatch = useMatch('/:enterpriseSlug/licenses/:activationKey/activate');

  const brandStyles = useStylesForCustomBrandColors(enterpriseCustomer);

  // Authenticated user is NOT linked to an enterprise customer.
  if (!enterpriseCustomer) {
    if (licenseActivationRouteMatch) {
      // If the user is trying to activate a license, render the license activation route.
      return <Outlet />;
    }
    // Otherwise, render the not found page.
    return <NotFoundPage />;
  }

  const fallbackRender = ({ error }) => (
    <AppErrorBoundary
      error={error}
      showSiteHeader={false}
      showSiteFooter={false}
    />
  );

  return (
    <EnterprisePage>
      <Helmet titleTemplate={TITLE_TEMPLATE} defaultTitle={DEFAULT_TITLE}>
        <html lang="en" />
        {brandStyles?.map(({ key, styles }) => (
          <style key={key} type="text/css">{styles}</style>
        ))}
      </Helmet>
      {isSystemMaintenanceAlertOpen(config) && (
        <SystemWideWarningBanner>
          {config.MAINTENANCE_ALERT_MESSAGE}
        </SystemWideWarningBanner>
      )}
      <SiteHeader />
      <EnterpriseBanner />
      <ErrorBoundary fallbackRender={fallbackRender}>
        <main id="content" className="fill-vertical-space">
          <Outlet />
        </main>
      </ErrorBoundary>
      <FooterSlot />
    </EnterprisePage>
  );
};

export default Layout;
