/**
 * App-level page configuration
 *
 * Centralized lazy loading for application-wide pages (non-feature-specific).
 *
 * ARCHITECTURAL PRINCIPLE:
 * This file handles pages that are NOT part of a specific feature:
 * - 404 Not Found page (app-wide error handling)
 * - Future: Maintenance page, Global error boundary page, etc.
 *
 * SEPARATION OF CONCERNS:
 * - App-level pages (this file) vs Feature-specific pages (features/[feature]/utils/pageConfig.ts)
 * - App pages serve the entire application, not a single feature
 * - Feature pages are part of business logic (e.g., FormSuccessPage for contract form)
 *
 * WHY NOT IN FEATURE CONFIG:
 * The 404 page is shown for ANY invalid route in the app, not just form routes.
 * Placing it in feature config (contract-form/utils/pageConfig.ts) would create
 * improper coupling between app-level routing and a specific feature.
 */

import { lazy } from 'react';

/**
 * 404 Not Found Page
 *
 * Shown when user navigates to a non-existent route anywhere in the application.
 * Uses PageLayout for consistent header (logo + theme toggle).
 */
export const NotFoundPage = lazy(() => import('@/app/pages/NotFoundPage'));
