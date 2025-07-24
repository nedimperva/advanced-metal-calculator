// Comprehensive validation system for metal calculator
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface DimensionValidation extends ValidationResult {
  dimension: string
  value: number | null
  unit: string
}

// Error types for better error categorization
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  CALCULATION = 'CALCULATION',
  NETWORK = 'NETWORK',
  SYSTEM = 'SYSTEM',
  USER_INPUT = 'USER_INPUT',
}

// Interface for validation error details
export interface ValidationErrorDetails {
  field?: string
  value?: unknown
  constraint?: string
  expectedType?: string
  actualType?: string
  range?: { min?: number; max?: number }
}

// Interface for general error context
export interface ErrorContext {
  [key: string]: unknown
}

export interface StructuredError {
  type: ErrorType
  code: string
  message: string
  details?: ValidationErrorDetails | Record<string, unknown>
  timestamp: Date
  context?: ErrorContext
}

// Validation constants
export const VALIDATION_LIMITS = {
  dimensions: {
    min: 0.001, // 0.001 mm minimum
    max: 100000, // 100 meters maximum
  },
  length: {
    min: 0.1, // 0.1 mm minimum
    max: 1000000, // 1 km maximum
  },
  temperature: {
    min: -273.15, // Absolute zero
    max: 5000, // Reasonable maximum for metallurgy
  },
  density: {
    min: 0.1, // Very light materials
    max: 30, // Very heavy materials like tungsten
  },
}

// Dimension validation with engineering constraints
export function validateDimension(
  dimension: string,
  value: string | number,
  unit: string = 'mm',
  profileType?: string
): DimensionValidation {
  const errors: string[] = []
  const warnings: string[] = []
  let numValue: number | null = null

  // Basic type validation
  if (typeof value === 'string') {
    if (value.trim() === '') {
      errors.push(`${dimension} is required`)
      return { isValid: false, errors, warnings, dimension, value: null, unit }
    }
    
    numValue = Number.parseFloat(value)
    if (isNaN(numValue)) {
      errors.push(`${dimension} must be a valid number`)
      return { isValid: false, errors, warnings, dimension, value: null, unit }
    }
  } else {
    numValue = value
  }

  // Range validation
  if (numValue <= VALIDATION_LIMITS.dimensions.min) {
    errors.push(`${dimension} must be greater than ${VALIDATION_LIMITS.dimensions.min} ${unit}`)
  }

  if (numValue > VALIDATION_LIMITS.dimensions.max) {
    errors.push(`${dimension} cannot exceed ${VALIDATION_LIMITS.dimensions.max} ${unit}`)
  }

  // Engineering constraints based on dimension type
  if (dimension.toLowerCase().includes('thickness') || dimension === 't' || dimension === 'tw' || dimension === 'tf') {
    if (numValue < 0.5) {
      warnings.push(`${dimension} of ${numValue} ${unit} is very thin for structural applications`)
    }
    if (numValue > 100) {
      warnings.push(`${dimension} of ${numValue} ${unit} is unusually thick`)
    }
  }

  // Profile-specific validations
  if (profileType && numValue > 0) {
    const profileWarnings = validateProfileDimensions(profileType, dimension, numValue, unit)
    warnings.push(...profileWarnings)
  }

  // Precision warnings
  if (numValue < 1 && numValue.toString().split('.')[1]?.length > 3) {
    warnings.push(`High precision value for ${dimension} - consider rounding to 3 decimal places`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    dimension,
    value: numValue,
    unit,
  }
}

// Profile-specific dimension validation
function validateProfileDimensions(
  profileType: string,
  dimension: string,
  value: number,
  unit: string
): string[] {
  const warnings: string[] = []

  switch (profileType) {
    case 'hea':
    case 'heb':
    case 'ipn':
    case 'ipe':
      // I-beam specific validations
      if (dimension === 'h' && value < 80) {
        warnings.push('Height below 80mm may not be practical for structural I-beams')
      }
      if (dimension === 'b' && value < 50) {
        warnings.push('Flange width below 50mm may cause stability issues')
      }
      if (dimension === 'tw' && value < 3) {
        warnings.push('Web thickness below 3mm may be insufficient for structural loads')
      }
      break

    case 'upn':
    case 'unp':
      // U-channel specific validations
      if (dimension === 'h' && value < 50) {
        warnings.push('Channel height below 50mm is uncommon for structural applications')
      }
      break

    case 'round':
      if (dimension === 'diameter' && value > 500) {
        warnings.push('Large diameter rounds may require special handling')
      }
      break

    case 'rhs':
    case 'shs':
      // Hollow section validations
      if (dimension === 't' && value < 1.5) {
        warnings.push('Wall thickness below 1.5mm may be insufficient for structural hollow sections')
      }
      break
  }

  return warnings
}

// Temperature validation
export function validateTemperature(temperature: string | number): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  let tempValue: number
  if (typeof temperature === 'string') {
    if (temperature.trim() === '') {
      return { isValid: true, errors, warnings } // Optional field
    }
    tempValue = Number.parseFloat(temperature)
    if (isNaN(tempValue)) {
      errors.push('Temperature must be a valid number')
      return { isValid: false, errors, warnings }
    }
  } else {
    tempValue = temperature
  }

  // Range validation
  if (tempValue < VALIDATION_LIMITS.temperature.min) {
    errors.push(`Temperature cannot be below ${VALIDATION_LIMITS.temperature.min}°C (absolute zero)`)
  }

  if (tempValue > VALIDATION_LIMITS.temperature.max) {
    errors.push(`Temperature cannot exceed ${VALIDATION_LIMITS.temperature.max}°C`)
  }

  // Practical warnings
  if (tempValue < -200) {
    warnings.push('Cryogenic temperatures may significantly affect material properties')
  }

  if (tempValue > 1000) {
    warnings.push('High temperatures may cause material degradation')
  }

  if (tempValue < 0) {
    warnings.push('Sub-zero temperatures may affect material brittleness')
  }

  return { isValid: errors.length === 0, errors, warnings }
}

