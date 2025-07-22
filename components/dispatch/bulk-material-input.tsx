"use client"

import React, { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { 
  Plus, 
  Trash2, 
  Download, 
  Upload, 
  Package, 
  Copy,
  Save,
  X,
  FileText,
  Calculator
} from "lucide-react"
import { toast } from '@/hooks/use-toast'
import type { DispatchMaterial, DispatchMaterialStatus, MaterialCatalog } from '@/lib/types'
import { MATERIALS } from '@/lib/metal-data'
import { LENGTH_UNITS, WEIGHT_UNITS } from '@/lib/unit-conversions'
import { useMaterials } from '@/contexts/material-context'
import { useMaterialCatalog } from '@/contexts/material-catalog-context'
import { useI18n } from '@/contexts/i18n-context'

interface BulkMaterialInputProps {
  dispatchNoteId: string
  onSuccess: () => void
  onCancel: () => void
  existingMaterials?: DispatchMaterial[]
}

interface MaterialFormData {
  id: string
  materialType: string
  profile: string
  grade: string
  dimensions: {
    length?: number
    width?: number
    height?: number
    thickness?: number
    diameter?: number
  }
  quantity: number
  unitWeight: number
  totalWeight: number
  lengthUnit: string
  weightUnit: string
  unitCost?: number
  totalCost?: number
  currency?: string
  status: DispatchMaterialStatus
  location?: string
  notes?: string
}

const PROFILE_TYPES = [
  'I-beam',
  'H-beam',
  'Channel',
  'Angle',
  'Flat Bar',
  'Round Bar',
  'Square Tube',
  'Rectangular Tube',
  'Pipe',
  'Plate',
  'Sheet'
]

const DEFAULT_MATERIAL: Omit<MaterialFormData, 'id'> = {
  materialType: '',
  profile: '',
  grade: '',
  dimensions: {},
  quantity: 1,
  unitWeight: 0,
  totalWeight: 0,
  lengthUnit: 'mm',
  weightUnit: 'kg',
  status: 'pending',
  currency: 'USD'
}

export function BulkMaterialInput({ 
  dispatchNoteId, 
  onSuccess, 
  onCancel, 
  existingMaterials = [] 
}: BulkMaterialInputProps) {
  const { bulkAddMaterials } = useMaterials()
  const { materials: catalogMaterials, loadMaterials, createMaterial } = useMaterialCatalog()
  const { t } = useI18n()

  const [materials, setMaterials] = useState<MaterialFormData[]>(() => {
    if (existingMaterials.length > 0) {
      return existingMaterials.map(material => ({
        id: material.id,
        materialType: material.materialType,
        profile: material.profile,
        grade: material.grade,
        dimensions: material.dimensions,
        quantity: material.quantity,
        unitWeight: material.unitWeight,
        totalWeight: material.totalWeight,
        lengthUnit: material.lengthUnit,
        weightUnit: material.weightUnit,
        unitCost: material.unitCost,
        totalCost: material.totalCost,
        currency: material.currency,
        status: material.status,
        location: material.location,
        notes: material.notes
      }))
    }
    return [{ ...DEFAULT_MATERIAL, id: generateId() }]
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false)

  // Load catalog materials on component mount
  useEffect(() => {
    loadMaterials()
  }, [loadMaterials])

  // Handle adding new material to catalog
  const handleAddToCatalog = async (materialData: Omit<MaterialCatalog, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => {
    try {
      await createMaterial(materialData)
      toast({
        title: "Success",
        description: "Material added to catalog successfully",
      })
      setShowAddMaterialModal(false)
      // Reload materials to include the new one
      loadMaterials()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add material to catalog",
        variant: "destructive"
      })
    }
  }

  function generateId() {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const addMaterial = () => {
    setMaterials(prev => [...prev, { ...DEFAULT_MATERIAL, id: generateId() }])
  }

  const removeMaterial = (id: string) => {
    if (materials.length > 1) {
      setMaterials(prev => prev.filter(m => m.id !== id))
    }
  }

  const updateMaterial = useCallback((id: string, field: keyof MaterialFormData, value: any) => {
    setMaterials(prev => prev.map(material => {
      if (material.id === id) {
        const updated = { ...material, [field]: value }
        
        // Auto-calculate total weight when quantity or unit weight changes
        if (field === 'quantity' || field === 'unitWeight') {
          updated.totalWeight = updated.quantity * updated.unitWeight
        }
        
        // Auto-calculate total cost when quantity or unit cost changes
        if (field === 'quantity' || field === 'unitCost') {
          if (updated.unitCost) {
            updated.totalCost = updated.quantity * updated.unitCost
          }
        }
        
        return updated
      }
      return material
    }))
  }, [])

  const updateDimension = useCallback((id: string, dimension: string, value: number) => {
    setMaterials(prev => prev.map(material => {
      if (material.id === id) {
        return {
          ...material,
          dimensions: {
            ...material.dimensions,
            [dimension]: value
          }
        }
      }
      return material
    }))
  }, [])

  const duplicateMaterial = (id: string) => {
    const material = materials.find(m => m.id === id)
    if (material) {
      const duplicate = { ...material, id: generateId() }
      setMaterials(prev => [...prev, duplicate])
    }
  }

  const validateMaterials = () => {
    const newErrors: Record<string, string> = {}
    
    materials.forEach((material, index) => {
      if (!material.materialType) {
        newErrors[`${material.id}.materialType`] = t('materialTypeRequired')
      }
      if (!material.profile) {
        newErrors[`${material.id}.profile`] = t('profileRequired')
      }
      if (!material.grade) {
        newErrors[`${material.id}.grade`] = t('gradeRequired')
      }
      if (material.quantity <= 0) {
        newErrors[`${material.id}.quantity`] = t('quantityMustBePositive')
      }
      if (material.unitWeight <= 0) {
        newErrors[`${material.id}.unitWeight`] = t('unitWeightMustBePositive')
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateMaterials()) {
      toast({
        title: t('validationError'),
        description: t('pleaseFixErrors'),
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      const materialsToAdd = materials.map(({ id, ...material }) => ({
        ...material,
        totalWeight: material.quantity * material.unitWeight,
        totalCost: material.unitCost ? material.quantity * material.unitCost : undefined
      }))

      await bulkAddMaterials(dispatchNoteId, materialsToAdd)
      onSuccess()
    } catch (error) {
      console.error('Failed to add materials:', error)
      toast({
        title: t('savingError'),
        description: error instanceof Error ? error.message : t('unknownError'),
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const exportTemplate = () => {
    const csvData = [
      'Material Type,Profile,Grade,Length,Width,Height,Thickness,Diameter,Quantity,Unit Weight,Unit Cost,Location,Notes',
      'Steel,I-beam,A572-50,6000,,200,12,,10,45.2,125.50,Warehouse A,Sample material',
      'Aluminum,Channel,6061-T6,3000,100,50,8,,25,8.7,45.00,Warehouse B,',
    ].join('\n')

    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'material-import-template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importFromCSV = () => {
    // TODO: Implement CSV import functionality
    toast({
      title: t('featureNotImplemented'),
      description: t('csvImportComingSoon'),
      variant: "default"
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('bulkMaterialInput')}</h2>
          <p className="text-muted-foreground">
            {t('addMultipleMaterialsToDispatch')}
          </p>
        </div>
        <Button variant="ghost" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Import/Export Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" onClick={exportTemplate}>
              <Download className="h-4 w-4 mr-2" />
              {t('downloadTemplate')}
            </Button>
            <Button variant="outline" onClick={importFromCSV}>
              <Upload className="h-4 w-4 mr-2" />
              {t('importFromCSV')}
            </Button>
            <div className="flex-1" />
            <Button onClick={addMaterial}>
              <Plus className="h-4 w-4 mr-2" />
              {t('addMaterial')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Materials List */}
      <div className="space-y-4">
        {materials.map((material, index) => (
          <Card key={material.id}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {t('material')} #{index + 1}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => duplicateMaterial(material.id)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  {materials.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMaterial(material.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Material Specification */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t('materialType')} *</Label>
                  <Select
                    value={material.materialType}
                    onValueChange={(value) => updateMaterial(material.id, 'materialType', value)}
                  >
                    <SelectTrigger className={errors[`${material.id}.materialType`] ? 'border-destructive' : ''}>
                      <SelectValue placeholder={t('selectMaterial')} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(MATERIALS).map(materialKey => (
                        <SelectItem key={materialKey} value={materialKey}>
                          {materialKey}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors[`${material.id}.materialType`] && (
                    <p className="text-sm text-destructive">{errors[`${material.id}.materialType`]}</p>
                  )}
                  
                  {/* Database Integration Helper */}
                  {material.materialType && !catalogMaterials.some(cm => cm.name.toLowerCase().includes(material.materialType.toLowerCase())) && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                        <Package className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm text-yellow-700">
                          Material not in catalog database
                        </span>
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-blue-600 hover:text-blue-700"
                          onClick={() => setShowAddMaterialModal(true)}
                        >
                          Add to Catalog
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t('profile')} *</Label>
                  <Select
                    value={material.profile}
                    onValueChange={(value) => updateMaterial(material.id, 'profile', value)}
                  >
                    <SelectTrigger className={errors[`${material.id}.profile`] ? 'border-destructive' : ''}>
                      <SelectValue placeholder={t('selectProfile')} />
                    </SelectTrigger>
                    <SelectContent>
                      {PROFILE_TYPES.map(profile => (
                        <SelectItem key={profile} value={profile}>
                          {profile}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors[`${material.id}.profile`] && (
                    <p className="text-sm text-destructive">{errors[`${material.id}.profile`]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t('grade')} *</Label>
                  <Input
                    value={material.grade}
                    onChange={(e) => updateMaterial(material.id, 'grade', e.target.value)}
                    placeholder={t('enterGrade')}
                    className={errors[`${material.id}.grade`] ? 'border-destructive' : ''}
                  />
                  {errors[`${material.id}.grade`] && (
                    <p className="text-sm text-destructive">{errors[`${material.id}.grade`]}</p>
                  )}
                </div>
              </div>

              {/* Dimensions */}
              <div>
                <Label className="text-sm font-medium">{t('dimensions')}</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{t('length')}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={material.dimensions.length || ''}
                      onChange={(e) => updateDimension(material.id, 'length', Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{t('width')}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={material.dimensions.width || ''}
                      onChange={(e) => updateDimension(material.id, 'width', Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{t('height')}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={material.dimensions.height || ''}
                      onChange={(e) => updateDimension(material.id, 'height', Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{t('thickness')}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={material.dimensions.thickness || ''}
                      onChange={(e) => updateDimension(material.id, 'thickness', Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{t('diameter')}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={material.dimensions.diameter || ''}
                      onChange={(e) => updateDimension(material.id, 'diameter', Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Quantity and Weight */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>{t('quantity')} *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={material.quantity}
                    onChange={(e) => updateMaterial(material.id, 'quantity', Number(e.target.value))}
                    className={errors[`${material.id}.quantity`] ? 'border-destructive' : ''}
                  />
                  {errors[`${material.id}.quantity`] && (
                    <p className="text-sm text-destructive">{errors[`${material.id}.quantity`]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t('unitWeight')} *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={material.unitWeight}
                    onChange={(e) => updateMaterial(material.id, 'unitWeight', Number(e.target.value))}
                    className={errors[`${material.id}.unitWeight`] ? 'border-destructive' : ''}
                  />
                  {errors[`${material.id}.unitWeight`] && (
                    <p className="text-sm text-destructive">{errors[`${material.id}.unitWeight`]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t('totalWeight')}</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={material.totalWeight.toFixed(2)}
                      disabled
                      className="bg-muted"
                    />
                    <Select
                      value={material.weightUnit}
                      onValueChange={(value) => updateMaterial(material.id, 'weightUnit', value)}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {WEIGHT_UNITS.map(unit => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('lengthUnit')}</Label>
                  <Select
                    value={material.lengthUnit}
                    onValueChange={(value) => updateMaterial(material.id, 'lengthUnit', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LENGTH_UNITS.map(unit => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Cost and Status */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>{t('unitCost')}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={material.unitCost || ''}
                    onChange={(e) => updateMaterial(material.id, 'unitCost', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('totalCost')}</Label>
                  <Input
                    value={material.totalCost?.toFixed(2) || '0.00'}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('status')}</Label>
                  <Select
                    value={material.status}
                    onValueChange={(value) => updateMaterial(material.id, 'status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">{t('pending')}</SelectItem>
                      <SelectItem value="arrived">{t('arrived')}</SelectItem>
                      <SelectItem value="allocated">{t('allocated')}</SelectItem>
                      <SelectItem value="used">{t('used')}</SelectItem>
                      <SelectItem value="damaged">{t('damaged')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('location')}</Label>
                  <Input
                    value={material.location || ''}
                    onChange={(e) => updateMaterial(material.id, 'location', e.target.value)}
                    placeholder={t('storageLocation')}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>{t('notes')}</Label>
                <Textarea
                  value={material.notes || ''}
                  onChange={(e) => updateMaterial(material.id, 'notes', e.target.value)}
                  placeholder={t('additionalNotes')}
                  rows={2}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge variant="outline">
                {materials.length} {t('materials')}
              </Badge>
              <Badge variant="outline">
                {t('totalWeight')}: {materials.reduce((sum, m) => sum + m.totalWeight, 0).toFixed(2)} kg
              </Badge>
              {materials.some(m => m.totalCost) && (
                <Badge variant="outline">
                  {t('totalCost')}: ${materials.reduce((sum, m) => sum + (m.totalCost || 0), 0).toFixed(2)}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? t('saving') : t('addMaterials')}
        </Button>
      </div>

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