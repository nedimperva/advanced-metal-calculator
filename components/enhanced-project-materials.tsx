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
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  DollarSign,
  FileText,
  Trash2,
  BarChart3,
  Loader2,
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
  MaterialStock
} from '@/lib/types'
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
  unreserveMaterialStock
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
    label: 'Reserved'
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
  onDelete: () => void
  onStatusChange: (status: ProjectMaterialStatus) => void
  isMobile: boolean
  stockInfo?: MaterialStock | null
  fallbackUnitCost?: number | null
}

function MaterialCard({ material, onDelete, onStatusChange, isMobile, stockInfo, fallbackUnitCost }: MaterialCardProps) {
  const { t } = useI18n()
  const statusConfig = MATERIAL_STATUS_CONFIG[material.status]

  return (
    <Card className="hover:bg-muted/30 transition-colors">
      <CardContent className={cn("p-4", isMobile && "p-3")}>
        <div className={cn("flex gap-3", isMobile ? "flex-col space-y-3" : "items-start")}>          
          <Package className={cn("text-muted-foreground shrink-0 mt-1", isMobile ? "h-4 w-4" : "h-5 w-5")} />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className={cn("font-medium leading-tight", isMobile ? "text-sm break-words" : "text-base")}>
                {material.materialName}
              </h4>
              <Badge variant="outline" className={cn("text-xs", statusConfig.color)}>
                {statusConfig.label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
              <div>
                <div className="text-muted-foreground text-xs">Quantity</div>
                <div className="font-medium">
                  {material.quantity} {material.unit || material.weightUnit || ''}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Price</div>
                <div className="font-medium">
                  {(() => {
                    const unit = material.unit || material.weightUnit || 'unit'
                    // Prefer stock price (Materials page is source of truth), then material fields, then catalog base price
                    const unitCostCandidate = (
                      (stockInfo?.unitCost !== undefined ? stockInfo.unitCost : undefined) ??
                      material.unitCost ??
                      (material as any)?.costPerUnit ??
                      fallbackUnitCost
                    )
                    const unitCostNum = unitCostCandidate != null ? Number(unitCostCandidate) : undefined
                    const unitCost = unitCostNum != null && unitCostNum > 0 && !Number.isNaN(unitCostNum) ? unitCostNum : undefined

                    const providedTotal = material.totalCost != null ? Number(material.totalCost) : undefined
                    const computedTotal = (providedTotal != null && providedTotal > 0)
                      ? providedTotal
                      : (unitCost != null ? unitCost * Number(material.quantity) : undefined)

                    return (
                      <>
                        {unitCost != null && (
                          <div>{unitCost.toFixed(2)} KM/{unit}</div>
                        )}
                        {computedTotal != null && !Number.isNaN(computedTotal) ? (
                          <div className="text-green-600 font-semibold">Total: {computedTotal.toFixed(2)} KM</div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </>
                    )
                  })()}
                </div>
              </div>
            </div>

            {stockInfo && (
              <div className="mt-1 text-xs text-muted-foreground">
                Available: {stockInfo.availableStock} {material.unit || material.weightUnit || ''}
              </div>
            )}
          </div>

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

      // Create project material with proper unit handling
      const projectMaterial: Omit<ProjectMaterial, 'id' | 'createdAt' | 'updatedAt'> = {
        projectId,
        materialCatalogId: selectedStock.materialCatalogId,
        materialName: selectedStock.material.name,
        profile: selectedStock.material.compatibleProfiles?.[0] || 'Standard',
        grade: selectedStock.material.availableGrades?.[0] || selectedStock.material.type,
        dimensions: {},
        quantity: assignQuantity,
        unit: 'kg', // Ensure consistent unit usage
        unitWeight: selectedStock.material.density || 1,
        totalWeight: assignQuantity, // For weight-based materials, quantity IS the weight
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

      // Finally, assign to project with proper unit handling
      const projectMaterial: Omit<ProjectMaterial, 'id' | 'createdAt' | 'updatedAt'> = {
        projectId,
        materialCatalogId: catalogMaterial.id,
        materialName: formData.materialName,
        profile: formData.profile || 'Custom',
        grade: formData.grade,
        dimensions: formData.dimensions || {},
        quantity: formData.quantity,
        unit: formData.unit, // Use the selected unit consistently
        unitWeight: formData.unitWeight || (formData.unit === 'kg' ? 1 : 0), // For kg unit, unitWeight is 1
        totalWeight: formData.unit === 'kg' ? formData.quantity : (formData.unitWeight || 0) * formData.quantity,
        lengthUnit: formData.lengthUnit,
        weightUnit: formData.weightUnit,
        status: ProjectMaterialStatus.REQUIRED,
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

interface EditMaterialFormProps {
  material: ProjectMaterial
  onSave: (material: Partial<ProjectMaterial>) => Promise<void>
  onCancel: () => void
}

function EditMaterialForm({ material, onSave, onCancel }: EditMaterialFormProps) {
  const { t } = useI18n()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    materialName: material.materialName,
    profile: material.profile,
    grade: material.grade,
    quantity: material.quantity.toString(),
    unit: material.unit || 'pcs',
    unitCost: material.unitCost?.toString() || '',
    totalCost: material.totalCost?.toString() || '',
    supplier: material.supplier || '',
    location: material.location || '',
    notes: material.notes || '',
    orderDate: material.orderDate ? new Date(material.orderDate).toISOString().split('T')[0] : '',
    deliveryDate: material.deliveryDate ? new Date(material.deliveryDate).toISOString().split('T')[0] : '',
    dimensions: { ...material.dimensions }
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.materialName.trim()) {
      newErrors.materialName = 'Material name is required'
    }

    if (!formData.profile.trim()) {
      newErrors.profile = 'Profile is required'
    }

    if (!formData.grade.trim()) {
      newErrors.grade = 'Grade is required'
    }

    const quantity = parseFloat(formData.quantity)
    if (!formData.quantity || isNaN(quantity) || quantity <= 0) {
      newErrors.quantity = 'Valid quantity is required'
    }

    if (formData.unitCost && (isNaN(parseFloat(formData.unitCost)) || parseFloat(formData.unitCost) < 0)) {
      newErrors.unitCost = 'Unit cost must be a valid positive number'
    }

    if (formData.totalCost && (isNaN(parseFloat(formData.totalCost)) || parseFloat(formData.totalCost) < 0)) {
      newErrors.totalCost = 'Total cost must be a valid positive number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const quantity = parseFloat(formData.quantity)
      const unitCost = formData.unitCost ? parseFloat(formData.unitCost) : undefined
      const totalCost = formData.totalCost ? parseFloat(formData.totalCost) : (unitCost ? unitCost * quantity : undefined)

      const updatedMaterial: Partial<ProjectMaterial> = {
        materialName: formData.materialName.trim(),
        profile: formData.profile.trim(),
        grade: formData.grade.trim(),
        quantity,
        unit: formData.unit,
        unitCost,
        totalCost,
        supplier: formData.supplier.trim() || undefined,
        location: formData.location.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        orderDate: formData.orderDate ? new Date(formData.orderDate) : undefined,
        deliveryDate: formData.deliveryDate ? new Date(formData.deliveryDate) : undefined,
        dimensions: formData.dimensions
      }

      await onSave(updatedMaterial)
    } catch (error) {
      console.error('Error updating material:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Material Name */}
        <div className="space-y-2">
          <Label htmlFor="materialName">Material Name *</Label>
          <Input
            id="materialName"
            value={formData.materialName}
            onChange={(e) => setFormData(prev => ({ ...prev, materialName: e.target.value }))}
            className={errors.materialName ? 'border-red-500' : ''}
          />
          {errors.materialName && <p className="text-red-500 text-sm">{errors.materialName}</p>}
        </div>

        {/* Profile */}
        <div className="space-y-2">
          <Label htmlFor="profile">Profile *</Label>
          <Input
            id="profile"
            value={formData.profile}
            onChange={(e) => setFormData(prev => ({ ...prev, profile: e.target.value }))}
            className={errors.profile ? 'border-red-500' : ''}
          />
          {errors.profile && <p className="text-red-500 text-sm">{errors.profile}</p>}
        </div>

        {/* Grade */}
        <div className="space-y-2">
          <Label htmlFor="grade">Grade *</Label>
          <Input
            id="grade"
            value={formData.grade}
            onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
            className={errors.grade ? 'border-red-500' : ''}
          />
          {errors.grade && <p className="text-red-500 text-sm">{errors.grade}</p>}
        </div>

        {/* Quantity */}
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity *</Label>
          <div className="flex gap-2">
            <Input
              id="quantity"
              type="number"
              step="0.01"
              min="0"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
              className={errors.quantity ? 'border-red-500' : ''}
            />
            <Select
              value={formData.unit}
              onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pcs">pcs</SelectItem>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="m">m</SelectItem>
                <SelectItem value="m²">m²</SelectItem>
                <SelectItem value="m³">m³</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity}</p>}
        </div>

        {/* Unit Cost */}
        <div className="space-y-2">
          <Label htmlFor="unitCost">Unit Cost (KM)</Label>
          <Input
            id="unitCost"
            type="number"
            step="0.01"
            min="0"
            value={formData.unitCost}
            onChange={(e) => setFormData(prev => ({ ...prev, unitCost: e.target.value }))}
            className={errors.unitCost ? 'border-red-500' : ''}
          />
          {errors.unitCost && <p className="text-red-500 text-sm">{errors.unitCost}</p>}
        </div>

        {/* Total Cost */}
        <div className="space-y-2">
          <Label htmlFor="totalCost">Total Cost (KM)</Label>
          <Input
            id="totalCost"
            type="number"
            step="0.01"
            min="0"
            value={formData.totalCost}
            onChange={(e) => setFormData(prev => ({ ...prev, totalCost: e.target.value }))}
            className={errors.totalCost ? 'border-red-500' : ''}
          />
          {errors.totalCost && <p className="text-red-500 text-sm">{errors.totalCost}</p>}
        </div>

        {/* Supplier */}
        <div className="space-y-2">
          <Label htmlFor="supplier">Supplier</Label>
          <Input
            id="supplier"
            value={formData.supplier}
            onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
          />
        </div>

        {/* Order Date */}
        <div className="space-y-2">
          <Label htmlFor="orderDate">Order Date</Label>
          <Input
            id="orderDate"
            type="date"
            value={formData.orderDate}
            onChange={(e) => setFormData(prev => ({ ...prev, orderDate: e.target.value }))}
          />
        </div>

        {/* Delivery Date */}
        <div className="space-y-2">
          <Label htmlFor="deliveryDate">Delivery Date</Label>
          <Input
            id="deliveryDate"
            type="date"
            value={formData.deliveryDate}
            onChange={(e) => setFormData(prev => ({ ...prev, deliveryDate: e.target.value }))}
          />
        </div>
      </div>

      {/* Dimensions */}
      <div className="space-y-2">
        <Label>Dimensions ({material.lengthUnit})</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.entries(formData.dimensions).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <Label htmlFor={`dim-${key}`} className="text-xs capitalize">{key}</Label>
              <Input
                id={`dim-${key}`}
                type="number"
                step="0.01"
                min="0"
                value={value}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  dimensions: { ...prev.dimensions, [key]: parseFloat(e.target.value) || 0 }
                }))}
                className="text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
        />
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Update Material
        </Button>
      </DialogFooter>
    </div>
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
  const [allStock, setAllStock] = useState<MaterialStock[]>([])
  const [showAllocation, setShowAllocation] = useState(false)
  const [showInstallDialog, setShowInstallDialog] = useState(false)
  const [installMaterial, setInstallMaterial] = useState<ProjectMaterial | null>(null)
  const [installQuantity, setInstallQuantity] = useState('')
  const [returnToStock, setReturnToStock] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<ProjectMaterial | null>(null)
  const { materials: catalogMaterials } = useMaterialCatalog()

  // Load materials
  const loadMaterials = async () => {
    setIsLoading(true)
    try {
      const [projectMaterials, stats, stock] = await Promise.all([
        getProjectMaterials(project.id),
        getProjectMaterialStatistics(project.id),
        getAllMaterialStock()
      ])
      // Backfill missing unit/unitCost/catalog links from stock by name/profile/grade
      const normalize = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
      const stripSteel = (s: string) => normalize(s).replace(/\bsteel\b/g, '').replace(/\s+/g, ' ').trim()
      const reconciled = projectMaterials.map((m) => {
        if (m.materialCatalogId && m.unitCost && m.unitCost > 0 && m.unit) return m
        const byCatalog = m.materialCatalogId ? stock.find(s => s.materialCatalogId === m.materialCatalogId) : undefined
        const mName = stripSteel(m.materialName)
        // Try to resolve via catalog first (source of truth), then map to stock via catalog id
        const catByName = catalogMaterials.find(cm => {
          const cName = stripSteel(cm.name)
          return cName === mName || cName.includes(mName) || mName.includes(cName)
        })
        const catByGrade = !catByName ? catalogMaterials.find(cm => normalize(cm.grade || '').includes(normalize(m.grade || '')) && stripSteel(cm.name).includes(stripSteel(m.profile || ''))) : undefined
        const resolvedCatalogId = (catByName || catByGrade)?.id
        const byCatalogFromCat = resolvedCatalogId ? stock.find(s => s.materialCatalogId === resolvedCatalogId) : undefined
        // Fallback: try stock entries that stored nested material name (legacy)
        const byNameLegacy = stock.find(s => {
          const sName = stripSteel(((s as any).material?.name) || '')
          return sName && (sName === mName || sName.includes(mName) || mName.includes(sName))
        })
        const resolved = byCatalog || byCatalogFromCat || byNameLegacy
        if (!resolved) return m
        return {
          ...m,
          materialCatalogId: m.materialCatalogId || resolved.materialCatalogId || resolvedCatalogId,
          unit: m.unit || m.weightUnit || 'kg',
          unitCost: (m.unitCost && m.unitCost > 0) ? m.unitCost : resolved.unitCost,
          totalCost: m.totalCost && m.totalCost > 0 ? m.totalCost : (resolved.unitCost ? resolved.unitCost * m.quantity : m.totalCost)
        }
      })
      setMaterials(reconciled)
      setStatistics(stats)
      setAllStock(stock)
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
    // If changing to INSTALLED, show installation dialog
    if (status === ProjectMaterialStatus.INSTALLED) {
      const material = materials.find(m => m.id === materialId)
      if (material) {
        setInstallMaterial(material)
        setInstallQuantity(material.quantity.toString())
        setReturnToStock(false)
        setShowInstallDialog(true)
        return
      }
    }

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

  // Handle installation
  const handleInstallation = async () => {
    if (!installMaterial || !installQuantity) return

    const installedQty = parseFloat(installQuantity)
    const totalQty = installMaterial.quantity
    
    if (installedQty <= 0 || installedQty > totalQty) {
      toast({
        title: 'Invalid Quantity',
        description: `Installed quantity must be between 0.01 and ${totalQty}`,
        variant: 'destructive'
      })
      return
    }

    try {
      const remainingQty = totalQty - installedQty
      
      // If partial installation, update the material quantity to installed amount
      if (remainingQty > 0) {
        // Update material quantity to installed amount
        await updateProjectMaterial(installMaterial.id, {
          quantity: installedQty,
          totalWeight: installMaterial.unit === 'kg' ? installedQty : installedQty * (installMaterial.unitWeight || 1),
          totalCost: installedQty * (installMaterial.unitCost || 0),
          status: ProjectMaterialStatus.INSTALLED
        })

        // Handle remaining quantity based on user choice
        if (returnToStock && installMaterial.materialCatalogId) {
          // Return remaining to stock
          await unreserveMaterialStock(installMaterial.materialCatalogId, remainingQty, project.id)
          
          const materialStock = await getAllMaterialStock()
          const stockRecord = materialStock.find(s => s.materialCatalogId === installMaterial.materialCatalogId)
          
          if (stockRecord) {
            await createMaterialStockTransaction({
              materialStockId: stockRecord.id,
              type: 'UNRESERVED',
              quantity: remainingQty,
              unitCost: installMaterial.unitCost || 0,
              totalCost: remainingQty * (installMaterial.unitCost || 0),
              referenceId: installMaterial.id,
              referenceType: 'PROJECT',
              transactionDate: new Date(),
              notes: `Returned to stock after partial installation. Installed: ${installedQty}, Returned: ${remainingQty}`,
              createdBy: 'user'
            })
          }
        } else {
          // Keep remaining as reserved - create new material entry for remaining quantity
          const remainingMaterial: Omit<ProjectMaterial, 'id' | 'createdAt' | 'updatedAt'> = {
            ...installMaterial,
            quantity: remainingQty,
            totalWeight: installMaterial.unit === 'kg' ? remainingQty : remainingQty * (installMaterial.unitWeight || 1),
            totalCost: remainingQty * (installMaterial.unitCost || 0),
            status: ProjectMaterialStatus.DELIVERED, // Keep as reserved/delivered
            notes: `Remaining quantity from installation of ${installedQty} ${installMaterial.unit || 'units'}. ${installMaterial.notes || ''}`.trim()
          }
          
          await createProjectMaterial(remainingMaterial)
        }
      } else {
        // Full installation
        await updateProjectMaterialStatus(installMaterial.id, ProjectMaterialStatus.INSTALLED)
      }

      // Create transaction record for installation
      if (installMaterial.materialCatalogId) {
        const materialStock = await getAllMaterialStock()
        const stockRecord = materialStock.find(s => s.materialCatalogId === installMaterial.materialCatalogId)
        
        if (stockRecord) {
          await createMaterialStockTransaction({
            materialStockId: stockRecord.id,
            type: 'OUT',
            quantity: installedQty,
            unitCost: installMaterial.unitCost || 0,
            totalCost: installedQty * (installMaterial.unitCost || 0),
            referenceId: installMaterial.id,
            referenceType: 'PROJECT',
            transactionDate: new Date(),
            notes: `Material installed in project: ${project.name}. ${remainingQty > 0 ? `Remaining ${remainingQty} ${returnToStock ? 'returned to stock' : 'still reserved'}` : 'Fully installed'}`,
            createdBy: 'user'
          })
        }
      }

      await loadMaterials()
      onUpdate?.()
      setShowInstallDialog(false)
      setInstallMaterial(null)
      setInstallQuantity('')
      setReturnToStock(false)

      toast({
        title: 'Success',
        description: `Material installation recorded. ${installedQty} units installed.${remainingQty > 0 && returnToStock ? ` ${remainingQty} units returned to stock.` : ''}`,
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
           {/* Add material action intentionally hidden to avoid duplicate creation flows */}
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

      {/* Materials Management */}
      <div className="space-y-4 mt-6">
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
              onDelete={() => handleDeleteMaterial(material.id)}
              onStatusChange={(status) => handleStatusChange(material.id, status)}
              isMobile={isMobile}
              stockInfo={(() => {
                const directId = material.materialCatalogId
                const byNameId = !directId ? (catalogMaterials.find(cm => cm.name === material.materialName)?.id) : undefined
                const resolvedId = directId || byNameId
                if (!resolvedId) return null
                return allStock.find(s => s.materialCatalogId === resolvedId) || null
              })()}
              fallbackUnitCost={(() => {
                const directId = material.materialCatalogId
                const byNameId = !directId ? (catalogMaterials.find(cm => cm.name === material.materialName)?.id) : undefined
                const resolvedId = directId || byNameId
                if (!resolvedId) return null
                return catalogMaterials.find(cm => cm.id === resolvedId)?.basePrice ?? null
              })()}
            />
          ))
        )}
        </div>
      </div>

      {/* Add Material Modal - removed to avoid duplicating data models (use original stock/material flows instead) */}

      {/* Installation Dialog */}
      <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Installation</DialogTitle>
            <DialogDescription>
              Record how much of "{installMaterial?.materialName}" was installed
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="installedQuantity">Quantity Installed</Label>
              <Input
                id="installedQuantity"
                type="number"
                min="0"
                max={installMaterial?.quantity || 0}
                step="0.01"
                value={installQuantity}
                onChange={(e) => setInstallQuantity(e.target.value)}
                placeholder={`Max: ${installMaterial?.quantity || 0}`}
              />
              <div className="text-sm text-muted-foreground">
                Total available: {installMaterial?.quantity} {installMaterial?.weightUnit}
              </div>
            </div>

            {/* Show return option only if there's remaining quantity and material is from stock */}
            {installMaterial && parseFloat(installQuantity) < installMaterial.quantity && installMaterial.materialCatalogId && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="returnToStock"
                    checked={returnToStock}
                    onCheckedChange={(checked) => setReturnToStock(!!checked)}
                  />
                  <Label htmlFor="returnToStock" className="text-sm">
                    Return remaining {(installMaterial.quantity - (parseFloat(installQuantity) || 0)).toFixed(2)} {installMaterial.weightUnit} to stock
                  </Label>
                </div>
                <div className="text-xs text-muted-foreground ml-6">
                  {returnToStock 
                    ? "Remaining quantity will be unreserved and available for other projects"
                    : "Remaining quantity will stay reserved for this project"
                  }
                </div>
              </div>
            )}

            {!installMaterial?.materialCatalogId && (
              <div className="text-sm text-muted-foreground p-3 bg-muted rounded">
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
              disabled={!installQuantity || parseFloat(installQuantity) <= 0}
            >
              Record Installation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Material Modal removed to rely on original data flows */}
    </div>
  )
}