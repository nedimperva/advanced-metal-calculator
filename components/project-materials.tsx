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
import { useMediaQuery } from '@/hooks/use-media-query'
import { 
  MATERIAL_STATUS_LABELS, 
  MATERIAL_STATUS_COLORS 
} from '@/lib/project-utils'
import { MaterialStatus, type Project, type ProjectMaterial, type Calculation } from '@/lib/types'
import { LoadingSpinner } from '@/components/loading-states'
import { toast } from '@/hooks/use-toast'
import { useI18n } from '@/contexts/i18n-context'

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
  onAdd: (material: any) => void
}

// Mobile-optimized Calculation Card Component
interface CalculationCardProps {
  calculation: Calculation
  project: Project
  onEdit: () => void
  onRemove: () => void
  isMobile: boolean
}

function CalculationCard({ calculation, project, onEdit, onRemove, isMobile }: CalculationCardProps) {
  const { t } = useI18n()
  return (
    <Card className="hover:bg-muted/30 transition-colors">
      <CardContent className={cn(
        "p-4",
        isMobile && "p-3"
      )}>
        <div className={cn(
          "flex gap-3",
          isMobile ? "flex-col space-y-3" : "items-center"
        )}>
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Calculator className={cn(
              "text-muted-foreground shrink-0 mt-1",
              isMobile ? "h-4 w-4" : "h-5 w-5"
            )} />
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-2 mb-2">
                <h4 className={cn(
                  "font-medium leading-tight",
                  isMobile ? "text-sm break-words" : "text-base truncate"
                )}>
                  {calculation.name || `${calculation.materialName} ${calculation.profileName}`}
                </h4>
                
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {calculation.totalWeight ? `${calculation.totalWeight.toFixed(2)} kg total` : `${calculation.weight?.toFixed(2)} kg`}
                  </Badge>
                  {calculation.totalCost && calculation.totalCost > 0 && (
                    <Badge variant="outline" className="text-xs text-green-600">
                      ${calculation.totalCost.toFixed(2)}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className={cn(
                "text-muted-foreground",
                isMobile ? "text-xs" : "text-sm"
              )}>
                {calculation.materialName} • {calculation.profileName} • {calculation.dimensions?.length || '?'}m
                {calculation.quantity && calculation.quantity > 1 && ` • ${t('quantity')}: ${calculation.quantity}`}
              </div>
              
              {calculation.notes && (
                <div className={cn(
                  "text-muted-foreground mt-1",
                  isMobile ? "text-xs break-words" : "text-xs truncate"
                )}>
                  {calculation.notes}
                </div>
              )}
              
              <div className={cn(
                "text-muted-foreground mt-2",
                isMobile ? "text-xs" : "text-xs"
              )}>
                {new Date(calculation.timestamp).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          {/* Action Buttons - Mobile Optimized */}
          <div className={cn(
            "flex gap-2 shrink-0",
            isMobile ? "w-full" : "items-center"
          )}>
            <Button
              variant="outline"
              size={isMobile ? "default" : "sm"}
              onClick={onEdit}
              className={cn(
                isMobile ? "flex-1 h-10" : ""
              )}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            
            <Button
              variant="outline"
              size={isMobile ? "default" : "sm"}
              onClick={onRemove}
              className={cn(
                "text-red-600 hover:text-red-700 hover:bg-red-50",
                isMobile ? "flex-1 h-10" : ""
              )}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Material Details Modal Component
function MaterialDetailsModal({ 
  material, 
  isOpen, 
  onClose, 
  onSave, 
  onDelete 
}: MaterialDetailsModalProps) {
  const isMobile = useMediaQuery("(max-width: 767px)")
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
        <DialogContent className={cn(
          isMobile 
            ? "max-w-[95vw] max-h-[90vh] w-full overflow-y-auto" 
            : "max-w-2xl max-h-[90vh] overflow-y-auto"
        )}>
          <DialogHeader>
            <DialogTitle>Material Details</DialogTitle>
            <DialogDescription>
              Update material information and status.
            </DialogDescription>
          </DialogHeader>
          
          {material && (
            <div className={cn(
              "space-y-4",
              isMobile && "space-y-3"
            )}>
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={(formData as any).name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Material name"
                    className={cn(isMobile && "text-base")}
                  />
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status || material.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as MaterialStatus }))}
                  >
                    <SelectTrigger className={cn(isMobile && "h-12")}>
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
                
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes..."
                    className={cn(
                      "min-h-[100px] resize-none",
                      isMobile && "text-base"
                    )}
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className={cn(
            isMobile ? "flex-col gap-2" : "flex-row gap-2"
          )}>
            <div className={cn(
              "flex gap-2",
              isMobile ? "flex-col w-full" : "flex-row"
            )}>
              <Button 
                variant="outline" 
                onClick={onClose}
                className={cn(isMobile && "w-full")}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className={cn(isMobile && "w-full")}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isLoading}
                className={cn(isMobile && "w-full")}
              >
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
        <AlertDialogContent className={cn(isMobile && "max-w-[95vw] w-full")}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Material</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this material? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={cn(
            isMobile ? "flex-col gap-2" : "flex-row gap-2"
          )}>
            <AlertDialogCancel className={cn(isMobile && "w-full")}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className={cn(
                "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                isMobile && "w-full"
              )}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Material'
              )}
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
  const { t, language } = useI18n()
  const isMobile = useMediaQuery("(max-width: 767px)")
  const [selectedCalculations, setSelectedCalculations] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')

  // Reset selections when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedCalculations(new Set())
      setSearchTerm('')
    }
  }, [isOpen])

  const handleAdd = () => {
    onAdd(Array.from(selectedCalculations))
    onClose()
  }

  const handleToggleCalculation = (calculationId: string) => {
    const newSelection = new Set(selectedCalculations)
    if (newSelection.has(calculationId)) {
      newSelection.delete(calculationId)
    } else {
      newSelection.add(calculationId)
    }
    setSelectedCalculations(newSelection)
  }

  // Show all calculations, but disable those already in the project
  const filteredCalculations = allCalculations.filter(calc =>
    searchTerm === '' || 
      calc.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      calc.profileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (calc.name && calc.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        isMobile 
          ? "max-w-[95vw] max-h-[90vh] w-full" 
          : "max-w-4xl max-h-[90vh]"
      )}>
        <DialogHeader>
          <DialogTitle>{language === 'bs' ? 'Dodaj Izračune' : 'Add Calculations'}</DialogTitle>
          <DialogDescription>
            {language === 'bs' ? 'Odaberite izračune iz vaše historije da ih dodate u ovaj projekat.' : 'Select calculations from your history to add to this project.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
placeholder={language === 'bs' ? 'Pretraži izračune...' : 'Search calculations...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                "pl-10",
                isMobile && "text-base h-12"
              )}
            />
          </div>
          
          {/* Calculations List */}
          <div className={cn(
            "border rounded-lg max-h-[50vh] overflow-y-auto",
            isMobile && "max-h-[60vh]"
          )}>
            {filteredCalculations.length === 0 ? (
              <div className="p-8 text-center">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-semibold mb-2">{language === 'bs' ? 'Nema Dostupnih Izračuna' : 'No Calculations Available'}</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 
                    (language === 'bs' ? 'Nijedan izračun ne odgovara vašoj pretrazi.' : 'No calculations match your search.') : 
                    (language === 'bs' ? 'Nema dostupnih izračuna za dodavanje.' : 'No calculations available to add.')
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-1 p-4">
                {filteredCalculations.map((calculation) => {
                  const alreadyInProject = project.calculationIds?.includes(calculation.id)
                  return (
                    <div
                      key={calculation.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                        selectedCalculations.has(calculation.id) && !alreadyInProject && "bg-primary/10 border-primary/20",
                        alreadyInProject ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-muted/50"
                      )}
                      onClick={() => !alreadyInProject && handleToggleCalculation(calculation.id)}
                    >
                      <Checkbox
                        checked={selectedCalculations.has(calculation.id)}
                        onChange={() => handleToggleCalculation(calculation.id)}
                        className="shrink-0"
                        disabled={alreadyInProject}
                      />
                      <Calculator className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-1">
                          <h4 className={cn(
                            "font-medium",
                            isMobile ? "text-sm break-words" : "text-base truncate"
                          )}>
                            {calculation.name || `${calculation.materialName} ${calculation.profileName}`}
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">
                              {calculation.totalWeight ? `${calculation.totalWeight.toFixed(2)} kg` : `${calculation.weight?.toFixed(2)} kg`}
                            </Badge>
                            {calculation.totalCost && calculation.totalCost > 0 && (
                              <Badge variant="outline" className="text-xs text-green-600">
                                ${calculation.totalCost.toFixed(2)}
                              </Badge>
                            )}
                            {alreadyInProject && (
                              <Badge variant="outline" className="text-xs text-gray-500 border-gray-300 ml-2">
                                {language === 'bs' ? 'Već u projektu' : 'Already in project'}
                              </Badge>
                            )}
                          </div>
                          <div className={cn(
                            "text-muted-foreground",
                            isMobile ? "text-xs" : "text-sm"
                          )}>
                            {calculation.materialName} • {calculation.profileName}
                            {calculation.quantity && calculation.quantity > 1 && ` • Qty: ${calculation.quantity}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className={cn(
          isMobile ? "flex-col gap-2" : "flex-row gap-2"
        )}>
          <div className={cn(
            "flex justify-between items-center",
            isMobile ? "w-full" : ""
          )}>
            <span className="text-sm text-muted-foreground">
              {language === 'bs' ? 
                `${selectedCalculations.size} ${selectedCalculations.size === 1 ? 'izračun' : selectedCalculations.size < 5 ? 'izračuna' : 'izračuna'} odabrano` :
                `${selectedCalculations.size} calculation${selectedCalculations.size !== 1 ? 's' : ''} selected`
              }
            </span>
          </div>
          <div className={cn(
            "flex gap-2",
            isMobile ? "w-full flex-col" : ""
          )}>
            <Button 
              variant="outline" 
              onClick={onClose}
              className={cn(isMobile && "w-full")}
            >
              {language === 'bs' ? 'Otkaži' : 'Cancel'}
            </Button>
            <Button 
              onClick={handleAdd}
              disabled={selectedCalculations.size === 0}
              className={cn(isMobile && "w-full")}
            >
              {language === 'bs' ? `Dodaj Odabrane (${selectedCalculations.size})` : `Add Selected (${selectedCalculations.size})`}
            </Button>
          </div>
        </DialogFooter>
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
  const { updateProject, allCalculations, refreshProjects, projects } = useProjects()
  const { t, language } = useI18n()
  const isMobile = useMediaQuery("(max-width: 767px)")
  
  // Local state
  const [showCalculationModal, setShowCalculationModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Get the fresh project data from context (this updates when context refreshes)
  const freshProject = projects.find(p => p.id === project.id) || project

  // Handle add calculations
  const handleAddCalculations = async (calculationIds: string[]) => {
    setIsLoading(true)
    try {
      const existingIds = freshProject.calculationIds || []
      const newIds = calculationIds.filter(id => !existingIds.includes(id))
      
      const updatedProject = {
        ...freshProject,
        calculationIds: [...existingIds, ...newIds],
        updatedAt: new Date()
      }
      
      await updateProject(updatedProject)
      await refreshProjects()
      onUpdate?.()
      
      toast({
        title: language === 'bs' ? 'Izračuni Dodani' : 'Calculations Added',
        description: language === 'bs' ? `Dodano ${newIds.length} izračuna u projekat` : `Added ${newIds.length} calculations to the project`,
      })
    } catch (error) {
      console.error('Failed to add calculations:', error)
      toast({
        title: language === 'bs' ? 'Dodavanje Neuspješno' : 'Add Failed',
        description: language === 'bs' ? 'Neuspješno dodavanje izračuna u projekat' : 'Failed to add calculations to project',
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle edit calculation
  const handleEditCalculation = (calcId: string) => {
    // Update URL parameters to load calculation for editing
    const url = new URL(window.location.href)
    url.searchParams.set('edit', calcId)
    url.searchParams.set('project', project.id)
    
    // Use pushState to avoid navigation - this will trigger the URL parameter handling
    window.history.pushState({}, '', url.toString())
    
    // Reload the page to trigger the URL parameter processing
    window.location.reload()
  }

  // Handle remove calculation
  const handleRemoveCalculation = async (calcId: string) => {
    const calculation = allCalculations.find(c => c.id === calcId)
    
    if (window.confirm(language === 'bs' ? 
      `Jeste li sigurni da želite ukloniti "${calculation?.name || 'ovaj izračun'}" iz ovog projekta?` :
      `Are you sure you want to remove "${calculation?.name || 'this calculation'}" from this project?`)) {
      try {
        // Remove from project
        const updatedProject = {
          ...freshProject,
          calculationIds: freshProject.calculationIds?.filter(id => id !== calcId) || [],
          updatedAt: new Date()
        }
              await updateProject(updatedProject)
      await refreshProjects()
      onUpdate?.()
      
      toast({
          title: language === 'bs' ? 'Izračun Uklonjen' : 'Calculation Removed',
          description: language === 'bs' ? 'Izračun je uklonjen iz projekta.' : 'Calculation has been removed from the project.',
        })
      } catch (error) {
        console.error('Failed to remove calculation:', error)
        toast({
          title: language === 'bs' ? 'Uklanjanje Neuspješno' : 'Remove Failed',
          description: language === 'bs' ? 'Neuspješno uklanjanje izračuna iz projekta' : 'Failed to remove calculation from project',
          variant: "destructive"
        })
      }
    }
  }

  return (
    <div className={cn("space-y-4 md:space-y-6", className)}>
      {/* Header - Mobile Optimized */}
      <div className="space-y-4">
        <div className={cn(
          "flex gap-4",
          isMobile ? "flex-col" : "items-center justify-between"
        )}>
          <h2 className={cn(
            "font-bold",
            isMobile ? "text-xl" : "text-2xl"
          )}>
{language === 'bs' ? 'Projektni Izračuni' : 'Project Calculations'}
          </h2>
          <Button 
            onClick={() => setShowCalculationModal(true)}
            className={cn(
              isMobile ? "w-full h-12" : ""
            )}
          >
            <Plus className="h-4 w-4 mr-2" />
            {language === 'bs' ? 'Dodaj Izračune' : 'Add Calculations'}
          </Button>
        </div>
      </div>

      {/* Project Calculations */}
      {freshProject.calculationIds && freshProject.calculationIds.length > 0 ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className={cn(
              "flex items-center gap-2",
              isMobile ? "text-lg" : "text-xl"
            )}>
              <Calculator className="h-5 w-5" />
{language === 'bs' ? `Izračuni (${freshProject.calculationIds.length})` : `Calculations (${freshProject.calculationIds.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent className={cn(
            isMobile ? "p-3" : "p-6"
          )}>
            <div className={cn(
              "space-y-3",
              isMobile && "space-y-2"
            )}>
              {freshProject.calculationIds.map((calcId) => {
                const calculation = allCalculations.find(c => c.id === calcId)
                if (!calculation) return null
                
                return (
                  <CalculationCard
                    key={calcId}
                    calculation={calculation}
                    project={project}
                    onEdit={() => handleEditCalculation(calcId)}
                    onRemove={() => handleRemoveCalculation(calcId)}
                    isMobile={isMobile}
                  />
                )
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className={cn(
            "text-center",
            isMobile ? "py-8 px-4" : "py-12"
          )}>
            <Calculator className={cn(
              "mx-auto mb-4 opacity-30",
              isMobile ? "h-10 w-10" : "h-12 w-12"
            )} />
            <h3 className={cn(
              "font-semibold mb-2",
              isMobile ? "text-base" : "text-lg"
            )}>
{language === 'bs' ? 'Nema Izračuna' : 'No Calculations'}
            </h3>
            <p className={cn(
              "text-muted-foreground mb-4",
              isMobile ? "text-sm" : "text-base"
            )}>
{language === 'bs' ? 'Dodajte izračune iz vaše historije da ih pratite u ovom projektu.' : 'Add calculations from your history to track them in this project.'}
            </p>
            <Button 
              onClick={() => setShowCalculationModal(true)}
              className={cn(
                isMobile ? "w-full h-12" : ""
              )}
            >
              <Plus className="h-4 w-4 mr-2" />
              {language === 'bs' ? 'Dodaj Izračune' : 'Add Calculations'}
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