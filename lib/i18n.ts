export type Language = 'en' | 'bs'

export interface Translations {
  // App title and navigation
  appTitle: string
  appSubtitle: string
  
  // Tabs
  calculator: string
  compare: string
  history: string
  breakdown: string
  advanced: string
  settings: string
  
  // Settings
  settingsTitle: string
  appearance: string
  theme: string
  light: string
  dark: string
  system: string
  colorTheme: string
  professionalBlue: string
  engineeringGreen: string
  industrialOrange: string
  structuralGray: string
  copperBronze: string
  language: string
  units: string
  defaultLengthUnit: string
  defaultWeightUnit: string
  
  // Material and Profile Selection
  materialSelection: string
  profileSelection: string
  material: string
  grade: string
  profile: string
  standardSize: string
  customDimensions: string
  useCustom: string
  editingCustom: string
  selectStandardSize: string
  
  // Dimensions and Labels
  dimensions: string
  profileDimensions: string
  lengthUnit: string
  weightUnit: string
  length: string
  thickness: string
  height: string
  width: string
  diameter: string
  wallThickness: string
  side: string
  sideLength: string
  acrossFlats: string
  webThickness: string
  flangeThickness: string
  rootRadius: string
  outerDiameter: string
  innerDiameter: string
  
  // Dimension Descriptions
  heightDesc: string
  widthDesc: string
  webThicknessDesc: string
  flangeThicknessDesc: string
  thicknessDesc: string
  rootRadiusDesc: string
  outerDiameterDesc: string
  wallThicknessDesc: string
  sideLengthDesc: string
  diameterDesc: string
  acrossFlatsDesc: string
  totalLengthDescription: string
  enterDimensionsFor: string
  changeInSettings: string
  
  // Temperature
  temperatureEffects: string
  enableTemperatureEffects: string
  operatingTemperature: string
  referenceTemperature: string
  adjustedDensity: string
  densityChange: string
  originalDensity: string
  
  // Results
  calculationResults: string
  singleUnit: string
  totalCost: string
  unitCost: string
  quantity: string
  price: string
  pieces: string
  piece: string
  totalWeight: string
  
  // Properties
  crossSectionalArea: string
  volume: string
  structuralProperties: string
  momentOfInertia: string
  sectionModulus: string
  radiusOfGyration: string
  physicalProperties: string
  perimeter: string
  weightPerLength: string
  
  // Actions
  save: string
  share: string
  export: string
  load: string
  calculate: string
  retry: string
  advancedAnalysis: string
  
  // History
  calculationHistory: string
  noCalculations: string
  noCalculationsDesc: string
  recent: string
  allSizes: string
  allOptions: string
  
  // Errors and validation
  calculationError: string
  invalidInputs: string
  selectProfileMaterial: string
  loadingError: string
  failedToLoad: string
  compatibilityIssue: string
  profileAutoCorrect: string
  savingError: string
  calculationSaved: string
  cannotSave: string
  cannotExport: string
  cannotShare: string
  enhancedCalculationExported: string
  sharedSuccessfully: string
  copiedToClipboard: string
  retryCalculation: string
  
  // Form Placeholders and Helpers
  enterValue: string
  enterLength: string
  selectMaterial: string
  selectProfile: string
  validateInputs: string
  analysisComplete: string
  computingProperties: string
  
  // Validation Messages
  fieldRequired: string
  mustBeNumber: string
  mustBeAtLeast: string
  cannotExceed: string
  veryThinWarning: string
  unusuallyThick: string
  heightTooSmall: string
  flangeWidthSmall: string
  webThicknessThin: string
  channelHeightSmall: string
  largeDiameterWarning: string
  wallThicknessThin: string
  cryogenicWarning: string
  highTempWarning: string
  subZeroWarning: string
  tempExceedsMelting: string
  tempApproachingMelting: string
  steelTempering: string
  steelBrittleness: string
  aluminumAnnealing: string
  pleaseCorrectErrors: string
  errorsFound: string
  warningsFound: string
  dismiss: string
  resetValidation: string
  
  // Material Selector
  materialType: string
  cost: string
  availability: string
  density: string
  yieldStrength: string
  elasticModulus: string
  meltingPoint: string
  mechanicalProperties: string
  tensile: string
  poisson: string
  hardness: string
  thermalProperties: string
  expansion: string
  conductivity: string
  typicalApplications: string
  standards: string
  grades: string
  more: string
  
  // Profile Selector
  profileCategory: string
  profileType: string
  profileVisualization: string
  selectedProfileVisualization: string
  available: string
  unavailableFor: string
  types: string
  recentIn: string
  allCompatibleTypes: string
  
  // Material Names (main categories)
  carbonAlloySteel: string
  stainlessSteelMaterial: string
  aluminumAlloy: string
  copperAlloy: string
  titaniumAlloy: string
  specialtyMetal: string
  
  // Steel Grades
  a36StructuralSteel: string
  a572Grade50HSLA: string
  a992Grade50WideFl: string
  mildSteel1018: string
  a514HighStrength: string
  d2ToolSteel: string
  
  // Stainless Grades
  ss304: string
  ss316: string
  ss321: string
  ss2205Duplex: string
  ss420: string
  
  // Aluminum Grades
  al6061T6: string
  al6063T5: string
  al7075T6: string
  al5052H32: string
  al5083H111: string
  al2024T4: string
  
  // Copper Grades
  c101PureCopper: string
  c360FreeCuttingBrass: string
  c260CartridgeBrass: string
  c510PhosphorBronze: string
  c655SiliconBronze: string
  