// Material compatibility validation
export function validateMaterialTemperature(
  materialName: string,
  temperature: number,
  meltingPoint: number
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check against melting point
  if (temperature >= meltingPoint) {
    errors.push(`Temperature (${temperature}°C) exceeds melting point of ${materialName} (${meltingPoint}°C)`)
  }

  // Material-specific warnings
  if (temperature > meltingPoint * 0.8) {
    warnings.push(`Temperature approaching melting point of ${materialName} - material properties may be significantly altered`)
  }

  // Steel-specific validations
  if (materialName.toLowerCase().includes('steel')) {
    if (temperature > 700) {
      warnings.push('High temperature may cause steel tempering and strength reduction')
    }
    if (temperature < -40) {
      warnings.push('Low temperature may increase steel brittleness')
    }
  }

  // Aluminum-specific validations
  if (materialName.toLowerCase().includes('aluminum')) {
    if (temperature > 300) {
      warnings.push('High temperature may cause aluminum annealing and strength loss')
    }
  }

  return { isValid: errors.length === 0, errors, warnings }
}

// Interface for material data
export interface MaterialData {
  name: string
  density: number
  meltingPoint: number
  thermalExpansion?: number
  yieldStrength?: number
  tensileStrength?: number
  type: string
}

// Comprehensive calculation validation
export function validateCalculationInputs(
  profileType: string,
  dimensions: Record<string, string>,
  length: string,
  materialData: MaterialData | null,
  temperature?: string
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Validate all dimensions
  const requiredDimensions = getRequiredDimensions(profileType)
  
  for (const dimension of requiredDimensions) {
    if (!dimensions[dimension] || dimensions[dimension].trim() === '') {
      errors.push(`${dimension} is required for ${profileType} profile`)
      continue
    }

    const dimValidation = validateDimension(dimension, dimensions[dimension], 'mm', profileType)
    if (!dimValidation.isValid) {
      errors.push(...dimValidation.errors)
    }
    warnings.push(...dimValidation.warnings)
  }

  // Validate length (skip for plates as they have length as a dimension)
  const isPlateProfile = ['plate', 'sheetMetal', 'checkeredPlate', 'perforatedPlate'].includes(profileType)
  
  if (!isPlateProfile) {
    if (!length || length.trim() === '') {
      errors.push('Length is required')
    } else {
      const lengthValidation = validateDimension('length', length, 'mm')
      if (!lengthValidation.isValid) {
        errors.push(...lengthValidation.errors)
      }
      warnings.push(...lengthValidation.warnings)
    }
  }

  // Validate material
  if (!materialData) {
    errors.push('Material selection is required')
  }

  // Validate temperature if provided
  if (temperature && temperature.trim() !== '') {
    const tempValidation = validateTemperature(temperature)
    if (!tempValidation.isValid) {
      errors.push(...tempValidation.errors)
    }
    warnings.push(...tempValidation.warnings)

    // Cross-validate temperature with material
    if (materialData && tempValidation.isValid) {
      const materialTempValidation = validateMaterialTemperature(
        materialData.name,
        Number.parseFloat(temperature),
        materialData.meltingPoint
      )
      if (!materialTempValidation.isValid) {
        errors.push(...materialTempValidation.errors)
      }
      warnings.push(...materialTempValidation.warnings)
    }
  }

  return { isValid: errors.length === 0, errors, warnings }
}

