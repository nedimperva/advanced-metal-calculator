"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Calendar,
  Building2,
  FileText,
  MoreHorizontal
} from "lucide-react"
import { format } from "date-fns"
import type { DispatchNote, DispatchStatus } from '@/lib/types'
import { useMaterials } from '@/contexts/material-context'
import { useI18n } from '@/contexts/i18n-context'
import { toast } from '@/hooks/use-toast'
import { onDispatchNoteUpdated } from '@/lib/dispatch-materials-sync'
import { getDispatchNote as dbGetDispatchNote, getDispatchMaterials as dbGetDispatchMaterials } from '@/lib/database'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DispatchNotesListProps {
  projectId: string
  onCreateNew: () => void
  onEditDispatch: (dispatch: DispatchNote) => void
  onViewDispatch: (dispatch: DispatchNote) => void
}

const statusIcons = {
  pending: Clock,
  shipped: Truck,
  arrived: CheckCircle,
  processed: Package,
  cancelled: AlertCircle
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  shipped: 'bg-blue-100 text-blue-800 border-blue-200',
  arrived: 'bg-green-100 text-green-800 border-green-200',
  processed: 'bg-purple-100 text-purple-800 border-purple-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200'
}

export function DispatchNotesList({ 
  projectId, 
  onCreateNew, 
  onEditDispatch, 
  onViewDispatch 
}: DispatchNotesListProps) {
  const { 
    getProjectDispatches, 
    getFilteredDispatches,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    clearFilters,
    getDispatchSummary,
    deleteDispatchNote,
    refreshMaterials
  } = useMaterials()
  const { t } = useI18n()

  const [showFilters, setShowFilters] = useState(false)

  const projectDispatches = getProjectDispatches(projectId)
  const summary = getDispatchSummary(projectId)

  const handleStatusChange = (status: DispatchStatus | 'all') => {
    setStatusFilter(status)
  }

  const handleDeleteDispatch = async (dispatchId: string) => {
    if (confirm(t('confirmDeleteDispatch'))) {
      try {
        await deleteDispatchNote(dispatchId)
      } catch (error) {
        console.error('Failed to delete dispatch note:', error)
      }
    }
  }

  const handleSyncNow = async (dispatch: DispatchNote) => {
    try {
      const fresh = await dbGetDispatchNote(dispatch.id)
      if (fresh) {
        const materials = await dbGetDispatchMaterials(dispatch.id)
        await onDispatchNoteUpdated({ ...fresh, materials } as any)
      } else {
        await onDispatchNoteUpdated(dispatch)
      }
      await refreshMaterials()
      toast({ title: t('success'), description: t('synchronized') })
    } catch (error) {
      toast({ title: t('syncFailed'), description: error instanceof Error ? error.message : t('unknownError'), variant: 'destructive' })
    }
  }

  const StatusIcon = ({ status }: { status: DispatchStatus }) => {
    const Icon = statusIcons[status]
    return <Icon className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('totalDispatches')}</p>
                <p className="text-2xl font-bold">{summary.totalDispatches}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Truck className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('pending')}</p>
                <p className="text-2xl font-bold">{summary.pendingDispatches}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('arrived')}</p>
                <p className="text-2xl font-bold">{summary.arrivedDispatches}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('totalMaterials')}</p>
                <p className="text-2xl font-bold">{summary.totalMaterials}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('dispatchNotes')}</h2>
          <p className="text-muted-foreground">
            {t('manageIncomingMaterials')}
          </p>
        </div>
        <Button onClick={onCreateNew} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>{t('newDispatchNote')}</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t('searchDispatches')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>{t('filters')}</span>
              </Button>
            </div>

            {showFilters && (
              <div className="flex flex-wrap gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>{t('status')}</Label>
                  <Select value={statusFilter} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allStatuses')}</SelectItem>
                      <SelectItem value="pending">{t('pending')}</SelectItem>
                      <SelectItem value="shipped">{t('shipped')}</SelectItem>
                      <SelectItem value="arrived">{t('arrived')}</SelectItem>
                      <SelectItem value="processed">{t('processed')}</SelectItem>
                      <SelectItem value="cancelled">{t('cancelled')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="ghost" onClick={clearFilters}>
                    {t('clearFilters')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dispatch Notes List */}
      <div className="space-y-4">
        {projectDispatches.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('noDispatchNotes')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('noDispatchNotesDescription')}
              </p>
              <Button onClick={onCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                {t('createFirstDispatchNote')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          projectDispatches.map((dispatch) => (
            <Card key={dispatch.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <StatusIcon status={dispatch.status} />
                        <Badge 
                          variant="outline" 
                          className={statusColors[dispatch.status]}
                        >
                          {t(dispatch.status)}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold">
                        {dispatch.dispatchNumber}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{dispatch.supplier.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{format(dispatch.date, 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span>{dispatch.materials.length} {t('materials')}</span>
                      </div>
                      {dispatch.totalValue && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            ${dispatch.totalValue.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {dispatch.notes && (
                      <div className="flex items-start space-x-2">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {dispatch.notes}
                        </p>
                      </div>
                    )}

                    {dispatch.expectedDeliveryDate && (
                      <div className="text-sm text-muted-foreground">
                        {t('expectedDelivery')}: {format(dispatch.expectedDeliveryDate, 'MMM dd, yyyy')}
                      </div>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewDispatch(dispatch)}>
                        {t('viewDetails')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditDispatch(dispatch)}>
                        {t('edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSyncNow(dispatch)}>
                        Sync now
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteDispatch(dispatch.id)}
                        className="text-destructive"
                      >
                        {t('delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}