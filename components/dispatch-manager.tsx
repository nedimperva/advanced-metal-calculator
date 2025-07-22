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
import { LoadingSpinner } from '@/components/loading-states'
import { 
  getAllMaterialStock,
  updateMaterialStock,
  createMaterialStockTransaction,
  createDispatchNote,
  getAllDispatchNotes,
  createDispatchMaterial
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
  
  // New dispatch form
  const [newDispatch, setNewDispatch] = useState({
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
      
      // Convert to DispatchRecord format for compatibility
      const dispatchRecords: DispatchRecord[] = dispatchNotes.map(note => ({
        id: note.id,
        orderNumber: note.dispatchNumber || note.orderNumber || 'N/A',
        supplierName: note.supplier?.name || 'Unknown Supplier',
        expectedDate: note.expectedDeliveryDate ? new Date(note.expectedDeliveryDate).toISOString().split('T')[0] : '',
        actualDate: note.actualDeliveryDate ? new Date(note.actualDeliveryDate).toISOString().split('T')[0] : undefined,
        status: note.status as 'pending' | 'in_transit' | 'delivered' | 'cancelled',
        materials: [], // Will be populated later with dispatch materials
        notes: note.notes || '',
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString()
      }))
      
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
  }, [loadMaterials])

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  const handleCreateDispatch = async () => {
    try {
      // Create dispatch note in database
      const dispatchNoteData = {
        dispatchNumber: newDispatch.orderNumber,
        supplier: { name: newDispatch.supplierName },
        expectedDeliveryDate: new Date(newDispatch.expectedDate),
        status: 'pending' as const,
        notes: newDispatch.notes,
        materials: newDispatch.materials.map(m => ({
          materialType: m.materialName.split(' ')[0], // Extract type from name
          profile: 'Standard',
          grade: 'Standard',
          dimensions: {},
          quantity: m.orderedQuantity,
          unitWeight: 1,
          totalWeight: m.orderedQuantity,
          lengthUnit: 'mm',
          weightUnit: 'kg',
          unitCost: 0,
          totalCost: 0,
          currency: 'USD',
          status: 'pending' as any,
          location: 'Warehouse'
        }))
      }
      
      const dispatchId = await createDispatchNote(dispatchNoteData)
      
      // Create dispatch materials for each material
      for (const material of newDispatch.materials) {
        await createDispatchMaterial({
          dispatchNoteId: dispatchId,
          materialType: material.materialName.split(' ')[0],
          profile: 'Standard',
          grade: 'Standard',
          dimensions: {},
          quantity: material.orderedQuantity,
          unitWeight: 1,
          totalWeight: material.orderedQuantity,
          lengthUnit: 'mm',
          weightUnit: material.unit,
          unitCost: 0,
          totalCost: 0,
          currency: 'USD',
          status: 'pending',
          location: 'Warehouse',
          notes: material.notes
        })
      }
      
      // Reload dispatches to show the new one
      await loadDispatches()
      
      setShowCreateDialog(false)
      setNewDispatch({
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

      // Update dispatch status
      const updatedDispatch = {
        ...dispatch,
        status: 'delivered' as const,
        actualDate: new Date().toISOString()
      }

      // Update dispatches state
      setDispatches(prev => prev.map(d => d.id === dispatchId ? updatedDispatch : d))

      // Update stock levels for each material
      const stockRecords = await getAllMaterialStock()
      
      for (const material of dispatch.materials) {
        // Find stock record by material name (simplified matching)
        const stockRecord = stockRecords.find(stock => 
          stock.materialCatalogId === material.materialId ||
          // Fallback: match by name if no direct ID match
          stockRecords.find(s => s.materialCatalogId === material.materialName)
        )

        if (stockRecord && material.deliveredQuantity > 0) {
          // Update stock levels
          const newCurrentStock = stockRecord.currentStock + material.deliveredQuantity
          const newAvailableStock = stockRecord.availableStock + material.deliveredQuantity
          const newTotalValue = newCurrentStock * stockRecord.unitCost

          await updateMaterialStock(stockRecord.id, {
            currentStock: newCurrentStock,
            availableStock: newAvailableStock,
            totalValue: newTotalValue,
            lastStockUpdate: new Date()
          })

          // Create stock transaction
          await createMaterialStockTransaction({
            materialStockId: stockRecord.id,
            type: 'IN',
            quantity: material.deliveredQuantity,
            unitCost: stockRecord.unitCost,
            totalCost: material.deliveredQuantity * stockRecord.unitCost,
            referenceId: dispatch.id,
            referenceType: 'DISPATCH',
            transactionDate: new Date(),
            notes: `Delivery from dispatch: ${dispatch.orderNumber}`,
            createdBy: 'system'
          })
        }
      }

      toast({
        title: "Success",
        description: "Dispatch marked as delivered and stock updated"
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // TODO: Add edit functionality
                              toast({
                                title: "Coming Soon",
                                description: "Edit dispatch functionality will be available soon"
                              })
                            }}
                          >
                            <Edit className="w-3 h-3" />
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
            <div className="grid grid-cols-2 gap-4">
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
                      onChange={(e) => setNewMaterial({...newMaterial, orderedQuantity: parseFloat(e.target.value) || 0})}
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