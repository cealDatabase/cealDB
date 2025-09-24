// hooks/useAutoSequenceFix.ts
'use client';

import { useEffect, useState } from 'react';

interface SequenceFixResult {
  success: boolean;
  message?: string;
  error?: string;
}

export function useAutoSequenceFix(enabled: boolean = true) {
  const [isFixing, setIsFixing] = useState(false);
  const [lastResult, setLastResult] = useState<SequenceFixResult | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const fixSequences = async () => {
      // Only run once per page load
      if (isFixing || lastResult) return;
      
      setIsFixing(true);
      
      try {
        console.log("🔧 Auto-fixing sequences before form load...");
        
        const response = await fetch('/api/fix-sequences', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();
        
        if (result.success) {
          console.log(`✅ Sequences fixed: ${result.message}`);
          setLastResult({ success: true, message: result.message });
        } else {
          console.error("❌ Sequence fix failed:", result.error);
          setLastResult({ success: false, error: result.error });
        }
      } catch (error) {
        console.error("❌ Auto sequence fix error:", error);
        setLastResult({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      } finally {
        setIsFixing(false);
      }
    };

    // Small delay to ensure page is loaded
    const timeoutId = setTimeout(fixSequences, 100);
    
    return () => clearTimeout(timeoutId);
  }, [enabled, isFixing, lastResult]);

  return {
    isFixing,
    lastResult,
    hasRun: !!lastResult
  };
}
