/**
 * usePrevious Hook
 *
 * Returns the previous value of a state or prop.
 * Useful for comparing current vs previous values in effects.
 *
 * @example
 * ```tsx
 * const userType = watch('userType');
 * const prevUserType = usePrevious(userType);
 *
 * useEffect(() => {
 *   if (prevUserType && prevUserType !== userType) {
 *     // userType changed - do cleanup
 *   }
 * }, [userType, prevUserType]);
 * ```
 */

import { useEffect, useRef } from 'react';

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
