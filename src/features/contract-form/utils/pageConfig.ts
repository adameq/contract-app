/**
 * Page configuration for contract form feature
 *
 * Single source of truth for contract form page lazy loading and step configuration.
 *
 * FEATURE-SPECIFIC CONFIGURATION:
 * - Form step pages (FormStep1-6): Configured with metadata for stepper UI
 * - Feature pages (FormSuccess): Pages specific to contract form flow
 *
 * This configuration drives:
 * - Step metadata (labels, descriptions)
 * - Routing (paths, component mapping)
 * - Conditional logic (step visibility)
 * - Code splitting (lazy loading)
 *
 * NOTE: App-level pages (404, maintenance, etc.) are configured separately
 * in @/app/config/pages.ts to maintain architectural boundaries.
 */

import type { ComponentType } from 'react';
import { lazy } from 'react';

/**
 * FORM STEP PAGES
 *
 * Lazy loaded step components with full metadata configuration.
 * Each step includes routing, labels, and conditional rendering logic.
 */
const FormStep1Page = lazy(() => import('../pages/FormStep1Page'));
const FormStep2Page = lazy(() => import('../pages/FormStep2Page'));
const FormStep3Page = lazy(() => import('../pages/FormStep3Page'));
const FormStep4Page = lazy(() => import('../pages/FormStep4Page'));
const FormStep5Page = lazy(() => import('../pages/FormStep5Page'));
const FormStep6Page = lazy(() => import('../pages/FormStep6Page'));

/**
 * STANDALONE PAGES
 *
 * Lazy loaded feature-specific pages outside the main form flow.
 * Used directly in router without step configuration.
 *
 * NOTE: App-level pages (like 404 NotFound) are configured in @/app/config/pages.ts
 * to maintain proper separation between app-level and feature-level concerns.
 */
export const FormSuccessPage = lazy(
  () => import('@/features/contract-form/pages/FormSuccessPage')
);

export interface StepConfig {
  id: number;
  path: string;
  label: string;
  shortLabel: string; // For mobile display
  description: string;
  isConditional: boolean; // Step may be skipped based on form data
  component: ComponentType; // Component to render for this step
}

/**
 * Base step configurations
 * Steps are displayed sequentially, with conditional logic for company data
 *
 * Each step includes its component - adding a new step only requires updating this config.
 */
export const STEP_CONFIGS: StepConfig[] = [
  {
    id: 1,
    path: '/step/1',
    label: 'Podstawy',
    shortLabel: 'Start',
    description: 'Wybierz sposób podpisania umowy',
    isConditional: false,
    component: FormStep1Page,
  },
  {
    id: 2,
    path: '/step/2',
    label: 'Dane osobowe',
    shortLabel: 'Dane',
    description: 'Podaj dane kontaktowe i sygnatariusza',
    isConditional: false,
    component: FormStep2Page,
  },
  {
    id: 3,
    path: '/step/3',
    label: 'Adres korespondencyjny',
    shortLabel: 'Adres',
    description: 'Podaj adres do korespondencji',
    isConditional: false,
    component: FormStep3Page,
  },
  {
    id: 4,
    path: '/step/4',
    label: 'Deklaracje PEP',
    shortLabel: 'PEP',
    description:
      'Wypełnij deklaracje dotyczące osób zajmujących eksponowane stanowiska polityczne',
    isConditional: false,
    component: FormStep4Page,
  },
  {
    id: 5,
    path: '/step/5',
    label: 'Typ użytkownika',
    shortLabel: 'Typ',
    description: 'Określ typ użytkownika i podaj dodatkowe dane',
    // Always shown for all users - contains UserTypeSection (user type selection)
    // TaxDataSection inside is conditionally rendered based on userType
    isConditional: false,
    component: FormStep5Page,
  },
  {
    id: 6,
    path: '/step/6',
    label: 'Podsumowanie',
    shortLabel: 'Koniec',
    description: 'Sprawdź dane i wyślij formularz',
    isConditional: false,
    component: FormStep6Page,
  },
];

/**
 * Get step configuration by step number
 */
export function getStepConfig(stepNumber: number): StepConfig | undefined {
  return STEP_CONFIGS.find(step => step.id === stepNumber);
}

/**
 * Get all step configurations
 */
export function getAllSteps(): StepConfig[] {
  return STEP_CONFIGS;
}

/**
 * Get the number of total steps (including conditional)
 */
export function getTotalSteps(): number {
  return STEP_CONFIGS.length;
}

/**
 * Check if a step is conditional
 */
export function isConditionalStep(stepNumber: number): boolean {
  const step = getStepConfig(stepNumber);
  return step?.isConditional ?? false;
}

/**
 * Get active steps based on user type
 *
 * CURRENT IMPLEMENTATION: Returns all steps for all user types.
 *
 * Rationale:
 * - Step 5 must be shown to all users (contains UserTypeSection for type selection)
 * - TaxDataSection inside step 5 is conditionally rendered based on userType
 * - Cannot hide step 5 before user selects type (chicken-and-egg problem)
 *
 * This function exists for future extensibility if we decide to make steps
 * truly conditional (would require moving UserTypeSection to earlier step).
 *
 * @param userType - User type to filter steps (currently unused)
 * @returns All step configurations (always returns STEP_CONFIGS)
 */
export function getActiveSteps(
  _userType: 'company' | 'consumer-vat' | 'consumer' | 'none'
): StepConfig[] {
  // All users see all steps - step 5 contains user type selection
  return STEP_CONFIGS;
}
