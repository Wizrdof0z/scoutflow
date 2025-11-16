import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'accent' | 'followup' | 'monitoring' | 'notgood' | 'discuss' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-calm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none"
    
    const variants = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      accent: "bg-accent text-accent-foreground hover:bg-accent/80",
      followup: "bg-followup text-followup-foreground hover:bg-followup/90",
      monitoring: "bg-monitoring text-monitoring-foreground hover:bg-monitoring/90",
      notgood: "bg-notgood text-notgood-foreground hover:bg-notgood/90",
      discuss: "bg-discuss text-discuss-foreground hover:bg-discuss/90",
      ghost: "hover:bg-accent/20 hover:text-accent-foreground",
      outline: "border-2 border-border bg-transparent hover:bg-accent/10",
    }
    
    const sizes = {
      default: "h-10 py-2 px-4 text-base",
      sm: "h-8 px-3 text-sm",
      lg: "h-12 px-8 text-lg",
    }
    
    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