  // Titanium Grades
  grade2PureTitanium: string
  grade5Ti6Al4V: string
  
  // Specialty Grades
  inconel625: string
  az31bMagnesium: string
  commercialZinc: string
  pureLead: string
  
  // Profile Category Names
  basicShapes: string
  iBeamsHBeams: string
  channelsAngles: string
  hollowSections: string
  specialSections: string
  steelPlates: string
  
  // Basic Shape Names
  rectangularBar: string
  roundBar: string
  squareBar: string
  flatBar: string
  hexagonalBar: string
  
  // Beam Names
  ipnIBeamNarrow: string
  ipeIBeamEuropean: string
  heaHBeamSeriesA: string
  hebHBeamSeriesB: string
  hecHBeamSeriesC: string
  wBeamAISC: string
  
  // Channel and Angle Names
  upnUChannelNormal: string
  cChannelAmerican: string
  equalAngle: string
  unequalAngle: string
  
  // Hollow Section Names
  rhsRectangularHollow: string
  shsSquareHollow: string
  chsCircularHollow: string
  pipeSchedule: string
  
  // Special Section Names
  tBeam: string
  bulbFlat: string
  halfRound: string
  
  // Plate Names
  steelPlate: string
  sheetMetal: string
  checkeredPlate: string
  perforatedPlate: string
  
  // Common Words for Suggestions and Naming
  lengthDimension: string
  sectionProfile: string
  profileShape: string
  beamElement: string
  channelElement: string
  angleElement: string
  hollowElement: string
  plateElement: string
  barElement: string
  tubeElement: string
  
  // Units and Measurements
  millimeters: string
  centimeters: string
  meters: string
  inches: string
  feet: string
  grams: string
  kilograms: string
  tonnes: string
  pounds: string
  ounces: string
  
  // Materials
  steel: string
  aluminum: string
  stainlessSteel: string
  copper: string
  brass: string
  iron: string
  titanium: string
  
  // Profiles
  beams: string
  columns: string
  angles: string
  channels: string
  hollow: string
  plates: string
  bars: string
  pipes: string
  
  // Pricing
  pricing: string
  defaultCurrency: string
  defaultPricingModel: string
  pricingSettings: string
  currentPricing: string
  
  // Loading States
  loading: string
  calculating: string
  validating: string
  saving: string
  exporting: string
  sharing: string
  
  // Empty States
  noDataAvailable: string
  noStandardSizes: string
  noDimensionsRequired: string
  selectToBegin: string
  completeToSee: string
  
  // Status Messages
  ready: string
  complete: string
  failed: string
  processing: string
  analyzing: string
  
  // Time and Date
  timestamp: string
  today: string
  yesterday: string
  thisWeek: string
  thisMonth: string
  
  // Common
  close: string
  cancel: string
  apply: string
  reset: string
  clear: string
  ok: string
  yes: string
  no: string
  back: string
  next: string
  finish: string
  continue: string
  skip: string
  help: string
  info: string
  warning: string
  error: string
  success: string
}

