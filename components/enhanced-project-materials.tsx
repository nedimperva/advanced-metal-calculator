"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
  MaterialStock,
  MaterialInstallation
} from '@/lib/types'

// Enhanced tracking interfaces

interface EnhancedProjectMaterial extends ProjectMaterial {
  reservedQuantity: number
  installedQuantity: number
  availableForInstallation: number
  installationRecords: MaterialInstallation[]
}
import { 
  getProjectMaterials,
  createProjectMaterial,
  updateProjectMaterial,
  deleteProjectMaterial,
  updateProjectMaterialStatus,
  getProjectMaterialStatistics,
  createProjectMaterialFromCalculation,
  searchProjectMaterials,
  getAllMaterialStock,
  reserveMaterialStock,
  createMaterialStockTransaction,
  unreserveMaterialStock,
  recordMaterialInstallation,
  getMaterialInstallationsByProjectMaterial
} from '@/lib/database'
import { useMaterialCatalog } from '@/contexts/material-catalog-context'
import { useProjects } from '@/contexts/project-context'
import { LoadingSpinner } from '@/components/loading-states'
import { toast } from '@/hooks/use-toast'
import { useI18n } from '@/contexts/i18n-context'

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

// Installation status for tracking
type InstallationStatus = 'not-started' | 'partial' | 'complete'

// Helper function to determine installation status
function getInstallationStatus(material: EnhancedProjectMaterial): InstallationStatus {
  if (material.installedQuantity === 0) return 'not-started'
  if (material.installedQuantity >= material.reservedQuantity) return 'complete'
  return 'partial'
}

// Material source icons
const MATERIAL_SOURCE_ICONS = {
  [ProjectMaterialSource.MANUAL]: FileText,
  [ProjectMaterialSource.CALCULATION]: Calculator,
  [ProjectMaterialSource.DISPATCH]: Truck,
  [ProjectMaterialSource.TEMPLATE]: Archive
}

interface MaterialCardProps {
  material: EnhancedProjectMaterial
  onEdit: () => void
  onDelete: () => void
  onStatusChange: (status: ProjectMaterialStatus) => void
  onInstall: () => void
  isMobile: boolean
}