// Get required dimensions for profile type
function getRequiredDimensions(profileType: string): string[] {
  const dimensionMap: Record<string, string[]> = {
    rectangular: ['width', 'height'],
    round: ['diameter'],
    square: ['side'],
    flat: ['width', 'thickness'],
    hexagonal: ['distance'],
    ipn: ['h', 'b', 'tw', 'tf'],
    ipe: ['h', 'b', 'tw', 'tf'],
    hea: ['h', 'b', 'tw', 'tf'],
    heb: ['h', 'b', 'tw', 'tf'],
    hec: ['h', 'b', 'tw', 'tf'],
    wBeam: ['h', 'b', 'tw', 'tf'],
    upn: ['h', 'b', 'tw', 'tf'],
    unp: ['h', 'b', 'tw', 'tf'],
    uChannel: ['h', 'b', 'tw', 'tf'],
    equalAngle: ['a', 't'],
    unequalAngle: ['a', 'b', 't'],
    rhs: ['h', 'b', 't'],
    shs: ['a', 't'],
    chs: ['od', 't'],
    pipe: ['od', 'wt'],
    tBeam: ['h', 'b', 'tw', 'tf'],
    bulbFlat: ['h', 'b', 't'],
    halfRound: ['d', 't'],
    // Plates
    plate: ['length', 'width', 'thickness'],
    sheetMetal: ['length', 'width', 'thickness'],
    checkeredPlate: ['length', 'width', 'thickness'],
    perforatedPlate: ['length', 'width', 'thickness'],
  }

  return dimensionMap[profileType] || []
}

// Create structured error
export function createError(
  type: ErrorType,
  code: string,
  message: string,
  details?: ValidationErrorDetails | Record<string, unknown>,
  context?: ErrorContext
): StructuredError {
  return {
    type,
    code,
    message,
    details,
    context,
    timestamp: new Date(),
  }
}

// Error message formatter
export function formatErrorMessage(error: StructuredError): string {
  const typePrefix = error.type === ErrorType.VALIDATION ? '⚠️' : 
                    error.type === ErrorType.CALCULATION ? '🔢' :
                    error.type === ErrorType.NETWORK ? '🌐' :
                    error.type === ErrorType.SYSTEM ? '⚙️' : '❌'
  
  return `${typePrefix} ${error.message}`
}

// Batch validation for multiple inputs
export function validateBatch<T>(
  items: T[],
  validator: (item: T) => ValidationResult
): ValidationResult {
  const allErrors: string[] = []
  const allWarnings: string[] = []

  for (const item of items) {
    const result = validator(item)
    allErrors.push(...result.errors)
    allWarnings.push(...result.warnings)
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  }
} 