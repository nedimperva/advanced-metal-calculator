"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Users,
  Settings,
  DollarSign,
  BarChart3
} from 'lucide-react'
import { calculateProjectStatistics, type ProjectStatistics } from '@/lib/project-utils'
import { useI18n } from '@/contexts/i18n-context'
import { LoadingSpinner } from '@/components/loading-states'

export default function WorkforceOverview() {
  const [statistics, setStatistics] = useState<ProjectStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const { t } = useI18n()

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const stats = await calculateProjectStatistics()
        setStatistics(stats)
      } catch (error) {
        console.error('Failed to fetch statistics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStatistics()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (!statistics || statistics.workforceStats.projectsWithWorkforce === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Workforce Data</h3>
          <p className="text-muted-foreground">
            No projects with workforce data found. Start tracking time in the Daily Journal.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">{t('workforceOverview')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('totalLaborHours')}</p>
                <p className="text-2xl font-bold">{statistics.workforceStats.totalLaborHours.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Settings className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('machineHours')}</p>
                <p className="text-2xl font-bold">{statistics.workforceStats.totalMachineryHours.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('laborCosts')}</p>
                <p className="text-2xl font-bold">${statistics.totalWorkforceCosts.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('activeProjects')}</p>
                <p className="text-2xl font-bold">{statistics.workforceStats.projectsWithWorkforce}</p>
                <p className="text-xs text-muted-foreground">{t('withWorkforce')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}