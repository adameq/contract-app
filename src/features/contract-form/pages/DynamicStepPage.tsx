/**
 * Dynamic Step Page Component
 *
 * Renders the appropriate step component based on URL parameter.
 * Uses pageConfig.ts as single source of truth for step configuration.
 *
 * **Architecture**:
 * - All steps work with FinalContractData from Single FormProvider
 * - Steps 1-4: Shared form data (signature, personal, correspondence, PEP)
 * - Step 5: User type selection and company data (conditional)
 * - Step 6: Review and submission
 *
 * **DRY Principle**:
 * - Step components are lazy-loaded in pageConfig.ts
 * - No duplication - adding new step only requires updating pageConfig.ts
 * - Component mapping, paths, and metadata all centralized
 */

import { useParams } from 'react-router-dom';

import { StepNotFoundError } from '../components/layout/StepNotFoundError';
import { getStepConfig } from '../utils/pageConfig';

/**
 * Dynamic Step Page Component
 *
 * Renders appropriate step component based on URL parameter.
 * Falls back to StepNotFoundError for invalid step numbers.
 *
 * Uses getStepConfig() from pageConfig.ts as single source of truth.
 */
export function DynamicStepPage() {
  const params = useParams<{ step: string }>();
  const stepNumber = params.step ? parseInt(params.step, 10) : 1;

  // Get step configuration from centralized config
  const stepConfig = getStepConfig(stepNumber);
  const StepComponent = stepConfig?.component ?? StepNotFoundError;

  return <StepComponent />;
}
