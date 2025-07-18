"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Package,
  Truck,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  BarChart3,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Project } from '@/lib/types'
import { 
  getProjectMaterialAllocationSummary,
  syncAllDispatchNotesForProject
} from '@/lib/dispatch-materials-sync'
import { toast } from '@/hooks/use-toast'
import { useI18n } from '@/contexts/i18n-context'

interface MaterialAllocationDashboardProps {
  project: Project
  onUpdate?: () => void
  className?: string
}

interface AllocationSummary {
  totalRequired: number
  totalDelivered: number
  totalInstalled: number
  totalWeight: number
  totalCost: number
  materialShortfalls: Array<{
    materialName: string
    profile: string
    grade: string
    requiredQuantity: number
    deliveredQuantity: number
    shortfall: number
  }>
  costAnalysis: {
    budgetedCost: number
    actualCost: number
    variance: number
    variancePercentage: number
  }
}

export default function MaterialAllocationDashboard({ 
  project, 
  onUpdate, 
  className 
}: MaterialAllocationDashboardProps) {
  const { t } = useI18n()
  const [summary, setSummary] = useState<AllocationSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  // Load allocation summary
  const loadSummary = async () => {
    setIsLoading(true)
    try {
      const allocationSummary = await getProjectMaterialAllocationSummary(project.id)
      setSummary(allocationSummary)
    } catch (error) {
      console.error('Failed to load allocation summary:', error)
      toast({
        title: 'Error',
        description: 'Failed to load material allocation summary',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Sync with dispatch notes
  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const result = await syncAllDispatchNotesForProject(project.id, {
        createIfNotExists: true,
        updateExisting: true,
        syncStatus: true
      })

      toast({
        title: 'Sync Complete',
        description: `${result.materialsCreated} materials created, ${result.materialsUpdated} updated`,
      })

      // Reload summary and notify parent
      await loadSummary()
      onUpdate?.()

    } catch (error) {
      console.error('Failed to sync dispatch notes:', error)
      toast({
        title: 'Sync Failed',
        description: 'Failed to sync dispatch notes with project materials',
        variant: 'destructive'
      })
    } finally {
      setIsSyncing(false)
    }
  }

  useEffect(() => {
    loadSummary()
  }, [project.id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (!summary) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
          <p className="text-muted-foreground">Unable to load material allocation data</p>
        </CardContent>
      </Card>
    )
  }

  const deliveryProgress = summary.totalRequired > 0 
    ? (summary.totalDelivered / summary.totalRequired) * 100 
    : 0

  const installationProgress = summary.totalDelivered > 0 
    ? (summary.totalInstalled / summary.totalDelivered) * 100 
    : 0

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Material Allocation Dashboard</h3>
          <p className="text-sm text-muted-foreground">
            Track material requirements, deliveries, and utilization
          </p>
        </div>
        <Button 
          onClick={handleSync} 
          disabled={isSyncing}
          variant="outline"
          size="sm"
        >
          {isSyncing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Sync with Dispatches
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <div>
                <p className="text-xs text-muted-foreground">Required</p>
                <p className="text-lg font-semibold">{summary.totalRequired}</p>
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
                <p className="text-lg font-semibold">{summary.totalDelivered}</p>
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
                <p className="text-lg font-semibold">{summary.totalInstalled}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-xs text-muted-foreground">Total Weight</p>
                <p className="text-lg font-semibold">{summary.totalWeight.toFixed(1)} kg</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delivery Progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Delivery Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Delivered</span>
                <span>{summary.totalDelivered} / {summary.totalRequired}</span>
              </div>
              <Progress value={deliveryProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {deliveryProgress.toFixed(1)}% of required materials delivered
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Installation Progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Installation Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Installed</span>
                <span>{summary.totalInstalled} / {summary.totalDelivered}</span>
              </div>
              <Progress value={installationProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {installationProgress.toFixed(1)}% of delivered materials installed
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Analysis */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Cost Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Actual Cost</p>
              <p className="text-lg font-semibold">${summary.costAnalysis.actualCost.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Budgeted Cost</p>
              <p className="text-lg font-semibold">${summary.costAnalysis.budgetedCost.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Variance</p>
              <div className="flex items-center justify-center gap-1">
                {summary.costAnalysis.variance >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                )}
                <p className={cn(
                  "text-lg font-semibold",
                  summary.costAnalysis.variance >= 0 ? "text-red-600" : "text-green-600"
                )}>
                  ${Math.abs(summary.costAnalysis.variance).toFixed(2)}
                </p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Variance %</p>
              <p className={cn(
                "text-lg font-semibold",
                summary.costAnalysis.variancePercentage >= 0 ? "text-red-600" : "text-green-600"
              )}>
                {summary.costAnalysis.variancePercentage >= 0 ? '+' : ''}
                {summary.costAnalysis.variancePercentage.toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Material Shortfalls */}
      {summary.materialShortfalls.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Material Shortfalls
              <Badge variant="destructive" className="ml-2">
                {summary.materialShortfalls.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.materialShortfalls.map((shortfall, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div>
                    <p className="font-medium">{shortfall.materialName}</p>
                    <p className="text-sm text-muted-foreground">
                      {shortfall.profile} • {shortfall.grade}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      <span className="text-red-600 font-medium">{shortfall.shortfall}</span>
                      <span className="text-muted-foreground"> short</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {shortfall.deliveredQuantity} / {shortfall.requiredQuantity} delivered
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}