"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Package,
  Calculator,
  Import,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  DollarSign,
  Calendar,
  FileText,
  Edit,
  Trash2,
  BarChart3,
  TrendingUp,
  MapPin,
  Tag,
  Loader2,
  Eye,
  Archive
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/use-media-query'
import { 
  ProjectMaterial, 
  ProjectMaterialStatus, 
  ProjectMaterialSource,
  Project,
  MaterialCatalog,
  Calculation
} from '@/lib/types'
import { 
  getProjectMaterials,
  createProjectMaterial,
  updateProjectMaterial,
  deleteProjectMaterial,
  updateProjectMaterialStatus,
  getProjectMaterialStatistics,
  createProjectMaterialFromCalculation,
  searchProjectMaterials
} from '@/lib/database'
import { useMaterialCatalog } from '@/contexts/material-catalog-context'
import { useCalculations } from '@/contexts/calculation-context'
import { LoadingSpinner } from '@/components/loading-states'
import { toast } from '@/hooks/use-toast'
import { useI18n } from '@/contexts/i18n-context'
import MaterialAllocationDashboard from './material-allocation-dashboard'
import MaterialCatalogBrowser from './material-catalog-browser'

interface EnhancedProjectMaterialsProps {
  project: Project
  onUpdate?: () => void
  className?: string
}

// Material status colors and icons
const MATERIAL_STATUS_CONFIG = {
  [ProjectMaterialStatus.REQUIRED]: {
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    icon: Clock,
    label: 'Required'
  },
  [ProjectMaterialStatus.ORDERED]: {
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    icon: Truck,
    label: 'Ordered'
  },
  [ProjectMaterialStatus.DELIVERED]: {
    color: 'text-green-600 bg-green-50 border-green-200',
    icon: CheckCircle2,
    label: 'Delivered'
  },
  [ProjectMaterialStatus.INSTALLED]: {
    color: 'text-gray-600 bg-gray-50 border-gray-200',
    icon: Archive,
    label: 'Installed'
  }
}

// Material source icons
const MATERIAL_SOURCE_ICONS = {
  [ProjectMaterialSource.MANUAL]: FileText,
  [ProjectMaterialSource.CALCULATION]: Calculator,
  [ProjectMaterialSource.DISPATCH]: Truck,
  [ProjectMaterialSource.TEMPLATE]: Archive
}

interface MaterialCardProps {
  material: ProjectMaterial
  onEdit: () => void
  onDelete: () => void
  onStatusChange: (status: ProjectMaterialStatus) => void
  isMobile: boolean
}

