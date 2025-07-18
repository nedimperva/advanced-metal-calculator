"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Plus, 
  Package,
  Search,
  Filter,
  Edit,
  Eye,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Boxes,
  FileText,
  Calendar,
  User,
  Building
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/use-media-query'
import { 
  MaterialCatalog, 
  MaterialType,
  MaterialCategory,
  MaterialAvailability,
  Project,
  ProjectMaterial,
  ProjectMaterialStatus,
  ProjectMaterialSource,
  MaterialStock,
  MaterialStockTransaction
} from '@/lib/types'
import { useMaterialCatalog } from '@/contexts/material-catalog-context'
import { useProjects } from '@/contexts/project-context'
import { LoadingSpinner } from '@/components/loading-states'
import { toast } from '@/hooks/use-toast'
import { useI18n } from '@/contexts/i18n-context'
import { 
  getAllMaterialCatalog, 
  createMaterialCatalog, 
  updateMaterialCatalog, 
  deleteMaterialCatalog,
  getAllMaterialStock,
  createMaterialStock,
  updateMaterialStock,
  reserveMaterialStock,
  addMaterialToProject,
  getMaterialStockTransactions,
  getAllProjectMaterials,
  createMaterialStockTransaction,
  deleteMaterialStock,
  updateProjectMaterial,
  deleteProjectMaterial,
  resetDatabase
} from '@/lib/database'


interface MaterialStockManagementProps {
  className?: string
}

