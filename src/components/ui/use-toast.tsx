"use client"

import * as React from "react"
import { Toast } from "./toast"

interface ToastOptions {
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
  duration?: number
}

interface ToastContextType {
  toast: (options: ToastOptions) => void
}

const ToastContext = React.createContext<ToastContextType | null>(null)

interface ToastItem extends ToastOptions {
  id: string
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])

  const toast = React.useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...options, id }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto-remove toast after duration (default 5 seconds)
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, options.duration || 5000)
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            title={toast.title}
            description={toast.description}
            variant={toast.variant}
            onClose={() => removeToast(toast.id)}
            className="animate-in slide-in-from-right-full fade-in-0 duration-300"
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Export for backwards compatibility
export { useToast as toast }
