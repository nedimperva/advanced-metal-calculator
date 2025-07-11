import { MaterialCategory } from './types'

export const STAINLESS_MATERIALS: MaterialCategory = {
  name: "Stainless Steels",
  grades: {
    // Austenitic Stainless
    s304: { 
      name: "304 Stainless Steel", 
      density: 8.0, 
      color: "bg-gray-400",
      yieldStrength: 215,
      tensileStrength: 505,
      elasticModulus: 193,
      poissonRatio: 0.29,
      hardness: "201 HB",
      thermalExpansion: 17.3,
      thermalConductivity: 16.2,
      specificHeat: 500,
      meltingPoint: 1450,
      relativeCost: 3,
      availability: 'excellent' as const,
      standards: ["AISI 304", "EN 1.4301"],
      applications: ["Food equipment", "Chemical processing", "Architecture"],
      temperatureCoefficient: -0.0005
    },
    s316: { 
      name: "316 Stainless Steel", 
      density: 8.0, 
      color: "bg-gray-300",
      yieldStrength: 205,
      tensileStrength: 515,
      elasticModulus: 193,
      poissonRatio: 0.29,
      hardness: "217 HB",
      thermalExpansion: 16.0,
      thermalConductivity: 16.2,
      specificHeat: 500,
      meltingPoint: 1450,
      relativeCost: 4,
      availability: 'excellent' as const,
      standards: ["AISI 316", "EN 1.4401"],
      applications: ["Marine", "Pharmaceutical", "Chemical"],
      temperatureCoefficient: -0.0005
    },
    s321: {
      name: "321 Stainless Steel",
      density: 8.0,
      color: "bg-gray-350",
      yieldStrength: 205,
      tensileStrength: 515,
      elasticModulus: 193,
      poissonRatio: 0.29,
      hardness: "217 HB",
      thermalExpansion: 16.6,
      thermalConductivity: 16.2,
      specificHeat: 500,
      meltingPoint: 1450,
      relativeCost: 4,
      availability: 'good' as const,
      standards: ["AISI 321", "EN 1.4541"],
      applications: ["High temperature", "Exhaust systems", "Heat exchangers"],
      temperatureCoefficient: -0.0005
    },
    
    // Duplex Stainless
    s2205: {
      name: "2205 Duplex Stainless",
      density: 7.8,
      color: "bg-indigo-500",
      yieldStrength: 448,
      tensileStrength: 620,
      elasticModulus: 200,
      poissonRatio: 0.28,
      hardness: "290 HB",
      thermalExpansion: 13.7,
      thermalConductivity: 17,
      specificHeat: 475,
      meltingPoint: 1450,
      relativeCost: 5,
      availability: 'good' as const,
      standards: ["ASTM A790", "EN 1.4462"],
      applications: ["Oil & gas", "Marine", "Chemical processing"],
      temperatureCoefficient: -0.0004
    },
    
    // Martensitic Stainless
    s410: {
      name: "410 Stainless Steel",
      density: 7.7,
      color: "bg-red-400",
      yieldStrength: 275,
      tensileStrength: 515,
      elasticModulus: 200,
      poissonRatio: 0.27,
      hardness: "155 HB",
      thermalExpansion: 10.4,
      thermalConductivity: 25,
      specificHeat: 460,
      meltingPoint: 1480,
      relativeCost: 2,
      availability: 'excellent' as const,
      standards: ["AISI 410", "EN 1.4006"],
      applications: ["Cutlery", "Valve trim", "Fasteners"],
      temperatureCoefficient: -0.0004
    },
    
    // Precipitation Hardening
    s17_4: {
      name: "17-4 PH Stainless",
      density: 7.8,
      color: "bg-orange-500",
      yieldStrength: 1170,
      tensileStrength: 1310,
      elasticModulus: 196,
      poissonRatio: 0.27,
      hardness: "375 HB",
      thermalExpansion: 10.8,
      thermalConductivity: 19.3,
      specificHeat: 460,
      meltingPoint: 1455,
      relativeCost: 4,
      availability: 'good' as const,
      standards: ["ASTM A564", "AMS 5643"],
      applications: ["Aerospace", "Nuclear", "High performance"],
      temperatureCoefficient: -0.0004
    }
  }
}