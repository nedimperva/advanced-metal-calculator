// Advanced structural engineering calculation engine
// Includes cross-sectional area, moment of inertia, section modulus, radius of gyration

export interface StructuralProperties {
  area: number               // Cross-sectional area (cm²)
  momentOfInertiaX: number   // Moment of inertia about X-axis (cm⁴)
  momentOfInertiaY: number   // Moment of inertia about Y-axis (cm⁴)
  sectionModulusX: number    // Section modulus about X-axis (cm³)
  sectionModulusY: number    // Section modulus about Y-axis (cm³)
  radiusOfGyrationX: number  // Radius of gyration about X-axis (cm)
  radiusOfGyrationY: number  // Radius of gyration about Y-axis (cm)
  centroidX: number          // X-coordinate of centroid (cm)
  centroidY: number          // Y-coordinate of centroid (cm)
  perimeter: number          // Perimeter (cm)
  weight: number             // Weight per unit length (kg/m)
  // Enhanced properties
  adjustedDensity?: number   // Temperature-adjusted density (g/cm³)
  operatingTemperature?: number // Operating temperature (°C)
}

// Temperature compensation for material properties
export function adjustDensityForTemperature(
  baseDensity: number,
  temperatureCoefficient: number | undefined,
  operatingTemperature: number,
  referenceTemperature: number = 20
): number {
  if (!temperatureCoefficient) return baseDensity
  
  const temperatureDelta = operatingTemperature - referenceTemperature
  return baseDensity * (1 + temperatureCoefficient * temperatureDelta)
}

// Enhanced calculation function with temperature effects
export function calculateStructuralPropertiesWithTemperature(
  profileType: string,
  dimensions: Record<string, string>,
  density: number,
  lengthFactor: number,
  operatingTemperature?: number,
  temperatureCoefficient?: number,
): StructuralProperties {
  // Calculate temperature-adjusted density
  const adjustedDensity = operatingTemperature !== undefined
    ? adjustDensityForTemperature(density, temperatureCoefficient, operatingTemperature)
    : density

  // Use adjusted density for calculations
  const properties = calculateStructuralProperties(profileType, dimensions, adjustedDensity, lengthFactor)
  
  // Add temperature information to results
  return {
    ...properties,
    adjustedDensity,
    operatingTemperature,
  }
}

export function calculateStructuralProperties(
  profileType: string,
  dimensions: Record<string, string>,
  density: number,
  lengthFactor: number,
): StructuralProperties {
  const dims = Object.fromEntries(
    Object.entries(dimensions).map(([key, value]) => [key, Number.parseFloat(value) * lengthFactor]),
  )

  try {
    switch (profileType) {
      // Basic shapes
      case "rectangular":
        return calculateRectangularProperties(dims, density)
      case "round":
        return calculateRoundProperties(dims, density)
      case "square":
        return calculateSquareProperties(dims, density)
      case "flat":
        return calculateFlatProperties(dims, density)
      case "hexagonal":
        return calculateHexagonalProperties(dims, density)

      // European I-Beams and H-Beams
      case "ipn":
      case "ipe":
      case "hea":
      case "heb":
      case "hec":
      case "wBeam":
        return calculateIBeamProperties(dims, density)

      // European U-Channels and American C-Channels
      case "upn":
      case "unp":
      case "uChannel":
        return calculateChannelProperties(dims, density)

      // Equal and Unequal Angles
      case "equalAngle":
        return calculateEqualAngleProperties(dims, density)
      case "unequalAngle":
        return calculateUnequalAngleProperties(dims, density)

      // Hollow Sections
      case "rhs":
        return calculateRHSProperties(dims, density)
      case "shs":
        return calculateSHSProperties(dims, density)
      case "chs":
        return calculateCHSProperties(dims, density)
      case "pipe":
        return calculatePipeProperties(dims, density)

      // Special Sections
      case "tBeam":
        return calculateTBeamProperties(dims, density)
      case "bulbFlat":
        return calculateBulbFlatProperties(dims, density)
      case "halfRound":
        return calculateHalfRoundProperties(dims, density)

      default:
        return getEmptyProperties()
    }
  } catch (error) {
    return getEmptyProperties()
  }
}

