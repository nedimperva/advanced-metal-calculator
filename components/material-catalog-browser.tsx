"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Search, 
  Filter, 
  Plus, 
  Package,
  BarChart3,
  DollarSign,
  Zap,
  Thermometer,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Copy,
  Star,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/use-media-query'
import { 
  MaterialCatalog, 
  MaterialTemplate,
  MaterialType,
  MaterialCategory,
  MaterialAvailability,
  MaterialSearchFilters
} from '@/lib/types'
import { useMaterialCatalog } from '@/contexts/material-catalog-context'
import { LoadingSpinner } from '@/components/loading-states'
import { toast } from '@/hooks/use-toast'
import { useI18n } from '@/contexts/i18n-context'
import { 
  createMaterialCatalog, 
  createMaterialStock 
} from '@/lib/database'

interface MaterialCatalogBrowserProps {
  onSelectMaterial?: (material: MaterialCatalog) => void
  onSelectTemplate?: (template: MaterialTemplate) => void
  className?: string
  mode?: 'browser' | 'selector'
}

// Material type colors and icons
const MATERIAL_TYPE_CONFIG = {
  [MaterialType.STEEL]: {
    color: 'text-gray-700 bg-gray-100 border-gray-300',
    icon: Package,
    label: 'Steel'
  },
  [MaterialType.ALUMINUM]: {
    color: 'text-blue-700 bg-blue-100 border-blue-300',
    icon: Zap,
    label: 'Aluminum'
  },
  [MaterialType.STAINLESS]: {
    color: 'text-purple-700 bg-purple-100 border-purple-300',
    icon: Star,
    label: 'Stainless'
  },
  [MaterialType.COPPER]: {
    color: 'text-orange-700 bg-orange-100 border-orange-300',
    icon: Thermometer,
    label: 'Copper'
  },
  [MaterialType.TITANIUM]: {
    color: 'text-indigo-700 bg-indigo-100 border-indigo-300',
    icon: Zap,
    label: 'Titanium'
  },
  [MaterialType.COMPOSITE]: {
    color: 'text-emerald-700 bg-emerald-100 border-emerald-300',
    icon: Package,
    label: 'Composite'
  }
}

// Availability status colors
const AVAILABILITY_CONFIG = {
  [MaterialAvailability.STOCK]: {
    color: 'text-green-700 bg-green-100 border-green-300',
    icon: CheckCircle2,
    label: 'In Stock'
  },
  [MaterialAvailability.ORDER]: {
    color: 'text-blue-700 bg-blue-100 border-blue-300',
    icon: Clock,
    label: 'Order'
  },
  [MaterialAvailability.SPECIAL]: {
    color: 'text-amber-700 bg-amber-100 border-amber-300',
    icon: AlertTriangle,
    label: 'Special Order'
  },
  [MaterialAvailability.DISCONTINUED]: {
    color: 'text-red-700 bg-red-100 border-red-300',
    icon: AlertTriangle,
    label: 'Discontinued'
  }
}

interface MaterialCardProps {
  material: MaterialCatalog
  onSelect?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onDuplicate?: () => void
  onViewDetails?: () => void
  isMobile: boolean
  mode: 'browser' | 'selector'
}