export const translations: Record<Language, Translations> = {
  en: {
    // App title and navigation
    appTitle: "Professional Metal Calculator",
    appSubtitle: "Calculate weights for structural profiles and materials",
    
    // Tabs
    calculator: "Calculator",
    compare: "Compare",
    history: "History", 
    breakdown: "Breakdown",
    advanced: "Advanced",
    settings: "Settings",
    
    // Settings
    settingsTitle: "Settings",
    appearance: "Appearance",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    system: "System",
    colorTheme: "Color Theme",
    professionalBlue: "Professional Blue",
    engineeringGreen: "Engineering Green",
    industrialOrange: "Industrial Orange",
    structuralGray: "Structural Gray",
    copperBronze: "Copper Bronze",
    language: "Language",
    units: "Units",
    defaultLengthUnit: "Default Length Unit",
    defaultWeightUnit: "Default Weight Unit",
    
    // Material and Profile Selection
    materialSelection: "Material Selection",
    profileSelection: "Profile Selection",
    material: "Material",
    grade: "Grade",
    profile: "Profile",
    standardSize: "Standard Size",
    customDimensions: "Custom Dimensions",
    useCustom: "Use Custom",
    editingCustom: "Editing Custom",
    selectStandardSize: "Select a standard size",
    
    // Dimensions and Labels
    dimensions: "Dimensions",
    profileDimensions: "Profile Dimensions",
    lengthUnit: "Length Unit",
    weightUnit: "Weight Unit",
    length: "Length",
    thickness: "Thickness",
    height: "Height",
    width: "Width",
    diameter: "Diameter",
    wallThickness: "Wall Thickness",
    side: "Side",
    sideLength: "Side length",
    acrossFlats: "Across flats",
    webThickness: "Web thickness",
    flangeThickness: "Flange thickness",
    rootRadius: "Root radius",
    outerDiameter: "Outer diameter",
    innerDiameter: "Inner diameter",
    
    // Dimension Descriptions
    heightDesc: "Overall height of the profile - critical for moment calculations",
    widthDesc: "Overall width of the flange - affects lateral stability",
    webThicknessDesc: "Thickness of the vertical web - resists shear forces",
    flangeThicknessDesc: "Thickness of the horizontal flange - resists bending",
    thicknessDesc: "Material thickness - affects all structural properties",
    rootRadiusDesc: "Corner radius (fillet) - stress concentration factor",
    outerDiameterDesc: "Outside diameter - determines overall size",
    wallThicknessDesc: "Wall thickness for pipes - affects strength and weight",
    sideLengthDesc: "Equal dimension for square profiles",
    diameterDesc: "Full diameter of round section",
    acrossFlatsDesc: "Distance across flats for hexagonal profiles",
    totalLengthDescription: "Total length of the profile",
    enterDimensionsFor: "Enter dimensions for",
    changeInSettings: "Change in Settings",
    
    // Temperature
    temperatureEffects: "Temperature Effects",
    enableTemperatureEffects: "Enable Temperature Effects",
    operatingTemperature: "Operating Temperature",
    referenceTemperature: "Reference temperature: 20°C. Temperature affects material density.",
    adjustedDensity: "Adjusted Density",
    densityChange: "Density Change",
    originalDensity: "Original",
    
    // Results
    calculationResults: "Calculation Results",
    singleUnit: "Single Unit",
    totalCost: "Total Cost",
    unitCost: "Unit Cost",
    quantity: "Quantity",
    price: "Price",
    pieces: "pieces",
    piece: "piece",
    totalWeight: "Total Weight",
    
    // Properties
    crossSectionalArea: "Cross-sectional Area",
    volume: "Volume",
    structuralProperties: "Structural Properties",
    momentOfInertia: "Moment of Inertia",
    sectionModulus: "Section Modulus",
    radiusOfGyration: "Radius of Gyration",
    physicalProperties: "Physical Properties",
    perimeter: "Perimeter",
    weightPerLength: "Weight/m",
    
    // Actions
    save: "Save",
    share: "Share",
    export: "Export",
    load: "Load",
    calculate: "Calculate",
    retry: "Retry Calculation",
    advancedAnalysis: "Advanced Analysis",
    
    // History
    calculationHistory: "Calculation History",
    noCalculations: "No saved calculations yet",
    noCalculationsDesc: "Complete calculations will appear here",
    recent: "Recent",
    allSizes: "All Sizes",
    allOptions: "All Options",
    
    // Errors and validation
    calculationError: "Calculation Error",
    invalidInputs: "Invalid Inputs",
    selectProfileMaterial: "Select a profile and material to begin calculation",
    loadingError: "Loading Error",
    failedToLoad: "Failed to load saved calculations.",
    compatibilityIssue: "Compatibility Issue",
    profileAutoCorrect: "Profile Auto-Corrected",
    savingError: "Saving Error",
    calculationSaved: "Calculation saved",
    cannotSave: "Cannot save calculation",
    cannotExport: "Cannot export calculation",
    cannotShare: "Cannot share calculation",
    enhancedCalculationExported: "Enhanced calculation exported",
    sharedSuccessfully: "Shared successfully",
    copiedToClipboard: "Copied to clipboard",
    retryCalculation: "Retry Calculation",
    
    // Form Placeholders and Helpers
    enterValue: "Enter value",
    enterLength: "Enter length",
    selectMaterial: "Select material",
    selectProfile: "Select profile",
    validateInputs: "Validating...",
    analysisComplete: "Analysis complete",
    computingProperties: "Computing structural properties...",
    
    // Validation Messages
    fieldRequired: "is required",
    mustBeNumber: "must be a valid number",
    mustBeAtLeast: "must be at least",
    cannotExceed: "cannot exceed",
    veryThinWarning: "is very thin for structural applications",
    unusuallyThick: "is unusually thick",
    heightTooSmall: "Height below 80mm may not be practical for structural I-beams",
    flangeWidthSmall: "Flange width below 50mm may cause stability issues",
    webThicknessThin: "Web thickness below 3mm may be insufficient for structural loads",
    channelHeightSmall: "Channel height below 50mm is uncommon for structural applications",
    largeDiameterWarning: "Large diameter rounds may require special handling",
    wallThicknessThin: "Wall thickness below 1.5mm may be insufficient for structural hollow sections",
    cryogenicWarning: "Cryogenic temperatures may significantly affect material properties",
    highTempWarning: "High temperatures may cause material degradation",
    subZeroWarning: "Sub-zero temperatures may affect material brittleness",
    tempExceedsMelting: "Temperature exceeds melting point",
    tempApproachingMelting: "Temperature approaching melting point - material properties may be significantly altered",
    steelTempering: "High temperature may cause steel tempering and strength reduction",
    steelBrittleness: "Low temperature may increase steel brittleness",
    aluminumAnnealing: "High temperature may cause aluminum annealing and strength loss",
    pleaseCorrectErrors: "Please correct the following errors:",
    errorsFound: "error",
    warningsFound: "warning",
    dismiss: "Dismiss",
    resetValidation: "Reset",
    
    // Material Selector
    materialType: "Material Type",
    cost: "Cost",
    availability: "Availability",
    density: "Density",
    yieldStrength: "Yield Strength",
    elasticModulus: "Elastic Modulus",
    meltingPoint: "Melting Point",
    mechanicalProperties: "Mechanical Properties",
    tensile: "Tensile",
    poisson: "Poisson",
    hardness: "Hardness",
    thermalProperties: "Thermal Properties",
    expansion: "Expansion",
    conductivity: "Conductivity",
    typicalApplications: "Typical Applications",
    standards: "Standards",
    grades: "Grades",
    more: "More",
    
    // Profile Selector
    profileCategory: "Profile Category",
    profileType: "Profile Type",
    profileVisualization: "Profile Visualization",
    selectedProfileVisualization: "Selected Profile Visualization",
    available: "Available",
    unavailableFor: "Unavailable For",
    types: "Types",
    recentIn: "Recent In",
    allCompatibleTypes: "All Compatible Types",
    
    // Material Names (main categories)
    carbonAlloySteel: "Carbon Alloy Steel",
    stainlessSteelMaterial: "Stainless Steel",
    aluminumAlloy: "Aluminum Alloy",
    copperAlloy: "Copper Alloy",
    titaniumAlloy: "Titanium Alloy",
    specialtyMetal: "Specialty Metal",
    
    // Steel Grades
    a36StructuralSteel: "A36 Structural Steel",
    a572Grade50HSLA: "A572 Grade 50 HSLA",
    a992Grade50WideFl: "A992 Grade 50 Wide Fl",
    mildSteel1018: "Mild Steel 1018",
    a514HighStrength: "A514 High Strength",
    d2ToolSteel: "D2 Tool Steel",
    
    // Stainless Grades
    ss304: "SS304",
    ss316: "SS316",
    ss321: "SS321",
    ss2205Duplex: "SS2205 Duplex",
    ss420: "SS420",
    
    // Aluminum Grades
    al6061T6: "6061-T6 Aluminum",
    al6063T5: "6063-T5 Aluminum",
    al7075T6: "7075-T6 Aluminum",
    al5052H32: "5052-H32 Aluminum",
    al5083H111: "5083-H111 Aluminum",
    al2024T4: "2024-T4 Aluminum",
    
    // Copper Grades
    c101PureCopper: "C101 Pure Copper",
    c360FreeCuttingBrass: "C360 Free Cutting Brass",
    c260CartridgeBrass: "C260 Cartridge Brass",
    c510PhosphorBronze: "C510 Phosphor Bronze",
    c655SiliconBronze: "C655 Silicon Bronze",
    
    // Titanium Grades
    grade2PureTitanium: "Grade 2 Pure Titanium",
    grade5Ti6Al4V: "Grade 5 Ti-6Al-4V",
    
    // Specialty Grades
    inconel625: "Inconel 625",
    az31bMagnesium: "AZ31B Magnesium",
    commercialZinc: "Commercial Zinc",
    pureLead: "Pure Lead",
    
    // Profile Category Names
    basicShapes: "Basic Shapes",
    iBeamsHBeams: "I-Beams/H-Beams",
    channelsAngles: "Channels/Angles",
    hollowSections: "Hollow Sections",
    specialSections: "Special Sections",
    steelPlates: "Steel Plates",
    
    // Basic Shape Names
    rectangularBar: "Rectangular Bar",
    roundBar: "Round Bar",
    squareBar: "Square Bar",
    flatBar: "Flat Bar",
    hexagonalBar: "Hexagonal Bar",
    
    // Beam Names
    ipnIBeamNarrow: "IPN I-Beam Narrow",
    ipeIBeamEuropean: "IPE I-Beam European",
    heaHBeamSeriesA: "HEA/HEB H-Beam Series A",
    hebHBeamSeriesB: "HEA/HEB H-Beam Series B",
    hecHBeamSeriesC: "HEC H-Beam Series C",
    wBeamAISC: "W-Beam AISC",
    
    // Channel and Angle Names
    upnUChannelNormal: "UPN/U Channel Normal",
    cChannelAmerican: "C Channel American",
    equalAngle: "Equal Angle",
    unequalAngle: "Unequal Angle",
    
    // Hollow Section Names
    rhsRectangularHollow: "RHS Rectangular Hollow",
    shsSquareHollow: "SHS Square Hollow",
    chsCircularHollow: "CHS Circular Hollow",
    pipeSchedule: "Pipe Schedule",
    
    // Special Section Names
    tBeam: "T-Beam",
    bulbFlat: "Bulb Flat",
    halfRound: "Half Round",
    
    // Plate Names
    steelPlate: "Steel Plate",
    sheetMetal: "Sheet Metal",
    checkeredPlate: "Checkered Plate",
    perforatedPlate: "Perforated Plate",
    
    // Common Words for Suggestions and Naming
    lengthDimension: "Length",
    sectionProfile: "Section",
    profileShape: "Profile",
    beamElement: "Beam",
    channelElement: "Channel",
    angleElement: "Angle",
    hollowElement: "Hollow",
    plateElement: "Plate",
    barElement: "Bar",
    tubeElement: "Tube",
    
    // Units and Measurements
    millimeters: "mm",
    centimeters: "cm",
    meters: "m",
    inches: "in",
    feet: "ft",
    grams: "g",
    kilograms: "kg",
    tonnes: "t",
    pounds: "lbs",
    ounces: "oz",
    
    // Materials
    steel: "Steel",
    aluminum: "Aluminum",
    stainlessSteel: "Stainless Steel",
    copper: "Copper",
    brass: "Brass",
    iron: "Iron",
    titanium: "Titanium",
    
    // Profiles
    beams: "Beams",
    columns: "Columns",
    angles: "Angles",
    channels: "Channels",
    hollow: "Hollow",
    plates: "Plates",
    bars: "Bars",
    pipes: "Pipes",
    
    // Pricing
    pricing: "Pricing",
    defaultCurrency: "Default Currency",
    defaultPricingModel: "Default Pricing Model",
    pricingSettings: "Pricing Settings",
    currentPricing: "Current Pricing",
    
    // Loading States
    loading: "Loading",
    calculating: "Calculating",
    validating: "Validating",
    saving: "Saving",
    exporting: "Exporting",
    sharing: "Sharing",
    
    // Empty States
    noDataAvailable: "No data available",
    noStandardSizes: "No standard sizes available for this profile type.",
    noDimensionsRequired: "No dimensions required for this profile type",
    selectToBegin: "Select a profile and material to begin calculation",
    completeToSee: "Complete a calculation to see the breakdown",
    
    // Status Messages
    ready: "Ready",
    complete: "Complete",
    failed: "Failed",
    processing: "Processing",
    analyzing: "Analyzing",
    
    // Time and Date
    timestamp: "Timestamp",
    today: "Today",
    yesterday: "Yesterday",
    thisWeek: "This week",
    thisMonth: "This month",
    
    // Common
    close: "Close",
    cancel: "Cancel",
    apply: "Apply",
    reset: "Reset",
    clear: "Clear",
    ok: "OK",
    yes: "Yes",
    no: "No",
    back: "Back",
    next: "Next",
    finish: "Finish",
    continue: "Continue",
    skip: "Skip",
    help: "Help",
    info: "Info",
    warning: "Warning",
    error: "Error",
    success: "Success"
  },
  
  bs: {
    // App title and navigation
    appTitle: "Profesionalni Kalkulator Metala",
    appSubtitle: "Izračunajte težine za strukturne profile i materijale",
    
    // Tabs
    calculator: "Kalkulator",
    compare: "Poredi",
    history: "Historija",
    breakdown: "Analiza",
    advanced: "Napredno",
    settings: "Postavke",
    
    // Settings
    settingsTitle: "Postavke",
    appearance: "Izgled",
    theme: "Tema",
    light: "Svijetla",
    dark: "Tamna",
    system: "Sistemska",
    colorTheme: "Boja Teme",
    professionalBlue: "Profesionalna Plava",
    engineeringGreen: "Inženjerska Zelena",
    industrialOrange: "Industrijska Narandžasta",
    structuralGray: "Strukturna Siva",
    copperBronze: "Bakar Bronza",
    language: "Jezik",
    units: "Jedinice",
    defaultLengthUnit: "Zadana jedinica dužine",
    defaultWeightUnit: "Zadana jedinica težine",
    
    // Material and Profile Selection
    materialSelection: "Izbor Materijala",
    profileSelection: "Izbor Profila",
    material: "Materijal",
    grade: "Kvalitet",
    profile: "Profil",
    standardSize: "Standardna Veličina",
    customDimensions: "Prilagođene Dimenzije",
    useCustom: "Koristi Prilagođeno",
    editingCustom: "Uređujem Prilagođeno",
    selectStandardSize: "Odaberite standardnu veličinu",
    
    // Dimensions and Labels
    dimensions: "Dimenzije",
    profileDimensions: "Dimenzije Profila",
    lengthUnit: "Jedinica Dužine",
    weightUnit: "Jedinica Težine",
    length: "Dužina",
    thickness: "Debljina",
    height: "Visina",
    width: "Širina",
    diameter: "Promjer",
    wallThickness: "Debljina Zida",
    side: "Strana",
    sideLength: "Dužina strane",
    acrossFlats: "Preko ravnih",
    webThickness: "Debljina rebra",
    flangeThickness: "Debljina pojasa",
    rootRadius: "Polumjer korijena",
    outerDiameter: "Vanjski promjer",
    innerDiameter: "Unutrašnji promjer",
    
    // Dimension Descriptions
    heightDesc: "Ukupna visina profila - kritična za proračun momenata",
    widthDesc: "Ukupna širina pojasa - utječe na bočnu stabilnost",
    webThicknessDesc: "Debljina vertikalnog rebra - odupire se silama smicanja",
    flangeThicknessDesc: "Debljina horizontalnog pojasa - odupire se savijanju",
    thicknessDesc: "Debljina materijala - utječe na sva strukturna svojstva",
    rootRadiusDesc: "Polumjer ugla (zaobljenje) - faktor koncentracije naprezanja",
    outerDiameterDesc: "Vanjski promjer - određuje ukupnu veličinu",
    wallThicknessDesc: "Debljina zida cijevi - utječe na čvrstoću i težinu",
    sideLengthDesc: "Jednake dimenzije za kvadratne profile",
    diameterDesc: "Puni promjer okruglog presjeka",
    acrossFlatsDesc: "Udaljenost preko ravnih za šesterokutne profile",
    totalLengthDescription: "Ukupna dužina profila",
    enterDimensionsFor: "Unesite dimenzije za",
    changeInSettings: "Promjena u Postavkama",
    
    // Temperature
    temperatureEffects: "Temperaturni Efekti",
    enableTemperatureEffects: "Omogući Temperaturne Efekte",
    operatingTemperature: "Radna Temperatura",
    referenceTemperature: "Referentna temperatura: 20°C. Temperatura utječe na gustinu materijala.",
    adjustedDensity: "Prilagođena Gustina",
    densityChange: "Promjena Gustine",
    originalDensity: "Originalna",
    
    // Results
    calculationResults: "Rezultati Izračuna",
    singleUnit: "Jedna Jedinica",
    totalCost: "Ukupna Cijena",
    unitCost: "Cijena po Jedinici",
    quantity: "Količina",
    price: "Cijena",
    pieces: "komada",
    piece: "komad",
    totalWeight: "Ukupna Težina",
    
    // Properties
    crossSectionalArea: "Površina Presjeka",
    volume: "Zapremina",
    structuralProperties: "Strukturna Svojstva",
    momentOfInertia: "Moment Inercije",
    sectionModulus: "Modul Presjeka",
    radiusOfGyration: "Polumjer Žiracije",
    physicalProperties: "Fizička Svojstva",
    perimeter: "Obim",
    weightPerLength: "Težina/m",
    
    // Actions
    save: "Sačuvaj",
    share: "Podjeli",
    export: "Izvezi",
    load: "Učitaj",
    calculate: "Izračunaj",
    retry: "Ponovi Izračun",
    advancedAnalysis: "Napredna Analiza",
    
    // History
    calculationHistory: "Historija Izračuna",
    noCalculations: "Nema sačuvanih izračuna",
    noCalculationsDesc: "Završeni izračuni će se pojaviti ovdje",
    recent: "Nedavni",
    allSizes: "Sve Veličine",
    allOptions: "Sve Opcije",
    
    // Errors and validation
    calculationError: "Greška u Izračunu",
    invalidInputs: "Neispravni Podaci",
    selectProfileMaterial: "Odaberite profil i materijal za početak izračuna",
    loadingError: "Greška Učitavanja",
    failedToLoad: "Neuspješno učitavanje sačuvanih izračuna.",
    compatibilityIssue: "Problem Kompatibilnosti",
    profileAutoCorrect: "Profil Automatski Ispravljen",
    savingError: "Greška Snimanja",
    calculationSaved: "Izračun sačuvan",
    cannotSave: "Ne mogu sačuvati izračun",
    cannotExport: "Ne mogu izvesti izračun",
    cannotShare: "Ne mogu podijeliti izračun",
    enhancedCalculationExported: "Poboljšani izračun izvezen",
    sharedSuccessfully: "Uspješno podijeljeno",
    copiedToClipboard: "Kopirano u međuspremnik",
    retryCalculation: "Ponovi Izračun",
    
    // Form Placeholders and Helpers
    enterValue: "Unesite vrijednost",
    enterLength: "Unesite dužinu",
    selectMaterial: "Odaberite materijal",
    selectProfile: "Odaberite profil",
    validateInputs: "Provjera...",
    analysisComplete: "Analiza završena",
    computingProperties: "Računam strukturna svojstva...",
    
    // Validation Messages
    fieldRequired: "je obavezno",
    mustBeNumber: "mora biti važeći broj",
    mustBeAtLeast: "mora biti najmanje",
    cannotExceed: "ne može premašiti",
    veryThinWarning: "je vrlo tanko za strukturne primjene",
    unusuallyThick: "je neobično debelo",
    heightTooSmall: "Visina ispod 80mm možda nije praktična za strukturne I-grede",
    flangeWidthSmall: "Širina pojasa ispod 50mm može izazvati probleme stabilnosti",
    webThicknessThin: "Debljina rebra ispod 3mm može biti nedovoljna za strukturna opterećenja",
    channelHeightSmall: "Visina kanala ispod 50mm je rijetka za strukturne primjene",
    largeDiameterWarning: "Veliki promjeri zahtijevaju posebno rukovanje",
    wallThicknessThin: "Debljina zida ispod 1.5mm može biti nedovoljna za strukturne šuplje presjeke",
    cryogenicWarning: "Kriogene temperature mogu značajno utjecati na svojstva materijala",
    highTempWarning: "Visoke temperature mogu uzrokovati degradaciju materijala",
    subZeroWarning: "Temperature ispod nule mogu utjecati na krhkost materijala",
    tempExceedsMelting: "Temperatura premašuje tačku topljenja",
    tempApproachingMelting: "Temperatura se približava tački topljenja - svojstva materijala mogu biti značajno izmijenjena",
    steelTempering: "Visoka temperatura može uzrokovati kaljenje čelika i smanjenje čvrstoće",
    steelBrittleness: "Niska temperatura može povećati krhkost čelika",
    aluminumAnnealing: "Visoka temperatura može uzrokovati žarenje aluminijuma i gubitak čvrstoće",
    pleaseCorrectErrors: "Molimo ispravite sljedeće greške:",
    errorsFound: "greška",
    warningsFound: "upozorenje",
    dismiss: "Odbaci",
    resetValidation: "Resetuj",
    
    // Material Selector
    materialType: "Tip Materijala",
    cost: "Cijena",
    availability: "Dostupnost",
    density: "Gustina",
    yieldStrength: "Granica Tekućnosti",
    elasticModulus: "Modul Elastičnosti",
    meltingPoint: "Tačka Taljenja",
    mechanicalProperties: "Mehanička Svojstva",
    tensile: "Zatezna",
    poisson: "Poisson",
    hardness: "Krtost",
    thermalProperties: "Termička Svojstva",
    expansion: "Rastezanje",
    conductivity: "Provodljivost",
    typicalApplications: "Tipične Primjene",
    standards: "Standardi",
    grades: "Kvalitet",
    more: "Više",
    
    // Profile Selector
    profileCategory: "Kategorija Profila",
    profileType: "Tip Profila",
    profileVisualization: "Vizualizacija Profila",
    selectedProfileVisualization: "Selektovana Vizualizacija Profila",
    available: "Dostupno",
    unavailableFor: "Nedostupno Za",
    types: "Vrste",
    recentIn: "Nedavno Uključeno",
    allCompatibleTypes: "Sve Kompatibilne Vrste",
    
    // Material Names (main categories)
    carbonAlloySteel: "Ugljični Legura",
    stainlessSteelMaterial: "Nerđajući Čelik",
    aluminumAlloy: "Aluminijumska Legura",
    copperAlloy: "Bakarova Legura",
    titaniumAlloy: "Titanijumska Legura",
    specialtyMetal: "Specijalni Metal",
    
    // Steel Grades
    a36StructuralSteel: "A36 Konstrukcijski Čelik",
    a572Grade50HSLA: "A572 Grade 50 HSLA",
    a992Grade50WideFl: "A992 Grade 50 Široka Flanša",
    mildSteel1018: "Mild 1018 Čelik",
    a514HighStrength: "A514 Visoka Čvrstoća",
    d2ToolSteel: "D2 Alatni Čelik",
    
    // Stainless Grades
    ss304: "SS304",
    ss316: "SS316",
    ss321: "SS321",
    ss2205Duplex: "SS2205 Duplex",
    ss420: "SS420",
    
    // Aluminum Grades
    al6061T6: "6061-T6 Aluminijum",
    al6063T5: "6063-T5 Aluminijum",
    al7075T6: "7075-T6 Aluminijum",
    al5052H32: "5052-H32 Aluminijum",
    al5083H111: "5083-H111 Aluminijum",
    al2024T4: "2024-T4 Aluminijum",
    
    // Copper Grades
    c101PureCopper: "C101 Čisti Bakar",
    c360FreeCuttingBrass: "C360 Slobodno Rezajući Mesing",
    c260CartridgeBrass: "C260 Karuselni Mesing",
    c510PhosphorBronze: "C510 Fosforni Bronze",
    c655SiliconBronze: "C655 Silicijumski Bronze",
    
    // Titanium Grades
    grade2PureTitanium: "Grade 2 Čisti Titanijum",
    grade5Ti6Al4V: "Grade 5 Ti-6Al-4V",
    
    // Specialty Grades
    inconel625: "Inconel 625",
    az31bMagnesium: "AZ31B Magnezijum",
    commercialZinc: "Trgovinski Cink",
    pureLead: "Čisti Olovo",
    
    // Profile Category Names
    basicShapes: "Osnovni Oblici",
    iBeamsHBeams: "I-Profili/H-Profili",
    channelsAngles: "Kanali/Kutovi",
    hollowSections: "Šuplje Presjeke",
    specialSections: "Specijalni Presječi",
    steelPlates: "Čelične Ploče",
    
    // Basic Shape Names
    rectangularBar: "Pravougaoni Profil",
    roundBar: "Kružni Profil",
    squareBar: "Kvadratni Profil",
    flatBar: "Plošni Profil",
    hexagonalBar: "Šesterokutni Profil",
    
    // Beam Names
    ipnIBeamNarrow: "IPN Narrow I-Beam",
    ipeIBeamEuropean: "IPE European I-Beam",
    heaHBeamSeriesA: "HEA/HEB H-Beam Series A",
    hebHBeamSeriesB: "HEA/HEB H-Beam Series B",
    hecHBeamSeriesC: "HEC H-Beam Series C",
    wBeamAISC: "W-Beam AISC",
    
    // Channel and Angle Names
    upnUChannelNormal: "UPN Normal U-Channel",
    cChannelAmerican: "C American Channel",
    equalAngle: "Jednaki Kut",
    unequalAngle: "Različiti Kut",
    
    // Hollow Section Names
    rhsRectangularHollow: "RHS Rectangular Hollow",
    shsSquareHollow: "SHS Square Hollow",
    chsCircularHollow: "CHS Circular Hollow",
    pipeSchedule: "Cijevni Plan",
    
    // Special Section Names
    tBeam: "T-Profil",
    bulbFlat: "Bulat Flanša",
    halfRound: "Polukružni Profil",
    
    // Plate Names
    steelPlate: "Čelična Ploča",
    sheetMetal: "Limovni Metal",
    checkeredPlate: "Kvadratični Metal",
    perforatedPlate: "Prorezani Metal",
    
    // Common Words for Suggestions and Naming
    lengthDimension: "Dužina",
    sectionProfile: "Presjek",
    profileShape: "Profil",
    beamElement: "Greda",
    channelElement: "Kanal",
    angleElement: "Kut",
    hollowElement: "Šuplje",
    plateElement: "Ploča",
    barElement: "Šipka",
    tubeElement: "Cijev",
    
    // Units and Measurements
    millimeters: "mm",
    centimeters: "cm",
    meters: "m",
    inches: "in",
    feet: "ft",
    grams: "g",
    kilograms: "kg",
    tonnes: "t",
    pounds: "lbs",
    ounces: "oz",
    
    // Materials
    steel: "Čelik",
    aluminum: "Aluminijum",
    stainlessSteel: "Nerđajući Čelik",
    copper: "Bakar",
    brass: "Mesing",
    iron: "Željezo",
    titanium: "Titanijum",
    
    // Profiles
    beams: "Grede",
    columns: "Stupovi",
    angles: "Uglovi",
    channels: "Kanali",
    hollow: "Šuplje",
    plates: "Ploče",
    bars: "Šipke",
    pipes: "Cijevi",
    
    // Pricing
    pricing: "Cijene",
    defaultCurrency: "Zadana Valuta",
    defaultPricingModel: "Zadani Model Cijene",
    pricingSettings: "Postavke Cijena",
    currentPricing: "Trenutne Cijene",
    
    // Loading States
    loading: "Učitavam",
    calculating: "Računam",
    validating: "Provjeram",
    saving: "Snimam",
    exporting: "Izvezem",
    sharing: "Dijelim",
    
    // Empty States
    noDataAvailable: "Nema dostupnih podataka",
    noStandardSizes: "Nema standardnih veličina za ovaj tip profila.",
    noDimensionsRequired: "Nisu potrebne dimenzije za ovaj tip profila",
    selectToBegin: "Odaberite profil i materijal za početak izračuna",
    completeToSee: "Završite izračun da vidite analizu",
    
    // Status Messages
    ready: "Spreman",
    complete: "Završeno",
    failed: "Neuspješno",
    processing: "Obrađujem",
    analyzing: "Analiziram",
    
    // Time and Date
    timestamp: "Vremenska oznaka",
    today: "Danas",
    yesterday: "Jučer",
    thisWeek: "Ova sedmica",
    thisMonth: "Ovaj mjesec",
    
    // Common
    close: "Zatvori",
    cancel: "Otkaži",
    apply: "Primijeni",
    reset: "Resetuj",
    clear: "Obriši",
    ok: "U redu",
    yes: "Da",
    no: "Ne",
    back: "Nazad",
    next: "Sljedeće",
    finish: "Završi",
    continue: "Nastavi",
    skip: "Preskoči",
    help: "Pomoć",
    info: "Informacije",
    warning: "Upozorenje",
    error: "Greška",
    success: "Uspjeh"
  }
}