// Helper function for empty properties
function getEmptyProperties(): StructuralProperties {
  return {
    area: 0,
    momentOfInertiaX: 0,
    momentOfInertiaY: 0,
    sectionModulusX: 0,
    sectionModulusY: 0,
    radiusOfGyrationX: 0,
    radiusOfGyrationY: 0,
    centroidX: 0,
    centroidY: 0,
    perimeter: 0,
    weight: 0,
  }
}

// Rectangular bar calculations
function calculateRectangularProperties(dims: Record<string, number>, density: number): StructuralProperties {
  if (!dims.length || !dims.width || !dims.height) return getEmptyProperties()

  const b = dims.width  // width
  const h = dims.height // height
  const area = b * h
  const ix = (b * Math.pow(h, 3)) / 12
  const iy = (h * Math.pow(b, 3)) / 12
  const sx = ix / (h / 2)
  const sy = iy / (b / 2)
  const rx = Math.sqrt(ix / area)
  const ry = Math.sqrt(iy / area)
  const perimeter = 2 * (b + h)
  const weight = area * density / 1000

  return {
    area, momentOfInertiaX: ix, momentOfInertiaY: iy, sectionModulusX: sx, sectionModulusY: sy,
    radiusOfGyrationX: rx, radiusOfGyrationY: ry, centroidX: b / 2, centroidY: h / 2, perimeter, weight,
  }
}

// Round bar calculations
function calculateRoundProperties(dims: Record<string, number>, density: number): StructuralProperties {
  if (!dims.diameter) return getEmptyProperties()

  const d = dims.diameter
  const r = d / 2
  const area = Math.PI * Math.pow(r, 2)
  const i = (Math.PI * Math.pow(d, 4)) / 64
  const s = i / r
  const rg = Math.sqrt(i / area)
  const perimeter = Math.PI * d
  const weight = area * density / 1000

  return {
    area, momentOfInertiaX: i, momentOfInertiaY: i, sectionModulusX: s, sectionModulusY: s,
    radiusOfGyrationX: rg, radiusOfGyrationY: rg, centroidX: r, centroidY: r, perimeter, weight,
  }
}

// Square bar calculations
function calculateSquareProperties(dims: Record<string, number>, density: number): StructuralProperties {
  if (!dims.side) return getEmptyProperties()

  const a = dims.side
  const area = Math.pow(a, 2)
  const i = (Math.pow(a, 4)) / 12
  const s = i / (a / 2)
  const rg = Math.sqrt(i / area)
  const perimeter = 4 * a
  const weight = area * density / 1000

  return {
    area, momentOfInertiaX: i, momentOfInertiaY: i, sectionModulusX: s, sectionModulusY: s,
    radiusOfGyrationX: rg, radiusOfGyrationY: rg, centroidX: a / 2, centroidY: a / 2, perimeter, weight,
  }
}

// Flat bar calculations
function calculateFlatProperties(dims: Record<string, number>, density: number): StructuralProperties {
  if (!dims.width || !dims.thickness) return getEmptyProperties()

  const b = dims.width
  const t = dims.thickness
  const area = b * t
  const ix = (b * Math.pow(t, 3)) / 12
  const iy = (t * Math.pow(b, 3)) / 12
  const sx = ix / (t / 2)
  const sy = iy / (b / 2)
  const rx = Math.sqrt(ix / area)
  const ry = Math.sqrt(iy / area)
  const perimeter = 2 * (b + t)
  const weight = area * density / 1000

  return {
    area, momentOfInertiaX: ix, momentOfInertiaY: iy, sectionModulusX: sx, sectionModulusY: sy,
    radiusOfGyrationX: rx, radiusOfGyrationY: ry, centroidX: b / 2, centroidY: t / 2, perimeter, weight,
  }
}

// Hexagonal bar calculations
function calculateHexagonalProperties(dims: Record<string, number>, density: number): StructuralProperties {
  if (!dims.distance) return getEmptyProperties()

  const s = dims.distance / 2 // Side length from across flats
  const area = (3 * Math.sqrt(3) / 2) * Math.pow(s, 2)
  const i = (5 * Math.sqrt(3) / 16) * Math.pow(s, 4)
  const sectionModulus = i / (Math.sqrt(3) * s / 2)
  const rg = Math.sqrt(i / area)
  const perimeter = 6 * s
  const weight = area * density / 1000

  return {
    area, momentOfInertiaX: i, momentOfInertiaY: i, sectionModulusX: sectionModulus, sectionModulusY: sectionModulus,
    radiusOfGyrationX: rg, radiusOfGyrationY: rg, centroidX: s, centroidY: s, perimeter, weight,
  }
}

