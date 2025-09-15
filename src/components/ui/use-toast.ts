import * as React from "react"

interface ToastProps {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

// Simple toast implementation for now
export const toast = ({ title, description, variant = 'default' }: ToastProps) => {
  // In a real implementation, this would use a toast library or context
  // For now, we'll use browser alert as fallback
  const message = description ? `${title}: ${description}` : title;
  
  if (variant === 'destructive') {
    console.error(message);
    alert(`Fehler: ${message}`);
  } else {
    console.log(message);
    alert(`Erfolg: ${message}`);
  }
};

// Hook for consistent usage
import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

interface ToastState {
  toasts: Toast[];
}

export function useToast() {
  const [state, setState] = useState<ToastState>({ toasts: [] });

  const toast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    const newToast = { ...toast, id };
    
    setState((prev) => ({
      toasts: [...prev.toasts, newToast]
    }));

    // Auto remove after 5 seconds
    setTimeout(() => {
      setState((prev) => ({
        toasts: prev.toasts.filter(t => t.id !== id)
      }));
    }, 5000);
  }, []);

  return {
    toast,
    toasts: state.toasts
  };
}
