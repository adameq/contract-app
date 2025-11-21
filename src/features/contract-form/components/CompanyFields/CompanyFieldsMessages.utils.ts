/**
 * Message resolution utilities for CompanyFieldsMessages
 *
 * This module encapsulates all message resolution logic in pure, declarative functions.
 * This approach provides:
 * - Single source of truth for message resolution
 * - Testable business logic (no component coupling)
 * - Clear, linear message resolution pipeline
 * - No imperative mutations or scattered conditionals
 */

import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

import type { CompanyData } from '@/shared/api/types';
import { getApiErrorMessage } from '@/shared/constants/apiErrorMessages';
import { getStatusErrorMessage } from '@/shared/constants/companyStatus';

import { formatCompanySourceDescription } from '../../utils/companyMessageFormatters';
import type { CompanyFieldsMessages, CompanyFieldsState } from './types';

/**
 * Function type for dynamically resolving description based on runtime data
 *
 * **USE CASES:**
 * Use DescriptionResolver (function) when description content depends on runtime data:
 * - Displaying dynamic values (NIP, company name, source registry)
 * - Showing calculated status indicators (🟢/🔴 based on isActive)
 * - Formatting messages with user-specific data
 *
 * Use static string when description content is fixed:
 * - Generic error messages ("Firma została wykreślona z rejestru")
 * - Static instructions ("Edytujesz dane pobrane z rejestru GUS...")
 * - Unchanging information messages
 *
 * **DESIGN PRINCIPLE:**
 * Mixed approach (string for static, function for dynamic) is intentional:
 * - Simpler: No function overhead for static content
 * - Efficient: Functions only when needed
 * - Type-safe: Both types supported in MessageConfig.description
 *
 * @example
 * ```typescript
 * // ✅ Good - function for dynamic content
 * description: ({ companyApiState, nip }) => {
 *   return `Found company ${companyApiState.name} with NIP ${nip}`;
 * }
 *
 * // ✅ Good - string for static content
 * description: 'Company has been deregistered from CEIDG'
 * ```
 */
export type DescriptionResolver = (params: {
  companyApiState?: CompanyData;
  nip?: string;
}) => string;

/**
 * Message configuration with resolved values
 *
 * **DESCRIPTION TYPE USAGE:**
 *
 * Description supports two types for different use cases:
 *
 * 1. **Static string** - Use for fixed content that doesn't change:
 *    - Generic error messages
 *    - Static instructions
 *    - Unchanging information
 *    - Status-based errors (company deregistered, suspended, etc.)
 *
 * 2. **DescriptionResolver function** - Use for dynamic content with runtime data:
 *    - Messages with user-specific values (NIP, company name)
 *    - Content based on API responses (source registry, status indicators)
 *    - Calculated or formatted messages
 *
 * **WHY MIXED APPROACH:**
 * - Type-safe: TypeScript accepts both types
 * - Efficient: Functions only when runtime data needed
 * - Simple: Static strings for static content (no function overhead)
 * - Flexible: Easy to add dynamic content when needed
 *
 * @example
 * ```typescript
 * // Static string for fixed content
 * const errorMessage: MessageConfig = {
 *   title: 'Company Deregistered',
 *   description: 'This company has been deregistered from CEIDG',
 * };
 *
 * // Function for dynamic content
 * const successMessage: MessageConfig = {
 *   title: 'Data Loaded Successfully',
 *   description: ({ companyApiState, nip }) =>
 *     `Loaded company ${companyApiState.name} with NIP ${nip}`,
 * };
 * ```
 */
export interface MessageConfig {
  title: string;
  description: string | DescriptionResolver;
  icon?: LucideIcon;
  actionLabel?: string;
}

/**
 * Parameters for message resolution
 */
export interface MessageResolverParams {
  state: CompanyFieldsState;
  type: 'info' | 'success' | 'warning' | 'error';
  nip?: string;
  /** Company API state for status indicators and message formatting */
  companyApiState?: CompanyData;
  customMessages?: Partial<CompanyFieldsMessages>;
}