// I-Beam calculations (European and American)
function calculateIBeamProperties(dims: Record<string, number>, density: number): StructuralProperties {
  if (!dims.h || !dims.b || !dims.tw || !dims.tf) return getEmptyProperties()

  const h = dims.h   // Total height
  const b = dims.b   // Flange width
  const tw = dims.tw // Web thickness
  const tf = dims.tf // Flange thickness

  // Cross-sectional area
  const area = 2 * b * tf + (h - 2 * tf) * tw

  // Moment of inertia about X-axis (strong axis)
  const ix = (b * Math.pow(h, 3)) / 12 - ((b - tw) * Math.pow(h - 2 * tf, 3)) / 12

  // Moment of inertia about Y-axis (weak axis)
  const iy = (2 * tf * Math.pow(b, 3)) / 12

  // Section modulus
  const sx = ix / (h / 2)
  const sy = iy / (b / 2)

  // Radius of gyration
  const rx = Math.sqrt(ix / area)
  const ry = Math.sqrt(iy / area)

  // Perimeter (approximate)
  const perimeter = 2 * b + 2 * (h - 2 * tf) + 4 * tf

  // Weight per unit length (kg/m)
  const weight = area * density / 1000

  return {
    area, momentOfInertiaX: ix, momentOfInertiaY: iy, sectionModulusX: sx, sectionModulusY: sy,
    radiusOfGyrationX: rx, radiusOfGyrationY: ry, centroidX: b / 2, centroidY: h / 2, perimeter, weight,
  }
}

// Channel calculations (European UNP and American C-Channel)
function calculateChannelProperties(dims: Record<string, number>, density: number): StructuralProperties {
  if (!dims.h || !dims.b || !dims.tw || !dims.tf) return getEmptyProperties()

  const h = dims.h   // Height
  const b = dims.b   // Flange width
  const tw = dims.tw // Web thickness
  const tf = dims.tf // Flange thickness

  // Cross-sectional area
  const area = b * tf + (h - tf) * tw

  // Moment of inertia about X-axis
  const ix = (tw * Math.pow(h, 3)) / 12 + (b - tw) * tf * Math.pow(h - tf / 2, 2)

  // Moment of inertia about Y-axis
  const iy = (tf * Math.pow(b, 3)) / 12

  // Section modulus
  const sx = ix / (h / 2)
  const sy = iy / (b / 2)

  // Radius of gyration
  const rx = Math.sqrt(ix / area)
  const ry = Math.sqrt(iy / area)

  // Perimeter
  const perimeter = 2 * h + 2 * b - tw

  // Weight per unit length
  const weight = area * density / 1000

  return {
    area, momentOfInertiaX: ix, momentOfInertiaY: iy, sectionModulusX: sx, sectionModulusY: sy,
    radiusOfGyrationX: rx, radiusOfGyrationY: ry, centroidX: b / 2, centroidY: h / 2, perimeter, weight,
  }
}

// Equal angle calculations
function calculateEqualAngleProperties(dims: Record<string, number>, density: number): StructuralProperties {
  if (!dims.a || !dims.t) return getEmptyProperties()

  const a = dims.a // Leg length
  const t = dims.t // Thickness

  // Cross-sectional area
  const area = (2 * a - t) * t

  // Moment of inertia (equal legs)
  const i = (t * (Math.pow(a, 4) - Math.pow(a - t, 4))) / 12

  // Section modulus (to extreme fiber)
  const s = i / (a / Math.sqrt(2))

  // Radius of gyration
  const rg = Math.sqrt(i / area)

  // Perimeter
  const perimeter = 2 * a - 2 * t

  // Weight per unit length
  const weight = area * density / 1000

  return {
    area, momentOfInertiaX: i, momentOfInertiaY: i, sectionModulusX: s, sectionModulusY: s,
    radiusOfGyrationX: rg, radiusOfGyrationY: rg, centroidX: a / 2, centroidY: a / 2, perimeter, weight,
  }
}

