// Material-Profile Compatibility Configuration
// Based on industry standards and manufacturing availability

export interface MaterialProfileMapping {
  materialKey: string;
  compatibleProfiles: {
    [categoryKey: string]: string[]; // Array of profile type keys within each category
  };
  notes?: string;
}

/**
 * Material-Profile Compatibility Matrix
 * Based on industry standards and common manufacturing practices
 * 
 * Sources:
 * - AISC Steel Construction Manual
 * - Aluminum Association Standards
 * - ASTM Material Standards
 * - Industry manufacturing catalogs
 */
export const MATERIAL_PROFILE_COMPATIBILITY: MaterialProfileMapping[] = [
  // STEEL - Most versatile material, supports all structural profiles
  {
    materialKey: "steel",
    compatibleProfiles: {
      basic: ["rectangular", "round", "square", "flat", "hexagonal"],
      beams: ["hea", "heb", "hem", "ipe", "ipn", "hec", "wbeam"],
      channels: ["upn", "channel", "uchannel"],
      hollow: ["rhs", "shs", "chs"],
      angles: ["equalAngle", "unequalAngle"],
      bars: ["roundBar", "squareBar", "flatBar", "hexBar", "rectangularBar"],
      plates: ["plate", "sheetMetal", "checkeredPlate", "perforatedPlate"],
      pipes: ["pipe"],
    },
    notes: "steelVersatileDesc" // Translation key
  },

  // STAINLESS STEEL - Similar to steel but more expensive, fewer specialty shapes
  {
    materialKey: "stainless",
    compatibleProfiles: {
      basic: ["rectangular", "round", "square", "flat", "hexagonal"],
      beams: ["ipe", "hea", "heb"], // European standards more common for stainless
      channels: ["upn", "uChannel", "equalAngle", "unequalAngle"],
      hollow: ["rhs", "shs", "chs", "pipe"],
      special: ["tBeam"],
      plates: ["plate", "sheetMetal", "perforatedPlate"]
    },
    notes: "stainlessLimitedDesc" // Translation key
  },

  // ALUMINUM - Excellent for extrusions, limited structural beams
  {
    materialKey: "aluminum",
    compatibleProfiles: {
      basic: ["rectangular", "round", "square", "flat", "hexagonal"],
      beams: [], // Very limited structural beam availability in aluminum
      channels: ["uChannel", "equalAngle", "unequalAngle"], // Common in aluminum extrusions
      hollow: ["rhs", "shs", "chs"], // Excellent availability
      special: ["tBeam"], // Available through extrusion
      plates: ["plate", "sheetMetal", "perforatedPlate"]
    },
    notes: "Aluminum excels in extrusions and hollow sections. Structural beams rarely available."
  },

  // COPPER - Mainly basic shapes and tubes
  {
    materialKey: "copper",
    compatibleProfiles: {
      basic: ["rectangular", "round", "square", "flat"],
      beams: [], // Not available
      channels: ["equalAngle"], // Very limited
      hollow: ["chs", "pipe"], // Excellent for plumbing applications
      special: [],
      plates: ["plate", "sheetMetal"]
    },
    notes: "Copper primarily available in basic shapes, tubes, and sheets. Limited structural options."
  },

  // TITANIUM - Very limited availability, mainly aerospace applications
  {
    materialKey: "titanium",
    compatibleProfiles: {
      basic: ["rectangular", "round", "square", "flat"],
      beams: [], // Not commercially available
      channels: [],
      hollow: ["chs"], // Limited pipe availability
      special: [],
      plates: ["plate", "sheetMetal"]
    },
    notes: "Titanium very limited availability. Mainly custom aerospace applications."
  },

  // SPECIALTY METALS - Very limited profiles
  {
    materialKey: "specialty",
    compatibleProfiles: {
      basic: ["rectangular", "round", "square", "flat"],
      beams: [],
      channels: [],
      hollow: ["chs"], // Some pipe availability for specific alloys
      special: [],
      plates: ["plate", "sheetMetal"]
    },
    notes: "Specialty metals have very limited profile availability. Mainly custom applications."
  }
];

/**
 * Get compatible profiles for a given material
 */
export function getCompatibleProfiles(materialKey: string): string[] {
  const mapping = MATERIAL_PROFILE_COMPATIBILITY.find(m => m.materialKey === materialKey);
  if (!mapping) return [];
  
  const compatibleTypes: string[] = [];
  Object.values(mapping.compatibleProfiles).forEach(profileTypes => {
    compatibleTypes.push(...profileTypes);
  });
  
  return compatibleTypes;
}

/**
 * Check if a material-profile combination is compatible
 */
export function isProfileCompatible(materialKey: string, profileType: string): boolean {
  const compatibleProfiles = getCompatibleProfiles(materialKey);
  return compatibleProfiles.includes(profileType);
}

/**
 * Get compatible profile categories for a material
 */
export function getCompatibleProfileCategories(materialKey: string): string[] {
  const mapping = MATERIAL_PROFILE_COMPATIBILITY.find(m => m.materialKey === materialKey);
  if (!mapping) return [];
  
  return Object.keys(mapping.compatibleProfiles).filter(
    category => mapping.compatibleProfiles[category].length > 0
  );
}

/**
 * Get compatible profile types within a specific category for a material
 */
export function getCompatibleProfileTypesInCategory(materialKey: string, category: string): string[] {
  const mapping = MATERIAL_PROFILE_COMPATIBILITY.find(m => m.materialKey === materialKey);
  if (!mapping || !mapping.compatibleProfiles[category]) return [];
  
  return mapping.compatibleProfiles[category];
}

/**
 * Get availability notes for a material
 */
export function getMaterialProfileNotes(materialKey: string): string | undefined {
  const mapping = MATERIAL_PROFILE_COMPATIBILITY.find(m => m.materialKey === materialKey);
  return mapping?.notes;
}

/**
 * Get material compatibility info with profile counts
 */
export function getMaterialCompatibilityInfo(materialKey: string) {
  const mapping = MATERIAL_PROFILE_COMPATIBILITY.find(m => m.materialKey === materialKey);
  if (!mapping) return null;
  
  const totalProfiles = getCompatibleProfiles(materialKey).length;
  const categoriesCount = getCompatibleProfileCategories(materialKey).length;
  
  return {
    totalProfiles,
    categoriesCount,
    notes: mapping.notes,
    compatibility: mapping.compatibleProfiles
  };
} 