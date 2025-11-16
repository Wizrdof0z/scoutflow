import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'followup' | 'monitoring' | 'notgood' | 'discuss' | 'muted'
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: "bg-primary text-primary-foreground",
      followup: "bg-followup text-followup-foreground",
      monitoring: "bg-monitoring text-monitoring-foreground",
      notgood: "bg-notgood text-notgood-foreground",
      discuss: "bg-discuss text-discuss-foreground",
      muted: "bg-muted text-muted-foreground",
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-calm",
          variants[variant],
          className
        )}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
