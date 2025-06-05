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
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PROFILES).map(([key, category]) => (
                <SelectItem key={key} value={key}>
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
  // Enhanced SVG visualizations for different profile types with dimension labels
  const visualizations: Record<string, React.JSX.Element> = {
    // Basic Shapes
    rectangular: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect
          x="20"
          y="20"
          width="80"
          height="40"
          stroke="currentColor"
          strokeWidth="2"
          fill="currentColor"
          fillOpacity="0.1"
          rx="2"
        />
        <text x="60" y="45" textAnchor="middle" className="text-xs fill-current">
          L×W×H
        </text>
        {/* Dimension arrows */}
        <defs>
          <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="currentColor" />
          </marker>
        </defs>
        <line x1="15" y1="20" x2="15" y2="60" stroke="currentColor" strokeWidth="1" markerEnd="url(#arrowhead)" markerStart="url(#arrowhead)" />
        <text x="10" y="45" textAnchor="middle" className="text-xs fill-current" transform="rotate(-90, 10, 45)">H</text>
      </svg>
    ),
    round: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="60"
          cy="40"
          r="25"
          stroke="currentColor"
          strokeWidth="2"
          fill="currentColor"
          fillOpacity="0.1"
        />
        <line x1="35" y1="40" x2="85" y2="40" stroke="currentColor" strokeWidth="1" strokeDasharray="3,2" />
        <text x="60" y="45" textAnchor="middle" className="text-xs fill-current">
          ⌀D
        </text>
      </svg>
    ),
    square: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect
          x="35"
          y="15"
          width="50"
          height="50"
          stroke="currentColor"
          strokeWidth="2"
          fill="currentColor"
          fillOpacity="0.1"
          rx="2"
        />
        <text x="60" y="45" textAnchor="middle" className="text-xs fill-current">
          A×A
        </text>
      </svg>
    ),
    flat: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect
          x="20"
          y="35"
          width="80"
          height="10"
          stroke="currentColor"
          strokeWidth="2"
          fill="currentColor"
          fillOpacity="0.1"
          rx="1"
        />
        <text x="60" y="30" textAnchor="middle" className="text-xs fill-current">
          W
        </text>
        <text x="110" y="42" textAnchor="start" className="text-xs fill-current">
          t
        </text>
      </svg>
    ),
    hexagonal: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon
          points="45,20 75,20 90,40 75,60 45,60 30,40"
          stroke="currentColor"
          strokeWidth="2"
          fill="currentColor"
          fillOpacity="0.1"
        />
        <text x="60" y="45" textAnchor="middle" className="text-xs fill-current">
          HEX
        </text>
      </svg>
    ),

    // European I-Beams
    ipn: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* I-beam profile - narrower version */}
        <path d="M35 15 L85 15 L85 25 L65 25 L65 55 L85 55 L85 65 L35 65 L35 55 L55 55 L55 25 L35 25 Z" 
              stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
        <text x="60" y="10" textAnchor="middle" className="text-xs fill-current font-bold">IPN</text>
        <text x="60" y="75" className="text-xs fill-current">b</text>
      </svg>
    ),
    ipe: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* IPE I-beam profile */}
        <path d="M30 15 L90 15 L90 25 L65 25 L65 55 L90 55 L90 65 L30 65 L30 55 L55 55 L55 25 L30 25 Z" 
              stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
        <text x="60" y="10" textAnchor="middle" className="text-xs fill-current font-bold">IPE</text>
        <text x="60" y="75" className="text-xs fill-current">b</text>
        <text x="110" y="40" className="text-xs fill-current">h</text>
      </svg>
    ),
    hea: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* H-beam profile - wider flanges */}
        <path d="M25 15 L95 15 L95 25 L65 25 L65 55 L95 55 L95 65 L25 65 L25 55 L55 55 L55 25 L25 25 Z" 
              stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
        <text x="60" y="10" textAnchor="middle" className="text-xs fill-current font-bold">HEA</text>
        <text x="60" y="75" className="text-xs fill-current">b</text>
        <text x="110" y="40" className="text-xs fill-current">h</text>
      </svg>
    ),
    heb: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* H-beam profile - thicker flanges */}
        <path d="M25 12 L95 12 L95 28 L68 28 L68 52 L95 52 L95 68 L25 68 L25 52 L52 52 L52 28 L25 28 Z" 
              stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
        <text x="60" y="8" textAnchor="middle" className="text-xs fill-current font-bold">HEB</text>
        <text x="60" y="76" className="text-xs fill-current">b</text>
        <text x="110" y="40" className="text-xs fill-current">h</text>
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

    // European U-Channels
    unp: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* U-channel profile */}
        <path d="M30 15 L30 65 L90 65 L90 55 L40 55 L40 25 L90 25 L90 15 Z" 
              stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
        <text x="60" y="10" textAnchor="middle" className="text-xs fill-current font-bold">UNP</text>
        <text x="95" y="20" className="text-xs fill-current">tf</text>
        <text x="110" y="40" className="text-xs fill-current">h</text>
        <text x="60" y="75" className="text-xs fill-current">b</text>
        <text x="25" y="40" className="text-xs fill-current">tw</text>
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

    // Angles
    equalAngle: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Equal angle */}
        <path d="M30 15 L30 65 L80 65 L80 55 L40 55 L40 25 L80 25 L80 15 Z" 
              stroke="currentColor" strokeWidth="3" fill="currentColor" fillOpacity="0.1" />
        <text x="85" y="20" className="text-xs fill-current">a</text>
        <text x="85" y="60" className="text-xs fill-current">a</text>
        <text x="25" y="75" className="text-xs fill-current">t</text>
        <text x="60" y="10" textAnchor="middle" className="text-xs fill-current font-bold">L=</text>
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

    // Hollow Sections
    rhs: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Rectangular hollow section */}
        <rect x="20" y="20" width="80" height="40" stroke="currentColor" strokeWidth="2" fill="none" rx="2" />
        <rect x="30" y="25" width="60" height="30" stroke="currentColor" strokeWidth="2" 
              fill="currentColor" fillOpacity="0.1" rx="1" />
        <text x="60" y="10" textAnchor="middle" className="text-xs fill-current font-bold">RHS</text>
        <text x="60" y="75" className="text-xs fill-current">b</text>
        <text x="110" y="45" className="text-xs fill-current">h</text>
        <text x="105" y="25" className="text-xs fill-current">t</text>
      </svg>
    ),
    shs: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Square hollow section */}
        <rect x="30" y="15" width="60" height="50" stroke="currentColor" strokeWidth="2" fill="none" rx="2" />
        <rect x="40" y="20" width="40" height="40" stroke="currentColor" strokeWidth="2" 
              fill="currentColor" fillOpacity="0.1" rx="1" />
        <text x="60" y="10" textAnchor="middle" className="text-xs fill-current font-bold">SHS</text>
        <text x="60" y="75" className="text-xs fill-current">a</text>
        <text x="100" y="20" className="text-xs fill-current">t</text>
      </svg>
    ),
    chs: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Circular hollow section */}
        <circle cx="60" cy="40" r="25" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="60" cy="40" r="18" stroke="currentColor" strokeWidth="2" 
                fill="currentColor" fillOpacity="0.1" />
        <text x="60" y="10" textAnchor="middle" className="text-xs fill-current font-bold">CHS</text>
        <line x1="35" y1="40" x2="85" y2="40" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" />
        <text x="60" y="75" className="text-xs fill-current">⌀OD</text>
        <text x="90" y="25" className="text-xs fill-current">t</text>
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

    // Special Sections
    tBeam: (
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* T-beam */}
        <path d="M30 15 L90 15 L90 25 L65 25 L65 65 L55 65 L55 25 L30 25 Z" 
              stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
        <text x="60" y="10" textAnchor="middle" className="text-xs fill-current font-bold">T</text>
        <text x="60" y="75" className="text-xs fill-current">b</text>
        <text x="110" y="40" className="text-xs fill-current">h</text>
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
