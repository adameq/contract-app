/**
 * Schema Index - Centralized Schema Exports
 *
 * Re-exports all schemas and types from the modular schema files.
 * This allows imports like `from '../schema'` to continue working.
 *
 * **Architecture:**
 * - sharedSchema: SharedFormData fields (signature, personal, correspondence, PEP, userType)
 * - companySchemas: Company-specific data (CompanyFormData, ConsumerVatFormData, FinalContractData)
 * - fieldSchemas: Individual field validators (reusable across schemas)
 *
 * **Migration:**
 * This file replaces the monolithic schema.ts discriminated union approach
 * with a cleaner, more maintainable modular structure using Zustand for state.
 */

// Re-export everything from shared schema
export * from './sharedSchema';

// Re-export everything from company schemas
export * from './companySchemas';

// Re-export everything from field schemas
export * from './fieldSchemas';
