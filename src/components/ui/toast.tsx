"use client"

import * as React from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'success'
  title?: string
  description?: string
  onClose?: () => void
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = 'default', title, description, onClose, children, ...props }, ref) => {
    const variantClasses = {
      default: 'bg-white border-gray-200',
      destructive: 'bg-red-50 border-red-200',
      success: 'bg-green-50 border-green-200'
    }

    return (
      <div
        ref={ref}
        className={cn(
          "pointer-events-auto w-full max-w-sm rounded-lg border p-4 shadow-md",
          variantClasses[variant],
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 mr-3">
            {title && (
              <div className={cn(
                "text-sm font-semibold",
                variant === 'destructive' ? 'text-red-800' :
                variant === 'success' ? 'text-green-800' : 'text-gray-900'
              )}>
                {title}
              </div>
            )}
            {description && (
              <div className={cn(
                "text-sm mt-1",
                variant === 'destructive' ? 'text-red-700' :
                variant === 'success' ? 'text-green-700' : 'text-gray-600'
              )}>
                {description}
              </div>
            )}
            {children}
          </div>
          {onClose && (
            <button
              className={cn(
                "ml-auto h-4 w-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                variant === 'destructive' ? 'text-red-500 hover:text-red-700' :
                variant === 'success' ? 'text-green-500 hover:text-green-700' : 'text-gray-500 hover:text-gray-700'
              )}
              onClick={onClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          )}
        </div>
      </div>
    )
  }
)
Toast.displayName = "Toast"

export { Toast }
