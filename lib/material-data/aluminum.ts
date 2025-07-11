import { MaterialCategory } from './types'

export const ALUMINUM_MATERIALS: MaterialCategory = {
  name: "Aluminum Alloys",
  grades: {
    // 6000 Series (Al-Mg-Si)
    "6061": { 
      name: "6061-T6 Aluminum", 
      density: 2.7, 
      color: "bg-blue-400",
      yieldStrength: 276,
      tensileStrength: 310,
      elasticModulus: 68.9,
      poissonRatio: 0.33,
      hardness: "95 HB",
      thermalExpansion: 23.6,
      thermalConductivity: 167,
      specificHeat: 896,
      meltingPoint: 582,
      relativeCost: 2,
      availability: 'excellent' as const,
      standards: ["ASTM B221", "EN AW-6061"],
      applications: ["Structural", "Marine", "Automotive"],
      temperatureCoefficient: -0.0007
    },
    "6063": { 
      name: "6063-T5 Aluminum", 
      density: 2.7, 
      color: "bg-blue-500",
      yieldStrength: 214,
      tensileStrength: 241,
      elasticModulus: 68.9,
      poissonRatio: 0.33,
      hardness: "73 HB",
      thermalExpansion: 23.4,
      thermalConductivity: 201,
      specificHeat: 896,
      meltingPoint: 585,
      relativeCost: 2,
      availability: 'excellent' as const,
      standards: ["ASTM B221", "EN AW-6063"],
      applications: ["Extrusions", "Window frames", "Architectural"],
      temperatureCoefficient: -0.0007
    },
    
    // 7000 Series (Al-Zn)
    "7075": { 
      name: "7075-T6 Aluminum", 
      density: 2.81, 
      color: "bg-blue-600",
      yieldStrength: 503,
      tensileStrength: 572,
      elasticModulus: 71.7,
      poissonRatio: 0.33,
      hardness: "150 HB",
      thermalExpansion: 23.2,
      thermalConductivity: 130,
      specificHeat: 960,
      meltingPoint: 477,
      relativeCost: 3,
      availability: 'good' as const,
      standards: ["ASTM B211", "AMS 4045"],
      applications: ["Aerospace", "High stress", "Aircraft structures"],
      temperatureCoefficient: -0.0007
    },
    
    // 5000 Series (Al-Mg)
    "5052": { 
      name: "5052-H32 Aluminum", 
      density: 2.68, 
      color: "bg-blue-300",
      yieldStrength: 193,
      tensileStrength: 228,
      elasticModulus: 70.3,
      poissonRatio: 0.33,
      hardness: "60 HB",
      thermalExpansion: 23.8,
      thermalConductivity: 138,
      specificHeat: 903,
      meltingPoint: 607,
      relativeCost: 2,
      availability: 'excellent' as const,
      standards: ["ASTM B209", "EN AW-5052"],
      applications: ["Marine", "Fuel tanks", "Sheet metal work"],
      temperatureCoefficient: -0.0007
    },
    "5083": {
      name: "5083-H111 Aluminum",
      density: 2.66,
      color: "bg-cyan-400",
      yieldStrength: 145,
      tensileStrength: 290,
      elasticModulus: 70.3,
      poissonRatio: 0.33,
      hardness: "75 HB",
      thermalExpansion: 23.8,
      thermalConductivity: 117,
      specificHeat: 900,
      meltingPoint: 570,
      relativeCost: 3,
      availability: 'good' as const,
      standards: ["ASTM B209", "EN AW-5083"],
      applications: ["Marine", "Pressure vessels", "Cryogenic"],
      temperatureCoefficient: -0.0007
    },
    
    // 2000 Series (Al-Cu)
    "2024": {
      name: "2024-T4 Aluminum",
      density: 2.78,
      color: "bg-orange-400",
      yieldStrength: 324,
      tensileStrength: 469,
      elasticModulus: 73.1,
      poissonRatio: 0.33,
      hardness: "120 HB",
      thermalExpansion: 22.9,
      thermalConductivity: 121,
      specificHeat: 875,
      meltingPoint: 502,
      relativeCost: 3,
      availability: 'good' as const,
      standards: ["ASTM B211", "AMS 4037"],
      applications: ["Aircraft", "Aerospace", "Truck wheels"],
      temperatureCoefficient: -0.0007
    },
  }
}