import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Calculation } from "./types"
import { LENGTH_UNITS } from "./unit-conversions"
import { STANDARD_SIZES } from "@/lib/metal-data"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format calculation name according to new convention:
 * Profile specification as main name, material as tag
 * Examples:
 * - "HEA 400 - 6000mm"
 * - "RHS 40x20x2 - 450mm"
 * - "L50x50x5 - 2000mm"
 */
export function formatCalculationName(calc: Calculation): { mainName: string; materialTag: string } {
  const { profileType, standardSize, dimensions, lengthUnit = 'mm' } = calc
  
  // Get length value and unit
  const lengthValue = dimensions.length || '1000'
  const lengthUnitName = lengthUnit
  
  let profileSpec = ""
  
  // Format based on profile type
  switch (profileType) {
    // European I-Beams
    case 'hea':
      if (standardSize && standardSize !== "Custom") {
        profileSpec = standardSize
      } else {
        // Find the closest standard size based on height
        const sizes = STANDARD_SIZES.hea
        const height = parseFloat(dimensions.h || '0')
        const closestSize = sizes.reduce((prev: typeof sizes[0], curr: typeof sizes[0]) => {
          const prevHeight = parseFloat(prev.dimensions.h)
          const currHeight = parseFloat(curr.dimensions.h)
          return Math.abs(currHeight - height) < Math.abs(prevHeight - height) ? curr : prev
        })
        profileSpec = closestSize.designation
      }
      break
    case 'heb':
      if (standardSize && standardSize !== "Custom") {
        profileSpec = `HEB ${standardSize.replace('HEB ', '')}`
      } else {
        const h = dimensions.h || '?'
        const b = dimensions.b || '?'
        profileSpec = `HEB ${h}x${b}`
      }
      break
    case 'hem':
      if (standardSize && standardSize !== "Custom") {
        profileSpec = `HEM ${standardSize.replace('HEM ', '')}`
      } else {
        const h = dimensions.h || '?'
        const b = dimensions.b || '?'
        profileSpec = `HEM ${h}x${b}`
      }
      break
    case 'ipe':
      if (standardSize && standardSize !== "Custom") {
        profileSpec = `IPE ${standardSize.replace('IPE ', '')}`
      } else {
        const h = dimensions.h || '?'
        const b = dimensions.b || '?'
        profileSpec = `IPE ${h}x${b}`
      }
      break
    case 'ipn':
      if (standardSize && standardSize !== "Custom") {
        profileSpec = `IPN ${standardSize.replace('IPN ', '')}`
      } else {
        const h = dimensions.h || '?'
        const b = dimensions.b || '?'
        profileSpec = `IPN ${h}x${b}`
      }
      break
    
    // Channels
    case 'upn':
      if (standardSize && standardSize !== "Custom") {
        profileSpec = `UPN ${standardSize.replace('UPN ', '')}`
      } else {
        const h = dimensions.h || '?'
        const b = dimensions.b || '?'
        profileSpec = `UPN ${h}x${b}`
      }
      break
    case 'upe':
      if (standardSize && standardSize !== "Custom") {
        profileSpec = `UPE ${standardSize.replace('UPE ', '')}`
      } else {
        const h = dimensions.h || '?'
        const b = dimensions.b || '?'
        profileSpec = `UPE ${h}x${b}`
      }
      break
    
    // Hollow sections
    case 'rhs':
      if (standardSize && standardSize !== "Custom") {
        profileSpec = `RHS ${standardSize.replace('RHS ', '')}`
      } else {
        const h = dimensions.h || '?'
        const b = dimensions.b || '?'
        const t = dimensions.t || '?'
        profileSpec = `RHS ${h}x${b}x${t}`
      }
      break
    case 'shs':
      if (standardSize && standardSize !== "Custom") {
        profileSpec = `SHS ${standardSize.replace('SHS ', '')}`
      } else {
        const a = dimensions.a || '?'
        const t = dimensions.t || '?'
        profileSpec = `SHS ${a}x${t}`
      }
      break
    case 'chs':
      if (standardSize && standardSize !== "Custom") {
        profileSpec = `CHS ${standardSize.replace('CHS ', '')}`
      } else {
        const od = dimensions.od || '?'
        const wt = dimensions.wt || '?'
        profileSpec = `CHS ${od}x${wt}`
      }
      break
    
    // Angles
    case 'equalAngle':
      if (standardSize && standardSize !== "Custom") {
        profileSpec = standardSize
      } else {
        const a = dimensions.a || '?'
        const t = dimensions.t || '?'
        profileSpec = `L${a}x${a}x${t}`
      }
      break
    case 'unequalAngle':
      if (standardSize && standardSize !== "Custom") {
        profileSpec = standardSize
      } else {
        const a = dimensions.a || '?'
        const b = dimensions.b || '?'
        const t = dimensions.t || '?'
        profileSpec = `L${a}x${b}x${t}`
      }
      break
    
    // Flat bars and plates
    case 'flatBar':
      if (standardSize && standardSize !== "Custom") {
        profileSpec = standardSize
      } else {
        const width = dimensions.b || dimensions.width || '?'
        const thickness = dimensions.t || dimensions.thickness || '?'
        profileSpec = `FLAT ${width}x${thickness}`
      }
      break
    case 'plate':
    case 'sheetMetal':
    case 'checkeredPlate':
    case 'perforatedPlate':
      if (standardSize && standardSize !== "Custom") {
        profileSpec = standardSize
      } else {
        const plateLength = dimensions.length || '?'
        const plateWidth = dimensions.width || '?'
        const plateThickness = dimensions.thickness || '?'
        const plateType = profileType === 'plate' ? 'PLATE' : 
                         profileType === 'sheetMetal' ? 'SHEET' :
                         profileType === 'checkeredPlate' ? 'CHECKER' : 'PERF'
        profileSpec = `${plateType} ${plateLength}x${plateWidth}x${plateThickness}`
      }
      break
    
    // Pipes
    case 'pipe':
      if (standardSize && standardSize !== "Custom") {
        profileSpec = standardSize
      } else {
        const diameter = dimensions.diameter || dimensions.od || '?'
        const wallThickness = dimensions.wt || dimensions.t || '?'
        profileSpec = `PIPE ${diameter}x${wallThickness}`
      }
      break
    
    // Round bars
    case 'roundBar':
      if (standardSize && standardSize !== "Custom") {
        profileSpec = standardSize
      } else {
        const roundDiameter = dimensions.diameter || dimensions.d || '?'
        profileSpec = `Ø${roundDiameter}`
      }
      break
    
    // Square bars
    case 'squareBar':
      if (standardSize && standardSize !== "Custom") {
        profileSpec = standardSize
      } else {
        const squareSide = dimensions.a || dimensions.side || '?'
        profileSpec = `SQ${squareSide}`
      }
      break
    
    // Hexagonal bars
    case 'hexBar':
      if (standardSize && standardSize !== "Custom") {
        profileSpec = standardSize
      } else {
        const hexDistance = dimensions.distance || dimensions.d || '?'
        profileSpec = `HEX${hexDistance}`
      }
      break
    
    // American W-Beams
    case 'wBeam':
      if (standardSize && standardSize !== "Custom") {
        profileSpec = standardSize
      } else {
        const h = dimensions.h || '?'
        const b = dimensions.b || '?'
        profileSpec = `W ${h}x${b}`
      }
      break
    
    // Default fallback
    default:
      profileSpec = standardSize || calc.profileName || profileType.toUpperCase()
  }
  
  // For plates, don't add length suffix since length is part of the dimension
  const isPlate = profileType === 'plate' || profileType === 'sheetMetal' || profileType === 'checkeredPlate' || profileType === 'perforatedPlate'
  
  const mainName = isPlate ? profileSpec : `${profileSpec} - ${lengthValue}${lengthUnitName}`
  const materialTag = calc.materialName
  
  return { mainName, materialTag }
}

/**
 * Get a short material tag from full material name
 */
export function getShortMaterialTag(materialName: string): string {
  // Common abbreviations
  const abbreviations: Record<string, string> = {
    'A36 Structural Steel': 'A36',
    'S355 Structural Steel': 'S355',
    'S275 Structural Steel': 'S275',
    'S235 Structural Steel': 'S235',
    '6061-T6 Aluminum': '6061-T6',
    '6063-T5 Aluminum': '6063-T5',
    '7075-T6 Aluminum': '7075-T6',
    '304 Stainless Steel': '304 SS',
    '316 Stainless Steel': '316 SS',
    '316L Stainless Steel': '316L SS',
    '420 Stainless Steel': '420 SS',
    'C1020 Carbon Steel': 'C1020',
    'C1045 Carbon Steel': 'C1045',
    'Grade 250 Copper': 'Cu250',
    'Phosphor Bronze': 'PB',
    'Silicon Bronze': 'SiB',
    'Yellow Brass': 'Brass',
    'Cast Iron': 'CI',
    'Ductile Iron': 'DI',
    'Titanium Grade 2': 'Ti-2',
    'Titanium Grade 5': 'Ti-5'
  }
  
  return abbreviations[materialName] || materialName.split(' ')[0]
}