// Unequal angle calculations
function calculateUnequalAngleProperties(dims: Record<string, number>, density: number): StructuralProperties {
  if (!dims.a || !dims.b || !dims.t) return getEmptyProperties()

  const a = dims.a // Longer leg
  const b = dims.b // Shorter leg
  const t = dims.t // Thickness

  // Cross-sectional area
  const area = (a + b - t) * t

  // Simplified calculations
  const ix = (t * (Math.pow(a, 4) - Math.pow(a - t, 4))) / 12
  const iy = (t * (Math.pow(b, 4) - Math.pow(b - t, 4))) / 12

  const sx = ix / (a / 2)
  const sy = iy / (b / 2)

  const rx = Math.sqrt(ix / area)
  const ry = Math.sqrt(iy / area)

  // Perimeter
  const perimeter = a + b - 2 * t

  // Weight per unit length
  const weight = area * density / 1000

  return {
    area, momentOfInertiaX: ix, momentOfInertiaY: iy, sectionModulusX: sx, sectionModulusY: sy,
    radiusOfGyrationX: rx, radiusOfGyrationY: ry, centroidX: b / 2, centroidY: a / 2, perimeter, weight,
  }
}

// Rectangular Hollow Section calculations
function calculateRHSProperties(dims: Record<string, number>, density: number): StructuralProperties {
  if (!dims.h || !dims.b || !dims.t) return getEmptyProperties()

  const h = dims.h // Height
  const b = dims.b // Width
  const t = dims.t // Wall thickness

  // Cross-sectional area
  const area = h * b - (h - 2 * t) * (b - 2 * t)

  // Moment of inertia
  const ix = (b * Math.pow(h, 3) - (b - 2 * t) * Math.pow(h - 2 * t, 3)) / 12
  const iy = (h * Math.pow(b, 3) - (h - 2 * t) * Math.pow(b - 2 * t, 3)) / 12

  // Section modulus
  const sx = ix / (h / 2)
  const sy = iy / (b / 2)

  // Radius of gyration
  const rx = Math.sqrt(ix / area)
  const ry = Math.sqrt(iy / area)

  // Perimeter (external)
  const perimeter = 2 * (h + b)

  // Weight per unit length
  const weight = area * density / 1000

  return {
    area, momentOfInertiaX: ix, momentOfInertiaY: iy, sectionModulusX: sx, sectionModulusY: sy,
    radiusOfGyrationX: rx, radiusOfGyrationY: ry, centroidX: b / 2, centroidY: h / 2, perimeter, weight,
  }
}

// Square Hollow Section calculations
function calculateSHSProperties(dims: Record<string, number>, density: number): StructuralProperties {
  if (!dims.a || !dims.t) return getEmptyProperties()

  const a = dims.a // Side length
  const t = dims.t // Wall thickness

  // Cross-sectional area
  const area = Math.pow(a, 2) - Math.pow(a - 2 * t, 2)

  // Moment of inertia (equal for both axes)
  const i = (Math.pow(a, 4) - Math.pow(a - 2 * t, 4)) / 12

  // Section modulus
  const s = i / (a / 2)

  // Radius of gyration
  const rg = Math.sqrt(i / area)

  // Perimeter
  const perimeter = 4 * a

  // Weight per unit length
  const weight = area * density / 1000

  return {
    area, momentOfInertiaX: i, momentOfInertiaY: i, sectionModulusX: s, sectionModulusY: s,
    radiusOfGyrationX: rg, radiusOfGyrationY: rg, centroidX: a / 2, centroidY: a / 2, perimeter, weight,
  }
}

// Circular Hollow Section calculations
function calculateCHSProperties(dims: Record<string, number>, density: number): StructuralProperties {
  if (!dims.od || !dims.t) return getEmptyProperties()

  const od = dims.od // Outer diameter
  const t = dims.t   // Wall thickness
  const id = od - 2 * t // Inner diameter

  // Cross-sectional area
  const area = Math.PI * (Math.pow(od / 2, 2) - Math.pow(id / 2, 2))

  // Moment of inertia (equal for both axes)
  const i = (Math.PI / 64) * (Math.pow(od, 4) - Math.pow(id, 4))

  // Section modulus
  const s = i / (od / 2)

  // Radius of gyration
  const rg = Math.sqrt(i / area)

  // Perimeter
  const perimeter = Math.PI * od

  // Weight per unit length
  const weight = area * density / 1000

  return {
    area, momentOfInertiaX: i, momentOfInertiaY: i, sectionModulusX: s, sectionModulusY: s,
    radiusOfGyrationX: rg, radiusOfGyrationY: rg, centroidX: od / 2, centroidY: od / 2, perimeter, weight,
  }
}

