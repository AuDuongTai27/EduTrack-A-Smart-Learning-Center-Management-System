import type { RouteObject } from 'react-router-dom';
import { LandingPageLayout } from '../GUIs/layouts/landing/Landing-page-layout';
import { LandingPage } from '../GUIs/pages/landing/Landing-page';
import { PublicOnlyRouteGuard } from './RoleRouteGuard';

export const landingRoutes: RouteObject = {
  path: '/',
  element: (
    <PublicOnlyRouteGuard>
      <LandingPageLayout />
    </PublicOnlyRouteGuard>
  ),
  children: [
    { index: true, element: <LandingPage /> },
  ],
};

export default landingRoutes;