/**
 * Icon components mapped to message types
 * Using lucide-react for consistent, accessible, and styleable icons
 */
export const MESSAGE_ICONS = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
} as const;

/**
 * Default messages for each state and type
 *
 * Icons are lucide-react components instead of emoji strings.
 * This provides better accessibility, consistent styling, and flexibility.
 *
 * Note: States 'loading' and 'active' have empty message objects because they
 * do not have messageType defined in STATE_CONFIG. If messageType is ever added
 * to these states, corresponding messages must be defined here.
 */
export const DEFAULT_MESSAGES: Record<
  CompanyFieldsState,
  CompanyFieldsMessages
> = {
  disabled: {
    info: {
      title: '',
      description:
        'Po wprowadzeniu poprawnego numeru NIP i kliknięciu przycisku Pobierz dane, dane firmy zostaną pobrane automatycznie z GUS, KRS lub CEIDG i zostanie sprawdzony status podatnika na Białej liście podatników VAT',
    },
  },
  loading: {},
  active: {},
  populated: {
    success: {
      title: 'Dane zostały automatycznie wypełnione',
      // DYNAMIC DESCRIPTION: Function-based resolver for runtime data
      // Calls formatCompanySourceDescription() with company data and NIP to show:
      // - Data source registry (CEIDG/KRS/GUS)
      // - NIP number
      // - Company activity status with icon (🟢 Active / 🔴 Inactive / 🟡 Suspended)
      // - Additional warnings for GUS-only data
      // Using function instead of static string for consistent, extensible structure.
      // @see DescriptionResolver type definition
      // @see formatCompanySourceDescription() for message formatting
      description: ({ companyApiState, nip }) => {
        if (!companyApiState || !nip) return '';
        // Type assertions safe here: guard check above ensures non-null values
        return formatCompanySourceDescription(
          companyApiState as CompanyData,
          nip as string
        );
      },
      actionLabel: 'Dane nieaktualne? Edytuj ręcznie',
    },
  },
  'edit-mode': {
    warning: {
      title: 'Tryb edycji danych firmowych',
      description:
        'Edytujesz dane pobrane z rejestru GUS. Upewnij się, że wprowadzane zmiany są zgodne z oficjalnymi dokumentami firmy.',
      actionLabel: 'Przywróć oryginalne dane z GUS',
    },
  },
  error: {
    error: {
      title: 'Firma wykreślona z rejestru REGON',
      description: getApiErrorMessage('ENTITY_DEREGISTERED_FROM_REGON'),
    },
  },
};

/**
 * Apply status-specific message override for error state
 *
 * This function handles the special case where error messages need to be
 * customized based on company status (e.g., suspended, liquidated, etc.)
 *
 * **DESCRIPTION TYPE:**
 * Returns static string from getStatusErrorMessage, not DescriptionResolver function.
 * This is intentional because status error messages are fixed content that don't
 * depend on runtime data beyond the status itself. The status is used to SELECT
 * the message, not to GENERATE dynamic content within the message.
 *
 * Examples of static status messages:
 * - "Firma została wykreślona z rejestru" (deregistered)
 * - "Działalność gospodarcza jest zawieszona" (suspended)
 * - "Firma oczekuje na rozpoczęcie działalności" (pending)
 *
 * These messages don't need NIP, company name, or other runtime data,
 * so using static strings is simpler and more efficient than functions.
 *
 * @param message - Base message configuration
 * @param params - Resolution parameters
 * @returns Message with status override applied, or original message
 */