// Pipe calculations
function calculatePipeProperties(dims: Record<string, number>, density: number): StructuralProperties {
  if (!dims.od || !dims.wt) return getEmptyProperties()

  const od = dims.od // Outer diameter
  const wt = dims.wt // Wall thickness

  return calculateCHSProperties({ od, t: wt }, density)
}

// T-Beam calculations
function calculateTBeamProperties(dims: Record<string, number>, density: number): StructuralProperties {
  if (!dims.h || !dims.b || !dims.tw || !dims.tf) return getEmptyProperties()

  const h = dims.h   // Total height
  const b = dims.b   // Flange width
  const tw = dims.tw // Web thickness
  const tf = dims.tf // Flange thickness

  // Cross-sectional area
  const area = b * tf + (h - tf) * tw

  // Centroid calculation
  const y1 = tf / 2 // Flange centroid
  const a1 = b * tf // Flange area
  const y2 = tf + (h - tf) / 2 // Web centroid
  const a2 = (h - tf) * tw // Web area

  const yc = (a1 * y1 + a2 * y2) / area

  // Moment of inertia about centroid
  const i1 = (b * Math.pow(tf, 3)) / 12 + a1 * Math.pow(y1 - yc, 2)
  const i2 = (tw * Math.pow(h - tf, 3)) / 12 + a2 * Math.pow(y2 - yc, 2)
  const ix = i1 + i2

  const iy = (tf * Math.pow(b, 3)) / 12 + (Math.pow(tw, 3) * (h - tf)) / 12

  // Section modulus
  const sx = ix / Math.max(yc, h - yc)
  const sy = iy / (b / 2)

  // Radius of gyration
  const rx = Math.sqrt(ix / area)
  const ry = Math.sqrt(iy / area)

  // Perimeter
  const perimeter = 2 * b + 2 * (h - tf) + tw

  // Weight per unit length
  const weight = area * density / 1000

  return {
    area, momentOfInertiaX: ix, momentOfInertiaY: iy, sectionModulusX: sx, sectionModulusY: sy,
    radiusOfGyrationX: rx, radiusOfGyrationY: ry, centroidX: b / 2, centroidY: yc, perimeter, weight,
  }
}

// Bulb flat calculations (simplified)
function calculateBulbFlatProperties(dims: Record<string, number>, density: number): StructuralProperties {
  if (!dims.h || !dims.b || !dims.t) return getEmptyProperties()

  // Simplified as rectangular + circular approximation
  const area = dims.h * dims.t + Math.PI * Math.pow(dims.b / 2, 2) / 2

  // Simplified calculations
  const ix = (dims.t * Math.pow(dims.h, 3)) / 12
  const iy = (dims.h * Math.pow(dims.t, 3)) / 12

  const sx = ix / (dims.h / 2)
  const sy = iy / (dims.t / 2)

  const rx = Math.sqrt(ix / area)
  const ry = Math.sqrt(iy / area)

  const perimeter = 2 * dims.h + dims.t + Math.PI * dims.b / 2
  const weight = area * density / 1000

  return {
    area, momentOfInertiaX: ix, momentOfInertiaY: iy, sectionModulusX: sx, sectionModulusY: sy,
    radiusOfGyrationX: rx, radiusOfGyrationY: ry, centroidX: dims.t / 2, centroidY: dims.h / 2, perimeter, weight,
  }
}

