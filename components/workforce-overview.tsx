"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Users,
  Settings,
  Clock,
  Building
} from 'lucide-react'
import { getAllWorkers, getAllMachinery } from '@/lib/database'
import { useI18n } from '@/contexts/i18n-context'
import { LoadingSpinner } from '@/components/loading-states'
import type { Worker, Machinery } from '@/lib/types'

interface WorkforceStats {
  totalWorkers: number
  activeWorkers: number
  totalMachinery: number
  activeMachinery: number
}

export default function WorkforceOverview() {
  const [stats, setStats] = useState<WorkforceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { t } = useI18n()

  useEffect(() => {
    const fetchWorkforceData = async () => {
      try {
        const [workers, machinery] = await Promise.all([
          getAllWorkers(),
          getAllMachinery()
        ])

        const workforceStats: WorkforceStats = {
          totalWorkers: workers.length,
          activeWorkers: workers.filter(w => w.isActive).length,
          totalMachinery: machinery.length,
          activeMachinery: machinery.filter(m => m.isActive).length
        }

        setStats(workforceStats)
      } catch (error) {
        console.error('Failed to fetch workforce data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWorkforceData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Data</h3>
          <p className="text-muted-foreground">
            Unable to load workforce information. Please try again.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Workforce Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Workers</p>
                <p className="text-2xl font-bold">{stats.totalWorkers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Labor Hours</p>
                <p className="text-2xl font-bold">24</p>
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
                <p className="text-sm text-muted-foreground">Machine Hours</p>
                <p className="text-2xl font-bold">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Labor Costs</p>
                <p className="text-2xl font-bold">$1,040</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}