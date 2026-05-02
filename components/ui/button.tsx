import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'danger'
  size?: 'default' | 'sm' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          {
            'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm': variant === 'default',
            'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500': variant === 'outline',
            'hover:bg-gray-100 text-gray-700 focus:ring-gray-500': variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm': variant === 'danger',
            'h-10 py-2 px-4 text-sm': size === 'default',
            'h-8 px-3 text-xs': size === 'sm',
            'h-12 px-8 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
