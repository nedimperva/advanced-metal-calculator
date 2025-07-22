"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
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
  Truck,
  Search,
  Calendar,
  Package,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Edit,
  Eye,
  FileText,
  Check,
  ChevronsUpDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/use-media-query'
import { toast } from '@/hooks/use-toast'
import { useI18n } from '@/contexts/i18n-context'
import { useMaterialCatalog } from '@/contexts/material-catalog-context'
import { useProjects } from '@/contexts/project-context'
import { LoadingSpinner } from '@/components/loading-states'
import { 
  getAllMaterialStock,
  updateMaterialStock,
  createMaterialStockTransaction,
  createDispatchNote,
  getAllDispatchNotes,
  createDispatchMaterial,
  getDispatchMaterials,
  updateDispatchNote,
  getDispatchNote,
  getAllMaterialCatalog,
  createMaterialStock
} from '@/lib/database'

interface DispatchRecord {
  id: string
  orderNumber: string
  supplierName: string
  expectedDate: string
  actualDate?: string
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled'
  materials: MaterialDelivery[]
  notes: string
  createdAt: string
  updatedAt: string
}

interface MaterialDelivery {
  id: string
  materialName: string
  materialId: string
  orderedQuantity: number
  deliveredQuantity: number
  unit: string
  notes: string
}

interface DispatchManagerProps {
  className?: string
}