function applyStatusOverride(
  message: MessageConfig | undefined,
  params: MessageResolverParams
): MessageConfig | undefined {
  // Only apply override for error state with error type
  if (params.state !== 'error' || params.type !== 'error') {
    return message;
  }

  // Need company API state with status
  if (!params.companyApiState?.status) {
    return message;
  }

  // Get status-specific error message (returns static string, not function)
  const statusError = getStatusErrorMessage(params.companyApiState.status);
  if (!statusError) {
    return message;
  }

  // Return status-specific message with static string description
  // (icon will be resolved from MESSAGE_ICONS)
  return {
    title: statusError.title,
    description: statusError.description, // Static string - intentional
  };
}

/**
 * Resolve final description based on message configuration
 *
 * **Generic Description Resolution:**
 *
 * Handles both static string descriptions and dynamic function-based descriptions.
 * This unified approach eliminates special-case logic and makes the system extensible.
 *
 * Description types:
 * 1. Static string - Returns the string directly
 * 2. Function (DescriptionResolver) - Calls function with runtime data to generate description
 *
 * For function-based descriptions (e.g., 'populated' state):
 * - Function receives companyApiState and NIP
 * - Generates description dynamically (e.g., via formatCompanySourceDescription)
 * - Shows data source, NIP, status indicators, warnings
 *
 * @param message - Message configuration with description (string or function)
 * @param params - Resolution parameters including company data and NIP
 * @returns Resolved description string
 *
 * @example
 * ```ts
 * // Function-based description (dynamic)
 * resolveDescription(
 *   { title: '...', description: ({ companyApiState, nip }) => formatCompanySourceDescription(...) },
 *   {
 *     state: 'populated',
 *     nip: '1234567890',
 *     companyApiState: { source: 'CEIDG', status: 'AKTYWNY', ... }
 *   }
 * )
 * // Returns: "Znaleziono i wypełniono dane z rejestru CEIDG dla NIP 1234567890. Status firmy: 🟢 Aktywna"
 *
 * // Static string description
 * resolveDescription(
 *   { title: '...', description: 'Static description' },
 *   { state: 'disabled', type: 'info' }
 * )
 * // Returns: "Static description"
 * ```
 *
 * @see DescriptionResolver - Function type for dynamic descriptions
 * @see DEFAULT_MESSAGES - Message configuration with mixed static/dynamic descriptions
 */
function resolveDescription(
  message: MessageConfig | undefined,
  params: MessageResolverParams
): string {
  if (!message?.description) return '';

  // Handle function-based description (dynamic resolution)
  if (typeof message.description === 'function') {
    return message.description({
      companyApiState: params.companyApiState,
      nip: params.nip,
    });
  }

  // Handle static string description
  return message.description;
}

/**
 * Resolve complete message configuration
 *
 * This is the main entry point for message resolution. It applies all
 * resolution logic in a clear, linear pipeline:
 * 1. Get base message from defaults
 * 2. Apply status-specific override (if applicable)
 * 3. Apply custom message override (if provided)
 * 4. Resolve description
 *
 * @param params - Message resolution parameters
 * @returns Resolved message configuration, or null if no message should be shown
 *
 * @example
 * ```ts
 * const message = resolveMessage({
 *   state: 'error',
 *   type: 'error',
 *   companyApiState: { status: 'suspended', ... }
 * });
 * // Returns status-specific error message
 * ```
 */
export function resolveMessage(
  params: MessageResolverParams
): MessageConfig | null {
  // 1. Get base message from defaults
  const baseMessage = DEFAULT_MESSAGES[params.state]?.[params.type];

  // 2. Apply status-specific override (declarative)
  const messageWithStatus = applyStatusOverride(baseMessage, params);

  // 3. Apply custom message override (highest priority)
  const finalMessage =
    params.customMessages?.[params.type] ?? messageWithStatus;

  // 4. No message to display
  if (!finalMessage) return null;

  // 5. Resolve description
  const description = resolveDescription(finalMessage, params);

  // 6. Return null if description is empty (nothing to display)
  // This ensures single responsibility: all display logic is in this function,
  // not in the component. The component only needs to check for null.
  if (!description) return null;

  // 7. Return complete resolved message
  return {
    ...finalMessage,
    description,
  };
}