function MaterialCard({ material, onEdit, onDelete, onStatusChange, isMobile }: MaterialCardProps) {
  const { t } = useI18n()
  const statusConfig = MATERIAL_STATUS_CONFIG[material.status]
  const SourceIcon = MATERIAL_SOURCE_ICONS[material.source]

  return (
    <Card className="hover:bg-muted/30 transition-colors">
      <CardContent className={cn("p-4", isMobile && "p-3")}>
        <div className={cn("flex gap-3", isMobile ? "flex-col space-y-3" : "items-start")}>
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Package className={cn("text-muted-foreground shrink-0 mt-1", isMobile ? "h-4 w-4" : "h-5 w-5")} />
            
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex flex-col gap-2 mb-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className={cn("font-medium leading-tight", isMobile ? "text-sm break-words" : "text-base")}>
                    {material.materialName}
                  </h4>
                  <div className="flex items-center gap-1 shrink-0">
                    <SourceIcon className="h-3 w-3 text-muted-foreground" />
                    <Badge variant="outline" className={cn("text-xs", statusConfig.color)}>
                      {statusConfig.label}
                    </Badge>
                  </div>
                </div>
                
                {/* Specifications */}
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {material.profile} • {material.grade}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {material.totalWeight.toFixed(2)} {material.weightUnit}
                    {material.quantity > 1 && ` (${material.quantity}x)`}
                  </Badge>
                  {material.totalCost && (
                    <Badge variant="outline" className="text-xs text-green-600">
                      ${material.totalCost.toFixed(2)}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Dimensions */}
              <div className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-sm")}>
                Dimensions: {Object.entries(material.dimensions)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(', ')} {material.lengthUnit}
              </div>

              {/* Supplier and Location */}
              {(material.supplier || material.location) && (
                <div className={cn("text-muted-foreground mt-1", isMobile ? "text-xs" : "text-sm")}>
                  {material.supplier && <span>Supplier: {material.supplier}</span>}
                  {material.supplier && material.location && <span> • </span>}
                  {material.location && <span>Location: {material.location}</span>}
                </div>
              )}

              {/* Notes */}
              {material.notes && (
                <div className={cn("text-muted-foreground mt-1 italic", isMobile ? "text-xs break-words" : "text-xs")}>
                  {material.notes}
                </div>
              )}

              {/* Dates */}
              <div className={cn("text-muted-foreground mt-2 flex flex-wrap gap-2", isMobile ? "text-xs" : "text-xs")}>
                <span>Added: {new Date(material.createdAt).toLocaleDateString()}</span>
                {material.orderDate && <span>• Ordered: {new Date(material.orderDate).toLocaleDateString()}</span>}
                {material.deliveryDate && <span>• Delivered: {new Date(material.deliveryDate).toLocaleDateString()}</span>}
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className={cn("flex gap-2 shrink-0", isMobile ? "w-full" : "items-center")}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size={isMobile ? "sm" : "sm"} className={cn(isMobile && "flex-1")}>
                  {statusConfig.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.entries(MATERIAL_STATUS_CONFIG).map(([status, config]) => (
                  <DropdownMenuItem 
                    key={status}
                    onClick={() => onStatusChange(status as ProjectMaterialStatus)}
                    className="flex items-center gap-2"
                  >
                    <config.icon className="h-4 w-4" />
                    {config.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Material
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
}

interface AddMaterialModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (material: Omit<ProjectMaterial, 'id' | 'createdAt' | 'updatedAt'>) => void
  projectId: string
}

function AddMaterialModal({ isOpen, onClose, onAdd, projectId }: AddMaterialModalProps) {
  const { t } = useI18n()
  const { materials: catalogMaterials, isLoading: catalogLoading } = useMaterialCatalog()
  const { calculations } = useCalculations()
  const [activeTab, setActiveTab] = useState<'manual' | 'catalog' | 'calculation'>('manual')
  const [isLoading, setIsLoading] = useState(false)
  
  // Manual entry form state
  const [formData, setFormData] = useState({
    materialName: '',
    profile: '',
    grade: '',
    quantity: 1,
    unitWeight: 0,
    lengthUnit: 'm',
    weightUnit: 'kg',
    supplier: '',
    notes: '',
    dimensions: {} as Record<string, number>
  })

  const handleManualSubmit = () => {
    if (!formData.materialName || !formData.profile || !formData.grade || formData.unitWeight <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }

    const material: Omit<ProjectMaterial, 'id' | 'createdAt' | 'updatedAt'> = {
      projectId,
      materialCatalogId: undefined,
      materialName: formData.materialName,
      profile: formData.profile,
      grade: formData.grade,
      dimensions: formData.dimensions,
      quantity: formData.quantity,
      unitWeight: formData.unitWeight,
      totalWeight: formData.unitWeight * formData.quantity,
      lengthUnit: formData.lengthUnit,
      weightUnit: formData.weightUnit,
      status: ProjectMaterialStatus.REQUIRED,
      supplier: formData.supplier || undefined,
      notes: formData.notes || undefined,
      source: ProjectMaterialSource.MANUAL
    }

    onAdd(material)
    onClose()
    
    // Reset form
    setFormData({
      materialName: '',
      profile: '',
      grade: '',
      quantity: 1,
      unitWeight: 0,
      lengthUnit: 'm',
      weightUnit: 'kg',
      supplier: '',
      notes: '',
      dimensions: {}
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Add Material to Project</DialogTitle>
          <DialogDescription>
            Add materials manually, from catalog, or import from calculations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tab selector */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('manual')}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                activeTab === 'manual' 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Manual Entry
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                activeTab === 'catalog' 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              From Catalog
            </button>
            <button
              onClick={() => setActiveTab('calculation')}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                activeTab === 'calculation' 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              From Calculation
            </button>
          </div>

          {/* Manual Entry Tab */}
          {activeTab === 'manual' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="materialName">Material Name *</Label>
                  <Input
                    id="materialName"
                    value={formData.materialName}
                    onChange={(e) => setFormData(prev => ({ ...prev, materialName: e.target.value }))}
                    placeholder="e.g., A36 Structural Steel"
                  />
                </div>
                <div>
                  <Label htmlFor="profile">Profile *</Label>
                  <Input
                    id="profile"
                    value={formData.profile}
                    onChange={(e) => setFormData(prev => ({ ...prev, profile: e.target.value }))}
                    placeholder="e.g., HEA, IPE, Channel"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="grade">Grade *</Label>
                  <Input
                    id="grade"
                    value={formData.grade}
                    onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                    placeholder="e.g., A36, S355"
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unitWeight">Unit Weight * ({formData.weightUnit})</Label>
                  <Input
                    id="unitWeight"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.unitWeight}
                    onChange={(e) => setFormData(prev => ({ ...prev, unitWeight: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about this material..."
                  className="h-20"
                />
              </div>
            </div>
          )}

          {/* Catalog Tab */}
          {activeTab === 'catalog' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-muted-foreground">
                  Select materials from your catalog or add new ones
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // TODO: Open Add Material to Catalog modal
                    toast({
                      title: 'Coming Soon',
                      description: 'Add material to catalog functionality will be available soon',
                    })
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Catalog
                </Button>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <MaterialCatalogBrowser
                  mode="selector"
                  onSelectMaterial={(material) => {
                    // Convert MaterialCatalog to ProjectMaterial format
                    const projectMaterial: Omit<ProjectMaterial, 'id' | 'createdAt' | 'updatedAt'> = {
                      projectId,
                      materialCatalogId: material.id,
                      materialName: material.name,
                      profile: material.compatibleProfiles[0] || 'Custom', // Use first compatible profile
                      grade: material.availableGrades[0] || 'Standard', // Use first available grade
                      dimensions: {}, // Will need to be specified by user
                      quantity: 1,
                      unitWeight: material.density, // Use density as approximate weight
                      totalWeight: material.density,
                      lengthUnit: 'm',
                      weightUnit: 'kg',
                      status: ProjectMaterialStatus.REQUIRED,
                      supplier: material.supplier,
                      unitCost: material.basePrice,
                      totalCost: material.basePrice,
                      source: ProjectMaterialSource.MANUAL
                    }
                    
                    onAdd(projectMaterial)
                    onClose()
                    
                    toast({
                      title: 'Material Added',
                      description: `${material.name} added to project from catalog`,
                    })
                  }}
                />
              </div>
            </div>
          )}

          {/* Calculation Tab */}
          {activeTab === 'calculation' && (
            <div className="space-y-4">
              <div className="text-center text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-2" />
                <p>Import from calculations coming soon!</p>
                <p className="text-sm">This will allow you to import materials from your calculation history.</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          {activeTab === 'manual' && (
            <Button onClick={handleManualSubmit} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Material
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function EnhancedProjectMaterials({
  project,
  onUpdate,
  className
}: EnhancedProjectMaterialsProps) {
  const { t } = useI18n()
  const isMobile = useMediaQuery("(max-width: 767px)")
  
  // State
  const [materials, setMaterials] = useState<ProjectMaterial[]>([])
  const [filteredMaterials, setFilteredMaterials] = useState<ProjectMaterial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectMaterialStatus | 'all'>('all')
  const [sourceFilter, setSourceFilter] = useState<ProjectMaterialSource | 'all'>('all')
  const [statistics, setStatistics] = useState<any>(null)
  const [showAllocation, setShowAllocation] = useState(false)

  // Load materials
  const loadMaterials = async () => {
    setIsLoading(true)
    try {
      const projectMaterials = await getProjectMaterials(project.id)
      const stats = await getProjectMaterialStatistics(project.id)
      setMaterials(projectMaterials)
      setStatistics(stats)
    } catch (error) {
      console.error('Failed to load materials:', error)
      toast({
        title: 'Error',
        description: 'Failed to load project materials',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter materials
  useEffect(() => {
    let filtered = materials

    if (searchTerm) {
      filtered = filtered.filter(material =>
        material.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.profile.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (material.supplier && material.supplier.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(material => material.status === statusFilter)
    }

    if (sourceFilter !== 'all') {
      filtered = filtered.filter(material => material.source === sourceFilter)
    }

    setFilteredMaterials(filtered)
  }, [materials, searchTerm, statusFilter, sourceFilter])

  // Load on mount
  useEffect(() => {
    loadMaterials()
  }, [project.id])

  // Handle add material
  const handleAddMaterial = async (materialData: Omit<ProjectMaterial, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createProjectMaterial(materialData)
      await loadMaterials()
      onUpdate?.()
      toast({
        title: 'Success',
        description: 'Material added to project',
      })
    } catch (error) {
      console.error('Failed to add material:', error)
      toast({
        title: 'Error',
        description: 'Failed to add material',
        variant: 'destructive'
      })
    }
  }

  // Handle status change
  const handleStatusChange = async (materialId: string, status: ProjectMaterialStatus) => {
    try {
      await updateProjectMaterialStatus(materialId, status)
      await loadMaterials()
      onUpdate?.()
      toast({
        title: 'Success',
        description: 'Material status updated',
      })
    } catch (error) {
      console.error('Failed to update status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update material status',
        variant: 'destructive'
      })
    }
  }

  // Handle delete material
  const handleDeleteMaterial = async (materialId: string) => {
    try {
      await deleteProjectMaterial(materialId)
      await loadMaterials()
      onUpdate?.()
      toast({
        title: 'Success',
        description: 'Material removed from project',
      })
    } catch (error) {
      console.error('Failed to delete material:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove material',
        variant: 'destructive'
      })
    }
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
      {/* Header and Statistics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Project Materials</h3>
            <p className="text-sm text-muted-foreground">
              Manage materials and track allocation for this project
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Material
          </Button>
        </div>

        {/* Statistics Cards */}
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
                    <p className="text-xs text-muted-foreground">Total Weight</p>
                    <p className="text-lg font-semibold">{statistics.totalWeight.toFixed(1)} kg</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Cost</p>
                    <p className="text-lg font-semibold">${statistics.totalCost.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Delivered</p>
                    <p className="text-lg font-semibold">{statistics.materialsByStatus.delivered || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="materials" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="materials">Materials List</TabsTrigger>
          <TabsTrigger value="allocation">Allocation Dashboard</TabsTrigger>
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
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(MATERIAL_STATUS_CONFIG).map(([status, config]) => (
              <SelectItem key={status} value={status}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={(value) => setSourceFilter(value as any)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value={ProjectMaterialSource.MANUAL}>Manual</SelectItem>
            <SelectItem value={ProjectMaterialSource.CALCULATION}>Calculation</SelectItem>
            <SelectItem value={ProjectMaterialSource.DISPATCH}>Dispatch</SelectItem>
            <SelectItem value={ProjectMaterialSource.TEMPLATE}>Template</SelectItem>
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
                {materials.length === 0 ? 'No Materials Added' : 'No Materials Match Filters'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {materials.length === 0 
                  ? 'Add materials to track what you need for this project'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
              {materials.length === 0 && (
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Material
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredMaterials.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              onEdit={() => {
                // TODO: Implement edit modal
                toast({
                  title: 'Coming Soon',
                  description: 'Material editing will be available soon',
                })
              }}
              onDelete={() => handleDeleteMaterial(material.id)}
              onStatusChange={(status) => handleStatusChange(material.id, status)}
              isMobile={isMobile}
            />
          ))
        )}
        </div>
        </TabsContent>

        <TabsContent value="allocation" className="mt-6">
          <MaterialAllocationDashboard
            project={project}
            onUpdate={loadMaterials}
          />
        </TabsContent>
      </Tabs>

      {/* Add Material Modal */}
      <AddMaterialModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddMaterial}
        projectId={project.id}
      />
    </div>
  )
}