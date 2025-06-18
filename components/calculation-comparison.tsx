"use client"

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Archive,
  BarChart3,
  Search,
  Filter,
  MoreVertical,
  Download,
  Play,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Equal,
  Eye,
  FolderOpen
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProjects } from '@/contexts/project-context'
import type { Calculation } from '@/lib/types'
import { toast } from '@/hooks/use-toast'

interface CalculationHistoryProps {
  calculations: Calculation[]
  onLoadCalculation?: (calculation: Calculation) => void
  onMoveToProject?: (calculationId: string, projectId: string) => void
  onAddToComparison?: (calculationId: string) => void
}

interface CalculationComparisonProps {
  calculations: Calculation[]
  selectedCalculations: Set<string>
  onRemoveFromComparison: (calculationId: string) => void
  onLoadCalculation?: (calculation: Calculation) => void
}

interface HistoryFilters {
  projectId?: string
  search?: string
  dateRange?: 'all' | 'today' | 'week' | 'month'
  materialType?: string
  profileType?: string
}

interface ComparisonMetric {
  key: string
  label: string
  getValue: (calc: Calculation) => number | string
  format: (value: number | string) => string
  unit: string
}

const COMPARISON_METRICS: ComparisonMetric[] = [
  {
    key: 'weight',
    label: 'Weight per unit',
    getValue: (calc) => calc.weight || 0,
    format: (value) => `${Number(value).toFixed(2)}`,
    unit: 'kg'
  },
  {
    key: 'totalWeight',
    label: 'Total Weight',
    getValue: (calc) => calc.totalWeight || calc.weight || 0,
    format: (value) => `${Number(value).toFixed(2)}`,
    unit: 'kg'
  },
  {
    key: 'crossSectionalArea',
    label: 'Cross-sectional Area',
    getValue: (calc) => calc.crossSectionalArea || 0,
    format: (value) => `${Number(value).toFixed(2)}`,
    unit: 'cm²'
  },
  {
    key: 'totalCost',
    label: 'Total Cost',
    getValue: (calc) => calc.totalCost || 0,
    format: (value) => `$${Number(value).toFixed(2)}`,
    unit: ''
  },
  {
    key: 'unitCost',
    label: 'Unit Cost',
    getValue: (calc) => calc.unitCost || 0,
    format: (value) => `$${Number(value).toFixed(2)}`,
    unit: ''
  },
  {
    key: 'costPerKg',
    label: 'Cost per kg',
    getValue: (calc) => {
      const totalCost = calc.totalCost || 0
      const totalWeight = calc.totalWeight || calc.weight || 0
      return totalWeight > 0 ? totalCost / totalWeight : 0
    },
    format: (value) => `$${Number(value).toFixed(2)}`,
    unit: '/kg'
  }
]

