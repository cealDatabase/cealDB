"use client";

import { useEffect, useState } from "react";

interface LocalDateTimeProps {
  dateString: string;
  className?: string;
}

export function LocalDateTime({ dateString, className }: LocalDateTimeProps) {
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
      
      // Format with user's local timezone - show timezone abbreviation
      const formatted = date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZoneName: 'short'
      });
      
      setLocalTime(formatted);
      setIsLoaded(true);
    } catch (error) {
      console.error('Error formatting date:', error);
      setLocalTime('Invalid date');
      setIsLoaded(true);
    }
  }, [dateString]);

  // Show a placeholder during SSR/hydration to avoid mismatch
  if (!isLoaded) {
    return <span className={className}>Loading...</span>;
  }

  return <span className={className}>{localTime}</span>;
}