function MaterialCard({ material, onEdit, onDelete, onStatusChange, onInstall, isMobile }: MaterialCardProps) {
  const { t } = useI18n()
  const statusConfig = MATERIAL_STATUS_CONFIG[material.status]
  const SourceIcon = MATERIAL_SOURCE_ICONS[material.source]
  const installationStatus = getInstallationStatus(material)

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
                </div>
                
                {/* Quantity and Pricing Information */}
                <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                  <div>
                    <div className="text-muted-foreground text-xs">Quantity & Weight</div>
                    <div className="font-medium">
                      {material.quantity} {material.unit || 'pcs'} 
                      {material.totalWeight > 0 && (
                        <span className="text-muted-foreground ml-1">
                          ({material.totalWeight.toFixed(2)} {material.weightUnit})
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Pricing</div>
                    <div className="font-medium">
                      {material.unitCost && (
                        <>
                          {material.unitCost.toFixed(2)} KM/{material.unit || 'pc'}
                          {material.totalCost && (
                            <div className="text-green-600 font-semibold">
                              Total: {material.totalCost.toFixed(2)} KM
                            </div>
                          )}
                        </>
                      )}
                      {!material.unitCost && material.totalCost && (
                        <div className="text-green-600 font-semibold">
                          {material.totalCost.toFixed(2)} KM
                        </div>
                      )}
                      {!material.unitCost && !material.totalCost && (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </div>
                  </div>
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

              {/* Installation Progress Bar */}
              {material.reservedQuantity > 0 && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Installation Progress</span>
                    <span>{((material.installedQuantity / material.reservedQuantity) * 100).toFixed(0)}%</span>
                  </div>
                  <Progress 
                    value={(material.installedQuantity / material.reservedQuantity) * 100} 
                    className="h-1.5"
                  />
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

interface StockMaterialSelectorProps {
  projectId: string
  onAssign: (material: Omit<ProjectMaterial, 'id' | 'createdAt' | 'updatedAt'>) => void
}

function StockMaterialSelector({ projectId, onAssign }: StockMaterialSelectorProps) {
  const { t } = useI18n()
  const { materials: catalogMaterials } = useMaterialCatalog()
  const { projects } = useProjects()
  const [materialStock, setMaterialStock] = useState<(MaterialStock & { material: MaterialCatalog })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStock, setSelectedStock] = useState<MaterialStock | null>(null)
  const [quantity, setQuantity] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadMaterialStock()
  }, [])

  const loadMaterialStock = async () => {
    try {
      setIsLoading(true)
      const [stockData, materials] = await Promise.all([
        getAllMaterialStock(),
        catalogMaterials.length > 0 ? Promise.resolve(catalogMaterials) : []
      ])
      
      const stockWithMaterials = stockData.map(stock => ({
        ...stock,
        material: materials.find(m => m.id === stock.materialCatalogId)
      })).filter(stock => stock.material && stock.availableStock > 0) as (MaterialStock & { material: MaterialCatalog })[]
      
      setMaterialStock(stockWithMaterials)
    } catch (error) {
      console.error('Failed to load material stock:', error)
      toast({
        title: 'Error',
        description: 'Failed to load material stock',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedStock || !quantity) {
      toast({
        title: 'Validation Error',
        description: 'Please select a material and enter quantity',
        variant: 'destructive'
      })
      return
    }

    const assignQuantity = parseFloat(quantity)
    if (assignQuantity <= 0 || assignQuantity > selectedStock.availableStock) {
      toast({
        title: 'Invalid Quantity',
        description: `Quantity must be between 1 and ${selectedStock.availableStock}`,
        variant: 'destructive'
      })
      return
    }

    try {
      // Reserve stock
      await reserveMaterialStock(selectedStock.materialCatalogId, assignQuantity, projectId)
      
      // Create stock transaction
      await createMaterialStockTransaction({
        materialStockId: selectedStock.id,
        type: 'RESERVED',
        quantity: assignQuantity,
        unitCost: selectedStock.unitCost,
        totalCost: assignQuantity * selectedStock.unitCost,
        referenceId: projectId,
        referenceType: 'PROJECT',
        transactionDate: new Date(),
        notes: `Reserved for project: ${projects.find(p => p.id === projectId)?.name || projectId}`,
        createdBy: 'system'
      })

      // Create project material
      const projectMaterial: Omit<ProjectMaterial, 'id' | 'createdAt' | 'updatedAt'> = {
        projectId,
        materialCatalogId: selectedStock.materialCatalogId,
        materialName: selectedStock.material.name,
        profile: selectedStock.material.compatibleProfiles?.[0] || 'Standard',
        grade: selectedStock.material.availableGrades?.[0] || selectedStock.material.type,
        dimensions: {},
        quantity: assignQuantity,
        unitWeight: selectedStock.material.density || 1,
        totalWeight: assignQuantity * (selectedStock.material.density || 1),
        unitCost: selectedStock.unitCost,
        totalCost: assignQuantity * selectedStock.unitCost,
        lengthUnit: 'mm',
        weightUnit: 'kg',
        status: ProjectMaterialStatus.ORDERED,
        supplier: selectedStock.supplier,
        orderDate: new Date(),
        source: ProjectMaterialSource.DISPATCH,
        notes: `Assigned from stock: ${selectedStock.material.name}`
      }

      onAssign(projectMaterial)
      
      toast({
        title: 'Success',
        description: 'Material assigned from stock successfully'
      })
    } catch (error) {
      console.error('Failed to assign material:', error)
      toast({
        title: 'Error',
        description: 'Failed to assign material from stock',
        variant: 'destructive'
      })
    }
  }

  const filteredStock = materialStock.filter(stock =>
    stock.material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.material.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Assign materials from your stock inventory
        </p>
      </div>
      
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search materials in stock..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stock List */}
      <div className="max-h-96 overflow-y-auto space-y-2">
        {filteredStock.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Stock Available</h3>
            <p className="text-sm text-muted-foreground">
              {materialStock.length === 0 
                ? 'No materials in stock. Add materials to your inventory first.'
                : 'No materials match your search criteria.'
              }
            </p>
          </div>
        ) : (
          filteredStock.map((stock) => (
            <Card
              key={stock.id}
              className={cn(
                "cursor-pointer border transition-colors hover:bg-muted/50",
                selectedStock?.id === stock.id && "ring-2 ring-primary"
              )}
              onClick={() => setSelectedStock(stock)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{stock.material.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{stock.material.type}</Badge>
                      <span>Available: {stock.availableStock}</span>
                      <span>•</span>
                      <span>${stock.unitCost.toFixed(2)} per unit</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      Total: ${stock.totalValue.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stock.location}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Assignment Form */}
      {selectedStock && (
        <div className="space-y-4 border-t pt-4">
          <div>
            <Label htmlFor="quantity">Quantity to Assign</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={selectedStock.availableStock}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={`Max: ${selectedStock.availableStock}`}
            />
          </div>
          <Button onClick={handleAssign} className="w-full">
            Assign to Project
          </Button>
        </div>
      )}
    </div>
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
  const [activeTab, setActiveTab] = useState<'manual' | 'catalog' | 'calculation'>('manual')
  const [isLoading, setIsLoading] = useState(false)
  
  // Manual entry form state
  const [formData, setFormData] = useState({
    materialName: '',
    materialType: 'STEEL',
    profile: '',
    grade: '',
    quantity: 1,
    unitWeight: 0,
    lengthUnit: 'm',
    weightUnit: 'kg',
    costPerUnit: 0,
    unit: 'kg',
    supplier: '',
    location: '',
    certificateNumber: '',
    notes: '',
    dimensions: {} as Record<string, number>
  })

  const handleManualSubmit = async () => {
    if (!formData.materialName || !formData.grade || !formData.costPerUnit || formData.quantity <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    
    try {
      // First, create the material in the catalog
      const materialData = {
        name: formData.materialName,
        type: formData.materialType,
        category: 'STRUCTURAL',
        grade: formData.grade,
        costPerUnit: formData.costPerUnit,
        unit: formData.unit,
        supplier: formData.supplier,
        location: formData.location,
        certificateNumber: formData.certificateNumber,
        notes: formData.notes,
        // Set basic defaults for required catalog fields
        density: 7.85,
        yieldStrength: 250,
        tensileStrength: 400,
        elongation: 20,
        applications: ['Structural'],
        standards: ['EN 10025'],
        profile: formData.profile || 'Custom',
        dimensions: formData.dimensions || {}
      }

      // Create material in catalog
      const catalogResponse = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(materialData)
      })

      if (!catalogResponse.ok) throw new Error('Failed to create material in catalog')
      
      const catalogMaterial = await catalogResponse.json()

      // Then create stock record
      const stockData = {
        materialId: catalogMaterial.id,
        currentStock: formData.quantity,
        minStock: 0,
        maxStock: formData.quantity * 2,
        reorderPoint: 0,
        unit: formData.unit,
        costPerUnit: formData.costPerUnit,
        supplier: formData.supplier,
        location: formData.location,
        notes: formData.notes
      }

      const stockResponse = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stockData)
      })

      if (!stockResponse.ok) throw new Error('Failed to create stock record')

      // Finally, assign to project
      const projectMaterial: Omit<ProjectMaterial, 'id' | 'createdAt' | 'updatedAt'> = {
        projectId,
        materialCatalogId: catalogMaterial.id,
        materialName: formData.materialName,
        profile: formData.profile || 'Custom',
        grade: formData.grade,
        dimensions: formData.dimensions || {},
        quantity: formData.quantity,
        unitWeight: formData.unitWeight || 0,
        totalWeight: (formData.unitWeight || 0) * formData.quantity,
        lengthUnit: formData.lengthUnit,
        weightUnit: formData.weightUnit,
        status: ProjectMaterialStatus.AVAILABLE,
        supplier: formData.supplier || undefined,
        notes: formData.notes || undefined,
        source: ProjectMaterialSource.MANUAL,
        unitCost: formData.costPerUnit,
        totalCost: formData.costPerUnit * formData.quantity
      }

      onAdd(projectMaterial)
      onClose()

      toast({
        title: 'Success',
        description: 'Material created and assigned to project successfully'
      })
      
    } catch (error) {
      console.error('Error creating material:', error)
      toast({
        title: 'Error',
        description: 'Failed to create material. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
    
    // Reset form
    setFormData({
      materialName: '',
      materialType: 'STEEL',
      profile: '',
      grade: '',
      quantity: 1,
      unitWeight: 0,
      lengthUnit: 'm',
      weightUnit: 'kg',
      costPerUnit: 0,
      unit: 'kg',
      supplier: '',
      location: '',
      certificateNumber: '',
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
              From Stock
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
              <div className="col-span-2 space-y-2">
                <Label htmlFor="materialName">Material Name *</Label>
                <Input
                  id="materialName"
                  value={formData.materialName}
                  onChange={(e) => setFormData(prev => ({ ...prev, materialName: e.target.value }))}
                  placeholder="Steel Plate S235 1500x3000x10mm"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="materialType">Material Type *</Label>
                  <Select 
                    value={formData.materialType || 'STEEL'} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, materialType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STEEL">Steel</SelectItem>
                      <SelectItem value="CONCRETE">Concrete</SelectItem>
                      <SelectItem value="ALUMINUM">Aluminum</SelectItem>
                      <SelectItem value="WOOD">Wood</SelectItem>
                      <SelectItem value="COMPOSITE">Composite</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade/Quality *</Label>
                  <Input
                    id="grade"
                    value={formData.grade}
                    onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                    placeholder="S235"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="costPerUnit">Unit Price (KM) *</Label>
                  <Input
                    id="costPerUnit"
                    type="number"
                    step="0.01"
                    value={formData.costPerUnit || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, costPerUnit: parseFloat(e.target.value) || 0 }))}
                    placeholder="2.50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Select 
                    value={formData.unit || 'kg'} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="pieces">pieces</SelectItem>
                      <SelectItem value="m">m</SelectItem>
                      <SelectItem value="m²">m²</SelectItem>
                      <SelectItem value="m³">m³</SelectItem>
                      <SelectItem value="tons">tons</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Storage Location</Label>
                <Input
                  id="location"
                  value={formData.location || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Warehouse A, Section B"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="certificateNumber">Certificate Number</Label>
                <Input
                  id="certificateNumber"
                  value={formData.certificateNumber || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, certificateNumber: e.target.value }))}
                  placeholder="Optional certificate number"
                />
              </div>

              <div className="space-y-2">
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

          {/* From Stock Tab */}
          {activeTab === 'catalog' && (
            <StockMaterialSelector 
              projectId={projectId}
              onAssign={(materialData) => {
                onAdd(materialData)
                onClose()
              }}
            />
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
  const [materials, setMaterials] = useState<EnhancedProjectMaterial[]>([])
  const [filteredMaterials, setFilteredMaterials] = useState<EnhancedProjectMaterial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectMaterialStatus | 'all'>('all')
  const [sourceFilter, setSourceFilter] = useState<ProjectMaterialSource | 'all'>('all')
  const [statistics, setStatistics] = useState<any>(null)
  // Removed unused showAllocation state
  const [showInstallDialog, setShowInstallDialog] = useState(false)
  const [installMaterial, setInstallMaterial] = useState<EnhancedProjectMaterial | null>(null)
  const [installQuantity, setInstallQuantity] = useState('')
  const [returnToStock, setReturnToStock] = useState(false)

  // Load materials with installation tracking
  const loadMaterials = async () => {
    setIsLoading(true)
    try {
      const projectMaterials = await getProjectMaterials(project.id)
      const stats = await getProjectMaterialStatistics(project.id)
      
      // Transform materials to include installation tracking
      const enhancedMaterials: EnhancedProjectMaterial[] = await Promise.all(
        projectMaterials.map(async (material) => {
          // Get installation records from the database
          const installationRecords = await getMaterialInstallationsByProjectMaterial(material.id)
          
          // Calculate tracking values
          const reservedQuantity = material.quantity
          const installedQuantity = installationRecords.reduce((sum, record) => sum + record.installedQuantity, 0)
          const availableForInstallation = Math.max(0, reservedQuantity - installedQuantity)
          
          return {
            ...material,
            reservedQuantity,
            installedQuantity,
            availableForInstallation,
            installationRecords
          }
        })
      )
      
      setMaterials(enhancedMaterials)
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

  // Handle status change (simplified - no longer triggers installation dialog)
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

  // Handle installation dialog opening
  const handleInstallClick = (material: EnhancedProjectMaterial) => {
    setInstallMaterial(material)
    setInstallQuantity(material.availableForInstallation.toString())
    setReturnToStock(false)
    setShowInstallDialog(true)
  }

  // Handle installation with proper tracking
  const handleInstallation = async () => {
    if (!installMaterial || !installQuantity) return

    const installedQty = parseFloat(installQuantity)
    const availableQty = installMaterial.availableForInstallation
    
    if (installedQty <= 0 || installedQty > availableQty) {
      toast({
        title: 'Invalid Quantity',
        description: `Installed quantity must be between 1 and ${availableQty} (available for installation)`,
        variant: 'destructive'
      })
      return
    }

    try {
      // Record the material installation using the unified function
      const installationId = await recordMaterialInstallation({
        projectMaterialId: installMaterial.id,
        projectId: installMaterial.projectId,
        installedQuantity: installedQty,
        remainingQuantity: returnToStock ? 0 : (availableQty - installedQty),
        returnedToStock: returnToStock ? (availableQty - installedQty) : 0,
        installedBy: 'Current User', // TODO: Get actual user from auth context
        installationDate: new Date(),
        notes: `Installation: ${installedQty} units installed${returnToStock && availableQty > installedQty ? `, ${availableQty - installedQty} returned to stock` : ', remaining reserved for future installation'}`
      })

      // The recordMaterialInstallation function handles all stock transactions 
      // and status updates automatically

      await loadMaterials()
      onUpdate?.()
      setShowInstallDialog(false)
      setInstallMaterial(null)
      setInstallQuantity('')
      setReturnToStock(false)

      toast({
        title: 'Installation Recorded',
        description: `${installedQty} units installed successfully.${returnToStock && availableQty > installedQty ? ` ${availableQty - installedQty} units returned to stock.` : ''}`,
      })
    } catch (error) {
      console.error('Failed to record installation:', error)
      toast({
        title: 'Error',
        description: 'Failed to record material installation',
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

      {/* Materials Content - No more tabs, everything unified */}
      <div className="space-y-6">
        {/* Allocation Summary Cards - Moved from dashboard */}
        {statistics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Required</p>
                    <p className="text-lg font-semibold">{materials.reduce((sum, m) => sum + m.reservedQuantity, 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Delivered</p>
                    <p className="text-lg font-semibold">{materials.filter(m => m.status === ProjectMaterialStatus.DELIVERED || m.status === ProjectMaterialStatus.INSTALLED).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Installed</p>
                    <p className="text-lg font-semibold">{materials.reduce((sum, m) => sum + m.installedQuantity, 0).toFixed(1)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Available to Install</p>
                    <p className="text-lg font-semibold">{materials.reduce((sum, m) => sum + m.availableForInstallation, 0).toFixed(1)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
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
              onInstall={() => handleInstallClick(material)}
              isMobile={isMobile}
            />
          ))
        )}
        </div>
      </div>

      {/* Add Material Modal */}
      <AddMaterialModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddMaterial}
        projectId={project.id}
      />

      {/* Installation Dialog */}
      <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Material Installation</DialogTitle>
            <DialogDescription>
              Install "{installMaterial?.materialName}" - Track actual usage and prevent double installations
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Installation Summary */}
            <div className="p-3 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Reserved:</span>
                <span className="font-medium">{installMaterial?.reservedQuantity} {installMaterial?.unit}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Already Installed:</span>
                <span className="font-medium text-green-600">{installMaterial?.installedQuantity || 0} {installMaterial?.unit}</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2">
                <span>Available to Install:</span>
                <span className="font-semibold text-blue-600">{installMaterial?.availableForInstallation} {installMaterial?.unit}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="installedQuantity">Quantity to Install Now</Label>
              <Input
                id="installedQuantity"
                type="number"
                min="0.01"
                max={installMaterial?.availableForInstallation || 0}
                step="0.01"
                value={installQuantity}
                onChange={(e) => setInstallQuantity(e.target.value)}
                placeholder={`Max: ${installMaterial?.availableForInstallation || 0}`}
              />
              <div className="text-sm text-muted-foreground">
                Maximum installable: {installMaterial?.availableForInstallation} {installMaterial?.unit}
              </div>
            </div>

            {/* Show return option only if there's remaining quantity and material is from stock */}
            {installMaterial && parseFloat(installQuantity) > 0 && parseFloat(installQuantity) < (installMaterial.availableForInstallation || 0) && installMaterial.materialCatalogId && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="returnToStock"
                    checked={returnToStock}
                    onCheckedChange={(checked) => setReturnToStock(!!checked)}
                  />
                  <Label htmlFor="returnToStock" className="text-sm">
                    Return remaining {((installMaterial.availableForInstallation || 0) - (parseFloat(installQuantity) || 0)).toFixed(2)} {installMaterial.unit} to stock
                  </Label>
                </div>
                <div className="text-xs text-muted-foreground ml-6">
                  {returnToStock 
                    ? "Remaining quantity will be unreserved and available for other projects"
                    : "Remaining quantity will stay reserved for future installation in this project"
                  }
                </div>
              </div>
            )}

            {!installMaterial?.materialCatalogId && (
              <div className="text-sm text-muted-foreground p-3 bg-amber-50 border border-amber-200 rounded">
                <span className="font-medium">Note:</span> This material was manually added and is not linked to stock inventory.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowInstallDialog(false)
                setInstallMaterial(null)
                setInstallQuantity('')
                setReturnToStock(false)
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleInstallation}
              disabled={!installQuantity || parseFloat(installQuantity) <= 0 || parseFloat(installQuantity) > (installMaterial?.availableForInstallation || 0)}
            >
              Record Installation ({parseFloat(installQuantity) || 0} {installMaterial?.unit})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}