// History Component - Pure browsing, no comparison
export function CalculationHistory({ 
  calculations, 
  onLoadCalculation,
  onMoveToProject,
  onAddToComparison
}: CalculationHistoryProps) {
  const [historyFilters, setHistoryFilters] = useState<HistoryFilters>({
    projectId: 'all',
    search: '',
    dateRange: 'all',
    materialType: 'all',
    profileType: 'all'
  })
  
  const { projects } = useProjects()

  // Filter calculations based on history filters
  const filteredCalculations = useMemo(() => {
    let filtered = [...calculations]

    // Project filter
    if (historyFilters.projectId && historyFilters.projectId !== 'all') {
      if (historyFilters.projectId === 'none') {
        filtered = filtered.filter(calc => !calc.projectId)
      } else {
        filtered = filtered.filter(calc => calc.projectId === historyFilters.projectId)
      }
    }

    // Search filter
    if (historyFilters.search) {
      const searchLower = historyFilters.search.toLowerCase()
      filtered = filtered.filter(calc => 
        calc.profileName?.toLowerCase().includes(searchLower) ||
        calc.profileType?.toLowerCase().includes(searchLower) ||
        calc.material?.toLowerCase().includes(searchLower) ||
        calc.materialName?.toLowerCase().includes(searchLower)
      )
    }

    // Date range filter
    if (historyFilters.dateRange && historyFilters.dateRange !== 'all') {
      const now = new Date()
      let cutoffDate = new Date()
      
      switch (historyFilters.dateRange) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          cutoffDate.setDate(now.getDate() - 7)
          break
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1)
          break
      }
      
      filtered = filtered.filter(calc => calc.timestamp >= cutoffDate)
    }

    // Material type filter
    if (historyFilters.materialType && historyFilters.materialType !== 'all') {
      filtered = filtered.filter(calc => calc.material === historyFilters.materialType)
    }

    // Profile type filter
    if (historyFilters.profileType && historyFilters.profileType !== 'all') {
      filtered = filtered.filter(calc => calc.profileType === historyFilters.profileType)
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [calculations, historyFilters])

  // Get unique values for filter dropdowns
  const uniqueMaterials = useMemo(() => 
    [...new Set(calculations.map(calc => calc.material).filter(Boolean))], [calculations]
  )
  
  const uniqueProfileTypes = useMemo(() => 
    [...new Set(calculations.map(calc => calc.profileType).filter(Boolean))], [calculations]
  )

  const handleMoveToProject = async (calculationId: string, projectId: string) => {
    if (onMoveToProject) {
      await onMoveToProject(calculationId, projectId)
      toast({
        title: "Calculation Moved",
        description: "Calculation has been moved to the selected project.",
      })
    }
  }

  const exportCalculations = () => {
    const dataStr = JSON.stringify(filteredCalculations, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `calculations-export-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    
    toast({
      title: "Export Successful",
      description: `Exported ${filteredCalculations.length} calculations.`,
    })
  }

  const getProjectName = (projectId?: string) => {
    if (!projectId) return 'No Project'
    const project = projects.find(p => p.id === projectId)
    return project?.name || 'Unknown Project'
  }

  if (calculations.length === 0) {
    return (
      <Card className="backdrop-blur-sm bg-card/90 border-primary/10">
        <CardContent className="text-center py-8">
          <Archive className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">No calculations in history</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="backdrop-blur-sm bg-card/90 border-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Archive className="h-5 w-5 text-primary" />
            Calculation History
            <Badge variant="secondary">{filteredCalculations.length}</Badge>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={exportCalculations}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search calculations..."
              value={historyFilters.search || ''}
              onChange={(e) => setHistoryFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10"
            />
          </div>
          
          <Select
            value={historyFilters.projectId || 'all'}
            onValueChange={(value) => setHistoryFilters(prev => ({ ...prev, projectId: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="none">No Project (General History)</SelectItem>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={historyFilters.dateRange || 'all'}
            onValueChange={(value) => setHistoryFilters(prev => ({ ...prev, dateRange: value as any }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Calculations List */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {filteredCalculations.map((calculation) => (
            <div
              key={calculation.id}
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium">
                    {calculation.name || `${calculation.materialName} ${calculation.profileName}`}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {getProjectName(calculation.projectId)}
                  </Badge>
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
                  {calculation.materialName} • {calculation.profileName}
                  {calculation.quantity && calculation.quantity > 1 && ` • Qty: ${calculation.quantity}`}
                  {calculation.notes && ` • ${calculation.notes}`}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {calculation.timestamp.toLocaleDateString()} at {calculation.timestamp.toLocaleTimeString()}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {onAddToComparison && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAddToComparison(calculation.id)}
                  >
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Compare
                  </Button>
                )}
                
                {onLoadCalculation && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onLoadCalculation(calculation)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Load
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <FolderOpen className="h-4 w-4 mr-1" />
                      Project
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Move to Project</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleMoveToProject(calculation.id, '')}>
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Remove from Project
                    </DropdownMenuItem>
                    {projects.map(project => (
                      <DropdownMenuItem
                        key={project.id}
                        onClick={() => handleMoveToProject(calculation.id, project.id)}
                      >
                        <FolderOpen className="h-4 w-4 mr-2" />
                        {project.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Comparison Component - Only for comparing selected calculations
export function CalculationComparison({ 
  calculations, 
  selectedCalculations,
  onRemoveFromComparison,
  onLoadCalculation
}: CalculationComparisonProps) {
  const [sortBy, setSortBy] = useState<string>('weight')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const compareCalculations = calculations.filter(calc => 
    selectedCalculations.has(calc.id)
  )

  const sortedCalculations = [...compareCalculations].sort((a, b) => {
    const metric = COMPARISON_METRICS.find(m => m.key === sortBy)
    if (!metric) return 0

    const aValue = metric.getValue(a)
    const bValue = metric.getValue(b)
    
    const aNum = typeof aValue === 'number' ? aValue : parseFloat(aValue.toString()) || 0
    const bNum = typeof bValue === 'number' ? bValue : parseFloat(bValue.toString()) || 0

    return sortOrder === 'asc' ? aNum - bNum : bNum - aNum
  })

  const getComparisonIcon = (value: number, baseline: number) => {
    const diff = ((value - baseline) / baseline) * 100
    if (Math.abs(diff) < 1) return <Equal className="h-3 w-3 text-muted-foreground" />
    if (diff > 0) return <TrendingUp className="h-3 w-3 text-green-500 dark:text-green-400" />
    return <TrendingDown className="h-3 w-3 text-red-500 dark:text-red-400" />
  }

  const getPercentageDiff = (value: number, baseline: number) => {
    const diff = ((value - baseline) / baseline) * 100
    const sign = diff > 0 ? '+' : ''
    return `${sign}${diff.toFixed(1)}%`
  }

  if (compareCalculations.length === 0) {
    return (
      <Card className="backdrop-blur-sm bg-card/90 border-primary/10">
        <CardContent className="text-center py-8">
          <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">No calculations selected for comparison</p>
          <p className="text-sm text-muted-foreground mt-2">
            Select calculations from the History tab to compare them here
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="backdrop-blur-sm bg-card/90 border-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Calculation Comparison
            <Badge variant="secondary">{selectedCalculations.size}/5</Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                {COMPARISON_METRICS.map(metric => (
                  <SelectItem key={metric.key} value={metric.key}>
                    {metric.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Calculation</th>
                  {COMPARISON_METRICS.map(metric => (
                    <th key={metric.key} className="text-center p-2 font-medium min-w-[120px]">
                      {metric.label}
                      <br />
                      <span className="text-xs text-muted-foreground">{metric.unit}</span>
                    </th>
                  ))}
                  <th className="text-center p-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedCalculations.map((calculation, index) => {
                  const baseline = sortedCalculations[0]
                  return (
                    <tr key={calculation.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <div>
                          <div className="font-medium">
                            {calculation.name || `${calculation.materialName} ${calculation.profileName}`}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {calculation.materialName} • {calculation.profileName}
                          </div>
                          {calculation.quantity && calculation.quantity > 1 && (
                            <div className="text-xs text-muted-foreground">
                              Qty: {calculation.quantity}
                            </div>
                          )}
                        </div>
                      </td>
                      {COMPARISON_METRICS.map(metric => {
                        const value = metric.getValue(calculation)
                        const numValue = typeof value === 'number' ? value : parseFloat(value.toString()) || 0
                        const baselineValue = typeof metric.getValue(baseline) === 'number' 
                          ? metric.getValue(baseline) as number 
                          : parseFloat(metric.getValue(baseline).toString()) || 0
                        
                        return (
                          <td key={metric.key} className="text-center p-2">
                            <div className="flex items-center justify-center gap-1">
                              <span>{metric.format(value)}</span>
                              {index > 0 && baselineValue > 0 && (
                                <div className="flex items-center gap-1">
                                  {getComparisonIcon(numValue, baselineValue)}
                                  <span className="text-xs text-muted-foreground">
                                    {getPercentageDiff(numValue, baselineValue)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                        )
                      })}
                      <td className="text-center p-2">
                        <div className="flex items-center justify-center gap-1">
                          {onLoadCalculation && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onLoadCalculation(calculation)}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onRemoveFromComparison(calculation.id)}
                          >
                            ×
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

 