// Half round calculations
function calculateHalfRoundProperties(dims: Record<string, number>, density: number): StructuralProperties {
  if (!dims.d || !dims.t) return getEmptyProperties()

  const d = dims.d
  const t = dims.t

  // Simplified area calculation for half-round profile
  const area = (Math.PI * d * t) / 2

  // Simplified moment calculations
  const i = (Math.PI * d * Math.pow(t, 3)) / 8
  const s = i / (t / 2)
  const rg = Math.sqrt(i / area)

  const perimeter = Math.PI * d / 2 + d
  const weight = area * density / 1000

  return {
    area, momentOfInertiaX: i, momentOfInertiaY: i / 2, sectionModulusX: s, sectionModulusY: s / 2,
    radiusOfGyrationX: rg, radiusOfGyrationY: rg / Math.sqrt(2), centroidX: d / 2, centroidY: t / 2, perimeter, weight,
  }
}

// Legacy functions for backward compatibility
export function calculateCrossSectionalArea(
  profileType: string,
  dimensions: Record<string, string>,
  lengthFactor: number,
): number {
  const properties = calculateStructuralProperties(profileType, dimensions, 7.85, lengthFactor)
  return properties.area
}

export function calculateWeight(
  profileType: string,
  dimensions: Record<string, string>,
  length: number,
  density: number,
  lengthFactor: number,
  weightFactor: number,
): number {
  try {
    const area = calculateCrossSectionalArea(profileType, dimensions, lengthFactor)
    if (area > 0 && length > 0) {
      const volume = area * (length * lengthFactor)
      return volume * density * weightFactor
    }
    return 0
  } catch (error) {
    return 0
  }
}

// ===== ADVANCED STRUCTURAL ANALYSIS FUNCTIONS =====

export interface BucklingAnalysis {
  eulerCriticalLoad: number      // Euler buckling load (N)
  slendernessRatio: number       // L/r ratio
  effectiveLength: number        // Effective length (cm)
  bucklingMode: 'elastic' | 'inelastic' | 'short'
  safetyFactor: number          // Recommended safety factor
  allowableLoad: number         // Safe design load (N)
  comments: string[]
}

export interface LoadCapacity {
  tensileCapacity: number        // Ultimate tensile capacity (N)
  compressiveCapacity: number    // Ultimate compressive capacity (N) 
  flexuralCapacity: number      // Bending moment capacity (N⋅m)
  shearCapacity: number         // Shear force capacity (N)
  yieldStrength: number         // Material yield strength (MPa)
  ultimateStrength: number      // Material ultimate strength (MPa)
  designCapacity: number        // Safe design capacity with factors (N)
}

export interface StressAnalysis {
  axialStress: number           // Axial stress (MPa)
  bendingStressX: number        // Bending stress about X-axis (MPa)
  bendingStressY: number        // Bending stress about Y-axis (MPa)
  shearStress: number          // Shear stress (MPa)
  vonMisesStress: number       // Equivalent von Mises stress (MPa)
  safetyFactor: number         // Factor of safety
  isWithinLimits: boolean      // Whether stress is within allowable limits
}

export interface DeflectionAnalysis {
  maxDeflection: number        // Maximum deflection (mm)
  deflectionRatio: number      // L/deflection ratio
  isAcceptable: boolean        // Whether deflection is within limits
  allowableDeflection: number  // Code-based allowable deflection (mm)
}

/**
 * Perform Euler buckling analysis for compression members
 */
