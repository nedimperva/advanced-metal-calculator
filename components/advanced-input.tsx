"use client"

import React, { useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { 
  Hash,
  Zap,
  MoreHorizontal,
  Copy
} from "lucide-react"
import { cn } from "@/lib/utils"
import { EnhancedInput } from "@/components/enhanced-input"

// Define the interface locally to avoid circular imports
interface EnhancedInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  unit?: string
  type?: "text" | "number"
  required?: boolean
  disabled?: boolean
  isLoading?: boolean
  profileType?: string
  dimension?: string
  min?: number
  max?: number
  step?: number
  helperText?: string
  autoComplete?: string
  className?: string
  onValidation?: (isValid: boolean, errors: string[], warnings: string[]) => void
  showValidationIcons?: boolean
  validateOnChange?: boolean
  debounceMs?: number
}

// Fraction parsing utility
export function parseFraction(input: string): number | null {
  if (!input || typeof input !== 'string') return null
  
  const trimmed = input.trim()
  
  // Handle whole numbers
  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    return parseFloat(trimmed)
  }
  
  // Handle simple fractions (1/2, 3/4, etc.)
  const simpleFraction = trimmed.match(/^(\d+)\/(\d+)$/)
  if (simpleFraction) {
    const numerator = parseInt(simpleFraction[1])
    const denominator = parseInt(simpleFraction[2])
    return denominator !== 0 ? numerator / denominator : null
  }
  
  // Handle mixed fractions (1 1/2, 2 3/4, etc.)
  const mixedFraction = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)$/)
  if (mixedFraction) {
    const whole = parseInt(mixedFraction[1])
    const numerator = parseInt(mixedFraction[2])
    const denominator = parseInt(mixedFraction[3])
    return denominator !== 0 ? whole + (numerator / denominator) : null
  }
  
  return null
}

// Common dimension presets for different profile types
export const DIMENSION_PRESETS = {
  hea: {
    name: "HEA European I-Beams",
    presets: [
      { name: "HEA 100", h: 96, b: 100, tw: 5, tf: 8 },
      { name: "HEA 120", h: 114, b: 120, tw: 5, tf: 8 },
      { name: "HEA 140", h: 133, b: 140, tw: 5.5, tf: 8.5 },
      { name: "HEA 160", h: 152, b: 160, tw: 6, tf: 9 },
      { name: "HEA 180", h: 171, b: 180, tw: 6, tf: 9.5 },
      { name: "HEA 200", h: 190, b: 200, tw: 6.5, tf: 10 },
      { name: "HEA 220", h: 210, b: 220, tw: 7, tf: 11 },
      { name: "HEA 240", h: 230, b: 240, tw: 7.5, tf: 12 },
      { name: "HEA 260", h: 250, b: 260, tw: 7.5, tf: 12.5 },
      { name: "HEA 280", h: 270, b: 280, tw: 8, tf: 13 },
      { name: "HEA 300", h: 290, b: 300, tw: 8.5, tf: 14 }
    ]
  },
  heb: {
    name: "HEB European I-Beams",
    presets: [
      { name: "HEB 100", h: 100, b: 100, tw: 6, tf: 10 },
      { name: "HEB 120", h: 120, b: 120, tw: 6.5, tf: 11 },
      { name: "HEB 140", h: 140, b: 140, tw: 7, tf: 12 },
      { name: "HEB 160", h: 160, b: 160, tw: 8, tf: 13 },
      { name: "HEB 180", h: 180, b: 180, tw: 8.5, tf: 14 },
      { name: "HEB 200", h: 200, b: 200, tw: 9, tf: 15 },
      { name: "HEB 220", h: 220, b: 220, tw: 9.5, tf: 16 },
      { name: "HEB 240", h: 240, b: 240, tw: 10, tf: 17 },
      { name: "HEB 260", h: 260, b: 260, tw: 10, tf: 17.5 },
      { name: "HEB 280", h: 280, b: 280, tw: 10.5, tf: 18 },
      { name: "HEB 300", h: 300, b: 300, tw: 11, tf: 19 }
    ]
  },
  rectangular: {
    name: "Rectangular Bars",
    presets: [
      { name: "10x20mm", width: 10, height: 20 },
      { name: "15x30mm", width: 15, height: 30 },
      { name: "20x40mm", width: 20, height: 40 },
      { name: "25x50mm", width: 25, height: 50 },
      { name: "30x60mm", width: 30, height: 60 },
      { name: "40x80mm", width: 40, height: 80 },
      { name: "50x100mm", width: 50, height: 100 }
    ]
  },
  round: {
    name: "Round Bars",
    presets: [
      { name: "6mm", diameter: 6 },
      { name: "8mm", diameter: 8 },
      { name: "10mm", diameter: 10 },
      { name: "12mm", diameter: 12 },
      { name: "16mm", diameter: 16 },
      { name: "20mm", diameter: 20 },
      { name: "25mm", diameter: 25 },
      { name: "30mm", diameter: 30 },
      { name: "40mm", diameter: 40 },
      { name: "50mm", diameter: 50 }
    ]
  },
  equalAngle: {
    name: "Equal Angles",
    presets: [
      { name: "L20x3", a: 20, t: 3 },
      { name: "L25x3", a: 25, t: 3 },
      { name: "L30x3", a: 30, t: 3 },
      { name: "L40x4", a: 40, t: 4 },
      { name: "L50x5", a: 50, t: 5 },
      { name: "L60x6", a: 60, t: 6 },
      { name: "L80x8", a: 80, t: 8 },
      { name: "L100x10", a: 100, t: 10 }
    ]
  }
}

