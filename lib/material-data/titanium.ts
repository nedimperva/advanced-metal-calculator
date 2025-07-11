import { MaterialCategory } from './types'

export const TITANIUM_MATERIALS: MaterialCategory = {
  name: "Titanium & Alloys",
  grades: {
    grade2: { 
      name: "Grade 2 Pure Titanium", 
      density: 4.51, 
      color: "bg-purple-500",
      yieldStrength: 275,
      tensileStrength: 345,
      elasticModulus: 103,
      poissonRatio: 0.34,
      hardness: "80 HRB",
      thermalExpansion: 8.6,
      thermalConductivity: 17,
      specificHeat: 523,
      meltingPoint: 1668,
      relativeCost: 5,
      availability: 'fair' as const,
      standards: ["ASTM B265", "AMS 4902"],
      applications: ["Chemical processing", "Medical implants", "Marine"],
      temperatureCoefficient: -0.0003
    },
    grade5: {
      name: "Grade 5 Ti-6Al-4V",
      density: 4.43,
      color: "bg-purple-600",
      yieldStrength: 880,
      tensileStrength: 950,
      elasticModulus: 114,
      poissonRatio: 0.34,
      hardness: "36 HRC",
      thermalExpansion: 8.6,
      thermalConductivity: 6.7,
      specificHeat: 560,
      meltingPoint: 1604,
      relativeCost: 5,
      availability: 'fair' as const,
      standards: ["ASTM B265", "AMS 4911"],
      applications: ["Aerospace", "Medical implants", "Racing"],
      temperatureCoefficient: -0.0003
    },
  }
}