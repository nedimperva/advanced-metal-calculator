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
  
  // New tabs and navigation
  projects: string
  workforce: string
  workers: string
  machinery: string
  journal: string
  historyAndCompare: string
  
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
  unitsSettings: string
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
  
  // Projects
  projectName: string
  projectDescription: string
  createProject: string
  editProject: string
  deleteProject: string
  viewProject: string
  noProject: string
  selectProject: string
  generalHistory: string
  projectDetails: string
  projectMaterials: string
  projectTimeline: string
  projectTasks: string
  projectStatus: string
  projectProgress: string
  addCalculation: string
  moveToProject: string
  projectCreated: string
  projectUpdated: string
  projectDeleted: string
  
  // Workforce
  workersManagement: string
  machineryManagement: string
  dailyJournal: string
  addWorker: string
  addMachinery: string
  workerName: string
  hourlyRate: string
  specialization: string
  machineryName: string
  machineryType: string
  operatingCost: string
  hoursWorked: string
  totalHours: string
  journalEntry: string
  timesheet: string
  workLog: string
  
  // History & Compare
  filterHistory: string
  searchHistory: string
  compareCalculations: string
  addToComparison: string
  removeFromComparison: string
  comparisonLimit: string
  clearFilters: string
  resetFilters: string
  showAll: string
  dateRange: string
  lastWeek: string
  lastMonth: string
  lastThreeMonths: string
  lastSixMonths: string
  
  // Bulk operations
  bulkEntry: string
  bulkSelect: string
  selectAll: string
  deselectAll: string
  applyToSelected: string
  defaultHours: string
  
  // Templates
  template: string
  templates: string
  saveTemplate: string
  deleteTemplate: string
  applyTemplate: string
  templateName: string
  createTemplate: string
  
  // View modes
  quickMode: string
  dailyMode: string
  projectMode: string
  
  // Navigation
  previousDay: string
  nextDay: string
  goToToday: string
  
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
  
  // Missing keys for UI elements
  update: string
  custom: string
  editMode: string
  cancelEdit: string
  addNotes: string
  addNotesOptional: string
  addNotesPlaceholder: string
  defaults: string
  units: string
  selectProjectOptional: string
  calculationUpdated: string
  addedToComparison: string
  calculationAddedToComparison: string
  comparisonLimitReached: string
  movedTo: string
  editingCalculation: string
  clickUpdateToSave: string
  calculationDeleted: string
  calculationRemoved: string
  deleteFailed: string
  editCancelled: string
  returnedToNormalMode: string
  updatedIn: string
  pcs: string
  
  // New strings to translate  
  crossSectionView: string
  steelVersatileDesc: string
  stainlessLimitedDesc: string
  noCalculationsSelected: string
  noCalculationsSelectedForComparison: string
  selectCalculationsFromHistory: string
  calculationHistoryTitle: string
  searchCalculations: string
  allProjects: string
  allTime: string
  allMaterials: string
  allProfileTypes: string
  clearAll: string
  applyFilters: string
  narrowDownHistory: string
  exportSuccessful: string
  exportedCalculations: string
  
  // Mobile history and comparison translations
  noCalculationsInHistory: string
  startCreatingCalculations: string
  releaseToRefresh: string
  pullToRefresh: string
  filterCalculations: string
  filters: string
  calculationDetails: string
  comparison: string
  comparisonOptions: string
  customizeComparison: string
  sortBy: string
  sortOrder: string
  ascending: string
  descending: string
  viewMode: string
  carousel: string
  sideBySide: string
  baseline: string
  showLess: string
  showMore: string
  loadCalculation: string
  created: string
  at: string
  weightPerUnit: string
  costPerKg: string
  
  // Project Management & Dashboard
  manageConstructionProjects: string
  newProject: string
  totalProjects: string
  activeProjects: string
  totalInvestment: string
  budget: string
  completionRate: string
  workforceOverview: string
  totalLaborHours: string
  machineHours: string
  laborCosts: string
  searchProjects: string
  allStatuses: string
  lastUpdated: string
  generalCalculations: string
  overview: string
  tasks: string
  materials: string
  timeline: string
  progressOverview: string
  overallProgress: string
  taskManagement: string
  addTask: string
  noTasks: string
  createFirstTask: string
  rectangularBars: string
  presets: string
    calculationComparison: string
  weight: string
  actions: string
  costWeight: string
}

