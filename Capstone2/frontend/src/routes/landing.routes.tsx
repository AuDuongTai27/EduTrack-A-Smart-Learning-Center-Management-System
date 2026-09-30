import type { RouteObject } from 'react-router-dom';
import { LandingPageLayout } from '../GUIs/layouts/landing/Landing-page-layout';
import { LandingPage } from '../GUIs/pages/landing/Landing-page';

export const landingRoutes: RouteObject = {
  path: '/',
  element: <LandingPageLayout />,
  children: [
    { index: true, element: <LandingPage /> },
  ],
};

export default landingRoutes;
