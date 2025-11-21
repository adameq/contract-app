/**
 * Example usage of usePEPFieldsContext for performance optimization
 *
 * This file demonstrates how to use the PEPFieldsContext in custom
 * components that need to skip expensive operations when hidden.
 *
 * CURRENT STATE: PEP fields use simple Input components without expensive logic.
 * This example is for FUTURE REFERENCE when complex components are needed.
 */

import { useEffect, useState } from 'react';

import { usePEPFieldsContext } from './hooks/usePEPFieldsContext';

/**
 * Example 1: Custom field with API data fetching
 *
 * This component skips data fetching when hidden, improving performance.
 */
export function PEPFieldWithDataFetching({ fieldName }: { fieldName: string }) {
  const { isHidden } = usePEPFieldsContext();
  const [data, setData] = useState<string[]>([]);

  useEffect(() => {
    // Skip expensive API call when fields are hidden
    if (isHidden) {
      console.log(`Skipping fetch for ${fieldName} - field is hidden`);
      return;
    }

    console.log(`Fetching data for ${fieldName}...`);

    // Simulated API call
    const fetchData = async () => {
      const response = await fetch(`/api/pep-data/${fieldName}`);
      const result = await response.json();
      setData(result);
    };

    void fetchData();
  }, [isHidden, fieldName]);

  return (
    <div>
      <label>{fieldName}</label>
      <select>
        {data.map(item => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Example 2: Custom field with expensive computation
 *
 * This component skips heavy calculations when hidden.
 */
export function PEPFieldWithComputation() {
  const { isHidden } = usePEPFieldsContext();
  const [result, setResult] = useState(0);

  useEffect(() => {
    // Skip expensive computation when hidden
    if (isHidden) {
      console.log('Skipping computation - field is hidden');
      return;
    }

    console.log('Running expensive computation...');

    // Simulated expensive operation
    const timer = setInterval(() => {
      setResult(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isHidden]);

  return (
    <div>
      <label>Computed Value: {result}</label>
    </div>
  );
}

/**
 * Example 3: Custom field with WebSocket subscription
 *
 * This component manages WebSocket connections based on visibility.
 */
export function PEPFieldWithWebSocket() {
  const { isHidden } = usePEPFieldsContext();
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    // Don't connect to WebSocket when hidden
    if (isHidden) {
      console.log('Skipping WebSocket connection - field is hidden');
      return;
    }

    console.log('Connecting to WebSocket...');

    const ws = new WebSocket('wss://example.com/pep-updates');

    ws.onmessage = event => {
      setMessages(prev => [...prev, event.data]);
    };

    return () => {
      console.log('Closing WebSocket connection');
      ws.close();
    };
  }, [isHidden]);

  return (
    <div>
      <label>Live Updates:</label>
      <ul>
        {messages.map((msg, i) => (
          <li key={i}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Example 4: Conditional validation based on visibility
 *
 * This component adjusts validation logic when hidden.
 */
export function PEPFieldWithConditionalValidation() {
  const { isHidden } = usePEPFieldsContext();

  useEffect(() => {
    if (isHidden) {
      console.log('Field hidden - validation suspended');
      return;
    }

    console.log('Field visible - validation active');

    // Setup complex validation listeners
    // e.g., debounced async validation against external API
  }, [isHidden]);

  return (
    <input
      type="text"
      placeholder="Complex validated field"
      // Validation logic that respects isHidden state
    />
  );
}

/**
 * HOW TO USE IN PRODUCTION:
 *
 * 1. Import the hook in your custom component:
 *    ```tsx
 *    import { usePEPFieldsContext } from '@/features/contract-form/components/hooks/usePEPFieldsContext';
 *    ```
 *
 * 2. Use the hook to access hidden state:
 *    ```tsx
 *    const { isHidden } = usePEPFieldsContext();
 *    ```
 *
 * 3. Guard expensive operations:
 *    ```tsx
 *    useEffect(() => {
 *      if (isHidden) return; // Skip when hidden
 *      // ... expensive logic
 *    }, [isHidden]);
 *    ```
 *
 * 4. Use your component in PEPSection:
 *    ```tsx
 *    <PEPQuestion {...props}>
 *      <YourCustomComponent />
 *    </PEPQuestion>
 *    ```
 *
 * The component automatically receives context from PEPQuestion!
 */