export const getTranslation = (language: Language, key: keyof Translations): string => {
  return translations[language][key] || translations.en[key] || key.toString()
}

// Translation mapping functions for dynamic content
export const getMaterialCategoryName = (language: Language, materialKey: string): string => {
  const mapping: Record<string, keyof Translations> = {
    'steel': 'carbonAlloySteel',
    'stainless': 'stainlessSteelMaterial', 
    'aluminum': 'aluminumAlloy',
    'copper': 'copperAlloy',
    'titanium': 'titaniumAlloy',
    'specialty': 'specialtyMetal'
  }
  
  const translationKey = mapping[materialKey]
  return translationKey ? getTranslation(language, translationKey) : materialKey
}

export const getMaterialGradeName = (language: Language, materialKey: string, gradeKey: string): string => {
  const mapping: Record<string, Record<string, keyof Translations>> = {
    steel: {
      'a36': 'a36StructuralSteel',
      'a572': 'a572Grade50HSLA', 
      'a992': 'a992Grade50WideFl',
      'mild': 'mildSteel1018',
      'a514': 'a514HighStrength',
      'd2': 'd2ToolSteel'
    },
    stainless: {
      's304': 'ss304',
      's316': 'ss316', 
      's321': 'ss321',
      's2205': 'ss2205Duplex',
      's420': 'ss420'
    },
    aluminum: {
      '6061': 'al6061T6',
      '6063': 'al6063T5',
      '7075': 'al7075T6', 
      '5052': 'al5052H32',
      '5083': 'al5083H111',
      '2024': 'al2024T4'
    },
    copper: {
      'pure': 'c101PureCopper',
      'brass360': 'c360FreeCuttingBrass',
      'brass260': 'c260CartridgeBrass',
      'phosphorBronze': 'c510PhosphorBronze',
      'siliconBronze': 'c655SiliconBronze'
    },
    titanium: {
      'grade2': 'grade2PureTitanium',
      'grade5': 'grade5Ti6Al4V'
    },
    specialty: {
      'inconel625': 'inconel625',
      'az31b': 'az31bMagnesium',
      'zinc': 'commercialZinc',
      'lead': 'pureLead'
    }
  }
  
  const translationKey = mapping[materialKey]?.[gradeKey]
  return translationKey ? getTranslation(language, translationKey) : gradeKey
}

