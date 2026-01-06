import { useState } from 'react';

export interface Toast {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = ({ title, description, variant = 'default' }: Toast) => {
    const newToast = { title, description, variant };
    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t !== newToast));
    }, 3000);

    // Also show browser alert for immediate feedback
    if (variant === 'destructive') {
      alert(`Error: ${title}\n${description || ''}`);
    } else {
      console.log(`Success: ${title}`, description);
    }
  };

  return { toast, toasts };
}
