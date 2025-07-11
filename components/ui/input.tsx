import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

// UnitInput component with unit display inside the input
interface UnitInputProps extends Omit<React.ComponentProps<"input">, "type"> {
  unit?: string
  unitPosition?: "left" | "right"
}

const UnitInput = React.forwardRef<HTMLInputElement, UnitInputProps>(
  ({ className, unit, unitPosition = "right", ...props }, ref) => {
    return (
      <div className="relative">
        <input
          type="number"
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            unit && unitPosition === "right" && "pr-12",
            unit && unitPosition === "left" && "pl-12",
            !unit && "px-3",
            className
          )}
          style={{
            paddingLeft: unit && unitPosition === "left" ? "3rem" : "0.75rem",
            paddingRight: unit && unitPosition === "right" ? "3rem" : "0.75rem",
          }}
          ref={ref}
          {...props}
        />
        {unit && (
          <div 
            className={cn(
              "absolute top-0 bottom-0 flex items-center justify-center pointer-events-none text-sm text-muted-foreground font-medium",
              unitPosition === "right" && "right-3",
              unitPosition === "left" && "left-3"
            )}
          >
            {unit}
          </div>
        )}
      </div>
    )
  }
)
UnitInput.displayName = "UnitInput"

export { Input, UnitInput }
