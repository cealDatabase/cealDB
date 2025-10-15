"use client";

import { useEffect, useState } from "react";

interface LocalDateTimeProps {
  dateString: string;
  className?: string;
  dateOnly?: boolean; // If true, shows only the date without time
}

export function LocalDateTime({ dateString, className, dateOnly = false }: LocalDateTimeProps) {
  const [localTime, setLocalTime] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Only run on client side to avoid hydration mismatch
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        setLocalTime('Invalid date');
        setIsLoaded(true);
        return;
      }
      
      // Format with UTC timezone
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        timeZone: 'UTC',
      };
      
      // Add time components if not dateOnly
      if (!dateOnly) {
        options.hour = 'numeric';
        options.minute = '2-digit';
        options.second = '2-digit';
        options.hour12 = true;
        options.timeZoneName = 'short';
      }
      
      const formatted = date.toLocaleString('en-US', options);
      
      setLocalTime(formatted);
      setIsLoaded(true);
    } catch (error) {
      console.error('Error formatting date:', error);
      setLocalTime('Invalid date');
      setIsLoaded(true);
    }
  }, [dateString, dateOnly]);

  // Show a placeholder during SSR/hydration to avoid mismatch
  if (!isLoaded) {
    return <span className={className}>Loading...</span>;
  }

  return <span className={className}>{localTime}</span>;
}