export function calculateBucklingAnalysis(
  structuralProperties: StructuralProperties,
  length: number, // Member length in cm
  endConditions: 'pinned' | 'fixed' | 'fixed-pinned' | 'cantilever' = 'pinned',
  elasticModulus: number = 200000, // MPa (typical for steel)
  yieldStrength: number = 250 // MPa
): BucklingAnalysis {
  // End condition factors (K values)
  const endConditionFactors = {
    'pinned': 1.0,           // Pin-pin
    'fixed': 0.5,            // Fixed-fixed
    'fixed-pinned': 0.7,     // Fixed-pin
    'cantilever': 2.0        // Fixed-free
  }

  const K = endConditionFactors[endConditions]
  const effectiveLength = K * length

  // Use minimum radius of gyration for most critical buckling
  const minRadiusOfGyration = Math.min(
    structuralProperties.radiusOfGyrationX,
    structuralProperties.radiusOfGyrationY
  )

  const slendernessRatio = effectiveLength / minRadiusOfGyration

  // Euler critical load (N)
  // Pe = π²EI/Le² = π²EA/λ² where λ = Le/r
  const eulerCriticalLoad = (Math.PI ** 2 * elasticModulus * structuralProperties.area * 100) / (slendernessRatio ** 2)

  // Determine buckling mode and safety factor
  let bucklingMode: 'elastic' | 'inelastic' | 'short'
  let safetyFactor: number
  let comments: string[] = []

  if (slendernessRatio > 120) {
    bucklingMode = 'elastic'
    safetyFactor = 2.5
    comments.push('Long column - elastic buckling governs')
    comments.push('Euler formula applies')
  } else if (slendernessRatio > 40) {
    bucklingMode = 'inelastic'
    safetyFactor = 2.0
    comments.push('Intermediate column - inelastic buckling')
    comments.push('Johnson formula recommended for accurate analysis')
  } else {
    bucklingMode = 'short'
    safetyFactor = 1.8
    comments.push('Short column - material yielding governs')
    comments.push('Buckling unlikely, check material strength')
  }

  const allowableLoad = eulerCriticalLoad / safetyFactor

  return {
    eulerCriticalLoad,
    slendernessRatio,
    effectiveLength,
    bucklingMode,
    safetyFactor,
    allowableLoad,
    comments
  }
}

/**
 * Calculate load capacities for different loading conditions
 */
export function calculateLoadCapacity(
  structuralProperties: StructuralProperties,
  yieldStrength: number = 250, // MPa
  ultimateStrength: number = 400, // MPa
  safetyFactorTension: number = 1.67,
  safetyFactorCompression: number = 1.92,
  safetyFactorBending: number = 1.67
): LoadCapacity {
  // Convert area from cm² to mm²
  const areaInMm2 = structuralProperties.area * 100

  // Tensile capacity (based on yield strength)
  const tensileCapacity = yieldStrength * areaInMm2

  // Compressive capacity (simplified - actual depends on buckling)
  const compressiveCapacity = yieldStrength * areaInMm2

  // Flexural capacity (plastic moment capacity)
  // Mp = fy * Z, where Z is plastic section modulus
  // Approximating plastic modulus as 1.1 * elastic modulus for common shapes
  const plasticModulusX = structuralProperties.sectionModulusX * 1.1
  const flexuralCapacity = yieldStrength * plasticModulusX * 1000 // Convert to N⋅mm

  // Shear capacity (simplified)
  // V = 0.6 * fy * Aweb (for I-beams, use area/2 as approximation)
  const shearCapacity = 0.6 * yieldStrength * (areaInMm2 / 2)

  // Design capacity (most conservative)
  const designCapacity = Math.min(
    tensileCapacity / safetyFactorTension,
    compressiveCapacity / safetyFactorCompression
  )

  return {
    tensileCapacity,
    compressiveCapacity,
    flexuralCapacity,
    shearCapacity,
    yieldStrength,
    ultimateStrength,
    designCapacity
  }
}

/**
 * Perform stress analysis for combined loading
 */
export function calculateStressAnalysis(
  structuralProperties: StructuralProperties,
  axialForce: number = 0,    // N (tension positive)
  momentX: number = 0,       // N⋅m about X-axis
  momentY: number = 0,       // N⋅m about Y-axis
  shearForce: number = 0,    // N
  yieldStrength: number = 250 // MPa
): StressAnalysis {
  // Convert area from cm² to mm²
  const areaInMm2 = structuralProperties.area * 100
  
  // Convert section moduli from cm³ to mm³
  const sectionModulusXInMm3 = structuralProperties.sectionModulusX * 1000
  const sectionModulusYInMm3 = structuralProperties.sectionModulusY * 1000

  // Axial stress (MPa)
  const axialStress = axialForce / areaInMm2

  // Bending stresses (MPa)
  const bendingStressX = (momentX * 1000) / sectionModulusXInMm3 // Convert N⋅m to N⋅mm
  const bendingStressY = (momentY * 1000) / sectionModulusYInMm3

  // Shear stress (simplified, MPa)
  const shearStress = shearForce / areaInMm2

  // Combined normal stress
  const combinedNormalStress = Math.abs(axialStress) + Math.abs(bendingStressX) + Math.abs(bendingStressY)

  // Von Mises stress (simplified for combined normal and shear)
  const vonMisesStress = Math.sqrt(combinedNormalStress ** 2 + 3 * (shearStress ** 2))

  // Safety factor
  const safetyFactor = yieldStrength / vonMisesStress

  // Check if within limits (safety factor > 1.5 typically required)
  const isWithinLimits = safetyFactor >= 1.5

  return {
    axialStress,
    bendingStressX,
    bendingStressY,
    shearStress,
    vonMisesStress,
    safetyFactor,
    isWithinLimits
  }
}