// Smart dimension suggestions based on current values
export function getSmartSuggestions(
  profileType: string, 
  dimensionKey: string, 
  currentValue: string,
  allDimensions: Record<string, string>
): number[] {
  const suggestions: number[] = []
  const currentNum = parseFloat(currentValue) || 0
  
  // Get preset suggestions for this profile type
  const presets = DIMENSION_PRESETS[profileType as keyof typeof DIMENSION_PRESETS]
  if (presets) {
    const values = presets.presets
      .map(preset => {
        const value = preset[dimensionKey as keyof typeof preset]
        return typeof value === 'number' ? value : undefined
      })
      .filter((val): val is number => typeof val === 'number' && val !== currentNum)
      .slice(0, 5)
    suggestions.push(...values)
  }
  
  // Add increment/decrement suggestions based on current value
  if (currentNum > 0) {
    const increments = [0.5, 1, 2, 5, 10].map(inc => currentNum + inc)
    const decrements = [0.5, 1, 2, 5, 10]
      .map(dec => currentNum - dec)
      .filter(val => val > 0)
    
    suggestions.push(...increments.slice(0, 2), ...decrements.slice(0, 2))
  }
  
  // Add common fractional values
  if (dimensionKey.includes('thickness') || dimensionKey === 't' || dimensionKey === 'tw' || dimensionKey === 'tf') {
    suggestions.push(3, 4, 5, 6, 8, 10, 12, 15, 20)
  }
  
  // Remove duplicates and sort
  return [...new Set(suggestions)].sort((a, b) => a - b).slice(0, 8)
}

// Enhanced input with fraction support
interface FractionInputProps extends Omit<EnhancedInputProps, 'onChange'> {
  onChange: (value: string) => void
  supportsFractions?: boolean
  showPresets?: boolean
  showSuggestions?: boolean
  allDimensions?: Record<string, string>
  onCopyFromProfile?: (dimensions: Record<string, number>) => void
}

