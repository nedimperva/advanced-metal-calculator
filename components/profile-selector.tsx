"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Info, Clock } from "lucide-react"
import { PROFILES } from "@/lib/metal-data"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useUserPreferences } from "@/hooks/use-user-preferences"

interface ProfileSelectorProps {
  profileCategory: string
  setProfileCategory: (category: string) => void
  profileType: string
  setProfileType: (type: string) => void
}

export default function ProfileSelector({
  profileCategory,
  setProfileCategory,
  profileType,
  setProfileType,
}: ProfileSelectorProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { trackProfile, getSuggestions } = useUserPreferences()
  const suggestions = getSuggestions()

  // Visual selection for profile categories
  const handleCategorySelect = (category: string) => {
    setProfileCategory(category)
    // Select first profile type in the new category, or most recent if available
    const recentTypes = suggestions.getProfileTypes(category)
    const firstType = recentTypes.length > 0 ? recentTypes[0] : Object.keys(PROFILES[category as keyof typeof PROFILES].types)[0]
    setProfileType(firstType)
    // Track the selection
    trackProfile(category, firstType)
  }

  const handleTypeSelect = (type: string) => {
    setProfileType(type)
    // Track the selection
    trackProfile(profileCategory, type)
  }

  const ProfileVisualizationModal = () => (
    <DialogContent className="max-w-sm mx-4">
      <DialogHeader>
        <DialogTitle>Profile Visualization</DialogTitle>
      </DialogHeader>
      <div className="flex justify-center items-center p-4">
        <ProfileVisualization profileType={profileType} />
      </div>
      <div className="text-sm text-muted-foreground text-center">
        Selected profile visualization
      </div>
    </DialogContent>
  )

  if (isMobile) {
    return (
      <div className="space-y-3">
        {/* Simplified Category Selection for Mobile */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Profile Category</div>
          <Select value={profileCategory} onValueChange={handleCategorySelect}>
            <SelectTrigger className="hover:border-primary/30 transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PROFILES).map(([key, category]) => (
                <SelectItem key={key} value={key} className="hover:bg-muted transition-colors">
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Simplified Profile Type Selection for Mobile */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Profile Type</div>
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
              {suggestions.getProfileTypes(profileCategory).length > 0 && (
                <>
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Recent in {PROFILES[profileCategory as keyof typeof PROFILES]?.name}
                  </div>
                  {suggestions.getProfileTypes(profileCategory).map((key) => {
                    const profile = PROFILES[profileCategory as keyof typeof PROFILES]?.types[key as keyof (typeof PROFILES)[keyof typeof PROFILES]["types"]] as any
                    if (!profile) return null
                    return (
                      <SelectItem key={`recent-${key}`} value={key}>
                        <div className="flex items-center gap-2">
                          <span>{profile.name}</span>
                          <Clock className="h-3 w-3 text-muted-foreground ml-auto" />
                        </div>
                      </SelectItem>
                    )
                  })}
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground">All Types</div>
                </>
              )}
              {Object.entries(PROFILES[profileCategory as keyof typeof PROFILES]?.types || {}).map(([key, profile]: [string, any]) => {
                // Skip if already shown in recent
                if (suggestions.getProfileTypes(profileCategory).includes(key)) return null
                return (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <span>{profile.name}</span>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Visual Category Selection */}
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-1">
          {Object.entries(PROFILES).map(([key, category]) => (
            <div
              key={key}
              className={cn(
                "border rounded-md p-2 text-center cursor-pointer transition-all duration-200 hover-lift",
                profileCategory === key
                  ? "selected-item-strong"
                  : "hover:bg-muted border-border hover:border-primary/20",
              )}
              onClick={() => handleCategorySelect(key)}
            >
              <div className="text-xs font-medium">{category.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Profile Type Selection */}
      <div>
        <Select value={profileType} onValueChange={handleTypeSelect}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PROFILES[profileCategory as keyof typeof PROFILES]?.types || {}).map(([key, profile]: [string, any]) => {
              return (
                <SelectItem key={key} value={key}>
                  <span>{profile.name}</span>
                </SelectItem>
              )
            })}
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
        <text x="60" y="43" textAnchor="middle" className="text-xs fill-current font-bold">RECT</text>
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
        <text x="60" y="28" textAnchor="middle" className="text-xs fill-current font-bold">ROUND</text>
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
        <text x="60" y="15" textAnchor="middle" className="text-xs fill-current font-bold">SQUARE</text>
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
        <text x="60" y="30" textAnchor="middle" className="text-xs fill-current font-bold">FLAT</text>
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
        <text x="60" y="78" textAnchor="middle" className="text-[8px] fill-current font-medium">distance</text>
        <text x="60" y="15" textAnchor="middle" className="text-xs fill-current font-bold">HEX</text>
        <text x="60" y="50" textAnchor="middle" className="text-[9px] fill-current opacity-70">across flats</text>
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
        {/* H-beam profile - heaviest version */}
        <path d="M20 10 L100 10 L100 30 L70 30 L70 50 L100 50 L100 70 L20 70 L20 50 L50 50 L50 30 L20 30 Z" 
              stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
        <text x="60" y="6" textAnchor="middle" className="text-xs fill-current font-bold">HEC</text>
        <text x="60" y="78" className="text-xs fill-current">b</text>
      </svg>
    ),
    wBeam: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* American W-beam */}
        <path d="M35 15 L85 15 L85 25 L65 25 L65 55 L85 55 L85 65 L35 65 L35 55 L55 55 L55 25 L35 25 Z" 
              stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
        <text x="60" y="10" textAnchor="middle" className="text-xs fill-current font-bold">W</text>
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
        {/* American C-channel */}
        <path d="M35 15 L35 65 L85 65 L85 55 L45 55 L45 25 L85 25 L85 15 Z" 
              stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
        <text x="60" y="10" textAnchor="middle" className="text-xs fill-current font-bold">C</text>
      </svg>
    ),

    // Angles - Equal Angle
    equalAngle: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-angle" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="currentColor" />
          </marker>
        </defs>
        {/* Equal angle profile */}
        <path d="M35 15 L35 60 L75 60 L75 52 L43 52 L43 23 L75 23 L75 15 Z" 
              stroke="currentColor" strokeWidth="3" fill="currentColor" fillOpacity="0.15" />
        {/* Dimensions */}
        <line x1="25" y1="15" x2="25" y2="60" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-angle)" markerStart="url(#arrow-angle)" />
        <text x="18" y="40" textAnchor="middle" className="text-[8px] fill-current font-medium" transform="rotate(-90, 18, 40)">a</text>
        <line x1="35" y1="70" x2="75" y2="70" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-angle)" markerStart="url(#arrow-angle)" />
        <text x="55" y="78" textAnchor="middle" className="text-[8px] fill-current font-medium">a</text>
        <text x="55" y="10" textAnchor="middle" className="text-xs fill-current font-bold">L =</text>
        {/* Thickness indicator */}
        <text x="85" y="20" className="text-[7px] fill-current">t</text>
        <text x="85" y="55" className="text-[7px] fill-current">r</text>
      </svg>
    ),
    unequalAngle: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Unequal angle */}
        <path d="M30 15 L30 65 L70 65 L70 55 L40 55 L40 25 L90 25 L90 15 Z" 
              stroke="currentColor" strokeWidth="3" fill="currentColor" fillOpacity="0.1" />
        <text x="95" y="20" className="text-xs fill-current">a</text>
        <text x="75" y="75" className="text-xs fill-current">b</text>
        <text x="60" y="10" textAnchor="middle" className="text-xs fill-current font-bold">L≠</text>
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
        <text x="60" y="18" textAnchor="middle" className="text-xs fill-current font-bold">RHS</text>
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
        <text x="60" y="15" textAnchor="middle" className="text-xs fill-current font-bold">SHS</text>
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

    // Steel Plates - All plate types share similar base design with different surface patterns
    plate: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-plate" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="currentColor" />
          </marker>
        </defs>
        {/* Steel plate - flat rectangular plate */}
        <rect x="20" y="30" width="80" height="25" stroke="currentColor" strokeWidth="2" 
              fill="currentColor" fillOpacity="0.15" rx="1" />
        {/* 3D effect - top edge */}
        <rect x="20" y="27" width="80" height="3" stroke="currentColor" strokeWidth="1" 
              fill="currentColor" fillOpacity="0.3" rx="1" />
        {/* 3D effect - right edge */}
        <rect x="100" y="30" width="3" height="25" stroke="currentColor" strokeWidth="1" 
              fill="currentColor" fillOpacity="0.2" rx="1" />
        {/* Dimensions */}
        <line x1="15" y1="30" x2="15" y2="55" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-plate)" markerStart="url(#arrow-plate)" />
        <text x="8" y="45" textAnchor="middle" className="text-[8px] fill-current font-medium" transform="rotate(-90, 8, 45)">width</text>
        <line x1="20" y1="65" x2="100" y2="65" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-plate)" markerStart="url(#arrow-plate)" />
        <text x="60" y="73" textAnchor="middle" className="text-[8px] fill-current font-medium">length</text>
        <line x1="110" y1="30" x2="110" y2="55" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-plate)" markerStart="url(#arrow-plate)" />
        <text x="115" y="45" textAnchor="start" className="text-[8px] fill-current font-medium" transform="rotate(90, 115, 45)">thickness</text>
        <text x="60" y="22" textAnchor="middle" className="text-xs fill-current font-bold">PLATE</text>
      </svg>
    ),
    sheetMetal: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-sheet" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="currentColor" />
          </marker>
        </defs>
        {/* Sheet metal - thinner plate with slight bend to show flexibility */}
        <path d="M20 35 L95 33 L100 35 L100 50 L95 52 L20 50 Z" 
              stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.15" />
        {/* 3D effect - top edge with slight curve */}
        <path d="M20 32 L95 30 L100 32 L95 33 L20 35 Z" 
              stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.3" />
        {/* Surface texture lines to show thin gauge */}
        <line x1="30" y1="36" x2="90" y2="34.5" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
        <line x1="30" y1="42" x2="90" y2="40.5" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
        <line x1="30" y1="48" x2="90" y2="46.5" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
        {/* Dimensions */}
        <line x1="15" y1="35" x2="15" y2="50" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-sheet)" markerStart="url(#arrow-sheet)" />
        <text x="8" y="45" textAnchor="middle" className="text-[8px] fill-current font-medium" transform="rotate(-90, 8, 45)">width</text>
        <line x1="20" y1="65" x2="100" y2="65" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-sheet)" markerStart="url(#arrow-sheet)" />
        <text x="60" y="73" textAnchor="middle" className="text-[8px] fill-current font-medium">length</text>
        <text x="60" y="22" textAnchor="middle" className="text-xs fill-current font-bold">SHEET</text>
        <text x="60" y="78" textAnchor="middle" className="text-[7px] fill-current opacity-70">thin gauge</text>
      </svg>
    ),
    checkeredPlate: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-checkered" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="currentColor" />
          </marker>
          <pattern id="diamond-pattern" patternUnits="userSpaceOnUse" width="8" height="8">
            <polygon points="4,1 7,4 4,7 1,4" stroke="currentColor" strokeWidth="0.5" 
                     fill="currentColor" fillOpacity="0.3" />
          </pattern>
        </defs>
        {/* Checkered plate with diamond pattern */}
        <rect x="20" y="30" width="80" height="25" stroke="currentColor" strokeWidth="2" 
              fill="url(#diamond-pattern)" rx="1" />
        {/* 3D effect - top edge */}
        <rect x="20" y="27" width="80" height="3" stroke="currentColor" strokeWidth="1" 
              fill="currentColor" fillOpacity="0.4" rx="1" />
        {/* 3D effect - right edge */}
        <rect x="100" y="30" width="3" height="25" stroke="currentColor" strokeWidth="1" 
              fill="currentColor" fillOpacity="0.3" rx="1" />
        {/* Diamond pattern overlay for better visibility */}
        <g opacity="0.6">
          <polygon points="30,35 33,38 30,41 27,38" stroke="currentColor" strokeWidth="0.8" fill="none" />
          <polygon points="38,35 41,38 38,41 35,38" stroke="currentColor" strokeWidth="0.8" fill="none" />
          <polygon points="46,35 49,38 46,41 43,38" stroke="currentColor" strokeWidth="0.8" fill="none" />
          <polygon points="54,35 57,38 54,41 51,38" stroke="currentColor" strokeWidth="0.8" fill="none" />
          <polygon points="62,35 65,38 62,41 59,38" stroke="currentColor" strokeWidth="0.8" fill="none" />
          <polygon points="70,35 73,38 70,41 67,38" stroke="currentColor" strokeWidth="0.8" fill="none" />
          <polygon points="78,35 81,38 78,41 75,38" stroke="currentColor" strokeWidth="0.8" fill="none" />
          <polygon points="86,35 89,38 86,41 83,38" stroke="currentColor" strokeWidth="0.8" fill="none" />
          <polygon points="94,35 97,38 94,41 91,38" stroke="currentColor" strokeWidth="0.8" fill="none" />
          
          <polygon points="34,43 37,46 34,49 31,46" stroke="currentColor" strokeWidth="0.8" fill="none" />
          <polygon points="42,43 45,46 42,49 39,46" stroke="currentColor" strokeWidth="0.8" fill="none" />
          <polygon points="50,43 53,46 50,49 47,46" stroke="currentColor" strokeWidth="0.8" fill="none" />
          <polygon points="58,43 61,46 58,49 55,46" stroke="currentColor" strokeWidth="0.8" fill="none" />
          <polygon points="66,43 69,46 66,49 63,46" stroke="currentColor" strokeWidth="0.8" fill="none" />
          <polygon points="74,43 77,46 74,49 71,46" stroke="currentColor" strokeWidth="0.8" fill="none" />
          <polygon points="82,43 85,46 82,49 79,46" stroke="currentColor" strokeWidth="0.8" fill="none" />
          <polygon points="90,43 93,46 90,49 87,46" stroke="currentColor" strokeWidth="0.8" fill="none" />
        </g>
        {/* Dimensions */}
        <line x1="15" y1="30" x2="15" y2="55" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-checkered)" markerStart="url(#arrow-checkered)" />
        <text x="8" y="45" textAnchor="middle" className="text-[8px] fill-current font-medium" transform="rotate(-90, 8, 45)">width</text>
        <line x1="20" y1="65" x2="100" y2="65" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-checkered)" markerStart="url(#arrow-checkered)" />
        <text x="60" y="73" textAnchor="middle" className="text-[8px] fill-current font-medium">length</text>
        <text x="60" y="22" textAnchor="middle" className="text-xs fill-current font-bold">CHECKERED</text>
        <text x="60" y="78" textAnchor="middle" className="text-[7px] fill-current opacity-70">anti-slip</text>
      </svg>
    ),
    perforatedPlate: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-perforated" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="currentColor" />
          </marker>
        </defs>
        {/* Perforated plate base */}
        <rect x="20" y="30" width="80" height="25" stroke="currentColor" strokeWidth="2" 
              fill="currentColor" fillOpacity="0.15" rx="1" />
        {/* 3D effect - top edge */}
        <rect x="20" y="27" width="80" height="3" stroke="currentColor" strokeWidth="1" 
              fill="currentColor" fillOpacity="0.3" rx="1" />
        {/* 3D effect - right edge */}
        <rect x="100" y="30" width="3" height="25" stroke="currentColor" strokeWidth="1" 
              fill="currentColor" fillOpacity="0.2" rx="1" />
        {/* Perforation holes - circular pattern */}
        <g fill="white" stroke="currentColor" strokeWidth="0.5">
          <circle cx="28" cy="36" r="1.5" />
          <circle cx="36" cy="36" r="1.5" />
          <circle cx="44" cy="36" r="1.5" />
          <circle cx="52" cy="36" r="1.5" />
          <circle cx="60" cy="36" r="1.5" />
          <circle cx="68" cy="36" r="1.5" />
          <circle cx="76" cy="36" r="1.5" />
          <circle cx="84" cy="36" r="1.5" />
          <circle cx="92" cy="36" r="1.5" />
          
          <circle cx="32" cy="42" r="1.5" />
          <circle cx="40" cy="42" r="1.5" />
          <circle cx="48" cy="42" r="1.5" />
          <circle cx="56" cy="42" r="1.5" />
          <circle cx="64" cy="42" r="1.5" />
          <circle cx="72" cy="42" r="1.5" />
          <circle cx="80" cy="42" r="1.5" />
          <circle cx="88" cy="42" r="1.5" />
          
          <circle cx="28" cy="48" r="1.5" />
          <circle cx="36" cy="48" r="1.5" />
          <circle cx="44" cy="48" r="1.5" />
          <circle cx="52" cy="48" r="1.5" />
          <circle cx="60" cy="48" r="1.5" />
          <circle cx="68" cy="48" r="1.5" />
          <circle cx="76" cy="48" r="1.5" />
          <circle cx="84" cy="48" r="1.5" />
          <circle cx="92" cy="48" r="1.5" />
        </g>
        {/* Dimensions */}
        <line x1="15" y1="30" x2="15" y2="55" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-perforated)" markerStart="url(#arrow-perforated)" />
        <text x="8" y="45" textAnchor="middle" className="text-[8px] fill-current font-medium" transform="rotate(-90, 8, 45)">width</text>
        <line x1="20" y1="65" x2="100" y2="65" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow-perforated)" markerStart="url(#arrow-perforated)" />
        <text x="60" y="73" textAnchor="middle" className="text-[8px] fill-current font-medium">length</text>
        <text x="60" y="22" textAnchor="middle" className="text-xs fill-current font-bold">PERFORATED</text>
        <text x="60" y="78" textAnchor="middle" className="text-[7px] fill-current opacity-70">ventilation</text>
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
