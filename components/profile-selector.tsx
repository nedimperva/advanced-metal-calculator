"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Info, Clock, AlertTriangle } from "lucide-react"
import { PROFILES } from "@/lib/metal-data"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useUserPreferences } from "@/hooks/use-user-preferences"
import { 
  getCompatibleProfileCategories, 
  getCompatibleProfileTypesInCategory, 
  isProfileCompatible,
  getMaterialProfileNotes
} from "@/lib/material-profile-compatibility"
import { useI18n } from "@/contexts/i18n-context"
import { getProfileCategoryName, getProfileTypeName } from "@/lib/i18n"

interface ProfileSelectorProps {
  profileCategory: string
  setProfileCategory: (category: string) => void
  profileType: string
  setProfileType: (type: string) => void
  material?: string // Add material prop for compatibility filtering
}

export default function ProfileSelector({
  profileCategory,
  setProfileCategory,
  profileType,
  setProfileType,
  material = "steel", // Default to steel for backward compatibility
}: ProfileSelectorProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { trackProfile, getSuggestions } = useUserPreferences()
  const suggestions = getSuggestions()
  const { t, language } = useI18n()

  // Get material compatibility data
  const compatibleCategories = getCompatibleProfileCategories(material)
  const materialNotesKey = getMaterialProfileNotes(material)
  // Translate the notes if they are a translation key, otherwise use as-is for compatibility
  const materialNotes = materialNotesKey && materialNotesKey.includes('Desc') ? t(materialNotesKey as any) : materialNotesKey
  
  // Filter available profile categories based on material compatibility
  const availableCategories = Object.entries(PROFILES).filter(([key]) => 
    compatibleCategories.includes(key)
  )

  // Visual selection for profile categories
  const handleCategorySelect = (category: string) => {
    setProfileCategory(category)
    // Get compatible profile types for this material and category
    const compatibleTypes = getCompatibleProfileTypesInCategory(material, category)
    const availableTypes = Object.keys(PROFILES[category as keyof typeof PROFILES].types).filter(type =>
      compatibleTypes.includes(type)
    )
    
    // Select first compatible profile type in the new category, or most recent if available
    const recentTypes = suggestions.getProfileTypes(category).filter(type => compatibleTypes.includes(type))
    const firstType = recentTypes.length > 0 ? recentTypes[0] : availableTypes[0]
    
    if (firstType) {
      setProfileType(firstType)
      // Track the selection
      trackProfile(category, firstType)
    }
  }

  const handleTypeSelect = (type: string) => {
    setProfileType(type)
    // Track the selection
    trackProfile(profileCategory, type)
  }

  const ProfileVisualizationModal = () => (
    <DialogContent className="max-w-sm mx-4">
      <DialogHeader>
        <DialogTitle>{t('profileVisualization')}</DialogTitle>
      </DialogHeader>
      <div className="flex justify-center items-center p-4">
        <ProfileVisualization profileType={profileType} />
      </div>
      <div className="text-sm text-muted-foreground text-center">
        {t('selectedProfileVisualization')}
      </div>
    </DialogContent>
  )

  if (isMobile) {
    return (
      <div className="space-y-3">
        {/* Material compatibility notice */}
        {materialNotes && (
          <div className="bg-muted/50 border border-border rounded-md p-2">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                {materialNotes}
              </p>
            </div>
          </div>
        )}
        
        {/* Simplified Category Selection for Mobile */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">{t('profileCategory')}</div>
            <Badge variant="secondary" className="text-xs">
              {availableCategories.length} {t('available')}
            </Badge>
          </div>
          <Select value={profileCategory} onValueChange={handleCategorySelect}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableCategories.map(([key, category]) => (
                <SelectItem key={key} value={key}>
                  {getProfileCategoryName(language, key)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Simplified Profile Type Selection for Mobile */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">{t('profileType')}</div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Info className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <ProfileVisualizationModal />
            </Dialog>
          </div>
          <Select value={profileType} onValueChange={handleTypeSelect}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {/* Recent types for this category first */}
              {(() => {
                const compatibleTypes = getCompatibleProfileTypesInCategory(material, profileCategory)
                const recentCompatibleTypes = suggestions.getProfileTypes(profileCategory).filter(type => 
                  compatibleTypes.includes(type)
                )
                
                return (
                  <>
                    {recentCompatibleTypes.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs font-medium text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {t('recentIn')} {PROFILES[profileCategory as keyof typeof PROFILES]?.name}
                        </div>
                        {recentCompatibleTypes.map((key) => {
                          const profile = PROFILES[profileCategory as keyof typeof PROFILES]?.types[key as keyof (typeof PROFILES)[keyof typeof PROFILES]["types"]] as any
                          if (!profile) return null
                          return (
                            <SelectItem key={`recent-${key}`} value={key}>
                              <div className="flex items-center gap-2">
                                <span>{getProfileTypeName(language, key)}</span>
                                <Clock className="h-3 w-3 text-muted-foreground ml-auto" />
                              </div>
                            </SelectItem>
                          )
                        })}
                        <div className="px-2 py-1 text-xs font-medium text-muted-foreground">{t('allCompatibleTypes')}</div>
                      </>
                    )}
                    {Object.entries(PROFILES[profileCategory as keyof typeof PROFILES]?.types || {}).map(([key, profile]: [string, any]) => {
                      // Skip if already shown in recent or not compatible
                      if (recentCompatibleTypes.includes(key) || !compatibleTypes.includes(key)) return null
                      return (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <span>{getProfileTypeName(language, key)}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </>
                )
              })()}
            </SelectContent>
          </Select>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Material compatibility notice for desktop */}
      {materialNotes && (
                        <div className="bg-muted/50 border border-border rounded-md p-2">
                  <div className="flex items-start gap-2">
                    <Info className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">
              {materialNotes}
            </p>
          </div>
        </div>
      )}
      
      {/* Visual Category Selection */}
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-1">
          {availableCategories.map(([key, category]) => {
            const compatibleTypesCount = getCompatibleProfileTypesInCategory(material, key).length
            return (
              <div
                key={key}
                className={cn(
                  "border rounded-md p-2 text-center cursor-pointer transition-all duration-200 hover-lift",
                  profileCategory === key
                    ? "selected-item-strong"
                    : "hover:bg-muted border-border hover:border-accent",
                )}
                onClick={() => handleCategorySelect(key)}
              >
                <div className="text-xs font-medium">{getProfileCategoryName(language, key)}</div>
                <div className="text-xs text-muted-foreground">{compatibleTypesCount} {t('types')}</div>
              </div>
            )
          })}
        </div>
        
        {/* Show incompatible categories if any */}
        {Object.entries(PROFILES).length > availableCategories.length && (
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {t('unavailableFor')} {material === "steel" ? "steel" : material === "aluminum" ? "aluminum" : material}
            </div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(PROFILES)
                .filter(([key]) => !compatibleCategories.includes(key))
                .map(([key, category]) => (
                  <Badge key={key} variant="outline" className="text-xs opacity-50">
                    {getProfileCategoryName(language, key)}
                  </Badge>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Profile Type Selection */}
      <div>
        <Select value={profileType} onValueChange={handleTypeSelect}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(() => {
              const compatibleTypes = getCompatibleProfileTypesInCategory(material, profileCategory)
              return Object.entries(PROFILES[profileCategory as keyof typeof PROFILES]?.types || {}).map(([key, profile]: [string, any]) => {
                // Only show compatible types
                if (!compatibleTypes.includes(key)) return null
                
                return (
                  <SelectItem key={key} value={key}>
                    <span>{getProfileTypeName(language, key)}</span>
                  </SelectItem>
                )
              })
            })()}
          </SelectContent>
        </Select>
      </div>

      {/* Compact Profile Visualization */}
      <div className="border rounded-md p-2 flex justify-center items-center bg-card/50 backdrop-blur-sm">
        <ProfileVisualization profileType={profileType} />
      </div>
    </div>
  )
}

function ProfileVisualization({ profileType }: { profileType: string }) {
  // Enhanced SVG visualizations for different profile types with accurate dimension labels
  const visualizations: Record<string, React.JSX.Element> = {
    // Basic Shapes
    rectangular: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="currentColor" />
          </marker>
        </defs>
        <rect
          x="30" y="25" width="60" height="30"
          stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.15" rx="2"
        />
        {/* Width dimension */}
        <line x1="30" y1="70" x2="90" y2="70" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
        <text x="60" y="78" textAnchor="middle" className="text-[8px] fill-current font-medium">width</text>
        {/* Height dimension */}
        <line x1="105" y1="25" x2="105" y2="55" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
        <text x="110" y="43" textAnchor="start" className="text-[8px] fill-current font-medium">height</text>

      </svg>
    ),
    round: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-round" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="currentColor" />
          </marker>
        </defs>
        <circle cx="60" cy="40" r="22" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.15" />
        {/* Diameter line */}
        <line x1="38" y1="40" x2="82" y2="40" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" />
        {/* Diameter dimension */}
        <line x1="35" y1="65" x2="85" y2="65" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-round)" markerStart="url(#arrow-round)" />
        <text x="60" y="73" textAnchor="middle" className="text-[8px] fill-current font-medium">diameter</text>
      </svg>
    ),
    square: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-square" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="currentColor" />
          </marker>
        </defs>
        <rect x="35" y="20" width="50" height="40" stroke="currentColor" strokeWidth="2" 
              fill="currentColor" fillOpacity="0.15" rx="2" />
        {/* Dimensions */}
        <line x1="25" y1="20" x2="25" y2="60" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-square)" markerStart="url(#arrow-square)" />
        <text x="18" y="43" textAnchor="middle" className="text-[8px] fill-current font-medium" transform="rotate(-90, 18, 43)">side</text>
        <line x1="35" y1="70" x2="85" y2="70" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-square)" markerStart="url(#arrow-square)" />
        <text x="60" y="78" textAnchor="middle" className="text-[8px] fill-current font-medium">side</text>
      </svg>
    ),
    flat: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-flat" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="currentColor" />
          </marker>
        </defs>
        <rect x="25" y="35" width="70" height="10" stroke="currentColor" strokeWidth="2" 
              fill="currentColor" fillOpacity="0.15" rx="1" />
        {/* Dimensions */}
        <line x1="25" y1="60" x2="95" y2="60" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-flat)" markerStart="url(#arrow-flat)" />
        <text x="60" y="68" textAnchor="middle" className="text-[8px] fill-current font-medium">width</text>
        <line x1="105" y1="35" x2="105" y2="45" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-flat)" markerStart="url(#arrow-flat)" />
        <text x="110" y="43" textAnchor="start" className="text-[8px] fill-current font-medium">thickness</text>
      </svg>
    ),
    hexagonal: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-hex" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="currentColor" />
          </marker>
        </defs>
        <polygon points="45,20 75,20 90,40 75,60 45,60 30,40" stroke="currentColor" strokeWidth="2" 
                 fill="currentColor" fillOpacity="0.15" />
        {/* Distance across flats dimension */}
        <line x1="25" y1="40" x2="95" y2="40" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" />
        <line x1="25" y1="70" x2="95" y2="70" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-hex)" markerStart="url(#arrow-hex)" />
        <text x="60" y="78" textAnchor="middle" className="text-[8px] fill-current font-medium">across flats</text>
      </svg>
    ),

    // European I-Beams - IPN (Narrow Profile)
    ipn: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-ipn" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="currentColor" />
          </marker>
        </defs>
        {/* IPN I-beam profile - narrower flanges */}
        <path d="M40 15 L80 15 L80 22 L63 22 L63 58 L80 58 L80 65 L40 65 L40 58 L57 58 L57 22 L40 22 Z" 
              stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.15" />
        {/* Dimensions */}
        <line x1="35" y1="15" x2="35" y2="65" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-ipn)" markerStart="url(#arrow-ipn)" />
        <text x="28" y="43" textAnchor="middle" className="text-[8px] fill-current font-medium" transform="rotate(-90, 28, 43)">h</text>
        <line x1="40" y1="75" x2="80" y2="75" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-ipn)" markerStart="url(#arrow-ipn)" />
        <text x="60" y="78" textAnchor="middle" className="text-[8px] fill-current font-medium">b</text>
        <text x="60" y="10" textAnchor="middle" className="text-xs fill-current font-bold">IPN</text>
        {/* Web and flange thickness indicators */}
        <text x="90" y="20" className="text-[7px] fill-current">tf</text>
        <text x="95" y="40" className="text-[7px] fill-current">tw</text>
      </svg>
    ),
    ipe: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-ipe" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="currentColor" />
          </marker>
        </defs>
        {/* IPE I-beam profile - European standard */}
        <path d="M32 15 L88 15 L88 23 L64 23 L64 57 L88 57 L88 65 L32 65 L32 57 L56 57 L56 23 L32 23 Z" 
              stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.15" />
        {/* Dimensions */}
        <line x1="25" y1="15" x2="25" y2="65" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-ipe)" markerStart="url(#arrow-ipe)" />
        <text x="18" y="43" textAnchor="middle" className="text-[8px] fill-current font-medium" transform="rotate(-90, 18, 43)">h</text>
        <line x1="32" y1="75" x2="88" y2="75" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-ipe)" markerStart="url(#arrow-ipe)" />
        <text x="60" y="78" textAnchor="middle" className="text-[8px] fill-current font-medium">b</text>
        <text x="60" y="10" textAnchor="middle" className="text-xs fill-current font-bold">IPE</text>
        {/* Web and flange thickness indicators */}
        <text x="95" y="20" className="text-[7px] fill-current">tf</text>
        <text x="100" y="40" className="text-[7px] fill-current">tw</text>
        <text x="105" y="60" className="text-[7px] fill-current">r</text>
      </svg>
    ),
    hea: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-hea" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="currentColor" />
          </marker>
        </defs>
        {/* HEA H-beam profile - wide flanges, light series */}
        <path d="M25 15 L95 15 L95 24 L65 24 L65 56 L95 56 L95 65 L25 65 L25 56 L55 56 L55 24 L25 24 Z" 
              stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.15" />
        {/* Dimensions */}
        <line x1="18" y1="15" x2="18" y2="65" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-hea)" markerStart="url(#arrow-hea)" />
        <text x="11" y="43" textAnchor="middle" className="text-[8px] fill-current font-medium" transform="rotate(-90, 11, 43)">h</text>
        <line x1="25" y1="75" x2="95" y2="75" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-hea)" markerStart="url(#arrow-hea)" />
        <text x="60" y="78" textAnchor="middle" className="text-[8px] fill-current font-medium">b</text>
        <text x="60" y="10" textAnchor="middle" className="text-xs fill-current font-bold">HEA</text>
        {/* Web and flange thickness indicators */}
        <text x="102" y="20" className="text-[7px] fill-current">tf</text>
        <text x="107" y="40" className="text-[7px] fill-current">tw</text>
        <text x="102" y="60" className="text-[7px] fill-current">r</text>
      </svg>
    ),
    heb: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-heb" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="currentColor" />
          </marker>
        </defs>
        {/* HEB H-beam profile - heavy series, thicker flanges */}
        <path d="M22 12 L98 12 L98 28 L68 28 L68 52 L98 52 L98 68 L22 68 L22 52 L52 52 L52 28 L22 28 Z" 
              stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.15" />
        {/* Dimensions */}
        <line x1="15" y1="12" x2="15" y2="68" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-heb)" markerStart="url(#arrow-heb)" />
        <text x="8" y="43" textAnchor="middle" className="text-[8px] fill-current font-medium" transform="rotate(-90, 8, 43)">h</text>
        <line x1="22" y1="75" x2="98" y2="75" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-heb)" markerStart="url(#arrow-heb)" />
        <text x="60" y="78" textAnchor="middle" className="text-[8px] fill-current font-medium">b</text>
        <text x="60" y="8" textAnchor="middle" className="text-xs fill-current font-bold">HEB</text>
        {/* Web and flange thickness indicators */}
        <text x="105" y="22" className="text-[7px] fill-current">tf</text>
        <text x="110" y="40" className="text-[7px] fill-current">tw</text>
      </svg>
    ),
    hec: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-hec" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="currentColor" />
          </marker>
          {/* Dense crosshatch pattern for heavy section */}
          <pattern id="steelCrosshatch-hec" patternUnits="userSpaceOnUse" width="4" height="4">
            <path d="M 0,4 L 4,0 M 0,0 L 4,4" stroke="currentColor" strokeWidth="0.4" opacity="0.4"/>
            <path d="M 2,6 L 6,2 M -2,2 L 2,-2" stroke="currentColor" strokeWidth="0.4" opacity="0.4"/>
          </pattern>
          {/* Gradient for professional appearance */}
          <linearGradient id="hecGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.2"/>
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.15"/>
          </linearGradient>
        </defs>
        
        {/* HEC H-beam profile - extra heavy European column with thick flanges */}
        <g transform="translate(10, 8)">
          {/* Main H-shape with very thick flanges and web */}
          <path d="M 10 5 L 90 5 L 90 20 L 62 20 L 62 44 L 90 44 L 90 59 L 10 59 L 10 44 L 38 44 L 38 20 L 10 20 Z" 
                stroke="currentColor" strokeWidth="2.5" fill="url(#hecGradient)" />
          
          {/* Dense crosshatch overlay for heavy section */}
          <path d="M 10 5 L 90 5 L 90 20 L 62 20 L 62 44 L 90 44 L 90 59 L 10 59 L 10 44 L 38 44 L 38 20 L 10 20 Z" 
                fill="url(#steelCrosshatch-hec)" opacity="0.6" />
          
          {/* Root radius indicators at corners */}
          <path d="M 38 20 Q 35 17 38 14 Q 41 17 44 20" 
                stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.7" />
          <path d="M 56 20 Q 59 17 56 14 Q 53 17 50 20" 
                stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.7" />
          <path d="M 38 44 Q 35 47 38 50 Q 41 47 44 44" 
                stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.7" />
          <path d="M 56 44 Q 59 47 56 50 Q 53 47 50 44" 
                stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.7" />
          
          {/* Enhanced dimensions with professional arrows */}
          <line x1="2" y1="5" x2="2" y2="59" stroke="currentColor" strokeWidth="1" 
                markerEnd="url(#arrow-hec)" markerStart="url(#arrow-hec)" />
          <text x="-4" y="34" textAnchor="middle" className="text-[8px] fill-current font-bold" 
                transform="rotate(-90, -4, 34)">h</text>
          
          <line x1="10" y1="68" x2="90" y2="68" stroke="currentColor" strokeWidth="1" 
                markerEnd="url(#arrow-hec)" markerStart="url(#arrow-hec)" />
          <text x="50" y="72" textAnchor="middle" className="text-[8px] fill-current font-bold">b</text>
          
          {/* Profile designation with enhanced styling */}
          <text x="50" y="2" textAnchor="middle" className="text-xs fill-current font-bold">HEC</text>
          
          {/* Enhanced thickness indicators */}
          <text x="98" y="14" className="text-[7px] fill-current font-semibold">tf</text>
          <text x="103" y="32" className="text-[7px] fill-current font-semibold">tw</text>
          <text x="98" y="50" className="text-[7px] fill-current font-medium opacity-80">r</text>
        </g>
      </svg>
    ),
    wBeam: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-wbeam" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="currentColor" />
          </marker>
          {/* Professional gradient for W-beam */}
          <linearGradient id="wbeamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.25"/>
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.15"/>
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.2"/>
          </linearGradient>
          {/* Crosshatch pattern for American steel */}
          <pattern id="steelCrosshatch-wbeam" patternUnits="userSpaceOnUse" width="5" height="5">
            <path d="M 0,5 L 5,0 M 0,0 L 5,5" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
          </pattern>
        </defs>
        
        {/* American W-beam profile with tapered flanges */}
        <g transform="translate(15, 10)">
          {/* Main W-shape with tapered flanges (characteristic of American W-beams) */}
          <path d="M 15 8 L 75 8 L 75 18 L 55 20 L 55 40 L 75 42 L 75 52 L 15 52 L 15 42 L 35 40 L 35 20 L 15 18 Z" 
                stroke="currentColor" strokeWidth="2.5" fill="url(#wbeamGradient)" />
          
          {/* Crosshatch overlay */}
          <path d="M 15 8 L 75 8 L 75 18 L 55 20 L 55 40 L 75 42 L 75 52 L 15 52 L 15 42 L 35 40 L 35 20 L 15 18 Z" 
                fill="url(#steelCrosshatch-wbeam)" opacity="0.4" />
          
          {/* Tapered flange edges (characteristic of W-beams) */}
          <line x1="15" y1="8" x2="15" y2="18" stroke="currentColor" strokeWidth="2" />
          <line x1="75" y1="8" x2="75" y2="18" stroke="currentColor" strokeWidth="2" />
          <line x1="15" y1="42" x2="15" y2="52" stroke="currentColor" strokeWidth="2" />
          <line x1="75" y1="42" x2="75" y2="52" stroke="currentColor" strokeWidth="2" />
          
          {/* Professional dimensions with American notation */}
          <line x1="7" y1="8" x2="7" y2="52" stroke="currentColor" strokeWidth="1" 
                markerEnd="url(#arrow-wbeam)" markerStart="url(#arrow-wbeam)" />
          <text x="1" y="32" textAnchor="middle" className="text-[8px] fill-current font-bold" 
                transform="rotate(-90, 1, 32)">d</text>
          
          <line x1="15" y1="62" x2="75" y2="62" stroke="currentColor" strokeWidth="1" 
                markerEnd="url(#arrow-wbeam)" markerStart="url(#arrow-wbeam)" />
          <text x="45" y="66" textAnchor="middle" className="text-[8px] fill-current font-bold">bf</text>
          
          {/* Profile designation */}
          <text x="45" y="5" textAnchor="middle" className="text-xs fill-current font-bold">W</text>
          
          {/* American notation thickness indicators */}
          <text x="83" y="14" className="text-[7px] fill-current font-semibold">tf</text>
          <text x="88" y="30" className="text-[7px] fill-current font-semibold">tw</text>
        </g>
      </svg>
    ),

    // European U-Channels - UPN (U-Profile Normal)
    upn: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-upn" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="currentColor" />
          </marker>
        </defs>
        {/* UPN U-channel profile */}
        <path d="M35 15 L35 65 L85 65 L85 57 L43 57 L43 23 L85 23 L85 15 Z" 
              stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.15" />
        {/* Dimensions */}
        <line x1="25" y1="15" x2="25" y2="65" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-upn)" markerStart="url(#arrow-upn)" />
        <text x="18" y="43" textAnchor="middle" className="text-[8px] fill-current font-medium" transform="rotate(-90, 18, 43)">h</text>
        <line x1="35" y1="75" x2="85" y2="75" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-upn)" markerStart="url(#arrow-upn)" />
        <text x="60" y="78" textAnchor="middle" className="text-[8px] fill-current font-medium">b</text>
        <text x="60" y="10" textAnchor="middle" className="text-xs fill-current font-bold">UPN</text>
        {/* Web and flange thickness indicators */}
        <text x="93" y="20" className="text-[7px] fill-current">tf</text>
        <text x="28" y="40" className="text-[7px] fill-current">tw</text>
        <text x="93" y="60" className="text-[7px] fill-current">r</text>
      </svg>
    ),
    uChannel: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-uchannel" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="currentColor" />
          </marker>
          {/* Professional gradient for C-channel */}
          <linearGradient id="uchannelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.25"/>
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.15"/>
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.2"/>
          </linearGradient>
          {/* Crosshatch pattern for American C-channel */}
          <pattern id="steelCrosshatch-uchannel" patternUnits="userSpaceOnUse" width="5" height="5">
            <path d="M 0,5 L 5,0 M 0,0 L 5,5" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
          </pattern>
        </defs>
        
        {/* American C-channel profile with professional styling */}
        <g transform="translate(20, 12)">
          {/* Main C-shape with rounded corners */}
          <path d="M 10 8 L 10 52 L 70 52 L 70 44 L 18 44 L 18 16 L 70 16 L 70 8 Z" 
                stroke="currentColor" strokeWidth="2.5" fill="url(#uchannelGradient)" rx="2" />
          
          {/* Crosshatch overlay */}
          <path d="M 10 8 L 10 52 L 70 52 L 70 44 L 18 44 L 18 16 L 70 16 L 70 8 Z" 
                fill="url(#steelCrosshatch-uchannel)" opacity="0.4" />
          
          {/* Rounded corners for professional appearance */}
          <path d="M 18 16 Q 15 13 18 10 Q 21 13 24 16" 
                stroke="currentColor" strokeWidth="1" fill="none" opacity="0.6" />
          <path d="M 18 44 Q 15 47 18 50 Q 21 47 24 44" 
                stroke="currentColor" strokeWidth="1" fill="none" opacity="0.6" />
          
          {/* Enhanced dimensions with professional arrows */}
          <line x1="2" y1="8" x2="2" y2="52" stroke="currentColor" strokeWidth="1" 
                markerEnd="url(#arrow-uchannel)" markerStart="url(#arrow-uchannel)" />
          <text x="-4" y="32" textAnchor="middle" className="text-[8px] fill-current font-bold" 
                transform="rotate(-90, -4, 32)">d</text>
          
          <line x1="10" y1="62" x2="70" y2="62" stroke="currentColor" strokeWidth="1" 
                markerEnd="url(#arrow-uchannel)" markerStart="url(#arrow-uchannel)" />
          <text x="40" y="66" textAnchor="middle" className="text-[8px] fill-current font-bold">bf</text>
          
          {/* Profile designation */}
          <text x="40" y="5" textAnchor="middle" className="text-xs fill-current font-bold">C</text>
          
          {/* American notation thickness indicators */}
          <text x="78" y="14" className="text-[7px] fill-current font-semibold">tf</text>
          <text x="5" y="30" className="text-[7px] fill-current font-semibold">tw</text>
          <text x="78" y="48" className="text-[7px] fill-current font-medium opacity-80">r</text>
        </g>
      </svg>
    ),

    // Angles - Equal Angle (Enhanced Design)
    equalAngle: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-angle" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="currentColor" />
          </marker>
          {/* Steel cross-hatching pattern */}
          <pattern id="steelCrosshatch-angle" patternUnits="userSpaceOnUse" width="6" height="6">
            <path d="M 0,6 L 6,0 M 0,0 L 6,6" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
            <path d="M 3,9 L 9,3 M -3,3 L 3,-3" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
          </pattern>
        </defs>
        
        {/* Equal angle L-profile with proper proportions */}
        <g transform="translate(20, 10)">
          {/* Main L-shape path with proper thickness */}
          <path d="M 0 55 L 0 0 L 55 0 L 55 12 L 12 12 L 12 55 Z" 
                stroke="currentColor" strokeWidth="2.5" fill="url(#steelCrosshatch-angle)" fillOpacity="0.4" />
          
          {/* Internal corner fillet */}
          <path d="M 12 12 Q 8 8 12 4 Q 16 8 20 12" 
                stroke="currentColor" strokeWidth="1" fill="none" opacity="0.6" />
          
          {/* Dimensions with improved arrows */}
          <line x1="-8" y1="0" x2="-8" y2="55" stroke="currentColor" strokeWidth="1" 
                markerEnd="url(#arrow-angle)" markerStart="url(#arrow-angle)" />
          <text x="-12" y="28" textAnchor="middle" className="text-[8px] fill-current font-semibold" 
                transform="rotate(-90, -12, 28)">a</text>
          
          <line x1="0" y1="65" x2="55" y2="65" stroke="currentColor" strokeWidth="1" 
                markerEnd="url(#arrow-angle)" markerStart="url(#arrow-angle)" />
          <text x="27" y="72" textAnchor="middle" className="text-[8px] fill-current font-semibold">a</text>
          
          {/* Profile designation */}
          <text x="27" y="-2" textAnchor="middle" className="text-xs fill-current font-bold">L</text>
          
          {/* Thickness indicators */}
          <text x="65" y="8" className="text-[7px] fill-current font-medium">t</text>
          <text x="8" y="63" className="text-[7px] fill-current font-medium">t</text>
          <text x="65" y="18" className="text-[7px] fill-current opacity-70">r</text>
        </g>
      </svg>
    ),
    unequalAngle: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-unequal" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="currentColor" />
          </marker>
          {/* Steel cross-hatching pattern */}
          <pattern id="steelCrosshatch-unequal" patternUnits="userSpaceOnUse" width="6" height="6">
            <path d="M 0,6 L 6,0 M 0,0 L 6,6" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
            <path d="M 3,9 L 9,3 M -3,3 L 3,-3" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
          </pattern>
        </defs>
        
        {/* Unequal angle L-profile with different leg lengths */}
        <g transform="translate(15, 10)">
          {/* Main L-shape path with unequal legs */}
          <path d="M 0 50 L 0 0 L 70 0 L 70 10 L 10 10 L 10 50 Z" 
                stroke="currentColor" strokeWidth="2.5" fill="url(#steelCrosshatch-unequal)" fillOpacity="0.4" />
          
          {/* Internal corner fillet */}
          <path d="M 10 10 Q 6 6 10 3 Q 14 6 18 10" 
                stroke="currentColor" strokeWidth="1" fill="none" opacity="0.6" />
          
          {/* Dimensions for longer leg (horizontal) */}
          <line x1="0" y1="60" x2="70" y2="60" stroke="currentColor" strokeWidth="1" 
                markerEnd="url(#arrow-unequal)" markerStart="url(#arrow-unequal)" />
          <text x="35" y="67" textAnchor="middle" className="text-[8px] fill-current font-semibold">a</text>
          
          {/* Dimensions for shorter leg (vertical) */}
          <line x1="-8" y1="0" x2="-8" y2="50" stroke="currentColor" strokeWidth="1" 
                markerEnd="url(#arrow-unequal)" markerStart="url(#arrow-unequal)" />
          <text x="-12" y="25" textAnchor="middle" className="text-[8px] fill-current font-semibold" 
                transform="rotate(-90, -12, 25)">b</text>
          
          {/* Profile designation */}
          <text x="35" y="-2" textAnchor="middle" className="text-xs fill-current font-bold">L ≠</text>
          
          {/* Thickness indicators */}
          <text x="78" y="6" className="text-[7px] fill-current font-medium">t</text>
          <text x="6" y="58" className="text-[7px] fill-current font-medium">t</text>
          <text x="78" y="16" className="text-[7px] fill-current opacity-70">r</text>
          
          {/* Additional notation for unequal legs */}
          <text x="80" y="35" className="text-[6px] fill-current opacity-80" transform="rotate(-90, 80, 35)">
            a ≠ b
          </text>
        </g>
      </svg>
    ),

    // Hollow Sections - RHS (Rectangular Hollow Section)
    rhs: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-rhs" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="currentColor" />
          </marker>
        </defs>
        {/* Rectangular hollow section - outer and inner rectangles */}
        <rect x="25" y="25" width="70" height="30" stroke="currentColor" strokeWidth="2" fill="none" rx="3" />
        <rect x="32" y="30" width="56" height="20" stroke="currentColor" strokeWidth="2" 
              fill="currentColor" fillOpacity="0.15" rx="2" />
        {/* Dimensions */}
        <line x1="18" y1="25" x2="18" y2="55" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-rhs)" markerStart="url(#arrow-rhs)" />
        <text x="11" y="43" textAnchor="middle" className="text-[8px] fill-current font-medium" transform="rotate(-90, 11, 43)">h</text>
        <line x1="25" y1="70" x2="95" y2="70" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-rhs)" markerStart="url(#arrow-rhs)" />
        <text x="60" y="78" textAnchor="middle" className="text-[8px] fill-current font-medium">b</text>

        {/* Wall thickness indicator */}
        <text x="103" y="30" className="text-[7px] fill-current">t</text>
        <line x1="95" y1="25" x2="95" y2="30" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
    shs: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-shs" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="currentColor" />
          </marker>
        </defs>
        {/* Square hollow section - outer and inner squares */}
        <rect x="30" y="20" width="60" height="40" stroke="currentColor" strokeWidth="2" fill="none" rx="3" />
        <rect x="37" y="25" width="46" height="30" stroke="currentColor" strokeWidth="2" 
              fill="currentColor" fillOpacity="0.15" rx="2" />
        {/* Dimensions */}
        <line x1="23" y1="20" x2="23" y2="60" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-shs)" markerStart="url(#arrow-shs)" />
        <text x="16" y="43" textAnchor="middle" className="text-[8px] fill-current font-medium" transform="rotate(-90, 16, 43)">a</text>
        <line x1="30" y1="70" x2="90" y2="70" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-shs)" markerStart="url(#arrow-shs)" />
        <text x="60" y="78" textAnchor="middle" className="text-[8px] fill-current font-medium">a</text>

        {/* Wall thickness indicator */}
        <text x="98" y="25" className="text-[7px] fill-current">t</text>
        <line x1="90" y1="20" x2="90" y2="25" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
    chs: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-chs" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="currentColor" />
          </marker>
        </defs>
        {/* Circular hollow section - outer and inner circles */}
        <circle cx="60" cy="40" r="22" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="60" cy="40" r="17" stroke="currentColor" strokeWidth="2" 
                fill="currentColor" fillOpacity="0.15" />
        {/* Diameter lines */}
        <line x1="38" y1="40" x2="82" y2="40" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" />
        {/* Dimensions */}
        <line x1="35" y1="65" x2="85" y2="65" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-chs)" markerStart="url(#arrow-chs)" />
        <text x="60" y="73" textAnchor="middle" className="text-[8px] fill-current font-medium">OD</text>
        <text x="60" y="15" textAnchor="middle" className="text-xs fill-current font-bold">CHS</text>
        {/* Wall thickness indicator */}
        <text x="95" y="30" className="text-[7px] fill-current">t</text>
        <line x1="82" y1="40" x2="77" y2="40" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    pipe: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Pipe */}
        <ellipse cx="60" cy="20" rx="30" ry="10" stroke="currentColor" strokeWidth="2" fill="none" />
        <line x1="30" y1="20" x2="30" y2="60" stroke="currentColor" strokeWidth="2" />
        <line x1="90" y1="20" x2="90" y2="60" stroke="currentColor" strokeWidth="2" />
        <ellipse cx="60" cy="60" rx="30" ry="10" stroke="currentColor" strokeWidth="2" fill="none" />
        <ellipse cx="60" cy="20" rx="22" ry="7" stroke="currentColor" strokeWidth="2" 
                 fill="currentColor" fillOpacity="0.1" />
        <line x1="38" y1="20" x2="38" y2="60" stroke="currentColor" strokeWidth="2" />
        <line x1="82" y1="20" x2="82" y2="60" stroke="currentColor" strokeWidth="2" />
        <ellipse cx="60" cy="60" rx="22" ry="7" stroke="currentColor" strokeWidth="2" 
                 fill="currentColor" fillOpacity="0.1" />
        <text x="60" y="10" textAnchor="middle" className="text-xs fill-current font-bold">PIPE</text>
      </svg>
    ),

    // Special Sections - T-Beam
    tBeam: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-tbeam" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="currentColor" />
          </marker>
        </defs>
        {/* T-beam profile */}
        <path d="M30 15 L90 15 L90 25 L65 25 L65 65 L55 65 L55 25 L30 25 Z" 
              stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.15" />
        {/* Dimensions */}
        <line x1="23" y1="15" x2="23" y2="65" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-tbeam)" markerStart="url(#arrow-tbeam)" />
        <text x="16" y="43" textAnchor="middle" className="text-[8px] fill-current font-medium" transform="rotate(-90, 16, 43)">h</text>
        <line x1="30" y1="75" x2="90" y2="75" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-tbeam)" markerStart="url(#arrow-tbeam)" />
        <text x="60" y="78" textAnchor="middle" className="text-[8px] fill-current font-medium">b</text>
        <text x="60" y="10" textAnchor="middle" className="text-xs fill-current font-bold">T-BEAM</text>
        {/* Web and flange thickness indicators */}
        <text x="98" y="20" className="text-[7px] fill-current">tf</text>
        <text x="50" y="50" className="text-[7px] fill-current">tw</text>
      </svg>
    ),
    bulbFlat: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Bulb flat */}
        <rect x="20" y="35" width="80" height="8" stroke="currentColor" strokeWidth="2" 
              fill="currentColor" fillOpacity="0.1" />
        <ellipse cx="100" cy="39" rx="8" ry="4" stroke="currentColor" strokeWidth="2" 
                 fill="currentColor" fillOpacity="0.2" />
        <text x="60" y="30" textAnchor="middle" className="text-xs fill-current font-bold">BULB</text>
      </svg>
    ),
    halfRound: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Half round */}
        <path d="M30 40 A 30 15 0 0 1 90 40 L30 40" 
              stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
        <text x="60" y="55" textAnchor="middle" className="text-xs fill-current font-bold">½ ROUND</text>
      </svg>
    ),
    plate: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-plate" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="currentColor" />
          </marker>
        </defs>
        {/* Steel plate - top view */}
        <rect x="20" y="30" width="80" height="20" stroke="currentColor" strokeWidth="2" 
              fill="currentColor" fillOpacity="0.15" rx="1" />
        {/* Dimensions */}
        <line x1="20" y1="60" x2="100" y2="60" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-plate)" markerStart="url(#arrow-plate)" />
        <text x="60" y="68" textAnchor="middle" className="text-[8px] fill-current font-medium">length</text>
        <line x1="110" y1="30" x2="110" y2="50" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-plate)" markerStart="url(#arrow-plate)" />
        <text x="115" y="43" textAnchor="start" className="text-[8px] fill-current font-medium">width</text>
        {/* Thickness indicator */}
        <line x1="20" y1="20" x2="20" y2="30" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-plate)" markerStart="url(#arrow-plate)" />
        <text x="15" y="28" textAnchor="end" className="text-[8px] fill-current font-medium">thickness</text>
        <text x="60" y="25" textAnchor="middle" className="text-xs fill-current font-bold">PLATE</text>
      </svg>
    ),
    sheetMetal: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-sheet" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="currentColor" />
          </marker>
        </defs>
        {/* Sheet metal - top view with thinner appearance */}
        <rect x="20" y="30" width="80" height="20" stroke="currentColor" strokeWidth="1.5" 
              fill="currentColor" fillOpacity="0.1" rx="1" />
        {/* Dimensions */}
        <line x1="20" y1="60" x2="100" y2="60" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-sheet)" markerStart="url(#arrow-sheet)" />
        <text x="60" y="68" textAnchor="middle" className="text-[8px] fill-current font-medium">length</text>
        <line x1="110" y1="30" x2="110" y2="50" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-sheet)" markerStart="url(#arrow-sheet)" />
        <text x="115" y="43" textAnchor="start" className="text-[8px] fill-current font-medium">width</text>
        {/* Thickness indicator */}
        <line x1="20" y1="20" x2="20" y2="30" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-sheet)" markerStart="url(#arrow-sheet)" />
        <text x="15" y="28" textAnchor="end" className="text-[8px] fill-current font-medium">thickness</text>
        <text x="60" y="25" textAnchor="middle" className="text-xs fill-current font-bold">SHEET</text>
      </svg>
    ),
    checkeredPlate: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-checker" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="currentColor" />
          </marker>
        </defs>
        {/* Checkered plate - top view with diamond pattern */}
        <rect x="20" y="30" width="80" height="20" stroke="currentColor" strokeWidth="2" 
              fill="currentColor" fillOpacity="0.15" rx="1" />
        {/* Diamond pattern overlay */}
        <path d="M30 40 L40 30 L50 40 L40 50 Z" stroke="currentColor" strokeWidth="1" fill="none" />
        <path d="M50 40 L60 30 L70 40 L60 50 Z" stroke="currentColor" strokeWidth="1" fill="none" />
        <path d="M70 40 L80 30 L90 40 L80 50 Z" stroke="currentColor" strokeWidth="1" fill="none" />
        {/* Dimensions */}
        <line x1="20" y1="60" x2="100" y2="60" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-checker)" markerStart="url(#arrow-checker)" />
        <text x="60" y="68" textAnchor="middle" className="text-[8px] fill-current font-medium">length</text>
        <line x1="110" y1="30" x2="110" y2="50" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-checker)" markerStart="url(#arrow-checker)" />
        <text x="115" y="43" textAnchor="start" className="text-[8px] fill-current font-medium">width</text>
        {/* Thickness indicator */}
        <line x1="20" y1="20" x2="20" y2="30" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-checker)" markerStart="url(#arrow-checker)" />
        <text x="15" y="28" textAnchor="end" className="text-[8px] fill-current font-medium">thickness</text>
        <text x="60" y="25" textAnchor="middle" className="text-xs fill-current font-bold">CHECKER</text>
      </svg>
    ),
    perforatedPlate: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-perf" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="currentColor" />
          </marker>
        </defs>
        {/* Perforated plate - top view with holes */}
        <rect x="20" y="30" width="80" height="20" stroke="currentColor" strokeWidth="2" 
              fill="currentColor" fillOpacity="0.15" rx="1" />
        {/* Hole pattern overlay */}
        <circle cx="35" cy="40" r="2" stroke="currentColor" strokeWidth="1" fill="none" />
        <circle cx="50" cy="40" r="2" stroke="currentColor" strokeWidth="1" fill="none" />
        <circle cx="65" cy="40" r="2" stroke="currentColor" strokeWidth="1" fill="none" />
        <circle cx="80" cy="40" r="2" stroke="currentColor" strokeWidth="1" fill="none" />
        {/* Dimensions */}
        <line x1="20" y1="60" x2="100" y2="60" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-perf)" markerStart="url(#arrow-perf)" />
        <text x="60" y="68" textAnchor="middle" className="text-[8px] fill-current font-medium">length</text>
        <line x1="110" y1="30" x2="110" y2="50" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-perf)" markerStart="url(#arrow-perf)" />
        <text x="115" y="43" textAnchor="start" className="text-[8px] fill-current font-medium">width</text>
        {/* Thickness indicator */}
        <line x1="20" y1="20" x2="20" y2="30" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-perf)" markerStart="url(#arrow-perf)" />
        <text x="15" y="28" textAnchor="end" className="text-[8px] fill-current font-medium">thickness</text>
        <text x="60" y="25" textAnchor="middle" className="text-xs fill-current font-bold">PERF</text>
      </svg>
    ),
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="text-muted-foreground">
        {visualizations[profileType] || (
          <div className="w-[120px] h-[80px] flex items-center justify-center border-2 border-dashed border-muted-foreground/50 rounded">
            <span className="text-xs">No Preview</span>
          </div>
        )}
      </div>
      {/* Profile type name */}
      <div className="text-center text-xs font-medium text-muted-foreground capitalize">
        {profileType.replace(/([A-Z])/g, ' $1').trim()}
      </div>
    </div>
  )
}
