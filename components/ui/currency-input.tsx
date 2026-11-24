"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: number
  onChange?: (value: number) => void
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, disabled, value = 0, onChange, onBlur, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState<string>("")
    const [isFocused, setIsFocused] = React.useState(false)

    // Format number to display with 2 decimal places
    const formatValue = (num: number): string => {
      if (isNaN(num) || num === 0) return ""
      return num.toFixed(2)
    }

    // Parse display value to number, rounded to 2 decimal places
    const parseValue = (str: string): number => {
      const cleaned = str.replace(/[^0-9.]/g, '')
      const parsed = parseFloat(cleaned)
      if (isNaN(parsed)) return 0
      // Round to 2 decimal places to avoid floating point precision issues
      return Math.round(parsed * 100) / 100
    }

    // Update display value when external value changes (on mount or data load)
    React.useEffect(() => {
      if (!isFocused) {
        setDisplayValue(formatValue(value || 0))
      }
    }, [value, isFocused])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value

      // Remove any non-numeric characters except decimal point
      inputValue = inputValue.replace(/[^0-9.]/g, '')

      // Prevent multiple decimal points
      const decimalCount = (inputValue.match(/\./g) || []).length
      if (decimalCount > 1) {
        return
      }

      // Limit to 2 decimal places
      const parts = inputValue.split('.')
      if (parts[1] && parts[1].length > 2) {
        inputValue = `${parts[0]}.${parts[1].slice(0, 2)}`
      }

      setDisplayValue(inputValue)
      
      // Only call onChange with valid numbers
      const numericValue = parseValue(inputValue)
      onChange?.(numericValue)
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      // Select all text on focus for easy editing
      e.target.select()
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      
      // Format the value with 2 decimal places on blur
      const numericValue = parseValue(displayValue)
      setDisplayValue(formatValue(numericValue))
      
      // Call parent onBlur if provided
      onBlur?.(e)
    }

    return (
      <div className="relative flex items-center">
        {/* Dollar sign prefix */}
        <div
          className={cn(
            "absolute left-3 text-gray-500 pointer-events-none select-none font-medium",
            disabled && "opacity-50"
          )}
        >
          $
        </div>
        
        {/* Input field */}
        <input
          type="text"
          inputMode="decimal"
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm ring-offset-background",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder="0.00"
          {...props}
        />
      </div>
    )
  }
)

CurrencyInput.displayName = "CurrencyInput"

export { CurrencyInput }
