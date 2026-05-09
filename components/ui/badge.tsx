import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantClasses = {
    default: "border-transparent bg-emerald-600 text-white shadow hover:bg-emerald-700",
    secondary: "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200",
    destructive: "border-transparent bg-red-500 text-white shadow hover:bg-red-600",
    success: "border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
    warning: "border-transparent bg-amber-100 text-amber-800 hover:bg-amber-200",
    outline: "text-slate-900",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
