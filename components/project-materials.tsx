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
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
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
import { Checkbox } from '@/components/ui/checkbox'
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
  ArrowRight,
  BarChart3,
  TrendingUp,
  Users,
  MapPin,
  Tag,
  Loader2,
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  Download,
  Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProjects } from '@/contexts/project-context'
import { 
  MATERIAL_STATUS_LABELS, 
  MATERIAL_STATUS_COLORS 
} from '@/lib/project-utils'
import { MaterialStatus, type Project, type ProjectMaterial, type PhysicalMaterial, type Calculation } from '@/lib/types'
import { LoadingSpinner } from '@/components/loading-states'
import { toast } from '@/hooks/use-toast'

interface ProjectMaterialsProps {
  project: Project
  onUpdate?: () => void
  className?: string
}

interface MaterialDetailsModalProps {
  material: ProjectMaterial | null
  isOpen: boolean
  onClose: () => void
  onSave: (material: ProjectMaterial) => void
  onDelete: (materialId: string) => void
}

interface AddCalculationModalProps {
  project: Project
  isOpen: boolean
  onClose: () => void
  onAdd: (calculationIds: string[]) => void
}

interface AddMaterialModalProps {
  project: Project
  isOpen: boolean
  onClose: () => void
  onAdd: (material: Omit<PhysicalMaterial, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>) => void
}

