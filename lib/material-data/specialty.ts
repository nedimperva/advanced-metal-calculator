import { MaterialCategory } from './types'

export const SPECIALTY_MATERIALS: MaterialCategory = {
  name: "Specialty Metals",
  grades: {
    // Nickel Alloys
    inconel625: {
      name: "Inconel 625",
      density: 8.44,
      color: "bg-green-600",
      yieldStrength: 414,
      tensileStrength: 827,
      elasticModulus: 208,
      poissonRatio: 0.31,
      hardness: "220 HB",
      thermalExpansion: 12.8,
      thermalConductivity: 9.8,
      specificHeat: 410,
      meltingPoint: 1350,
      relativeCost: 5,
      availability: 'limited' as const,
      standards: ["AMS 5599", "ASTM B443"],
      applications: ["Aerospace", "Chemical processing", "Nuclear"],
      temperatureCoefficient: -0.0004
    },
    
    // Magnesium
    az31b: {
      name: "AZ31B Magnesium",
      density: 1.77,
      color: "bg-lime-400",
      yieldStrength: 200,
      tensileStrength: 260,
      elasticModulus: 45,
      poissonRatio: 0.35,
      hardness: "73 HB",
      thermalExpansion: 26.0,
      thermalConductivity: 96,
      specificHeat: 1050,
      meltingPoint: 610,
      relativeCost: 4,
      availability: 'fair' as const,
      standards: ["ASTM B90", "ASTM B107"],
      applications: ["Automotive", "Electronics", "Aerospace"],
      temperatureCoefficient: -0.0008
    },
    
    // Zinc
    zinc: { 
      name: "Commercial Zinc", 
      density: 7.14, 
      color: "bg-gray-400",
      yieldStrength: 21,
      tensileStrength: 37,
      elasticModulus: 108,
      poissonRatio: 0.25,
      hardness: "30 HB",
      thermalExpansion: 30.2,
      thermalConductivity: 116,
      specificHeat: 388,
      meltingPoint: 420,
      relativeCost: 2,
      availability: 'excellent' as const,
      standards: ["ASTM B6", "EN 1179"],
      applications: ["Galvanizing", "Die casting", "Alloys"],
      temperatureCoefficient: -0.0007
    },
    
    // Lead
    lead: {
      name: "Commercial Lead",
      density: 11.34,
      color: "bg-slate-600",
      yieldStrength: 12,
      tensileStrength: 17,
      elasticModulus: 16,
      poissonRatio: 0.44,
      hardness: "4 HB",
      thermalExpansion: 28.9,
      thermalConductivity: 35,
      specificHeat: 129,
      meltingPoint: 327,
      relativeCost: 2,
      availability: 'good' as const,
      standards: ["ASTM B29", "EN 12588"],
      applications: ["Radiation shielding", "Batteries", "Ammunition"],
      temperatureCoefficient: -0.0009
    }
  }
}