export const getProfileCategoryName = (language: Language, categoryKey: string): string => {
  const mapping: Record<string, keyof Translations> = {
    'basic': 'basicShapes',
    'beams': 'iBeamsHBeams',
    'channels': 'channelsAngles', 
    'hollow': 'hollowSections',
    'special': 'specialSections',
    'plates': 'steelPlates'
  }
  
  const translationKey = mapping[categoryKey]
  return translationKey ? getTranslation(language, translationKey) : categoryKey
}

export const getProfileTypeName = (language: Language, typeKey: string): string => {
  const mapping: Record<string, keyof Translations> = {
    // Basic shapes
    'rectangular': 'rectangularBar',
    'round': 'roundBar',
    'square': 'squareBar',
    'flat': 'flatBar',
    'hexagonal': 'hexagonalBar',
    
    // Beams
    'ipn': 'ipnIBeamNarrow',
    'ipe': 'ipeIBeamEuropean',
    'hea': 'heaHBeamSeriesA',
    'heb': 'hebHBeamSeriesB', 
    'hec': 'hecHBeamSeriesC',
    'wBeam': 'wBeamAISC',
    
    // Channels and angles
    'upn': 'upnUChannelNormal',
    'uChannel': 'cChannelAmerican',
    'equalAngle': 'equalAngle',
    'unequalAngle': 'unequalAngle',
    
    // Hollow sections
    'rhs': 'rhsRectangularHollow',
    'shs': 'shsSquareHollow',
    'chs': 'chsCircularHollow',
    'pipe': 'pipeSchedule',
    
    // Special sections
    'tBeam': 'tBeam',
    'bulbFlat': 'bulbFlat',
    'halfRound': 'halfRound',
    
    // Plates
    'plate': 'steelPlate',
    'sheetMetal': 'sheetMetal',
    'checkeredPlate': 'checkeredPlate',
    'perforatedPlate': 'perforatedPlate'
  }
  
  const translationKey = mapping[typeKey]
  return translationKey ? getTranslation(language, translationKey) : typeKey
}

export const availableLanguages: { code: Language; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'bs', name: 'Bosnian', nativeName: 'Bosanski' }
] 