// Material Details Modal Component
function MaterialDetailsModal({ 
  material, 
  isOpen, 
  onClose, 
  onSave, 
  onDelete 
}: MaterialDetailsModalProps) {
  const [formData, setFormData] = useState<Partial<ProjectMaterial>>({})
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (material) {
      setFormData(material)
    } else {
      setFormData({})
    }
  }, [material])

  const handleSave = async () => {
    if (!material) return

    setIsLoading(true)
    try {
      const updatedMaterial: ProjectMaterial = {
        ...material,
        ...formData
      }
      
      await onSave(updatedMaterial)
      onClose()
      
      toast({
        title: "Material Updated",
        description: "Material details have been saved",
      })
    } catch (error) {
      console.error('Failed to save material:', error)
      toast({
        title: "Save Failed",
        description: "Failed to save material details",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!material) return

    setIsLoading(true)
    try {
      await onDelete(material.id)
      setShowDeleteDialog(false)
      onClose()
      
      toast({
        title: "Material Deleted",
        description: "Material has been removed from the project",
      })
    } catch (error) {
      console.error('Failed to delete material:', error)
      toast({
        title: "Delete Failed",
        description: "Failed to delete material",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const statusOptions = Object.values(MaterialStatus).map(status => ({
    value: status,
    label: MATERIAL_STATUS_LABELS[status],
    color: MATERIAL_STATUS_COLORS[status]
  }))

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Material Details</DialogTitle>
            <DialogDescription>
              View and edit material information, supplier details, and delivery tracking.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Material Name</Label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter material name"
                  />
                </div>
                
                <div>
                  <Label>Status</Label>
                  <Select 
                    value={formData.status || MaterialStatus.PENDING}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as MaterialStatus }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={formData.quantity || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <Label>Unit</Label>
                  <Input
                    value={formData.unit || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                    placeholder="kg, m, pcs, etc."
                  />
                </div>
              </div>
            </div>

            {/* Cost Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Cost Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Unit Cost</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.unitCost || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, unitCost: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <Label>Total Cost</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.totalCost || (formData.quantity && formData.unitCost ? formData.quantity * formData.unitCost : '')}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalCost: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Supplier Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Supplier Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Supplier Name</Label>
                  <Input
                    value={formData.supplier || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                    placeholder="Enter supplier name"
                  />
                </div>
                
                <div>
                  <Label>Contact Person</Label>
                  <Input
                    value={formData.supplierContact || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplierContact: e.target.value }))}
                    placeholder="Contact person"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Delivery Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Order Date</Label>
                  <Input
                    type="date"
                    value={formData.orderDate ? formData.orderDate.split('T')[0] : ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, orderDate: e.target.value ? new Date(e.target.value).toISOString() : undefined }))}
                  />
                </div>
                
                <div>
                  <Label>Expected Delivery</Label>
                  <Input
                    type="date"
                    value={formData.expectedDelivery ? formData.expectedDelivery.split('T')[0] : ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, expectedDelivery: e.target.value ? new Date(e.target.value).toISOString() : undefined }))}
                  />
                </div>
              </div>
              
              <div>
                <Label>Delivery Address</Label>
                <Textarea
                  value={formData.deliveryAddress || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                  placeholder="Enter delivery address"
                  rows={2}
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about this material"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter className="flex justify-between">
            <Button 
              variant="destructive" 
              onClick={() => setShowDeleteDialog(true)}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading || !formData.name}>
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Material</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this material from the project? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLoading}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// Add Calculation Modal Component
function AddCalculationModal({ 
  project, 
  isOpen, 
  onClose, 
  onAdd 
}: AddCalculationModalProps) {
  const { allCalculations } = useProjects()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCalculations, setSelectedCalculations] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)

  // Load calculations on open
  useEffect(() => {
    if (isOpen) {
      setSelectedCalculations(new Set())
      setSearchTerm('')
    }
  }, [isOpen])

  // Filter available calculations (not already in project)
  const availableCalculations = useMemo(() => {
    const projectCalculationIds = new Set(project.calculationIds || [])
    return allCalculations.filter(calc => 
      !projectCalculationIds.has(calc.id) &&
      (calc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       calc.materialName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       calc.profileName?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [allCalculations, project.calculationIds, searchTerm])

  const handleAdd = () => {
    if (selectedCalculations.size === 0) return
    setIsLoading(true)
    onAdd(Array.from(selectedCalculations))
    setSelectedCalculations(new Set())
  }

  const handleToggleCalculation = (calculationId: string) => {
    const newSelected = new Set(selectedCalculations)
    if (newSelected.has(calculationId)) {
      newSelected.delete(calculationId)
    } else {
      newSelected.add(calculationId)
    }
    setSelectedCalculations(newSelected)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Calculations to Project</DialogTitle>
          <DialogDescription>
            Select calculations from your history to add to this project.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search calculations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Calculations List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {availableCalculations.length === 0 ? (
              <div className="text-center py-8">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'No calculations match your search.' : 'No available calculations to add.'}
                </p>
              </div>
            ) : (
              availableCalculations.map((calculation) => (
                <div
                  key={calculation.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={selectedCalculations.has(calculation.id)}
                    onCheckedChange={() => handleToggleCalculation(calculation.id)}
                  />
                  
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">
                        {calculation.name || `${calculation.materialName} ${calculation.profileName}`}
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        {calculation.totalWeight ? `${calculation.totalWeight.toFixed(2)} kg total` : `${calculation.weight?.toFixed(2)} kg`}
                      </Badge>
                      {calculation.totalCost && calculation.totalCost > 0 && (
                        <Badge variant="outline" className="text-xs text-green-600">
                          ${calculation.totalCost.toFixed(2)}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {calculation.materialName} • {calculation.profileName} • {calculation.dimensions?.length || '?'}m
                      {calculation.quantity && calculation.quantity > 1 && ` • Qty: ${calculation.quantity}`}
                    </div>
                    {calculation.notes && (
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        {calculation.notes}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    {new Date(calculation.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {selectedCalculations.size} calculation{selectedCalculations.size !== 1 ? 's' : ''} selected
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleAdd} 
              disabled={selectedCalculations.size === 0 || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add {selectedCalculations.size} Calculation{selectedCalculations.size !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Add Material Modal Component
function AddMaterialModal({ 
  project, 
  isOpen, 
  onClose, 
  onAdd 
}: AddMaterialModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    unit: 'kg',
    unitCost: 0,
    totalCost: 0,
    supplier: '',
    supplierContact: '',
    status: MaterialStatus.PENDING as MaterialStatus,
    notes: '',
    expectedDelivery: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Material name is required",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      await onAdd({
        ...formData,
        expectedDelivery: formData.expectedDelivery ? new Date(formData.expectedDelivery).toISOString() : undefined
      })
      
      // Reset form
      setFormData({
        name: '',
        quantity: 0,
        unit: 'kg',
        unitCost: 0,
        totalCost: 0,
        supplier: '',
        supplierContact: '',
        status: MaterialStatus.PENDING,
        notes: '',
        expectedDelivery: ''
      })
      
      onClose()
      
      toast({
        title: "Material Added",
        description: "New material has been added to the project",
      })
    } catch (error) {
      console.error('Failed to add material:', error)
      toast({
        title: "Add Failed",
        description: "Failed to add material",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const statusOptions = Object.values(MaterialStatus).map(status => ({
    value: status,
    label: MATERIAL_STATUS_LABELS[status],
    color: MATERIAL_STATUS_COLORS[status]
  }))

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Material</DialogTitle>
          <DialogDescription>
            Add a physical material to track for this project - suppliers, delivery, installation, etc.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Material Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Steel Beams HEA120"
                />
              </div>
              
              <div>
                <Label>Status</Label>
                <Select 
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as MaterialStatus }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={formData.quantity || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
              
              <div>
                <Label>Unit</Label>
                <Input
                  value={formData.unit}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                  placeholder="kg, m, pcs, etc."
                />
              </div>
            </div>
          </div>

          {/* Cost Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Cost Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Unit Cost</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.unitCost || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, unitCost: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label>Total Cost</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.totalCost || (formData.quantity && formData.unitCost ? formData.quantity * formData.unitCost : '')}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalCost: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Supplier Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Supplier Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Supplier Name</Label>
                <Input
                  value={formData.supplier}
                  onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                  placeholder="Enter supplier name"
                />
              </div>
              
              <div>
                <Label>Contact Person</Label>
                <Input
                  value={formData.supplierContact}
                  onChange={(e) => setFormData(prev => ({ ...prev, supplierContact: e.target.value }))}
                  placeholder="Contact person"
                />
              </div>
            </div>
          </div>

          {/* Delivery & Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Delivery & Notes</h3>
            
            <div>
              <Label>Expected Delivery Date</Label>
              <Input
                type="date"
                value={formData.expectedDelivery}
                onChange={(e) => setFormData(prev => ({ ...prev, expectedDelivery: e.target.value }))}
              />
            </div>
            
            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about this material..."
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !formData.name.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Material
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Main Project Materials Component
export default function ProjectMaterials({
  project,
  onUpdate,
  className
}: ProjectMaterialsProps) {
  const { updateProject, allCalculations } = useProjects()
  
  // Local state
  const [showCalculationModal, setShowCalculationModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Handle add calculations
  const handleAddCalculations = async (calculationIds: string[]) => {
    setIsLoading(true)
    try {
      const existingIds = project.calculationIds || []
      const newIds = calculationIds.filter(id => !existingIds.includes(id))
      
      const updatedProject = {
        ...project,
        calculationIds: [...existingIds, ...newIds],
        updatedAt: new Date()
      }
      
      await updateProject(updatedProject)
      onUpdate?.()
      
      toast({
        title: "Calculations Added",
        description: `Added ${newIds.length} calculations to the project`,
      })
    } catch (error) {
      console.error('Failed to add calculations:', error)
      toast({
        title: "Add Failed",
        description: "Failed to add calculations to project",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Project Calculations</h2>
          <Button onClick={() => setShowCalculationModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Calculations
          </Button>
        </div>
      </div>

      {/* Project Calculations */}
      {project.calculationIds && project.calculationIds.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Calculations ({project.calculationIds.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {project.calculationIds.map((calcId) => {
                const calculation = allCalculations.find(c => c.id === calcId)
                if (!calculation) return null
                
                return (
                  <div
                    key={calcId}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Calculator className="h-4 w-4 text-muted-foreground" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">
                          {calculation.name || `${calculation.materialName} ${calculation.profileName}`}
                        </h4>
                        <Badge variant="secondary" className="text-xs">
                          {calculation.totalWeight ? `${calculation.totalWeight.toFixed(2)} kg total` : `${calculation.weight?.toFixed(2)} kg`}
                        </Badge>
                        {calculation.totalCost && calculation.totalCost > 0 && (
                          <Badge variant="outline" className="text-xs text-green-600">
                            ${calculation.totalCost.toFixed(2)}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {calculation.materialName} • {calculation.profileName} • {calculation.dimensions?.length || '?'}m
                        {calculation.quantity && calculation.quantity > 1 && ` • Qty: ${calculation.quantity}`}
                      </div>
                      {calculation.notes && (
                        <div className="text-xs text-muted-foreground mt-1 truncate">
                          {calculation.notes}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Update URL parameters to load calculation for editing
                          const url = new URL(window.location.href)
                          url.searchParams.set('edit', calcId)
                          url.searchParams.set('project', project.id)
                          
                          // Use pushState to avoid navigation - this will trigger the URL parameter handling
                          window.history.pushState({}, '', url.toString())
                          
                          // Reload the page to trigger the URL parameter processing
                          window.location.reload()
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          if (window.confirm(`Are you sure you want to remove "${calculation.name || 'this calculation'}" from this project?`)) {
                            try {
                              // Remove from project
                              const updatedProject = {
                                ...project,
                                calculationIds: project.calculationIds.filter(id => id !== calcId),
                                updatedAt: new Date()
                              }
                              await updateProject(updatedProject)
                              onUpdate?.()
                              
                              toast({
                                title: "Calculation Removed",
                                description: "Calculation has been removed from the project.",
                              })
                            } catch (error) {
                              console.error('Failed to remove calculation:', error)
                              toast({
                                title: "Remove Failed",
                                description: "Failed to remove calculation from project",
                                variant: "destructive"
                              })
                            }
                          }
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      {new Date(calculation.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Calculator className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-semibold mb-2">No Calculations</h3>
            <p className="text-muted-foreground mb-4">
              Add calculations from your history to track them in this project.
            </p>
            <Button onClick={() => setShowCalculationModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Calculations
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Calculation Modal */}
      <AddCalculationModal
        project={project}
        isOpen={showCalculationModal}
        onClose={() => setShowCalculationModal(false)}
        onAdd={handleAddCalculations}
      />
    </div>
  )
}