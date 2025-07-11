"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  CalendarIcon, 
  Building2, 
  Phone, 
  Mail, 
  MapPin,
  Package,
  Save,
  X
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { DispatchNote, DispatchSupplier, DispatchStatus } from '@/lib/types'
import { useMaterials } from '@/contexts/material-context'
import { useI18n } from '@/contexts/i18n-context'
import { toast } from '@/hooks/use-toast'

interface CreateDispatchNoteProps {
  projectId: string
  onSuccess: (dispatchNote: DispatchNote) => void
  onCancel: () => void
  editingDispatch?: DispatchNote
}

export function CreateDispatchNote({ 
  projectId, 
  onSuccess, 
  onCancel, 
  editingDispatch 
}: CreateDispatchNoteProps) {
  const { createDispatchNote, updateDispatchNote } = useMaterials()
  const { t } = useI18n()

  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    dispatchNumber: editingDispatch?.dispatchNumber || '',
    internalReference: editingDispatch?.internalReference || '',
    date: editingDispatch?.date || new Date(),
    expectedDeliveryDate: editingDispatch?.expectedDeliveryDate || undefined,
    status: editingDispatch?.status || 'pending' as DispatchStatus,
    supplier: editingDispatch?.supplier || {
      name: '',
      contact: '',
      phone: '',
      email: '',
      address: ''
    } as DispatchSupplier,
    trackingNumber: editingDispatch?.trackingNumber || '',
    shippingMethod: editingDispatch?.shippingMethod || '',
    totalValue: editingDispatch?.totalValue || undefined,
    currency: editingDispatch?.currency || 'USD',
    invoiceNumber: editingDispatch?.invoiceNumber || '',
    notes: editingDispatch?.notes || '',
    inspectionRequired: editingDispatch?.inspectionRequired || false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.dispatchNumber.trim()) {
      newErrors.dispatchNumber = t('dispatchNumberRequired')
    }

    if (!formData.supplier.name.trim()) {
      newErrors.supplierName = t('supplierNameRequired')
    }

    if (!formData.supplier.contact.trim()) {
      newErrors.supplierContact = t('supplierContactRequired')
    }

    if (formData.supplier.email && !/\S+@\S+\.\S+/.test(formData.supplier.email)) {
      newErrors.supplierEmail = t('invalidEmailFormat')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const dispatchData = {
        ...formData,
        projectId,
        totalValue: formData.totalValue ? Number(formData.totalValue) : undefined
      }

      if (editingDispatch) {
        const updatedDispatch = {
          ...editingDispatch,
          ...dispatchData,
          updatedAt: new Date()
        }
        await updateDispatchNote(updatedDispatch)
        onSuccess(updatedDispatch)
      } else {
        const dispatchId = await createDispatchNote(dispatchData)
        // Create a mock dispatch note for the callback
        const newDispatch: DispatchNote = {
          ...dispatchData,
          id: dispatchId,
          materials: [],
          inspectionCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        onSuccess(newDispatch)
      }
    } catch (error) {
      console.error('Failed to save dispatch note:', error)
      toast({
        title: t('savingError'),
        description: error instanceof Error ? error.message : t('unknownError'),
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const updateSupplierData = (field: keyof DispatchSupplier, value: string) => {
    setFormData(prev => ({
      ...prev,
      supplier: {
        ...prev.supplier,
        [field]: value
      }
    }))
    // Clear error when user starts typing
    const errorKey = `supplier${field.charAt(0).toUpperCase() + field.slice(1)}`
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {editingDispatch ? t('editDispatchNote') : t('createDispatchNote')}
          </h2>
          <p className="text-muted-foreground">
            {t('enterDispatchDetails')}
          </p>
        </div>
        <Button variant="ghost" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>{t('dispatchInformation')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dispatchNumber">{t('dispatchNumber')} *</Label>
                <Input
                  id="dispatchNumber"
                  value={formData.dispatchNumber}
                  onChange={(e) => updateFormData('dispatchNumber', e.target.value)}
                  placeholder={t('enterDispatchNumber')}
                  className={errors.dispatchNumber ? 'border-destructive' : ''}
                />
                {errors.dispatchNumber && (
                  <p className="text-sm text-destructive">{errors.dispatchNumber}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="internalReference">{t('internalReference')}</Label>
                <Input
                  id="internalReference"
                  value={formData.internalReference}
                  onChange={(e) => updateFormData('internalReference', e.target.value)}
                  placeholder={t('enterInternalReference')}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('dispatchDate')} *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, "PPP") : <span>{t('pickDate')}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => date && updateFormData('date', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>{t('expectedDeliveryDate')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.expectedDeliveryDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.expectedDeliveryDate 
                        ? format(formData.expectedDeliveryDate, "PPP") 
                        : <span>{t('pickDate')}</span>
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.expectedDeliveryDate}
                      onSelect={(date) => updateFormData('expectedDeliveryDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">{t('status')}</Label>
                <Select value={formData.status} onValueChange={(value) => updateFormData('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t('pending')}</SelectItem>
                    <SelectItem value="shipped">{t('shipped')}</SelectItem>
                    <SelectItem value="arrived">{t('arrived')}</SelectItem>
                    <SelectItem value="processed">{t('processed')}</SelectItem>
                    <SelectItem value="cancelled">{t('cancelled')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trackingNumber">{t('trackingNumber')}</Label>
                <Input
                  id="trackingNumber"
                  value={formData.trackingNumber}
                  onChange={(e) => updateFormData('trackingNumber', e.target.value)}
                  placeholder={t('enterTrackingNumber')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Supplier Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>{t('supplierInformation')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplierName">{t('supplierName')} *</Label>
                <Input
                  id="supplierName"
                  value={formData.supplier.name}
                  onChange={(e) => updateSupplierData('name', e.target.value)}
                  placeholder={t('enterSupplierName')}
                  className={errors.supplierName ? 'border-destructive' : ''}
                />
                {errors.supplierName && (
                  <p className="text-sm text-destructive">{errors.supplierName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplierContact">{t('contactPerson')} *</Label>
                <Input
                  id="supplierContact"
                  value={formData.supplier.contact}
                  onChange={(e) => updateSupplierData('contact', e.target.value)}
                  placeholder={t('enterContactPerson')}
                  className={errors.supplierContact ? 'border-destructive' : ''}
                />
                {errors.supplierContact && (
                  <p className="text-sm text-destructive">{errors.supplierContact}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplierPhone">{t('phoneNumber')}</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="supplierPhone"
                    value={formData.supplier.phone}
                    onChange={(e) => updateSupplierData('phone', e.target.value)}
                    placeholder={t('enterPhoneNumber')}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplierEmail">{t('emailAddress')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="supplierEmail"
                    type="email"
                    value={formData.supplier.email}
                    onChange={(e) => updateSupplierData('email', e.target.value)}
                    placeholder={t('enterEmailAddress')}
                    className={cn("pl-10", errors.supplierEmail ? 'border-destructive' : '')}
                  />
                </div>
                {errors.supplierEmail && (
                  <p className="text-sm text-destructive">{errors.supplierEmail}</p>
                )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="supplierAddress">{t('address')}</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-muted-foreground h-4 w-4" />
                  <Textarea
                    id="supplierAddress"
                    value={formData.supplier.address}
                    onChange={(e) => updateSupplierData('address', e.target.value)}
                    placeholder={t('enterSupplierAddress')}
                    className="pl-10 resize-none"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('financialInformation')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalValue">{t('totalValue')}</Label>
                <Input
                  id="totalValue"
                  type="number"
                  step="0.01"
                  value={formData.totalValue || ''}
                  onChange={(e) => updateFormData('totalValue', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder={t('enterTotalValue')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">{t('currency')}</Label>
                <Select value={formData.currency} onValueChange={(value) => updateFormData('currency', value)}>
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

              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">{t('invoiceNumber')}</Label>
                <Input
                  id="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={(e) => updateFormData('invoiceNumber', e.target.value)}
                  placeholder={t('enterInvoiceNumber')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Details */}
        <Card>
          <CardHeader>
            <CardTitle>{t('additionalDetails')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shippingMethod">{t('shippingMethod')}</Label>
              <Input
                id="shippingMethod"
                value={formData.shippingMethod}
                onChange={(e) => updateFormData('shippingMethod', e.target.value)}
                placeholder={t('enterShippingMethod')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t('notes')}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => updateFormData('notes', e.target.value)}
                placeholder={t('enterNotesAboutDispatch')}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="inspectionRequired"
                checked={formData.inspectionRequired}
                onCheckedChange={(checked) => updateFormData('inspectionRequired', checked)}
              />
              <Label htmlFor="inspectionRequired">{t('inspectionRequired')}</Label>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading 
              ? t('saving') 
              : editingDispatch 
                ? t('updateDispatchNote') 
                : t('createDispatchNote')
            }
          </Button>
        </div>
      </form>
    </div>
  )
}