/**
 * Calculate deflection for simply supported beam under uniform load
 */
export function calculateDeflectionAnalysis(
  structuralProperties: StructuralProperties,
  length: number,              // Beam length in cm
  uniformLoad: number = 0,     // Uniform load in N/cm
  pointLoad: number = 0,       // Point load at center in N
  elasticModulus: number = 200000, // MPa
  deflectionLimit: number = 250    // L/deflectionLimit (typical L/250)
): DeflectionAnalysis {
  // Convert moment of inertia from cm⁴ to mm⁴
  const momentOfInertiaInMm4 = structuralProperties.momentOfInertiaX * 10000

  // Convert length to mm
  const lengthInMm = length * 10

  // Maximum deflection calculations (mm)
  let maxDeflection = 0

  // Uniform load deflection: δ = 5wL⁴/(384EI)
  if (uniformLoad > 0) {
    const uniformLoadInNPerMm = uniformLoad / 10 // Convert N/cm to N/mm
    const uniformLoadDeflection = (5 * uniformLoadInNPerMm * (lengthInMm ** 4)) / 
                                 (384 * elasticModulus * momentOfInertiaInMm4)
    maxDeflection += uniformLoadDeflection
  }

  // Point load deflection: δ = PL³/(48EI)
  if (pointLoad > 0) {
    const pointLoadDeflection = (pointLoad * (lengthInMm ** 3)) / 
                               (48 * elasticModulus * momentOfInertiaInMm4)
    maxDeflection += pointLoadDeflection
  }

  // Allowable deflection
  const allowableDeflection = lengthInMm / deflectionLimit

  // Deflection ratio
  const deflectionRatio = lengthInMm / maxDeflection

  // Check if acceptable
  const isAcceptable = maxDeflection <= allowableDeflection

  return {
    maxDeflection,
    deflectionRatio,
    isAcceptable,
    allowableDeflection
  }
}

/**
 * Comprehensive structural analysis combining all methods
 */
export function performComprehensiveAnalysis(
  structuralProperties: StructuralProperties,
  analysisParameters: {
    length: number               // Member length (cm)
    yieldStrength?: number       // Material yield strength (MPa)
    ultimateStrength?: number    // Material ultimate strength (MPa)
    elasticModulus?: number      // Elastic modulus (MPa)
    endConditions?: 'pinned' | 'fixed' | 'fixed-pinned' | 'cantilever'
    
    // Loading conditions
    axialForce?: number          // Axial force (N)
    momentX?: number             // Moment about X-axis (N⋅m)
    momentY?: number             // Moment about Y-axis (N⋅m)
    shearForce?: number          // Shear force (N)
    uniformLoad?: number         // Uniform load (N/cm)
    pointLoad?: number           // Point load (N)
  }
) {
  const {
    length,
    yieldStrength = 250,
    ultimateStrength = 400,
    elasticModulus = 200000,
    endConditions = 'pinned',
    axialForce = 0,
    momentX = 0,
    momentY = 0,
    shearForce = 0,
    uniformLoad = 0,
    pointLoad = 0
  } = analysisParameters

  const bucklingAnalysis = calculateBucklingAnalysis(
    structuralProperties, length, endConditions, elasticModulus, yieldStrength
  )

  const loadCapacity = calculateLoadCapacity(
    structuralProperties, yieldStrength, ultimateStrength
  )

  const stressAnalysis = calculateStressAnalysis(
    structuralProperties, axialForce, momentX, momentY, shearForce, yieldStrength
  )

  const deflectionAnalysis = calculateDeflectionAnalysis(
    structuralProperties, length, uniformLoad, pointLoad, elasticModulus
  )

  return {
    structuralProperties,
    bucklingAnalysis,
    loadCapacity,
    stressAnalysis,
    deflectionAnalysis
  }
} 