export default function DispatchManager({ className }: DispatchManagerProps) {
  const { t } = useI18n()
  const { materials: catalogMaterials, loadMaterials, createMaterial } = useMaterialCatalog()
  const { projects, currentProject } = useProjects()
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [mounted, setMounted] = useState(false)
  
  // State management
  const [dispatches, setDispatches] = useState<DispatchRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false)
  const [selectedDispatch, setSelectedDispatch] = useState<DispatchRecord | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingDispatch, setEditingDispatch] = useState<DispatchRecord | null>(null)
  
  // New dispatch form
  const [newDispatch, setNewDispatch] = useState({
    projectId: currentProject?.id || '',
    orderNumber: '',
    supplierName: '',
    expectedDate: '',
    notes: '',
    materials: [] as MaterialDelivery[]
  })
  
  // Material delivery form
  const [newMaterial, setNewMaterial] = useState({
    materialCatalogId: '',
    materialName: '',
    orderedQuantity: 0,
    deliveredQuantity: 0,
    unit: '',
    notes: ''
  })
  
  // Material selection state
  const [open, setOpen] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null)

  const loadDispatches = async () => {
    try {
      setIsLoading(true)
      const dispatchNotes = await getAllDispatchNotes()
      
      // Helper function to safely convert dates
      const safeDate = (dateValue: any): string => {
        if (!dateValue) return ''
        try {
          const date = new Date(dateValue)
          if (isNaN(date.getTime())) return ''
          return date.toISOString().split('T')[0]
        } catch {
          return ''
        }
      }

      const safeISODate = (dateValue: any): string => {
        if (!dateValue) return new Date().toISOString()
        try {
          const date = new Date(dateValue)
          if (isNaN(date.getTime())) return new Date().toISOString()
          return date.toISOString()
        } catch {
          return new Date().toISOString()
        }
      }

      // Convert to DispatchRecord format and load materials for each
      const dispatchRecords: DispatchRecord[] = []
      
      for (const note of dispatchNotes) {
        // Get materials for this dispatch
        const dispatchMaterials = await getDispatchMaterials(note.id)
        
        const materials: MaterialDelivery[] = dispatchMaterials.map(dm => ({
          id: dm.id,
          materialName: dm.materialType + ' ' + dm.profile + ' ' + dm.grade,
          materialId: dm.id, // Use dispatch material ID since we don't have catalog ID
          orderedQuantity: Number(dm.orderedQuantity) || 0,
          deliveredQuantity: Number(dm.deliveredQuantity) || 0,
          unit: dm.unit || 'kg',
          notes: dm.notes || ''
        }))
        
        dispatchRecords.push({
          id: note.id,
          orderNumber: note.dispatchNumber || note.orderNumber || 'N/A',
          supplierName: note.supplier?.name || 'Unknown Supplier',
          expectedDate: safeDate(note.expectedDeliveryDate),
          actualDate: note.actualDeliveryDate ? safeDate(note.actualDeliveryDate) : undefined,
          status: note.status as 'pending' | 'in_transit' | 'delivered' | 'cancelled',
          materials: materials,
          notes: note.notes || '',
          createdAt: safeISODate(note.createdAt),
          updatedAt: safeISODate(note.updatedAt)
        })
      }
      
      setDispatches(dispatchRecords)
    } catch (error) {
      console.error('Failed to load dispatches:', error)
      toast({
        title: "Error",
        description: "Failed to load dispatch records",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    loadDispatches()
    loadMaterials()
  }, []) // Empty dependency array - only run once on mount

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  const handleCreateDispatch = async () => {
    if (!newDispatch.projectId) {
      toast({
        title: "Error",
        description: "Please select a project for this dispatch",
        variant: "destructive"
      })
      return
    }

    try {
      // Create dispatch note in database
      const dispatchNoteData = {
        projectId: newDispatch.projectId,
        dispatchNumber: newDispatch.orderNumber,
        date: new Date(),
        expectedDeliveryDate: newDispatch.expectedDate ? new Date(newDispatch.expectedDate) : undefined,
        supplier: { 
          name: newDispatch.supplierName,
          contactPerson: '',
          phone: '',
          email: '',
          address: ''
        },
        status: 'pending' as const,
        notes: newDispatch.notes
      }
      
      const dispatchId = await createDispatchNote(dispatchNoteData)
      
      // Create dispatch materials for each material
      for (const material of newDispatch.materials) {
        // Find the catalog material for better data
        const catalogMaterial = catalogMaterials.find(cm => cm.id === material.materialId)
        
        await createDispatchMaterial({
          dispatchNoteId: dispatchId,
          materialType: catalogMaterial?.type || material.materialName.split(' ')[0] || 'Steel',
          profile: catalogMaterial?.category || 'Standard',
          grade: catalogMaterial?.name || 'Standard',
          dimensions: {
            length: catalogMaterial?.standardLength || 0,
            width: catalogMaterial?.standardWidth || 0,
            height: catalogMaterial?.standardHeight || 0,
            thickness: catalogMaterial?.standardThickness || 0
          },
          quantity: material.orderedQuantity || 0,
          orderedQuantity: material.orderedQuantity || 0,
          deliveredQuantity: material.deliveredQuantity || 0,
          unitWeight: catalogMaterial?.density || 1,
          totalWeight: (material.orderedQuantity || 0) * (catalogMaterial?.density || 1),
          lengthUnit: catalogMaterial?.lengthUnit || 'mm',
          weightUnit: material.unit || 'kg',
          unit: material.unit || 'kg',
          unitCost: catalogMaterial?.basePrice || 0,
          totalCost: (material.orderedQuantity || 0) * (catalogMaterial?.basePrice || 0),
          currency: catalogMaterial?.currency || 'USD',
          status: 'pending',
          location: 'Warehouse',
          notes: material.notes || `Material from catalog: ${catalogMaterial?.name || material.materialName}`
        })
      }
      
      // Reload dispatches to show the new one
      await loadDispatches()
      
      setShowCreateDialog(false)
      setNewDispatch({
        projectId: currentProject?.id || '',
        orderNumber: '',
        supplierName: '',
        expectedDate: '',
        notes: '',
        materials: []
      })
      
      toast({
        title: "Success",
        description: "Dispatch record created successfully"
      })
    } catch (error) {
      console.error('Failed to create dispatch:', error)
      toast({
        title: "Error",
        description: "Failed to create dispatch record",
        variant: "destructive"
      })
    }
  }

  const addMaterialToDispatch = () => {
    if (!selectedMaterial || !newMaterial.orderedQuantity) {
      toast({
        title: "Error",
        description: "Please select a material and enter quantity",
        variant: "destructive"
      })
      return
    }
    
    const material: MaterialDelivery = {
      id: Date.now().toString(),
      materialName: selectedMaterial.name,
      materialId: selectedMaterial.id,
      orderedQuantity: newMaterial.orderedQuantity,
      deliveredQuantity: newMaterial.deliveredQuantity,
      unit: selectedMaterial.baseUnit || 'kg', // Get unit from catalog
      notes: newMaterial.notes
    }
    
    setNewDispatch(prev => ({
      ...prev,
      materials: [...prev.materials, material]
    }))
    
    // Reset form
    setNewMaterial({
      materialCatalogId: '',
      materialName: '',
      orderedQuantity: 0,
      deliveredQuantity: 0,
      unit: '',
      notes: ''
    })
    setSelectedMaterial(null)
    setOpen(false)
  }

  const removeMaterialFromDispatch = (materialId: string) => {
    setNewDispatch(prev => ({
      ...prev,
      materials: prev.materials.filter(m => m.id !== materialId)
    }))
  }

  const handleMarkAsDelivered = async (dispatchId: string) => {
    try {
      const dispatch = dispatches.find(d => d.id === dispatchId)
      if (!dispatch) return
      
      // Get the dispatch note from database to update it
      const dispatchNote = await getDispatchNote(dispatchId)
      if (!dispatchNote) {
        toast({
          title: "Error",
          description: "Dispatch note not found",
          variant: "destructive"
        })
        return
      }
      
      // Update dispatch status in database
      await updateDispatchNote({
        ...dispatchNote,
        status: 'delivered',
        actualDeliveryDate: new Date()
      })
      
      // Update stock levels for each material
      const [stockRecords, catalogMaterials] = await Promise.all([
        getAllMaterialStock(),
        getAllMaterialCatalog()
      ])
      
      let stockUpdated = 0
      
      for (const material of dispatch.materials) {
        // When marking as delivered, use ordered quantity if delivered quantity is 0
        const deliveredQuantity = material.deliveredQuantity > 0 ? material.deliveredQuantity : material.orderedQuantity
        if (deliveredQuantity <= 0) continue
        
        // Try to find stock record by matching material name with catalog
        let stockRecord = null
        
        // First try to find by material name in catalog
        const catalogMaterial = catalogMaterials.find(cm => 
          cm.name.toLowerCase().includes(material.materialName.toLowerCase()) ||
          material.materialName.toLowerCase().includes(cm.name.toLowerCase())
        )
        
        if (catalogMaterial) {
          // Find stock record by catalog material ID
          stockRecord = stockRecords.find(stock => stock.materialCatalogId === catalogMaterial.id)
        }
        
        // If still not found, try fuzzy matching by name
        if (!stockRecord) {
          const materialWords = material.materialName.toLowerCase().split(' ')
          stockRecord = stockRecords.find(stock => {
            const catalogMat = catalogMaterials.find(cm => cm.id === stock.materialCatalogId)
            if (!catalogMat) return false
            
            const catalogWords = catalogMat.name.toLowerCase().split(' ')
            return materialWords.some(word => 
              catalogWords.some(cword => cword.includes(word) || word.includes(cword))
            )
          })
        }
        
        // If no stock record found but we have a catalog material, create one
        if (!stockRecord && catalogMaterial) {
          console.log(`Creating new stock record for material: ${catalogMaterial.name}`)
          const newStockId = await createMaterialStock({
            materialCatalogId: catalogMaterial.id,
            currentStock: 0,
            reservedStock: 0,
            availableStock: 0,
            minimumStock: 10,
            maximumStock: 1000,
            unitCost: catalogMaterial.basePrice || 0,
            totalValue: 0,
            location: 'Warehouse',
            supplier: 'Unknown',
            notes: `Stock record created automatically from dispatch delivery`
          })
          
          // Reload stock records to include the new one
          const updatedStockRecords = await getAllMaterialStock()
          stockRecord = updatedStockRecords.find(stock => stock.id === newStockId)
        }
        
        if (stockRecord) {
          // Update stock levels
          const newCurrentStock = (Number(stockRecord.currentStock) || 0) + (Number(deliveredQuantity) || 0)
          const newAvailableStock = (Number(stockRecord.availableStock) || 0) + (Number(deliveredQuantity) || 0)
          const newTotalValue = newCurrentStock * (Number(stockRecord.unitCost) || 0)
          
          await updateMaterialStock({
            ...stockRecord,
            currentStock: newCurrentStock,
            availableStock: newAvailableStock,
            totalValue: newTotalValue,
            lastStockUpdate: new Date(),
            updatedAt: new Date()
          })
          
          // Create transaction record
          await createMaterialStockTransaction({
            materialStockId: stockRecord.id,
            type: 'IN',
            quantity: deliveredQuantity,
            unitCost: stockRecord.unitCost || 0,
            totalCost: deliveredQuantity * (stockRecord.unitCost || 0),
            referenceId: dispatchId,
            referenceType: 'DISPATCH',
            transactionDate: new Date(),
            notes: `Delivered via dispatch ${dispatch.orderNumber}. Material: ${material.materialName}`,
            createdBy: 'system'
          })
          
          stockUpdated++
        } else {
          console.warn(`Could not find stock record for material: ${material.materialName}`)
          console.log('Available catalog materials:', catalogMaterials.map(cm => cm.name))
          console.log('Available stock records:', stockRecords.map(sr => sr.materialCatalogId))
        }
      }
      
      // Reload dispatches to reflect changes
      await loadDispatches()

      toast({
        title: "Success",
        description: `Dispatch marked as delivered. ${stockUpdated} materials added to stock.`
      })
    } catch (error) {
      console.error('Failed to mark dispatch as delivered:', error)
      toast({
        title: "Error",
        description: "Failed to update dispatch status",
        variant: "destructive"
      })
    }
  }

  const handleStatusChange = async (dispatchId: string, newStatus: string) => {
    try {
      // Get the dispatch note from database
      const dispatchNote = await getDispatchNote(dispatchId)
      if (!dispatchNote) {
        toast({
          title: "Error",
          description: "Dispatch note not found",
          variant: "destructive"
        })
        return
      }
      
      // Update dispatch status in database
      const updatedDispatchNote = {
        ...dispatchNote,
        status: newStatus as any,
        updatedAt: new Date()
      }
      
      // If marking as delivered, also set actual delivery date and update stock
      if (newStatus === 'delivered' && !dispatchNote.actualDeliveryDate) {
        updatedDispatchNote.actualDeliveryDate = new Date()
      }
      
      await updateDispatchNote(updatedDispatchNote)
      
      // If changing to delivered, update stock levels
      if (newStatus === 'delivered') {
        const dispatch = dispatches.find(d => d.id === dispatchId)
        if (dispatch) {
          // Use the same stock update logic from handleMarkAsDelivered
          const [stockRecords, catalogMaterials] = await Promise.all([
            getAllMaterialStock(),
            getAllMaterialCatalog()
          ])
          
          let stockUpdated = 0
          
          for (const material of dispatch.materials) {
            // When marking as delivered, use ordered quantity if delivered quantity is 0
            const deliveredQuantity = material.deliveredQuantity > 0 ? material.deliveredQuantity : material.orderedQuantity
            if (deliveredQuantity <= 0) continue
            
            // Find stock record by matching material name with catalog
            let stockRecord = null
            
            const catalogMaterial = catalogMaterials.find(cm => 
              cm.name.toLowerCase().includes(material.materialName.toLowerCase()) ||
              material.materialName.toLowerCase().includes(cm.name.toLowerCase())
            )
            
            if (catalogMaterial) {
              stockRecord = stockRecords.find(stock => stock.materialCatalogId === catalogMaterial.id)
            }
            
            if (!stockRecord) {
              const materialWords = material.materialName.toLowerCase().split(' ')
              stockRecord = stockRecords.find(stock => {
                const catalogMat = catalogMaterials.find(cm => cm.id === stock.materialCatalogId)
                if (!catalogMat) return false
                
                const catalogWords = catalogMat.name.toLowerCase().split(' ')
                return materialWords.some(word => 
                  catalogWords.some(cword => cword.includes(word) || word.includes(cword))
                )
              })
            }
            
            // If no stock record found but we have a catalog material, create one
            if (!stockRecord && catalogMaterial) {
              console.log(`Creating new stock record for material: ${catalogMaterial.name}`)
              const newStockId = await createMaterialStock({
                materialCatalogId: catalogMaterial.id,
                currentStock: 0,
                reservedStock: 0,
                availableStock: 0,
                minimumStock: 10,
                maximumStock: 1000,
                unitCost: catalogMaterial.basePrice || 0,
                totalValue: 0,
                location: 'Warehouse',
                supplier: 'Unknown',
                notes: `Stock record created automatically from dispatch delivery`
              })
              
              // Reload stock records to include the new one
              const updatedStockRecords = await getAllMaterialStock()
              stockRecord = updatedStockRecords.find(stock => stock.id === newStockId)
            }
            
            if (stockRecord) {
              const newCurrentStock = (Number(stockRecord.currentStock) || 0) + (Number(deliveredQuantity) || 0)
              const newAvailableStock = (Number(stockRecord.availableStock) || 0) + (Number(deliveredQuantity) || 0)
              const newTotalValue = newCurrentStock * (Number(stockRecord.unitCost) || 0)
              
              await updateMaterialStock({
                ...stockRecord,
                currentStock: newCurrentStock,
                availableStock: newAvailableStock,
                totalValue: newTotalValue,
                lastStockUpdate: new Date(),
                updatedAt: new Date()
              })
              
              await createMaterialStockTransaction({
                materialStockId: stockRecord.id,
                type: 'IN',
                quantity: deliveredQuantity,
                unitCost: stockRecord.unitCost || 0,
                totalCost: deliveredQuantity * (stockRecord.unitCost || 0),
                referenceId: dispatchId,
                referenceType: 'DISPATCH',
                transactionDate: new Date(),
                notes: `Delivered via dispatch ${dispatch.orderNumber}. Material: ${material.materialName}`,
                createdBy: 'system'
              })
              
              stockUpdated++
            } else {
              console.warn(`Could not find stock record for material: ${material.materialName}`)
              console.log('Available catalog materials:', catalogMaterials.map(cm => cm.name))
              console.log('Available stock records:', stockRecords.map(sr => sr.materialCatalogId))
            }
          }
        }
      }
      
      // Reload dispatches to reflect changes
      await loadDispatches()
      
      toast({
        title: "Success",
        description: newStatus === 'delivered' ? 
          `Dispatch marked as delivered. Materials added to stock.` :
          `Dispatch status updated to ${newStatus}`
      })
    } catch (error) {
      console.error('Failed to update dispatch status:', error)
      toast({
        title: "Error",
        description: "Failed to update dispatch status",
        variant: "destructive"
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-50 border-green-200'
      case 'in_transit': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return CheckCircle2
      case 'in_transit': return Truck
      case 'pending': return Clock
      case 'cancelled': return AlertTriangle
      default: return Package
    }
  }

  const filteredDispatches = dispatches.filter(dispatch => {
    const matchesSearch = dispatch.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dispatch.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || dispatch.status === statusFilter
    return matchesSearch && matchesStatus
  })

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
          <h2 className="text-2xl font-bold">Dispatch Manager</h2>
          <p className="text-muted-foreground">
            Track material orders and deliveries
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Dispatch
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search dispatches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_transit">In Transit</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Dispatches Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Dispatch Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Expected Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Materials</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDispatches.map((dispatch) => {
                  const StatusIcon = getStatusIcon(dispatch.status)
                  return (
                    <TableRow key={dispatch.id}>
                      <TableCell className="font-medium">
                        {dispatch.orderNumber}
                      </TableCell>
                      <TableCell>{dispatch.supplierName}</TableCell>
                      <TableCell>
                        {new Date(dispatch.expectedDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(dispatch.status)}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {dispatch.status.charAt(0).toUpperCase() + dispatch.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Package className="w-3 h-3 mr-1" />
                          {dispatch.materials.length} item{dispatch.materials.length !== 1 ? 's' : ''}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedDispatch(dispatch)
                              setShowViewDialog(true)
                            }}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          {dispatch.status === 'in_transit' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsDelivered(dispatch.id)}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Edit className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(dispatch.id, 'pending')}
                                disabled={dispatch.status === 'pending'}
                              >
                                <Clock className="w-4 h-4 mr-2" />
                                Pending
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(dispatch.id, 'in_transit')}
                                disabled={dispatch.status === 'in_transit'}
                              >
                                <Truck className="w-4 h-4 mr-2" />
                                In Transit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(dispatch.id, 'delivered')}
                                disabled={dispatch.status === 'delivered'}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Delivered
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(dispatch.id, 'cancelled')}
                                disabled={dispatch.status === 'cancelled'}
                              >
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                Cancelled
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {/* Create Dispatch Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Create New Dispatch</DialogTitle>
            <DialogDescription>
              Add a new material order arrival record
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Basic Information */}
            {/* Project Selection - Full Width */}
            <div className="space-y-2">
              <Label htmlFor="projectSelect">Project *</Label>
              <Select 
                value={newDispatch.projectId} 
                onValueChange={(value) => setNewDispatch({...newDispatch, projectId: value})}
              >
                <SelectTrigger id="projectSelect">
                  <SelectValue placeholder="Select a project for this dispatch" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{project.name}</span>
                        <span className="text-sm text-muted-foreground">{project.client}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="orderNumber">Order Number</Label>
                <Input
                  id="orderNumber"
                  value={newDispatch.orderNumber}
                  onChange={(e) => setNewDispatch({...newDispatch, orderNumber: e.target.value})}
                  placeholder="ORD-2024-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplierName">Supplier Name</Label>
                <Input
                  id="supplierName"
                  value={newDispatch.supplierName}
                  onChange={(e) => setNewDispatch({...newDispatch, supplierName: e.target.value})}
                  placeholder="ArcelorMittal"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedDate">Expected Date</Label>
                <Input
                  id="expectedDate"
                  type="date"
                  value={newDispatch.expectedDate}
                  onChange={(e) => setNewDispatch({...newDispatch, expectedDate: e.target.value})}
                />
              </div>
            </div>

            {/* Materials Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Materials</h3>
              </div>
              
              {/* Add Material Form */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label>Select Material</Label>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="w-full justify-between"
                        >
                          {selectedMaterial
                            ? selectedMaterial.name
                            : "Select material..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search materials..." />
                          <CommandEmpty>
                            <div className="p-4 text-center">
                              <p className="text-sm text-muted-foreground mb-2">
                                No materials found.
                              </p>
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => {
                                  setOpen(false)
                                  setShowAddMaterialModal(true)
                                }}
                              >
                                Add to Catalog
                              </Button>
                            </div>
                          </CommandEmpty>
                          <CommandList>
                            <CommandGroup>
                              {catalogMaterials.map((material) => (
                                <CommandItem
                                  key={material.id}
                                  onSelect={() => {
                                    setSelectedMaterial(material)
                                    setNewMaterial(prev => ({
                                      ...prev,
                                      materialCatalogId: material.id,
                                      materialName: material.name,
                                      unit: material.baseUnit || 'kg'
                                    }))
                                    setOpen(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedMaterial?.id === material.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span className="font-medium">{material.name}</span>
                                    <span className="text-sm text-muted-foreground">
                                      {material.type} - {material.baseUnit || 'kg'}
                                    </span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="orderedQuantity">Quantity</Label>
                    <Input
                      id="orderedQuantity"
                      type="number"
                      value={newMaterial.orderedQuantity}
                      onChange={(e) => {
                        const value = e.target.value
                        const numValue = value === '' ? 0 : (parseFloat(value) || 0)
                        setNewMaterial({...newMaterial, orderedQuantity: numValue})
                      }}
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      value={selectedMaterial ? selectedMaterial.baseUnit || 'kg' : newMaterial.unit}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>
                <Button onClick={addMaterialToDispatch} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Material
                </Button>
              </div>

              {/* Materials List */}
              {newDispatch.materials.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Added Materials:</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Material</TableHead>
                          <TableHead>Ordered</TableHead>
                          <TableHead>Delivered</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {newDispatch.materials.map((material) => (
                          <TableRow key={material.id}>
                            <TableCell>{material.materialName}</TableCell>
                            <TableCell>{material.orderedQuantity} {material.unit}</TableCell>
                            <TableCell>{material.deliveredQuantity} {material.unit}</TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeMaterialFromDispatch(material.id)}
                              >
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newDispatch.notes}
                onChange={(e) => setNewDispatch({...newDispatch, notes: e.target.value})}
                placeholder="Additional notes about this dispatch..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDispatch}>
              Create Dispatch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dispatch Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Dispatch Details</DialogTitle>
            <DialogDescription>
              View dispatch information for {selectedDispatch?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {selectedDispatch && (
              <>
                {/* Basic Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Order Number</Label>
                    <div className="text-lg font-semibold">{selectedDispatch.orderNumber}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Supplier</Label>
                    <div className="text-lg">{selectedDispatch.supplierName}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Expected Date</Label>
                    <div className="text-lg">{new Date(selectedDispatch.expectedDate).toLocaleDateString()}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge className={getStatusColor(selectedDispatch.status)}>
                      {selectedDispatch.status.charAt(0).toUpperCase() + selectedDispatch.status.slice(1)}
                    </Badge>
                  </div>
                </div>

                {/* Materials */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Materials</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Material Name</TableHead>
                          <TableHead>Ordered</TableHead>
                          <TableHead>Delivered</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedDispatch.materials.map((material) => (
                          <TableRow key={material.id}>
                            <TableCell className="font-medium">{material.materialName}</TableCell>
                            <TableCell>{material.orderedQuantity} {material.unit}</TableCell>
                            <TableCell>{material.deliveredQuantity} {material.unit}</TableCell>
                            <TableCell>
                              <Badge className={
                                material.deliveredQuantity >= material.orderedQuantity
                                  ? 'text-green-600 bg-green-50 border-green-200'
                                  : material.deliveredQuantity > 0
                                  ? 'text-yellow-600 bg-yellow-50 border-yellow-200'
                                  : 'text-gray-600 bg-gray-50 border-gray-200'
                              }>
                                {material.deliveredQuantity >= material.orderedQuantity
                                  ? 'Complete'
                                  : material.deliveredQuantity > 0
                                  ? 'Partial'
                                  : 'Pending'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Notes */}
                {selectedDispatch.notes && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Notes</Label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {selectedDispatch.notes}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Material to Catalog Dialog */}
      <Dialog open={showAddMaterialModal} onOpenChange={setShowAddMaterialModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Material to Catalog</DialogTitle>
            <DialogDescription>
              This feature will redirect you to the Materials Management page where you can add new materials to your catalog database.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowAddMaterialModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setShowAddMaterialModal(false)
                window.open('/management?tab=materials', '_blank')
              }}
            >
              Open Materials Manager
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}