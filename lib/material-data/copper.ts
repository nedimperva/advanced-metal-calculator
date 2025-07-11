import { MaterialCategory } from './types'

export const COPPER_MATERIALS: MaterialCategory = {
  name: "Copper & Alloys",
  grades: {
    // Pure Copper
    pure: { 
      name: "C101 Pure Copper", 
      density: 8.96, 
      color: "bg-orange-600",
      yieldStrength: 33,
      tensileStrength: 220,
      elasticModulus: 110,
      poissonRatio: 0.34,
      hardness: "40 HB",
      thermalExpansion: 16.5,
      thermalConductivity: 401,
      specificHeat: 385,
      meltingPoint: 1085,
      relativeCost: 4,
      availability: 'excellent' as const,
      standards: ["ASTM B152", "EN CW004A"],
      applications: ["Electrical", "Plumbing", "Heat exchangers"],
      temperatureCoefficient: -0.0005
    },
    
    // Brasses
    brass360: { 
      name: "C360 Free Cutting Brass", 
      density: 8.5, 
      color: "bg-yellow-600",
      yieldStrength: 124,
      tensileStrength: 338,
      elasticModulus: 101,
      poissonRatio: 0.33,
      hardness: "65 HB",
      thermalExpansion: 20.9,
      thermalConductivity: 113,
      specificHeat: 380,
      meltingPoint: 885,
      relativeCost: 3,
      availability: 'excellent' as const,
      standards: ["ASTM B16", "ASTM B124"],
      applications: ["Machining", "Gears", "Valves"],
      temperatureCoefficient: -0.0006
    },
    brass260: { 
      name: "C260 Cartridge Brass", 
      density: 8.53, 
      color: "bg-yellow-500",
      yieldStrength: 76,
      tensileStrength: 300,
      elasticModulus: 97,
      poissonRatio: 0.33,
      hardness: "55 HB",
      thermalExpansion: 19.9,
      thermalConductivity: 120,
      specificHeat: 380,
      meltingPoint: 915,
      relativeCost: 3,
      availability: 'excellent' as const,
      standards: ["ASTM B19", "ASTM B36"],
      applications: ["Ammunition", "Cartridge cases", "Hardware"],
      temperatureCoefficient: -0.0006
    },
    
    // Bronzes
    bronze: { 
      name: "C932 Bearing Bronze", 
      density: 8.8, 
      color: "bg-amber-600",
      yieldStrength: 130,
      tensileStrength: 310,
      elasticModulus: 103,
      poissonRatio: 0.34,
      hardness: "70 HB",
      thermalExpansion: 18.0,
      thermalConductivity: 71,
      specificHeat: 377,
      meltingPoint: 1050,
      relativeCost: 4,
      availability: 'good' as const,
      standards: ["ASTM B505", "SAE 660"],
      applications: ["Bearings", "Bushings", "Wear plates"],
      temperatureCoefficient: -0.0005
    },
    
    // Copper-Nickel
    cupronickel: {
      name: "C706 Copper-Nickel",
      density: 8.94,
      color: "bg-rose-500",
      yieldStrength: 140,
      tensileStrength: 380,
      elasticModulus: 150,
      poissonRatio: 0.32,
      hardness: "80 HB",
      thermalExpansion: 16.2,
      thermalConductivity: 29,
      specificHeat: 377,
      meltingPoint: 1170,
      relativeCost: 5,
      availability: 'fair' as const,
      standards: ["ASTM B466", "ASTM B467"],
      applications: ["Marine", "Condensers", "Heat exchangers"],
      temperatureCoefficient: -0.0004
    }
  }
}