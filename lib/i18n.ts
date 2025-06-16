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
  
  // Dimensions
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
  
  // Temperature
  temperatureEffects: string
  enableTemperatureEffects: string
  operatingTemperature: string
  referenceTemperature: string
  
  // Results
  calculationResults: string
  singleUnit: string
  totalCost: string
  unitCost: string
  quantity: string
  price: string
  pieces: string
  piece: string
  
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
  
  // Errors and validation
  calculationError: string
  invalidInputs: string
  selectProfileMaterial: string
  
  // Materials
  steel: string
  aluminum: string
  stainlessSteel: string
  copper: string
  brass: string
  
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
  
  // Common
  close: string
  cancel: string
  apply: string
  reset: string
  clear: string
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
    
    // Dimensions
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
    
    // Temperature
    temperatureEffects: "Temperature Effects",
    enableTemperatureEffects: "Enable Temperature Effects",
    operatingTemperature: "Operating Temperature",
    referenceTemperature: "Reference temperature: 20°C. Temperature affects material density.",
    
    // Results
    calculationResults: "Calculation Results",
    singleUnit: "Single Unit",
    totalCost: "Total Cost",
    unitCost: "Unit Cost",
    quantity: "Quantity",
    price: "Price",
    pieces: "pieces",
    piece: "piece",
    
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
    
    // Errors and validation
    calculationError: "Calculation Error",
    invalidInputs: "Invalid Inputs",
    selectProfileMaterial: "Select a profile and material to begin calculation",
    
    // Materials
    steel: "Steel",
    aluminum: "Aluminum",
    stainlessSteel: "Stainless Steel",
    copper: "Copper",
    brass: "Brass",
    
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
    
    // Common
    close: "Close",
    cancel: "Cancel",
    apply: "Apply",
    reset: "Reset",
    clear: "Clear"
  },
  
  bs: {
    // App title and navigation
    appTitle: "Profesionalni Kalkulator Metala",
    appSubtitle: "Izračunajte težine za strukturne profile i materijale",
    
    // Tabs
    calculator: "Kalkulator",
    compare: "Poredi",
    history: "Istorija",
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
    selectStandardSize: "Izaberite standardnu veličinu",
    
    // Dimensions
    dimensions: "Dimenzije",
    profileDimensions: "Dimenzije Profila",
    lengthUnit: "Jedinica Dužine",
    weightUnit: "Jedinica Težine",
    length: "Dužina",
    thickness: "Debljina",
    height: "Visina",
    width: "Širina",
    diameter: "Prečnik",
    wallThickness: "Debljina Zida",
    
    // Temperature
    temperatureEffects: "Temperaturni Efekti",
    enableTemperatureEffects: "Omogući Temperaturne Efekte",
    operatingTemperature: "Radna Temperatura",
    referenceTemperature: "Referentna temperatura: 20°C. Temperatura utiče na gustinu materijala.",
    
    // Results
    calculationResults: "Rezultati Izračuna",
    singleUnit: "Jedna Jedinica",
    totalCost: "Ukupna Cijena",
    unitCost: "Cijena po Jedinici",
    quantity: "Količina",
    price: "Cijena",
    pieces: "komada",
    piece: "komad",
    
    // Properties
    crossSectionalArea: "Površina Presjeka",
    volume: "Zapremina",
    structuralProperties: "Strukturna Svojstva",
    momentOfInertia: "Moment Inercije",
    sectionModulus: "Modul Presjeka",
    radiusOfGyration: "Poluprečnik Giracije",
    physicalProperties: "Fizička Svojstva",
    perimeter: "Obim",
    weightPerLength: "Težina/m",
    
    // Actions
    save: "Sačuvaj",
    share: "Podijeli",
    export: "Izvezi",
    load: "Učitaj",
    calculate: "Izračunaj",
    retry: "Ponovi Izračun",
    advancedAnalysis: "Napredna Analiza",
    
    // History
    calculationHistory: "Istorija Izračuna",
    noCalculations: "Nema sačuvanih izračuna",
    noCalculationsDesc: "Završeni izračuni će se pojaviti ovdje",
    recent: "Nedavni",
    allSizes: "Sve Veličine",
    
    // Errors and validation
    calculationError: "Greška u Izračunu",
    invalidInputs: "Neispravni Podaci",
    selectProfileMaterial: "Izaberite profil i materijal za početak izračuna",
    
    // Materials
    steel: "Čelik",
    aluminum: "Aluminijum",
    stainlessSteel: "Nerđajući Čelik",
    copper: "Bakar",
    brass: "Mesing",
    
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
    
    // Common
    close: "Zatvori",
    cancel: "Otkaži",
    apply: "Primijeni",
    reset: "Resetuj",
    clear: "Obriši"
  }
}

export const getTranslation = (language: Language, key: keyof Translations): string => {
  return translations[language]?.[key] || translations.en[key] || key
}

export const availableLanguages: { code: Language; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'bs', name: 'Bosnian', nativeName: 'Bosanski' }
] 