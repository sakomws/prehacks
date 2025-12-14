import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  children: React.ReactNode
  asChild?: boolean
  href?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, asChild, href, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none no-underline"
    
    const variants = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95",
      secondary: "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 shadow-sm hover:shadow-md",
      outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
      ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
    }
    
    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-sm",
      lg: "px-8 py-4 text-base"
    }
    
    const classes = cn(baseStyles, variants[variant], sizes[size], className)
    
    if (href) {
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      )
    }
    
    return (
      <button
        className={classes}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