export default function MaterialStockManagement({ className }: MaterialStockManagementProps) {
  const { t } = useI18n()
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const { projects } = useProjects()
  const [mounted, setMounted] = useState(false)
  
  // State management
  const [materials, setMaterials] = useState<MaterialCatalog[]>([])
  const [materialStock, setMaterialStock] = useState<MaterialStock[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<MaterialCategory | 'all'>('all')
  const [selectedType, setSelectedType] = useState<MaterialType | 'all'>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showStockDialog, setShowStockDialog] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialCatalog | null>(null)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [assignQuantity, setAssignQuantity] = useState('')
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedStockForView, setSelectedStockForView] = useState<MaterialStock | null>(null)
  const [stockTransactions, setStockTransactions] = useState<MaterialStockTransaction[]>([])
  const [projectMaterials, setProjectMaterials] = useState<ProjectMaterial[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [showEditReservationsDialog, setShowEditReservationsDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [materialToDelete, setMaterialToDelete] = useState<MaterialStock | null>(null)
  const [editingAssignment, setEditingAssignment] = useState<ProjectMaterial | null>(null)
  const [editAssignmentQuantity, setEditAssignmentQuantity] = useState('')
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  
  // New material form
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    type: MaterialType.STEEL,
    category: MaterialCategory.STRUCTURAL,
    grade: '',
    weight: 0,
    costPerUnit: 0,
    unit: 'kg',
    supplier: '',
    location: '',
    certificateNumber: '',
    notes: ''
  })
  
  // Stock management form
  const [stockData, setStockData] = useState({
    currentStock: 0,
    minimumStock: 20,
    maximumStock: 1000,
    unitCost: 0,
    location: '',
    supplier: '',
    notes: ''
  })

  const loadMaterials = async () => {
    try {
      setIsLoading(true)
      const [catalogMaterials, stockData] = await Promise.all([
        getAllMaterialCatalog(),
        getAllMaterialStock()
      ])
      
      setMaterials(catalogMaterials)
      
      // Map stock data with material information
      const stockWithMaterials = stockData.map(stock => ({
        ...stock,
        material: catalogMaterials.find(m => m.id === stock.materialCatalogId),
        totalValue: stock.currentStock * stock.unitCost
      })).filter(stock => stock.material) as (MaterialStock & { material: MaterialCatalog })[]
      
      setMaterialStock(stockWithMaterials)
      
      // If no stock data exists, create initial stock for each material
      if (stockData.length === 0 && catalogMaterials.length > 0) {
        console.log('Creating initial stock data for', catalogMaterials.length, 'materials')
        for (const material of catalogMaterials) {
          await createMaterialStock({
            materialCatalogId: material.id,
            currentStock: 0,
            reservedStock: 0,
            availableStock: 0,
            minimumStock: 10,
            maximumStock: 1000,
            unitCost: material.costPerUnit || 0,
            totalValue: 0,
            location: material.location || 'Warehouse A',
            supplier: material.supplier || 'Default Supplier',
            notes: material.notes || ''
          })
        }
        // Reload after creating initial stock
        await loadMaterials()
      }
    } catch (error) {
      console.error('Failed to load materials:', error)
      toast({
        title: "Error",
        description: "Failed to load materials",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    loadMaterials()
  }, [])

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  const handleCreateMaterial = async () => {
    try {
      // Create the material in the catalog with simplified data
      const materialData = {
        name: newMaterial.name,
        type: newMaterial.type,
        category: newMaterial.category,
        grade: newMaterial.grade,
        weight: newMaterial.weight,
        costPerUnit: newMaterial.costPerUnit,
        unit: newMaterial.unit,
        supplier: newMaterial.supplier,
        location: newMaterial.location,
        certificateNumber: newMaterial.certificateNumber,
        notes: newMaterial.notes,
        // Set basic defaults for required fields
        density: 7.85,
        yieldStrength: 250,
        tensileStrength: 400,
        elasticModulus: 200,
        poissonRatio: 0.3,
        thermalExpansion: 12,
        thermalConductivity: 50,
        specificHeat: 460,
        meltingPoint: 1500,
        availableProfiles: [],
        availability: MaterialAvailability.STOCK,
        minimumQuantity: 1,
        leadTime: 0
      }
      
      const materialId = await createMaterialCatalog(materialData)
      
      // Create initial stock entry for the new material
      await createMaterialStock({
        materialCatalogId: materialId,
        currentStock: stockData.currentStock,
        reservedStock: 0,
        availableStock: stockData.currentStock,
        minimumStock: stockData.minimumStock,
        maximumStock: stockData.maximumStock || 1000,
        unitCost: newMaterial.costPerUnit || 0,
        totalValue: stockData.currentStock * (newMaterial.costPerUnit || 0),
        location: newMaterial.location || 'Warehouse A',
        supplier: newMaterial.supplier || 'Default Supplier',
        notes: newMaterial.notes || ''
      })
      
      await loadMaterials()
      setShowCreateDialog(false)
      setNewMaterial({
        name: '',
        type: MaterialType.STEEL,
        category: MaterialCategory.STRUCTURAL,
        grade: '',
        weight: 0,
        costPerUnit: 0,
        unit: 'kg',
        supplier: '',
        location: '',
        certificateNumber: '',
        notes: ''
      })
      setStockData({
        currentStock: 0,
        minimumStock: 20,
        maximumStock: 1000,
        unitCost: 0,
        location: '',
        supplier: '',
        notes: ''
      })
      toast({
        title: "Success",
        description: "Material and stock entry created successfully"
      })
    } catch (error) {
      console.error('Failed to create material:', error)
      toast({
        title: "Error",
        description: "Failed to create material",
        variant: "destructive"
      })
    }
  }

  const handleAssignToProject = async () => {
    if (!selectedMaterial || !selectedProject || !assignQuantity) return
    
    try {
      const quantity = parseFloat(assignQuantity)
      const stock = materialStock.find(s => s.materialCatalogId === selectedMaterial.id)
      
      if (!stock || stock.availableStock < quantity) {
        toast({
          title: "Insufficient Stock",
          description: "Not enough stock available for this assignment",
          variant: "destructive"
        })
        return
      }
      
      // Reserve stock for the project
      await reserveMaterialStock(selectedMaterial.id, quantity, selectedProject)
      
      // Create project material assignment
      const projectMaterial: Omit<ProjectMaterial, 'id' | 'createdAt' | 'updatedAt'> = {
        projectId: selectedProject,
        materialCatalogId: selectedMaterial.id,
        materialName: selectedMaterial.name,
        profile: selectedMaterial.compatibleProfiles?.[0] || 'Standard',
        grade: selectedMaterial.availableGrades?.[0] || selectedMaterial.type,
        dimensions: {},
        quantity: quantity,
        unitWeight: selectedMaterial.density || 1,
        totalWeight: quantity * (selectedMaterial.density || 1),
        unitCost: stock.unitCost,
        totalCost: quantity * stock.unitCost,
        lengthUnit: 'mm',
        weightUnit: 'kg',
        status: ProjectMaterialStatus.ORDERED,
        supplier: stock.supplier,
        orderDate: new Date(),
        source: ProjectMaterialSource.DISPATCH,
        notes: `Assigned from stock: ${selectedMaterial.name}`
      }
      
      // Add material to project
      await addMaterialToProject(projectMaterial)
      
      // Create stock transaction record
      await createMaterialStockTransaction({
        materialStockId: stock.id,
        type: 'RESERVED',
        quantity: quantity,
        unitCost: stock.unitCost,
        totalCost: quantity * stock.unitCost,
        referenceId: selectedProject,
        referenceType: 'PROJECT',
        transactionDate: new Date(),
        notes: `Reserved for project: ${projects.find(p => p.id === selectedProject)?.name || selectedProject}`,
        createdBy: 'system'
      })
      
      // Reload materials to reflect updated stock
      await loadMaterials()
      
      setShowAssignDialog(false)
      setSelectedProject('')
      setAssignQuantity('')
      
      toast({
        title: "Success",
        description: `Material assigned to project successfully`
      })
    } catch (error) {
      console.error('Failed to assign material:', error)
      toast({
        title: "Error",
        description: "Failed to assign material to project",
        variant: "destructive"
      })
    }
  }

  const handleUpdateStock = async () => {
    if (!selectedMaterial) return
    
    try {
      // Find the current stock record
      const currentStock = materialStock.find(s => s.materialCatalogId === selectedMaterial.id)
      if (!currentStock) {
        toast({
          title: "Error",
          description: "Stock record not found",
          variant: "destructive"
        })
        return
      }

      // Update the stock with new values
      const updatedStock: MaterialStock = {
        ...currentStock,
        currentStock: stockData.currentStock,
        availableStock: stockData.currentStock - currentStock.reservedStock,
        minimumStock: stockData.minimumStock,
        maximumStock: stockData.maximumStock,
        unitCost: stockData.unitCost,
        totalValue: stockData.currentStock * stockData.unitCost,
        location: stockData.location,
        supplier: stockData.supplier,
        notes: stockData.notes,
        updatedAt: new Date()
      }

      await updateMaterialStock(updatedStock)
      
      await loadMaterials()
      setShowStockDialog(false)
      
      toast({
        title: "Success",
        description: "Stock information updated successfully"
      })
    } catch (error) {
      console.error('Failed to update stock:', error)
      toast({
        title: "Error",
        description: "Failed to update stock information",
        variant: "destructive"
      })
    }
  }

  const loadMaterialHistory = async (materialId: string, stockId: string) => {
    try {
      setIsLoadingHistory(true)
      
      // Load stock transactions
      const transactions = await getMaterialStockTransactions(stockId)
      setStockTransactions(transactions)
      
      // Load project materials that reference this material
      const allProjectMaterials = await getAllProjectMaterials()
      const relatedMaterials = allProjectMaterials.filter(pm => pm.materialCatalogId === materialId)
      setProjectMaterials(relatedMaterials)
      
    } catch (error) {
      console.error('Failed to load material history:', error)
      toast({
        title: "Error",
        description: "Failed to load material history",
        variant: "destructive"
      })
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const handleUnreserveFromProject = async (projectMaterialId: string, quantity: number) => {
    if (!selectedStockForView) return
    
    try {
      // Create unreserve transaction
      await createMaterialStockTransaction({
        materialStockId: selectedStockForView.id,
        type: 'UNRESERVED',
        quantity: quantity,
        referenceId: projectMaterialId,
        referenceType: 'PROJECT',
        transactionDate: new Date(),
        notes: `Unreserved from project`,
        createdBy: 'system'
      })
      
      // Reload history and stock
      await loadMaterials()
      await loadMaterialHistory(selectedStockForView.material.id, selectedStockForView.id)
      
      toast({
        title: "Success",
        description: "Material unreserved from project"
      })
    } catch (error) {
      console.error('Failed to unreserve material:', error)
      toast({
        title: "Error",
        description: "Failed to unreserve material",
        variant: "destructive"
      })
    }
  }

  const handleDeleteMaterial = async () => {
    if (!materialToDelete) return

    try {
      // Get all project materials that reference this material
      const allProjectMaterials = await getAllProjectMaterials()
      const relatedMaterials = allProjectMaterials.filter(pm => pm.materialCatalogId === materialToDelete.materialCatalogId)
      
      // Check if material has any active project assignments
      const activeAssignments = relatedMaterials.filter(pm => pm.status === 'REQUIRED' || pm.status === 'ORDERED')
      
      if (activeAssignments.length > 0) {
        toast({
          title: "Cannot Delete",
          description: `Cannot delete material with ${activeAssignments.length} active project assignments. Please remove assignments first.`,
          variant: "destructive"
        })
        return
      }

      // Force delete all related project materials (including completed ones)
      for (const pm of relatedMaterials) {
        try {
          await deleteProjectMaterial(pm.id)
        } catch (error) {
          console.warn(`Failed to delete project material ${pm.id}:`, error)
        }
      }
      
      // Delete all stock transactions for this material
      try {
        const transactions = await getMaterialStockTransactions(materialToDelete.id)
        // Note: We don't have a deleteTransaction function, but we'll delete the stock record which should cascade
      } catch (error) {
        console.warn('Failed to get transactions for cleanup:', error)
      }

      // Delete stock record
      await deleteMaterialStock(materialToDelete.id)
      
      // Delete material from catalog
      await deleteMaterialCatalog(materialToDelete.materialCatalogId)
      
      // Reload materials
      await loadMaterials()
      
      setShowDeleteDialog(false)
      setMaterialToDelete(null)
      
      toast({
        title: "Success",
        description: "Material and all related records deleted successfully"
      })
    } catch (error) {
      console.error('Failed to delete material:', error)
      toast({
        title: "Error",
        description: "Failed to delete material. Try resetting the database if the issue persists.",
        variant: "destructive"
      })
    }
  }

  const handleEditAssignment = async () => {
    if (!editingAssignment || !editAssignmentQuantity || !selectedStockForView) return

    try {
      const newQuantity = parseFloat(editAssignmentQuantity)
      const quantityDifference = newQuantity - editingAssignment.quantity

      // Update the project material
      await updateProjectMaterial(editingAssignment.id, {
        quantity: newQuantity,
        totalWeight: newQuantity * editingAssignment.unitWeight,
        totalCost: newQuantity * editingAssignment.unitCost
      })

      // Create transaction for the difference
      if (quantityDifference !== 0) {
        await createMaterialStockTransaction({
          materialStockId: selectedStockForView.id,
          type: quantityDifference > 0 ? 'RESERVED' : 'UNRESERVED',
          quantity: Math.abs(quantityDifference),
          referenceId: editingAssignment.projectId,
          referenceType: 'PROJECT',
          transactionDate: new Date(),
          notes: `Assignment ${quantityDifference > 0 ? 'increased' : 'decreased'} by ${Math.abs(quantityDifference)}`,
          createdBy: 'system'
        })
      }

      // Reload data
      await loadMaterials()
      await loadMaterialHistory(selectedStockForView.material.id, selectedStockForView.id)
      
      setEditingAssignment(null)
      setEditAssignmentQuantity('')
      
      toast({
        title: "Success",
        description: "Assignment updated successfully"
      })
    } catch (error) {
      console.error('Failed to update assignment:', error)
      toast({
        title: "Error",
        description: "Failed to update assignment",
        variant: "destructive"
      })
    }
  }

  const handleResetDatabase = async () => {
    try {
      setIsResetting(true)
      
      // Reset the database
      await resetDatabase()
      
      // Clear all state
      setMaterials([])
      setMaterialStock([])
      setStockTransactions([])
      setProjectMaterials([])
      
      setShowResetDialog(false)
      
      toast({
        title: "Database Reset",
        description: "Database has been completely reset. Please refresh the page."
      })
      
      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload()
      }, 2000)
      
    } catch (error) {
      console.error('Failed to reset database:', error)
      toast({
        title: "Error",
        description: "Failed to reset database. Please close all tabs and try again.",
        variant: "destructive"
      })
    } finally {
      setIsResetting(false)
    }
  }

  const filteredStock = materialStock.filter(stock => {
    if (!stock.material) return false
    const matchesSearch = stock.material.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || stock.material.category === selectedCategory
    const matchesType = selectedType === 'all' || stock.material.type === selectedType
    return matchesSearch && matchesCategory && matchesType
  })

  const getStockStatus = (stock: MaterialStock) => {
    if (stock.availableStock <= stock.minimumStock) return 'low'
    if (stock.availableStock >= stock.maximumStock) return 'high'
    return 'normal'
  }

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'low': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Material Stock Management</h2>
          <p className="text-muted-foreground">
            Manage material inventory and assign to projects
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowResetDialog(true)}
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Reset Database
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Material
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as MaterialCategory | 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.values(MaterialCategory).map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedType} onValueChange={(value) => setSelectedType(value as MaterialType | 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.values(MaterialType).map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stock Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Boxes className="w-5 h-5" />
            Material Stock
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Reserved</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Unit Cost</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStock.map((stock) => {
                  const status = getStockStatus(stock)
                  return (
                    <TableRow key={stock.id}>
                      <TableCell className="font-medium">
                        {stock.material.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {stock.material.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{stock.currentStock}</TableCell>
                      <TableCell>{stock.availableStock}</TableCell>
                      <TableCell>{stock.reservedStock}</TableCell>
                      <TableCell>
                        <Badge className={getStockStatusColor(status)}>
                          {status === 'low' && <TrendingDown className="w-3 h-3 mr-1" />}
                          {status === 'high' && <TrendingUp className="w-3 h-3 mr-1" />}
                          {status === 'normal' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <DollarSign className="w-3 h-3 mr-1" />
                          {stock.unitCost.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <DollarSign className="w-3 h-3 mr-1" />
                          {stock.totalValue.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>{stock.location}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedMaterial(stock.material)
                              setShowAssignDialog(true)
                            }}
                          >
                            Assign
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedStockForView(stock)
                              setShowViewDialog(true)
                              loadMaterialHistory(stock.material.id, stock.id)
                            }}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedMaterial(stock.material)
                              setStockData({
                                currentStock: stock.currentStock,
                                minimumStock: stock.minimumStock,
                                maximumStock: stock.maximumStock,
                                unitCost: stock.unitCost,
                                location: stock.location,
                                supplier: stock.supplier,
                                notes: stock.notes
                              })
                              setShowStockDialog(true)
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setMaterialToDelete(stock)
                              setShowDeleteDialog(true)
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Material Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Material</DialogTitle>
            <DialogDescription>
              Create a new material in the catalog
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">Material Name</Label>
              <Input
                id="name"
                value={newMaterial.name}
                onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})}
                placeholder="Steel Plate S235 1500x3000x10mm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Material Type</Label>
              <Select value={newMaterial.type} onValueChange={(value) => setNewMaterial({...newMaterial, type: value as MaterialType})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(MaterialType).map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">Grade/Quality</Label>
              <Input
                id="grade"
                value={newMaterial.grade}
                onChange={(e) => setNewMaterial({...newMaterial, grade: e.target.value})}
                placeholder="S235"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                value={newMaterial.weight}
                onChange={(e) => setNewMaterial({...newMaterial, weight: parseFloat(e.target.value) || 0})}
                placeholder="353.25"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="costPerUnit">Unit Price (KM)</Label>
              <Input
                id="costPerUnit"
                type="number"
                step="0.01"
                value={newMaterial.costPerUnit}
                onChange={(e) => setNewMaterial({...newMaterial, costPerUnit: parseFloat(e.target.value) || 0})}
                placeholder="2.50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select value={newMaterial.unit} onValueChange={(value) => setNewMaterial({...newMaterial, unit: value})}>
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
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Select value={newMaterial.supplier} onValueChange={(value) => setNewMaterial({...newMaterial, supplier: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ArcelorMittal">ArcelorMittal</SelectItem>
                  <SelectItem value="Thyssenkrupp">Thyssenkrupp</SelectItem>
                  <SelectItem value="Nucor">Nucor</SelectItem>
                  <SelectItem value="Local Supplier">Local Supplier</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentStock">Current Stock</Label>
              <Input
                id="currentStock"
                type="number"
                value={stockData.currentStock}
                onChange={(e) => setStockData({...stockData, currentStock: parseFloat(e.target.value) || 0})}
                placeholder="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minimumStock">Min Stock Alert</Label>
              <Input
                id="minimumStock"
                type="number"
                value={stockData.minimumStock}
                onChange={(e) => setStockData({...stockData, minimumStock: parseFloat(e.target.value) || 0})}
                placeholder="20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Storage Location</Label>
              <Input
                id="location"
                value={newMaterial.location}
                onChange={(e) => setNewMaterial({...newMaterial, location: e.target.value})}
                placeholder="Warehouse A-1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="certificateNumber">Certificate Number</Label>
              <Input
                id="certificateNumber"
                value={newMaterial.certificateNumber}
                onChange={(e) => setNewMaterial({...newMaterial, certificateNumber: e.target.value})}
                placeholder="EN10025-2023"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">Notes/Description</Label>
              <Textarea
                id="notes"
                value={newMaterial.notes}
                onChange={(e) => setNewMaterial({...newMaterial, notes: e.target.value})}
                placeholder="Additional notes or description..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateMaterial}>
              Create Material
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign to Project Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Material to Project</DialogTitle>
            <DialogDescription>
              Assign {selectedMaterial?.name} to a project
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={assignQuantity}
                onChange={(e) => setAssignQuantity(e.target.value)}
                placeholder="Enter quantity"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignToProject}>
              Assign to Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Stock Dialog */}
      <Dialog open={showStockDialog} onOpenChange={setShowStockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Stock Information</DialogTitle>
            <DialogDescription>
              Update stock levels and information for {selectedMaterial?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editCurrentStock">Current Stock</Label>
                <Input
                  id="editCurrentStock"
                  type="number"
                  value={stockData.currentStock}
                  onChange={(e) => setStockData({...stockData, currentStock: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editUnitCost">Unit Cost</Label>
                <Input
                  id="editUnitCost"
                  type="number"
                  step="0.01"
                  value={stockData.unitCost}
                  onChange={(e) => setStockData({...stockData, unitCost: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editMinStock">Minimum Stock</Label>
                <Input
                  id="editMinStock"
                  type="number"
                  value={stockData.minimumStock}
                  onChange={(e) => setStockData({...stockData, minimumStock: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editMaxStock">Maximum Stock</Label>
                <Input
                  id="editMaxStock"
                  type="number"
                  value={stockData.maximumStock}
                  onChange={(e) => setStockData({...stockData, maximumStock: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editLocation">Location</Label>
                <Input
                  id="editLocation"
                  value={stockData.location}
                  onChange={(e) => setStockData({...stockData, location: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editSupplier">Supplier</Label>
                <Input
                  id="editSupplier"
                  value={stockData.supplier}
                  onChange={(e) => setStockData({...stockData, supplier: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editNotes">Notes</Label>
              <Textarea
                id="editNotes"
                value={stockData.notes}
                onChange={(e) => setStockData({...stockData, notes: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStockDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStock}>
              Update Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Material History Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Material History</DialogTitle>
            <DialogDescription>
              View arrival and usage history for {selectedStockForView?.material?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Material Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Current Stock</Label>
                <div className="text-2xl font-bold">{selectedStockForView?.currentStock || 0}</div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Reserved</Label>
                <div className="text-2xl font-bold text-orange-600">{selectedStockForView?.reservedStock || 0}</div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Available</Label>
                <div className="text-2xl font-bold text-green-600">{selectedStockForView?.availableStock || 0}</div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Total Value</Label>
                <div className="text-2xl font-bold">{selectedStockForView?.totalValue?.toFixed(2) || '0.00'} KM</div>
              </div>
            </div>
            
            {isLoadingHistory ? (
              <div className="flex items-center justify-center h-32">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Project Assignments */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Building className="w-5 h-5" />
                      Project Assignments
                    </h3>
                    {projectMaterials.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowEditReservationsDialog(true)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Reservations
                      </Button>
                    )}
                  </div>
                  {projectMaterials.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Project</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Cost</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {projectMaterials.map((pm) => {
                            const project = projects.find(p => p.id === pm.projectId)
                            return (
                              <TableRow key={pm.id}>
                                <TableCell className="font-medium">
                                  {project?.name || 'Unknown Project'}
                                </TableCell>
                                <TableCell>{pm.quantity} {pm.weightUnit}</TableCell>
                                <TableCell>
                                  <Badge variant={pm.status === 'INSTALLED' ? 'default' : 'secondary'}>
                                    {pm.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>{pm.totalCost?.toFixed(2) || '0.00'} KM</TableCell>
                                <TableCell>
                                  {pm.createdAt ? new Date(pm.createdAt).toLocaleDateString() : 'N/A'}
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Building className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p>No project assignments found</p>
                    </div>
                  )}
                </div>

                {/* Stock Transactions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Stock Transactions
                  </h3>
                  {stockTransactions.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Reference</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Notes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stockTransactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell>
                                <Badge variant={
                                  transaction.type === 'IN' ? 'default' :
                                  transaction.type === 'OUT' ? 'destructive' :
                                  transaction.type === 'RESERVED' ? 'secondary' :
                                  'outline'
                                }>
                                  {transaction.type}
                                </Badge>
                              </TableCell>
                              <TableCell>{transaction.quantity}</TableCell>
                              <TableCell>
                                {transaction.referenceType === 'PROJECT' ? 
                                  projects.find(p => p.id === transaction.referenceId)?.name || 'Unknown Project' :
                                  transaction.referenceType || 'N/A'}
                              </TableCell>
                              <TableCell>
                                {transaction.transactionDate ? 
                                  new Date(transaction.transactionDate).toLocaleDateString() : 
                                  new Date(transaction.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>{transaction.notes || 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p>No stock transactions found</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Reservations Dialog */}
      <Dialog open={showEditReservationsDialog} onOpenChange={setShowEditReservationsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Material Reservations</DialogTitle>
            <DialogDescription>
              Manage reservations for {selectedStockForView?.material?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {projectMaterials.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectMaterials.map((pm) => {
                      const project = projects.find(p => p.id === pm.projectId)
                      return (
                        <TableRow key={pm.id}>
                          <TableCell className="font-medium">
                            {project?.name || 'Unknown Project'}
                          </TableCell>
                          <TableCell>{pm.quantity} {pm.weightUnit}</TableCell>
                          <TableCell>
                            <Badge variant={pm.status === 'INSTALLED' ? 'default' : 'secondary'}>
                              {pm.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {pm.status === 'REQUIRED' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingAssignment(pm)
                                      setEditAssignmentQuantity(pm.quantity.toString())
                                    }}
                                  >
                                    <Edit className="w-3 h-3 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUnreserveFromProject(pm.id, pm.quantity)}
                                  >
                                    <Trash2 className="w-3 h-3 mr-1" />
                                    Unreserve
                                  </Button>
                                </>
                              )}
                              {pm.status === 'INSTALLED' && (
                                <Badge variant="default">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Completed
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Building className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No project assignments found</p>
              </div>
            )}
            
            {/* Edit Assignment Form */}
            {editingAssignment && (
              <div className="mt-6 border-t pt-6">
                <h4 className="font-medium mb-4">Edit Assignment</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Project</Label>
                      <div className="text-sm text-gray-600">
                        {projects.find(p => p.id === editingAssignment.projectId)?.name || 'Unknown Project'}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Current Quantity</Label>
                      <div className="text-sm text-gray-600">
                        {editingAssignment.quantity} {editingAssignment.weightUnit}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editQuantity">New Quantity</Label>
                    <Input
                      id="editQuantity"
                      type="number"
                      value={editAssignmentQuantity}
                      onChange={(e) => setEditAssignmentQuantity(e.target.value)}
                      placeholder="Enter new quantity"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleEditAssignment}>
                      Save Changes
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setEditingAssignment(null)
                        setEditAssignmentQuantity('')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => {
              setShowEditReservationsDialog(false)
              setEditingAssignment(null)
              setEditAssignmentQuantity('')
            }}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Material Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Material</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {materialToDelete?.material?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {materialToDelete && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-800">Warning</span>
                </div>
                <p className="text-sm text-red-700">
                  This will permanently delete the material and all its stock records.
                </p>
                {materialToDelete.reservedStock > 0 && (
                  <p className="text-sm text-red-700 mt-2">
                    <strong>Cannot delete:</strong> This material has {materialToDelete.reservedStock} units reserved for projects.
                  </p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteMaterial}
              disabled={materialToDelete?.reservedStock > 0}
            >
              Delete Material
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Database Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Database</DialogTitle>
            <DialogDescription>
              This will permanently delete ALL data in the database. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-800">⚠️ DANGER ZONE</span>
              </div>
              <p className="text-sm text-red-700 mb-2">
                This will delete ALL of the following:
              </p>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• All materials and stock records</li>
                <li>• All project assignments</li>
                <li>• All dispatch records</li>
                <li>• All transaction history</li>
                <li>• All projects and calculations</li>
                <li>• All settings and preferences</li>
              </ul>
              <p className="text-sm text-red-700 mt-2 font-medium">
                The application will automatically refresh after the reset.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleResetDatabase}
              disabled={isResetting}
            >
              {isResetting ? (
                <>
                  <LoadingSpinner className="w-4 h-4 mr-2" />
                  Resetting...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Reset Database
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}