export function FractionInput({
  value,
  onChange,
  supportsFractions = true,
  showPresets = true,
  showSuggestions = true,
  allDimensions = {},
  onCopyFromProfile,
  profileType,
  dimension,
  ...props
}: FractionInputProps) {
  const [showFractionHelper, setShowFractionHelper] = useState(false)
  const [rawValue, setRawValue] = useState(value)

  // Handle fraction input
  const handleFractionInput = useCallback((input: string) => {
    setRawValue(input)
    
    if (supportsFractions) {
      const parsed = parseFraction(input)
      if (parsed !== null) {
        onChange(parsed.toString())
        return
      }
    }
    
    onChange(input)
  }, [onChange, supportsFractions])

  // Get smart suggestions for this dimension
  const suggestions = useMemo(() => {
    if (!showSuggestions || !profileType || !dimension) return []
    return getSmartSuggestions(profileType, dimension, value, allDimensions)
  }, [showSuggestions, profileType, dimension, value, allDimensions])

  // Get presets for current profile type
  const presets = useMemo(() => {
    if (!showPresets || !profileType) return null
    return DIMENSION_PRESETS[profileType as keyof typeof DIMENSION_PRESETS]
  }, [showPresets, profileType])

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <EnhancedInput
            {...props}
            value={rawValue}
            onChange={handleFractionInput}
            dimension={dimension}
            profileType={profileType}
          />
        </div>
        
        {/* Advanced input controls */}
        <div className="flex gap-1">
          {/* Fraction helper */}
          {supportsFractions && (
            <Popover open={showFractionHelper} onOpenChange={setShowFractionHelper}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  <Hash className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="end">
                <div className="space-y-3">
                  <div className="text-sm font-medium">Fraction Helper</div>
                  <div className="space-y-2 text-xs">
                    <div>Examples:</div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => {
                          handleFractionInput("1/2")
                          setShowFractionHelper(false)
                        }}
                      >
                        1/2 = 0.5
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => {
                          handleFractionInput("3/4")
                          setShowFractionHelper(false)
                        }}
                      >
                        3/4 = 0.75
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => {
                          handleFractionInput("1 1/2")
                          setShowFractionHelper(false)
                        }}
                      >
                        1 1/2 = 1.5
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => {
                          handleFractionInput("2 3/4")
                          setShowFractionHelper(false)
                        }}
                      >
                        2 3/4 = 2.75
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Smart suggestions */}
          {suggestions.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  <Zap className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="end">
                <div className="space-y-3">
                  <div className="text-sm font-medium">Smart Suggestions</div>
                  <div className="grid grid-cols-4 gap-1">
                    {suggestions.map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => {
                          onChange(suggestion.toString())
                          setRawValue(suggestion.toString())
                        }}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Dimension presets */}
          {presets && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-3">
                  <div className="text-sm font-medium">{presets.name}</div>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {presets.presets.map((preset) => (
                      <div
                        key={preset.name}
                        className="flex items-center justify-between p-2 rounded border hover:bg-muted cursor-pointer"
                        onClick={() => {
                          if (onCopyFromProfile) {
                            // Convert string-based preset to numbers
                            const numericPreset: Record<string, number> = {}
                            Object.entries(preset).forEach(([key, value]) => {
                              if (key !== 'name' && typeof value === 'number') {
                                numericPreset[key] = value
                              }
                            })
                            onCopyFromProfile(numericPreset)
                          }
                        }}
                      >
                        <div className="text-sm font-medium">{preset.name}</div>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </div>
  )
}

// Dimension presets component
interface DimensionPresetsProps {
  profileType: string
  onApplyPreset: (dimensions: Record<string, number>) => void
  className?: string
}

export function DimensionPresets({ profileType, onApplyPreset, className }: DimensionPresetsProps) {
  const presets = DIMENSION_PRESETS[profileType as keyof typeof DIMENSION_PRESETS]
  
  if (!presets) return null

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">{presets.name}</h3>
            <Badge variant="outline">{presets.presets.length} presets</Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {presets.presets.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => {
                  // Convert preset to numeric values
                  const numericPreset: Record<string, number> = {}
                  Object.entries(preset).forEach(([key, value]) => {
                    if (key !== 'name' && typeof value === 'number') {
                      numericPreset[key] = value
                    }
                  })
                  onApplyPreset(numericPreset)
                }}
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Smart suggestions component
interface SmartSuggestionsProps {
  profileType: string
  dimensionKey: string
  currentValue: string
  allDimensions: Record<string, string>
  onSelectSuggestion: (value: string) => void
  className?: string
}

export function SmartSuggestions({
  profileType,
  dimensionKey,
  currentValue,
  allDimensions,
  onSelectSuggestion,
  className
}: SmartSuggestionsProps) {
  const suggestions = getSmartSuggestions(profileType, dimensionKey, currentValue, allDimensions)
  
  if (suggestions.length === 0) return null

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {suggestions.map((suggestion) => (
        <Button
          key={suggestion}
          variant="outline"
          size="sm"
          className="h-6 text-xs"
          onClick={() => onSelectSuggestion(suggestion.toString())}
        >
          {suggestion}
        </Button>
      ))}
    </div>
  )
} 