const MaterialCard = React.memo(function MaterialCard({ 
  material, 
  onSelect, 
  onEdit, 
  onDelete, 
  onDuplicate,
  onViewDetails,
  isMobile, 
  mode 
}: MaterialCardProps) {
  const typeConfig = MATERIAL_TYPE_CONFIG[material.type] || MATERIAL_TYPE_CONFIG[MaterialType.STEEL]
  const availabilityConfig = AVAILABILITY_CONFIG[material.availability] || AVAILABILITY_CONFIG[MaterialAvailability.STOCK]
  const TypeIcon = typeConfig.icon
  const AvailabilityIcon = availabilityConfig.icon

  return (
    <Card className="hover:bg-muted/30 transition-colors">
      <CardContent className={cn("p-4", isMobile && "p-3")}>
        <div className={cn("flex gap-3", isMobile ? "flex-col space-y-3" : "items-start")}>
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <TypeIcon className={cn("text-muted-foreground shrink-0 mt-1", isMobile ? "h-4 w-4" : "h-5 w-5")} />
            
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex flex-col gap-2 mb-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className={cn("font-medium leading-tight", isMobile ? "text-sm break-words" : "text-base")}>
                    {material.name}
                  </h4>
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge variant="outline" className={cn("text-xs", typeConfig.color)}>
                      {typeConfig.label}
                    </Badge>
                  </div>
                </div>
                
                {/* Category and Availability */}
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {material.category}
                  </Badge>
                  <Badge variant="outline" className={cn("text-xs", availabilityConfig.color)}>
                    <AvailabilityIcon className="h-3 w-3 mr-1" />
                    {availabilityConfig.label}
                  </Badge>
                  <Badge variant="outline" className="text-xs text-green-600">
                    ${(material.basePrice || 0).toFixed(2)} {material.currency}
                  </Badge>
                </div>
              </div>

              {/* Properties Summary */}
              <div className={cn("text-muted-foreground grid grid-cols-2 gap-2", isMobile ? "text-xs" : "text-sm")}>
                <div>Density: {material.density} g/cm³</div>
                <div>Yield: {material.yieldStrength} MPa</div>
                <div>Tensile: {material.tensileStrength} MPa</div>
                <div>Modulus: {material.elasticModulus} GPa</div>
              </div>

              {/* Profiles */}
              <div className={cn("mt-2", isMobile ? "text-xs" : "text-sm")}>
                <span className="text-muted-foreground">Profiles: </span>
                <span>{(material.compatibleProfiles || []).slice(0, 3).join(', ')}</span>
                {(material.compatibleProfiles || []).length > 3 && (
                  <span className="text-muted-foreground"> +{(material.compatibleProfiles || []).length - 3} more</span>
                )}
              </div>

              {/* Supplier */}
              {material.supplier && (
                <div className={cn("text-muted-foreground mt-1", isMobile ? "text-xs" : "text-sm")}>
                  Supplier: {material.supplier}
                </div>
              )}

              {/* Tags */}
              {(material.tags || []).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {(material.tags || []).slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {(material.tags || []).length > 3 && (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      +{(material.tags || []).length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className={cn("flex gap-2 shrink-0", isMobile ? "w-full" : "items-center")}>
            {mode === 'selector' && onSelect && (
              <Button onClick={onSelect} size="sm" className={cn(isMobile && "flex-1")}>
                Select
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={onViewDetails}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Material
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Material
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

interface MaterialDetailsModalProps {
  material: MaterialCatalog | null
  isOpen: boolean
  onClose: () => void
}

function MaterialDetailsModal({ material, isOpen, onClose }: MaterialDetailsModalProps) {
  if (!material) return null

  const typeConfig = MATERIAL_TYPE_CONFIG[material.type]
  const availabilityConfig = AVAILABILITY_CONFIG[material.availability]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <typeConfig.icon className="h-5 w-5" />
            {material.name}
          </DialogTitle>
          <DialogDescription>
            {material.description || 'Detailed material specifications and properties'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <typeConfig.icon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="font-medium">{typeConfig.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Category</p>
                    <p className="font-medium">{material.category}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <availabilityConfig.icon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Availability</p>
                    <p className="font-medium">{availabilityConfig.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Base Price</p>
                    <p className="font-medium">${(material.basePrice || 0).toFixed(2)} {material.currency}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Physical Properties */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Physical Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Density</p>
                  <p className="font-medium">{material.density} g/cm³</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Yield Strength</p>
                  <p className="font-medium">{material.yieldStrength} MPa</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tensile Strength</p>
                  <p className="font-medium">{material.tensileStrength} MPa</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Elastic Modulus</p>
                  <p className="font-medium">{material.elasticModulus} GPa</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Poisson's Ratio</p>
                  <p className="font-medium">{material.poissonRatio}</p>
                </div>
                {material.hardness && (
                  <div>
                    <p className="text-sm text-muted-foreground">Hardness</p>
                    <p className="font-medium">{material.hardness}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Thermal Properties */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thermal Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Thermal Expansion</p>
                  <p className="font-medium">{material.thermalExpansion} × 10⁻⁶/°C</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Thermal Conductivity</p>
                  <p className="font-medium">{material.thermalConductivity} W/m·K</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Specific Heat</p>
                  <p className="font-medium">{material.specificHeat} J/kg·K</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Melting Point</p>
                  <p className="font-medium">{material.meltingPoint}°C</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compatibility & Standards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Compatible Profiles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {material.compatibleProfiles.map((profile, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {profile}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Available Grades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {material.availableGrades.map((grade, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {grade}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Standards & Applications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Standards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {material.standards.map((standard, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {standard}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {material.applications.map((application, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {application}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tags */}
          {material.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {material.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Supplier Info */}
          {material.supplier && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Supplier Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Supplier</p>
                    <p className="font-medium">{material.supplier}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Base Price</p>
                    <p className="font-medium">${(material.basePrice || 0).toFixed(2)} {material.currency}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Availability</p>
                    <Badge className={availabilityConfig.color}>
                      <availabilityConfig.icon className="h-3 w-3 mr-1" />
                      {availabilityConfig.label}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface AddMaterialModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (material: Omit<MaterialCatalog, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => void
}

function AddMaterialModal({ isOpen, onClose, onAdd }: AddMaterialModalProps) {
  const { t } = useI18n()
  const [isLoading, setIsLoading] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: MaterialType.STEEL,
    category: MaterialCategory.STRUCTURAL,
    description: '',
    // Physical Properties
    density: 0,
    yieldStrength: 0,
    tensileStrength: 0,
    elasticModulus: 0,
    poissonRatio: 0.3,
    hardness: '',
    // Thermal Properties
    thermalExpansion: 0,
    thermalConductivity: 0,
    specificHeat: 0,
    meltingPoint: 0,
    // Availability & Pricing
    basePrice: 0,
    currency: 'USD',
    supplier: '',
    availability: MaterialAvailability.STOCK,
    // Profiles & Standards
    compatibleProfiles: [] as string[],
    availableGrades: [] as string[],
    standards: [] as string[],
    applications: [] as string[],
    tags: [] as string[]
  })

  const [profileInput, setProfileInput] = useState('')
  const [gradeInput, setGradeInput] = useState('')
  const [standardInput, setStandardInput] = useState('')
  const [applicationInput, setApplicationInput] = useState('')
  const [tagInput, setTagInput] = useState('')

  const handleSubmit = () => {
    if (!formData.name || !formData.density || !formData.yieldStrength || !formData.tensileStrength || !formData.elasticModulus) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }

    const material: Omit<MaterialCatalog, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      ...formData,
      createdBy: 'user' // Could be enhanced with actual user management
    }

    onAdd(material)
    onClose()
    
    // Reset form
    setFormData({
      name: '',
      type: MaterialType.STEEL,
      category: MaterialCategory.STRUCTURAL,
      description: '',
      density: 0,
      yieldStrength: 0,
      tensileStrength: 0,
      elasticModulus: 0,
      poissonRatio: 0.3,
      hardness: '',
      thermalExpansion: 0,
      thermalConductivity: 0,
      specificHeat: 0,
      meltingPoint: 0,
      basePrice: 0,
      currency: 'USD',
      supplier: '',
      availability: MaterialAvailability.STOCK,
      compatibleProfiles: [],
      availableGrades: [],
      standards: [],
      applications: [],
      tags: []
    })
  }

  const addToArray = (array: string[], value: string, setter: (arr: string[]) => void) => {
    if (value.trim() && !array.includes(value.trim())) {
      setter([...array, value.trim()])
    }
  }

  const removeFromArray = (array: string[], index: number, setter: (arr: string[]) => void) => {
    setter(array.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Add New Material to Catalog</DialogTitle>
          <DialogDescription>
            Create a new material entry for your centralized database
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Material Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., A36 Structural Steel"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as MaterialType }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(MaterialType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {MATERIAL_TYPE_CONFIG[type].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as MaterialCategory }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(MaterialCategory).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="availability">Availability</Label>
                  <Select value={formData.availability} onValueChange={(value) => setFormData(prev => ({ ...prev, availability: value as MaterialAvailability }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(MaterialAvailability).map((availability) => (
                        <SelectItem key={availability} value={availability}>
                          {AVAILABILITY_CONFIG[availability].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the material"
                />
              </div>
            </CardContent>
          </Card>

          {/* Physical Properties */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Physical Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="density">Density * (g/cm³)</Label>
                  <Input
                    id="density"
                    type="number"
                    step="0.01"
                    value={formData.density}
                    onChange={(e) => setFormData(prev => ({ ...prev, density: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="yieldStrength">Yield Strength * (MPa)</Label>
                  <Input
                    id="yieldStrength"
                    type="number"
                    value={formData.yieldStrength}
                    onChange={(e) => setFormData(prev => ({ ...prev, yieldStrength: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="tensileStrength">Tensile Strength * (MPa)</Label>
                  <Input
                    id="tensileStrength"
                    type="number"
                    value={formData.tensileStrength}
                    onChange={(e) => setFormData(prev => ({ ...prev, tensileStrength: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="elasticModulus">Elastic Modulus * (GPa)</Label>
                  <Input
                    id="elasticModulus"
                    type="number"
                    value={formData.elasticModulus}
                    onChange={(e) => setFormData(prev => ({ ...prev, elasticModulus: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="poissonRatio">Poisson's Ratio</Label>
                  <Input
                    id="poissonRatio"
                    type="number"
                    step="0.01"
                    value={formData.poissonRatio}
                    onChange={(e) => setFormData(prev => ({ ...prev, poissonRatio: parseFloat(e.target.value) || 0.3 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="hardness">Hardness</Label>
                  <Input
                    id="hardness"
                    value={formData.hardness}
                    onChange={(e) => setFormData(prev => ({ ...prev, hardness: e.target.value }))}
                    placeholder="e.g., HRC 20"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Thermal Properties */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thermal Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="thermalExpansion">Thermal Expansion (× 10⁻⁶/°C)</Label>
                  <Input
                    id="thermalExpansion"
                    type="number"
                    step="0.1"
                    value={formData.thermalExpansion}
                    onChange={(e) => setFormData(prev => ({ ...prev, thermalExpansion: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="thermalConductivity">Thermal Conductivity (W/m·K)</Label>
                  <Input
                    id="thermalConductivity"
                    type="number"
                    step="0.1"
                    value={formData.thermalConductivity}
                    onChange={(e) => setFormData(prev => ({ ...prev, thermalConductivity: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="specificHeat">Specific Heat (J/kg·K)</Label>
                  <Input
                    id="specificHeat"
                    type="number"
                    value={formData.specificHeat}
                    onChange={(e) => setFormData(prev => ({ ...prev, specificHeat: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="meltingPoint">Melting Point (°C)</Label>
                  <Input
                    id="meltingPoint"
                    type="number"
                    value={formData.meltingPoint}
                    onChange={(e) => setFormData(prev => ({ ...prev, meltingPoint: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Supplier */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pricing & Supplier</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="basePrice">Base Price</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                    placeholder="Supplier name"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compatible Profiles & Grades */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Compatible Profiles & Grades</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Compatible Profiles</Label>
                <div className="flex gap-2">
                  <Input
                    value={profileInput}
                    onChange={(e) => setProfileInput(e.target.value)}
                    placeholder="Add profile (e.g., I-beam, Channel)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addToArray(formData.compatibleProfiles, profileInput, (arr) => setFormData(prev => ({ ...prev, compatibleProfiles: arr })))
                        setProfileInput('')
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    onClick={() => {
                      addToArray(formData.compatibleProfiles, profileInput, (arr) => setFormData(prev => ({ ...prev, compatibleProfiles: arr })))
                      setProfileInput('')
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {formData.compatibleProfiles.map((profile, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {profile}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1"
                        onClick={() => removeFromArray(formData.compatibleProfiles, index, (arr) => setFormData(prev => ({ ...prev, compatibleProfiles: arr })))}
                      >
                        ×
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Available Grades</Label>
                <div className="flex gap-2">
                  <Input
                    value={gradeInput}
                    onChange={(e) => setGradeInput(e.target.value)}
                    placeholder="Add grade (e.g., A36, S355)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addToArray(formData.availableGrades, gradeInput, (arr) => setFormData(prev => ({ ...prev, availableGrades: arr })))
                        setGradeInput('')
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    onClick={() => {
                      addToArray(formData.availableGrades, gradeInput, (arr) => setFormData(prev => ({ ...prev, availableGrades: arr })))
                      setGradeInput('')
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {formData.availableGrades.map((grade, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {grade}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1"
                        onClick={() => removeFromArray(formData.availableGrades, index, (arr) => setFormData(prev => ({ ...prev, availableGrades: arr })))}
                      >
                        ×
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add Material
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function MaterialCatalogBrowser({
  onSelectMaterial,
  onSelectTemplate,
  className,
  mode = 'browser'
}: MaterialCatalogBrowserProps) {
  const { t } = useI18n()
  const isMobile = useMediaQuery("(max-width: 767px)")
  const [mounted, setMounted] = useState(false)
  
  // Material catalog context
  const { 
    materials, 
    templates, 
    isLoading, 
    searchMaterials, 
    deleteMaterial,
    statistics 
  } = useMaterialCatalog()
  
  // State
  const [activeTab, setActiveTab] = useState<'materials' | 'templates'>('materials')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialCatalog | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  
  // Filters
  const [filters, setFilters] = useState<MaterialSearchFilters>({})
  const [typeFilter, setTypeFilter] = useState<MaterialType | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<MaterialCategory | 'all'>('all')
  const [availabilityFilter, setAvailabilityFilter] = useState<MaterialAvailability | 'all'>('all')

  // Filter materials
  const filteredMaterials = useMemo(() => {
    let filtered = materials

    if (searchTerm) {
      filtered = filtered.filter(material =>
        material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.applications.some(app => app.toLowerCase().includes(searchTerm.toLowerCase())) ||
        material.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(material => material.type === typeFilter)
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(material => material.category === categoryFilter)
    }

    if (availabilityFilter !== 'all') {
      filtered = filtered.filter(material => material.availability === availabilityFilter)
    }

    return filtered
  }, [materials, searchTerm, typeFilter, categoryFilter, availabilityFilter])

  // Handle material actions
  const handleSelectMaterial = (material: MaterialCatalog) => {
    onSelectMaterial?.(material)
  }

  const handleViewDetails = (material: MaterialCatalog) => {
    setSelectedMaterial(material)
    setShowDetailsModal(true)
  }

  const handleEditMaterial = (material: MaterialCatalog) => {
    toast({
      title: 'Coming Soon',
      description: 'Material editing will be available soon',
    })
  }

  const handleDeleteMaterial = async (material: MaterialCatalog) => {
    try {
      await deleteMaterial(material.id)
      toast({
        title: 'Success',
        description: 'Material deleted from catalog',
      })
    } catch (error) {
      console.error('Failed to delete material:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete material',
        variant: 'destructive'
      })
    }
  }

  const handleDuplicateMaterial = (material: MaterialCatalog) => {
    toast({
      title: 'Coming Soon',
      description: 'Material duplication will be available soon',
    })
  }

  // Handle mounting and prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle adding new material to both catalog and stock
  const handleAddMaterial = async (materialData: Omit<MaterialCatalog, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => {
    try {
      // Create the material in the catalog
      const materialId = await createMaterialCatalog(materialData)
      
      // Create initial stock entry for the new material
      await createMaterialStock({
        materialCatalogId: materialId,
        currentStock: 0,
        reservedStock: 0,
        availableStock: 0,
        minimumStock: 10,
        maximumStock: 1000,
        unitCost: materialData.costPerUnit || 0,
        totalValue: 0,
        location: materialData.location || 'Warehouse A',
        supplier: materialData.supplier || 'Default Supplier',
        notes: materialData.notes || ''
      })
      
      setShowAddModal(false)
      toast({
        title: "Success",
        description: "Material added to catalog and stock management"
      })
    } catch (error) {
      console.error('Failed to create material:', error)
      toast({
        title: "Error",
        description: "Failed to add material",
        variant: "destructive"
      })
    }
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }


  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Material Catalog</h3>
            <p className="text-sm text-muted-foreground">
              Browse and manage your centralized material database
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Material
          </Button>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Materials</p>
                    <p className="text-lg font-semibold">{statistics.totalMaterials}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Material Types</p>
                    <p className="text-lg font-semibold">{statistics.materialsByType ? Object.keys(statistics.materialsByType).length : 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">In Stock</p>
                    <p className="text-lg font-semibold">{statistics.materialsByAvailability?.stock || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Templates</p>
                    <p className="text-lg font-semibold">{templates.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="materials" className="space-y-4 mt-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.values(MaterialType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {MATERIAL_TYPE_CONFIG[type].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as any)}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.values(MaterialCategory).map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={availabilityFilter} onValueChange={(value) => setAvailabilityFilter(value as any)}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Availability</SelectItem>
                {Object.values(MaterialAvailability).map((availability) => (
                  <SelectItem key={availability} value={availability}>
                    {AVAILABILITY_CONFIG[availability].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Materials List */}
          <div className="space-y-4">
            {filteredMaterials.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">
                    {materials.length === 0 ? 'No Materials in Catalog' : 'No Materials Match Filters'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {materials.length === 0 
                      ? 'Materials will appear here once added to your catalog'
                      : 'Try adjusting your search or filter criteria'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredMaterials.map((material) => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  onSelect={() => handleSelectMaterial(material)}
                  onEdit={() => handleEditMaterial(material)}
                  onDelete={() => handleDeleteMaterial(material)}
                  onDuplicate={() => handleDuplicateMaterial(material)}
                  onViewDetails={() => handleViewDetails(material)}
                  isMobile={isMobile}
                  mode={mode}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4 mt-6">
          <Card>
            <CardContent className="p-12 text-center">
              <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Material Templates</h3>
              <p className="text-muted-foreground mb-4">
                Template management interface coming soon!
              </p>
              <Button disabled>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Material Details Modal */}
      <MaterialDetailsModal
        material={selectedMaterial}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
      />
      
      {/* Add Material Modal */}
      <AddMaterialModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddMaterial}
      />

    </div>
  )
}