export const translations: Record<Language, Translations> = {
  en: {
    // App title and navigation
    appTitle: "SteelForge Pro",
    appSubtitle: "Calculate weights for structural profiles and materials",
    
    // Tabs
    calculator: "Calculator",
    compare: "Compare",
    history: "History", 
    breakdown: "Breakdown",
    advanced: "Advanced",
    settings: "Settings",
    
          // New tabs and navigation
      projects: "Projects",
      workforce: "Workforce", 
      workers: "Workers",
      machinery: "Machinery",
      journal: "Journal",
      historyAndCompare: "History & Compare",
    
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
      unitsSettings: "Units",
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
    
    // Projects
    projectName: "Project Name",
    projectDescription: "Project Description",
    createProject: "Create Project",
    editProject: "Edit Project",
    deleteProject: "Delete Project",
    viewProject: "View Project",
    noProject: "No Project",
    selectProject: "Select Project",
    generalHistory: "General History",
    allProjects: "All Projects",
    projectDetails: "Project Details",
    projectMaterials: "Project Materials",
    projectTimeline: "Project Timeline",
    projectTasks: "Project Tasks",
    projectStatus: "Project Status",
    projectProgress: "Project Progress",
    addCalculation: "Add Calculation",
    moveToProject: "Move to Project",
    projectCreated: "Project Created",
    projectUpdated: "Project Updated",
    projectDeleted: "Project Deleted",
    
    // Workforce
    workersManagement: "Workers Management",
    machineryManagement: "Machinery Management",
    dailyJournal: "Daily Journal",
    addWorker: "Add Worker",
    addMachinery: "Add Machinery",
    workerName: "Worker Name",
    hourlyRate: "Hourly Rate",
    specialization: "Specialization",
    machineryName: "Machinery Name",
    machineryType: "Machinery Type",
    operatingCost: "Operating Cost",
    hoursWorked: "Hours Worked",
    totalHours: "Total Hours",
    journalEntry: "Journal Entry",
    timesheet: "Timesheet",
    workLog: "Work Log",
    
    // History & Compare
    filterHistory: "Filter History",
    searchHistory: "Search History",
    compareCalculations: "Compare Calculations",
    addToComparison: "Add to Comparison",
    removeFromComparison: "Remove from Comparison",
    comparisonLimit: "Comparison Limit",
    narrowDownHistory: "Narrow Down History",
    clearFilters: "Clear Filters",
    resetFilters: "Reset Filters",
    showAll: "Show All",
    dateRange: "Date Range",
    materialType: "Material Type",
    profileType: "Profile Type",
    lastWeek: "Last Week",
    lastMonth: "Last Month",
    lastThreeMonths: "Last Three Months",
    lastSixMonths: "Last Six Months",
    thisWeek: "This Week",
    thisMonth: "This Month",
    
    // Bulk operations
    bulkEntry: "Bulk Entry",
    bulkSelect: "Bulk Select",
    selectAll: "Select All",
    deselectAll: "Deselect All",
    applyToSelected: "Apply to Selected",
    defaultHours: "Default Hours",
    
    // Templates
    template: "Template",
    templates: "Templates",
    saveTemplate: "Save Template",
    deleteTemplate: "Delete Template",
    applyTemplate: "Apply Template",
    templateName: "Template Name",
    createTemplate: "Create Template",
    
    // View modes
    quickMode: "Quick Mode",
    dailyMode: "Daily Mode",
    projectMode: "Project Mode",
    
    // Navigation
    previousDay: "Previous Day",
    nextDay: "Next Day",
    today: "Today",
    goToToday: "Go to Today",
    
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
    success: "Success",
    
    // Missing keys for UI elements
    update: "Update",
    custom: "Custom",
    editMode: "Edit Mode",
    cancelEdit: "Cancel Edit",
    addNotes: "Add Notes",
    addNotesOptional: "Add Notes (Optional)",
    addNotesPlaceholder: "Add notes here...",
    defaults: "Defaults",
    units: "Units",
    selectProjectOptional: "Select Project (Optional)",
    calculationUpdated: "Calculation Updated",
    addedToComparison: "Added to Comparison",
    calculationAddedToComparison: "Calculation Added to Comparison",
    comparisonLimitReached: "Comparison Limit Reached",
    movedTo: "Moved To",
    editingCalculation: "Editing Calculation",
    clickUpdateToSave: "Click Update to Save",
    calculationDeleted: "Calculation Deleted",
    calculationRemoved: "Calculation Removed",
    deleteFailed: "Delete Failed",
    editCancelled: "Edit Cancelled",
    returnedToNormalMode: "Returned to Normal Mode",
    updatedIn: "Updated In",
    pcs: "pcs",
    
    // New strings to translate  
    crossSectionView: "Cross-Section View",
    steelVersatileDesc: "Steel is the most versatile construction material with excellent availability for all profile types.",
    noCalculationsSelected: "No calculations selected",
    noCalculationsSelectedForComparison: "No calculations selected for comparison",
    selectCalculationsFromHistory: "Select calculations from history",
    calculationHistoryTitle: "Calculation History",
    searchCalculations: "Search Calculations",
    allProjects: "All Projects",
    allTime: "All Time",
    allMaterials: "All Materials",
    allProfileTypes: "All Profile Types",
    clearAll: "Clear All",
    applyFilters: "Apply Filters",
    baseline: "Baseline",
    loadCalculation: "Load Calculation", 
    sortBy: "Sort by",
    narrowDownHistory: "Narrow Down History",
    exportSuccessful: "Export Successful",
    exportedCalculations: "Exported Calculations",
    
    // Mobile history and comparison translations
    noCalculationsInHistory: "No calculations in history",
    startCreatingCalculations: "Start by creating some calculations to see them here",
    releaseToRefresh: "Release to refresh",
    pullToRefresh: "Pull to refresh",
    filterCalculations: "Filter Calculations",
    filters: "Filters",
    calculationDetails: "Calculation Details",
    comparison: "Comparison",
    comparisonOptions: "Comparison Options",
    customizeComparison: "Customize how calculations are compared",
    sortBy: "Sort by",
    sortOrder: "Sort order",
    ascending: "Ascending",
    descending: "Descending",
    viewMode: "View mode",
    carousel: "Carousel",
    sideBySide: "Side-by-Side",
    baseline: "Baseline",
    showLess: "Show Less",
    showMore: "Show More", 
    loadCalculation: "Load Calculation",
    created: "Created",
    at: "at",
    weightPerUnit: "Weight per unit",
    costPerKg: "Cost per kg",
    stainlessLimitedDesc: "Corrosion resistant with limited profile selection for specialized applications.",
    
    // Project Management & Dashboard
    manageConstructionProjects: "Manage Construction Projects",
    newProject: "New Project",
    totalProjects: "Total Projects",
    activeProjects: "Active Projects",
    totalInvestment: "Total Investment",
    budget: "Budget",
    completionRate: "Completion Rate",
    workforceOverview: "Workforce Overview",
    totalLaborHours: "Total Labor Hours",
    machineHours: "Machine Hours",
    laborCosts: "Labor Costs",
    searchProjects: "Search Projects",
    allStatuses: "All Statuses",
    lastUpdated: "Last Updated",
    generalCalculations: "General Calculations",
    editProject: "Edit Project",
    overview: "Overview",
    tasks: "Tasks",
    materials: "Materials",
    timeline: "Timeline",
    progressOverview: "Progress Overview",
    overallProgress: "Overall Progress",
    taskManagement: "Task Management",
    addTask: "Add Task",
    noTasks: "No Tasks",
    createFirstTask: "Create First Task",
    rectangularBars: "Rectangular Bars",
    presets: "Presets",
    calculationComparison: "Calculation Comparison",
    weight: "Weight",
    cost: "Cost",
    quantity: "Quantity",
    actions: "Actions",
    projects: "Projects"
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
    
          // New tabs and navigation
      projects: "Projekti",
      workforce: "Radna Snaga", 
      workers: "Radnici",
      machinery: "Mašine",
      journal: "Dnevnik",
      historyAndCompare: "Historija i Poređenje",
    
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
    unitsSettings: "Jedinice",
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
    
    // Projects
    projectName: "Naziv Projekta",
    projectDescription: "Opis Projekta",
    createProject: "Kreiraj Projekt",
    editProject: "Uredi Projekt",
    deleteProject: "Obriši Projekt",
    viewProject: "Pogledaj Projekt",
    noProject: "Nema Projekta",
    selectProject: "Odaberite Projekt",
    generalHistory: "Opća Historija",
    allProjects: "Svi Projekti",
    projectDetails: "Detalji Projekta",
    projectMaterials: "Materijali Projekta",
    projectTimeline: "Vremenski Plan Projekta",
    projectTasks: "Zadaci Projekta",
    projectStatus: "Status Projekta",
    projectProgress: "Napredak Projekta",
    addCalculation: "Dodaj Izračun",
    moveToProject: "Premjesti u Projekt",
    projectCreated: "Projekt Kreiran",
    projectUpdated: "Projekt Ažuriran",
    projectDeleted: "Projekt Obrišen",
    
    // Workforce
    workersManagement: "Upravljanje Radnicima",
    machineryManagement: "Upravljanje Mašinama",
    dailyJournal: "Dnevni Dnevnik",
    addWorker: "Dodaj Radnika",
    addMachinery: "Dodaj Mašinu",
    workerName: "Ime Radnika",
    hourlyRate: "Satnica",
    specialization: "Specijalizacija",
    machineryName: "Ime Mašine",
    machineryType: "Tip Mašine",
    operatingCost: "Operativni Trošak",
    hoursWorked: "Radnih Sati",
    totalHours: "Ukupno Radnih Sati",
    totalCost: "Ukupna Cijena",
    journalEntry: "Unos u Dnevnik",
    timesheet: "Raspored",
    workLog: "Dnevnik Rada",
    
    // History & Compare
    filterHistory: "Filter Historije",
    searchHistory: "Pretraži Historiju",
    compareCalculations: "Poredi Izračune",
    addToComparison: "Dodaj u Poredjenje",
    removeFromComparison: "Ukloni iz Poredjenja",
    comparisonLimit: "Granica Poredjenja",
    narrowDownHistory: "Ogranici Historiju",
    clearFilters: "Očisti Filteri",
    resetFilters: "Resetuj Filteri",
    showAll: "Pokaži Sve",
    dateRange: "Raspon Datuma",
    materialType: "Tip Materijala",
    profileType: "Tip Profila",
    lastWeek: "Prošla Nedjelja",
    lastMonth: "Prošli Mjesec",
    lastThreeMonths: "Prošla Tri Mjeseca",
    lastSixMonths: "Prošla Šest Mjeseci",
    thisWeek: "Ova Nedjelja",
    thisMonth: "Ovaj Mjesec",
    
    // Bulk operations
    bulkEntry: "Masovni Unos",
    bulkSelect: "Masovni Odabir",
    selectAll: "Odaberi Sve",
    deselectAll: "Ukloni Odabir",
    applyToSelected: "Primijeni na Odabrano",
    defaultHours: "Zadani Satni",
    
    // Templates
    template: "Šablon",
    templates: "Šabloni",
    saveTemplate: "Sačuvaj Šablon",
    deleteTemplate: "Obriši Šablon",
    applyTemplate: "Primijeni Šablon",
    templateName: "Naziv Šablona",
    createTemplate: "Kreiraj Šablon",
    
    // View modes
    quickMode: "Brzi Mod",
    dailyMode: "Dnevni Mod",
    projectMode: "Projektni Mod",
    
    // Navigation
    previousDay: "Prethodni Dan",
    nextDay: "Slijedeći Dan",
    today: "Danas",
    goToToday: "Idi na Danas",
    
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
    hardness: "Tvrdoća",
    thermalProperties: "Termička Svojstva",
    expansion: "Termično Širenje",
    conductivity: "Toplinska Provodljivost",
    typicalApplications: "Tipične Primjene",
    standards: "Standardi",
    grades: "Kvaliteti",
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
    ipnIBeamNarrow: "IPN Uski I-Profil",
    ipeIBeamEuropean: "IPE Evropski I-Profil",
    heaHBeamSeriesA: "HEA H-Profil Serija A",
    hebHBeamSeriesB: "HEB H-Profil Serija B",
    hecHBeamSeriesC: "HEC H-Profil Serija C",
    wBeamAISC: "W-Profil AISC",
    
    // Channel and Angle Names
    upnUChannelNormal: "UPN Normalni U-Kanal",
    cChannelAmerican: "C Američki Kanal",
    equalAngle: "Jednaki Ugao",
    unequalAngle: "Nejednaki Ugao",
    
    // Hollow Section Names
    rhsRectangularHollow: "RHS Pravougaoni Šuplji Profil",
    shsSquareHollow: "SHS Kvadratni Šuplji Profil",
    chsCircularHollow: "CHS Kružni Šuplji Profil",
    pipeSchedule: "Cijevni Raspored",
    
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
    success: "Uspjeh",
    
    // Missing keys for UI elements
    update: "Ažuriraj",
    custom: "Prilagođeno",
    editMode: "Režim Uređivanja",
    cancelEdit: "Otkaži Uređivanje",
    addNotes: "Dodaj Bilješke",
    addNotesOptional: "Dodaj Bilješke (Opcionalno)",
    addNotesPlaceholder: "Dodaj bilješke ovdje...",
    defaults: "Zadane Vrijednosti",
    units: "Jedinice",
    selectProjectOptional: "Odaberite Projekt (Opcionalno)",
    calculationUpdated: "Izračun Ažuriran",
    addedToComparison: "Dodano u Poređenje",
    calculationAddedToComparison: "Izračun Dodan u Poređenje",
    comparisonLimitReached: "Dosegnuta Granica Poređenja",
    movedTo: "Premješteno u",
    editingCalculation: "Uređujem Izračun",
    clickUpdateToSave: "Kliknite Ažuriraj za Snimanje",
    calculationDeleted: "Izračun Obrisan",
    calculationRemoved: "Izračun Uklonjen",
    deleteFailed: "Brisanje Neuspješno",
    editCancelled: "Uređivanje Otkazano",
    returnedToNormalMode: "Vraćeno u Normalni Režim",
    updatedIn: "Ažurirano u",
    pcs: "kom",
    
         // New strings to translate  
     crossSectionView: "Pregled Presjeka",
     steelVersatileDesc: "Čelik je najsvestraniji građevinski materijal sa odličnom dostupnošću za sve tipove profila",
     stainlessLimitedDesc: "Dostupnost nehrđajućeg čelika ograničena za velike strukturne sekcije zbog cijene",
     noCalculationsSelected: "Nema odabranih izračuna",
     noCalculationsSelectedForComparison: "Nema odabranih izračuna za poređenje",
     selectCalculationsFromHistory: "Odaberite izračune iz Historije tab-a da ih poredite ovdje",
     calculationHistoryTitle: "Historija Izračuna",
     searchCalculations: "Pretraži izračune...",
     allProjects: "Svi Projekti",
     allTime: "Svo Vrijeme",
     allMaterials: "Svi Materijali",
     allProfileTypes: "Svi Tipovi Profila",
     clearAll: "Obriši Sve",
           applyFilters: "Primijeni Filtere",
      baseline: "Bazna Linija",
      loadCalculation: "Učitaj Izračun",
      sortBy: "Sortiraj po",
      narrowDownHistory: "Sužite istoriju izračuna",
         exportSuccessful: "Izvoz Uspješan",
    exportedCalculations: "Izvezeni izračuni",
    
    // Mobile history and comparison translations
    noCalculationsInHistory: "Nema izračuna u historiji",
    startCreatingCalculations: "Započnite kreiranje izračuna da biste ih vidjeli ovdje",
    releaseToRefresh: "Otpustite za osvježavanje",
    pullToRefresh: "Povucite za osvježavanje",
    filterCalculations: "Filtriraj Izračune",
    filters: "Filteri",
    calculationDetails: "Detalji Izračuna",
    comparison: "Poređenje",
    comparisonOptions: "Opcije Poređenja",
    customizeComparison: "Prilagodite kako se izračuni porede",
    sortBy: "Sortiraj po",
    sortOrder: "Redoslijed sortiranja",
    ascending: "Rastući",
    descending: "Opadajući",
    viewMode: "Način prikaza",
    carousel: "Karusel",
    sideBySide: "Jedan pored drugog",
    baseline: "Osnova",
    showLess: "Prikaži manje",
    showMore: "Prikaži više",
    loadCalculation: "Učitaj Izračun",
    created: "Kreiran",
    at: "u",
    weightPerUnit: "Težina po jedinici",
    costPerKg: "Cijena po kg",
    stainlessLimitedDesc: "Otporan na koroziju sa ograničenim izborom profila za specijalizirane primjene.",
    
    // Project Management & Dashboard
    manageConstructionProjects: "Upravljanje Građevinskim Projektima",
    newProject: "Novi Projekt",
    totalProjects: "Ukupno Projekata",
    activeProjects: "Aktivni Projekti",
    totalInvestment: "Ukupna Investicija",
    budget: "Budžet",
    completionRate: "Stopa Završetka",
    workforceOverview: "Pregled Radne Snage",
    totalLaborHours: "Ukupno Radnih Sati",
    machineHours: "Mašinski Sati",
    laborCosts: "Troškovi Radne Snage",
    searchProjects: "Pretraži Projekte",
    allStatuses: "Svi Statusi",
    lastUpdated: "Poslednje Ažuriranje",
    generalCalculations: "Opći Izračuni",
    editProject: "Uredi Projekt",
    overview: "Pregled",
    tasks: "Zadaci",
    materials: "Materijali",
    timeline: "Vremenski Plan",
    progressOverview: "Pregled Napretka",
    overallProgress: "Ukupni Napredak",
    taskManagement: "Upravljanje Zadacima",
    addTask: "Dodaj Zadatak",
    noTasks: "Nema Zadataka",
    createFirstTask: "Kreiraj Prvi Zadatak",
    rectangularBars: "Pravougaoni Profili",
    presets: "Predefinisane Postavke",
    calculationComparison: "Poređenje Izračuna",
    weight: "Težina",
    cost: "Cijena",
    quantity: "Količina",
    actions: "Akcije",
    projects: "Projekti"
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