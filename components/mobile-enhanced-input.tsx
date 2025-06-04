import React, { useRef, useState, useCallback, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Plus, Minus, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileEnhancedInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  unit?: string
  dimension?: string
  helperText?: string
  step?: number
  min?: number
  max?: number
  precision?: number
  suggestions?: number[]
  disabled?: boolean
  className?: string
}

export function MobileEnhancedInput({
  label,
  value,
  onChange,
  placeholder,
  unit,
  dimension,
  helperText,
  step = 1,
  min,
  max,
  precision = 2,
  suggestions = [],
  disabled = false,
  className
}: MobileEnhancedInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [isGestureMode, setIsGestureMode] = useState(false)

  const numericValue = parseFloat(value) || 0

  const handleIncrement = useCallback(() => {
    const newValue = Math.min(numericValue + step, max ?? Number.MAX_SAFE_INTEGER)
    onChange(newValue.toFixed(precision))
  }, [numericValue, step, max, precision, onChange])

  const handleDecrement = useCallback(() => {
    const newValue = Math.max(numericValue - step, min ?? 0)
    onChange(newValue.toFixed(precision))
  }, [numericValue, step, min, precision, onChange])

  const handleReset = useCallback(() => {
    onChange('0')
  }, [onChange])

  const handleSuggestion = useCallback((suggestion: number) => {
    onChange(suggestion.toString())
  }, [onChange])

  // Touch gesture handling
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return
    const touch = e.touches[0]
    setTouchStart({ x: touch.clientX, y: touch.clientY })
    setIsGestureMode(false)
  }, [disabled])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart || disabled) return
    
    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStart.x
    const deltaY = touch.clientY - touchStart.y
    
    // Detect horizontal swipe (more than 30px movement)
    if (Math.abs(deltaX) > 30 && Math.abs(deltaY) < 20) {
      setIsGestureMode(true)
      e.preventDefault() // Prevent scrolling
      
      // Right swipe = increment, Left swipe = decrement
      if (deltaX > 0) {
        handleIncrement()
      } else {
        handleDecrement()
      }
      
      setTouchStart({ x: touch.clientX, y: touch.clientY }) // Reset for continuous gesture
    }
  }, [touchStart, disabled, handleIncrement, handleDecrement])

  const handleTouchEnd = useCallback(() => {
    setTouchStart(null)
    setTimeout(() => setIsGestureMode(false), 100)
  }, [])

  // Focus management for mobile keyboards
  const handleFocus = useCallback(() => {
    setIsFocused(true)
    if (inputRef.current) {
      // Ensure numeric keyboard on mobile
      inputRef.current.inputMode = 'decimal'
      inputRef.current.pattern = '[0-9]*'
    }
  }, [])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
  }, [])

  // Simplify value change handling for better responsiveness
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
  }, [onChange])

  // Format value display
  const formatValue = useCallback((val: string) => {
    const num = parseFloat(val)
    if (isNaN(num)) return val
    return num.toFixed(precision)
  }, [precision])

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium flex items-center justify-between">
        {label}
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </Label>
      
      <div className="relative">
        {/* Main Input */}
        <div 
          className={cn(
            "relative flex items-center border rounded-md bg-background transition-colors",
            isFocused && "ring-2 ring-primary ring-offset-2",
            isGestureMode && "bg-primary/5 border-primary",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Decrement Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDecrement}
            disabled={disabled || (min !== undefined && numericValue <= min)}
            className="h-8 w-8 p-0 rounded-l-md rounded-r-none border-r"
          >
            <Minus className="h-3 w-3" />
          </Button>

          {/* Input Field */}
          <Input
            ref={inputRef}
            type="number"
            value={value}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className="border-0 rounded-none text-center font-mono focus-visible:ring-0 focus-visible:ring-offset-0"
            inputMode="decimal"
            pattern="[0-9]*"
            step={step}
            min={min}
            max={max}
          />

          {/* Increment Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleIncrement}
            disabled={disabled || (max !== undefined && numericValue >= max)}
            className="h-8 w-8 p-0 rounded-r-md rounded-l-none border-l"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {/* Gesture Indicator */}
        {isGestureMode && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
              Swipe ← → to adjust
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {(suggestions.length > 0 || !disabled) && (
        <div className="flex items-center gap-2 flex-wrap">
          {/* Reset Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={disabled}
            className="h-6 px-2 text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>

          {/* Suggestion Buttons */}
          {suggestions.slice(0, 4).map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              onClick={() => handleSuggestion(suggestion)}
              disabled={disabled}
              className="h-6 px-2 text-xs"
            >
              {suggestion}{unit && <span className="ml-1 text-muted-foreground">{unit}</span>}
            </Button>
          ))}
        </div>
      )}

      {/* Touch Instructions */}
      {isFocused && !disabled && (
        <div className="text-xs text-muted-foreground text-center">
          Swipe left/right to adjust • Tap +/- buttons • Type directly
        </div>
      )}
    </div>
  )
}

// Preset hook for common dimension suggestions
export function useDimensionSuggestions(profileType: string, dimensionKey: string): number[] {
  return React.useMemo(() => {
    const suggestions: Record<string, Record<string, number[]>> = {
      // I-Beam suggestions
      hea: {
        height: [100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300],
        width: [100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300],
        web_thickness: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        flange_thickness: [8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28]
      },
      heb: {
        height: [100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300],
        width: [100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300],
        web_thickness: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
        flange_thickness: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
      },
      // Rectangular suggestions
      rectangular: {
        width: [10, 15, 20, 25, 30, 40, 50, 60, 80, 100],
        height: [10, 15, 20, 25, 30, 40, 50, 60, 80, 100],
        length: [1000, 2000, 3000, 4000, 5000, 6000]
      },
      // Round suggestions
      round: {
        diameter: [6, 8, 10, 12, 16, 20, 25, 30, 35, 40, 50],
        length: [1000, 2000, 3000, 4000, 5000, 6000]
      },
      // Angle suggestions
      equalAngle: {
        leg: [20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100],
        thickness: [3, 4, 5, 6, 7, 8, 9, 10, 12, 15]
      }
    }

    return suggestions[profileType]?.[dimensionKey] || []
  }, [profileType, dimensionKey])
} 