"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Users,
  Settings,
  Clock,
  DollarSign
} from 'lucide-react'
import { getAllWorkers, getAllMachinery, getDailyJournalTimesheetByDate } from '@/lib/database'
import { useI18n } from '@/contexts/i18n-context'
import { LoadingSpinner } from '@/components/loading-states'
import type { Worker, Machinery } from '@/lib/types'
import { eachDayOfInterval, startOfMonth, endOfMonth, format } from 'date-fns'

interface WorkforceStats {
  totalWorkers: number
  monthlyLaborHours: number
  monthlyMachineHours: number
  monthlyLaborCosts: number
}

export default function WorkforceOverview() {
  const [stats, setStats] = useState<WorkforceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { t } = useI18n()

  useEffect(() => {
    const fetchWorkforceData = async () => {
      try {
        const workers = await getAllWorkers()
        
        // Get current month date range
        const now = new Date()
        const monthStart = startOfMonth(now)
        const monthEnd = endOfMonth(now)
        const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
        
        let monthlyLaborHours = 0
        let monthlyMachineHours = 0
        let monthlyLaborCosts = 0
        
        // Calculate monthly statistics from daily timesheets
        for (const day of daysInMonth) {
          try {
            const timesheet = await getDailyJournalTimesheetByDate(day)
            if (timesheet) {
              // Sum worker hours and costs
              timesheet.workerEntries.forEach(entry => {
                const dailyHours = entry.projectHours.reduce((sum, ph) => sum + ph.hours, 0)
                const dailyCost = entry.projectHours.reduce((sum, ph) => sum + ph.cost, 0)
                monthlyLaborHours += dailyHours
                monthlyLaborCosts += dailyCost
              })
              
              // Sum machinery hours
              timesheet.machineryEntries.forEach(entry => {
                const dailyHours = entry.projectHours.reduce((sum, ph) => sum + ph.hours, 0)
                monthlyMachineHours += dailyHours
              })
            }
          } catch (error) {
            // Skip days with errors
            continue
          }
        }

        const workforceStats: WorkforceStats = {
          totalWorkers: workers.length,
          monthlyLaborHours: Math.round(monthlyLaborHours * 10) / 10, // Round to 1 decimal
          monthlyMachineHours: Math.round(monthlyMachineHours * 10) / 10,
          monthlyLaborCosts: Math.round(monthlyLaborCosts)
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

  const currentMonth = format(new Date(), 'MMMM yyyy')

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Workforce Overview - {currentMonth}</h3>
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
                <p className="text-sm text-muted-foreground">Monthly Labor Hours</p>
                <p className="text-2xl font-bold">{stats.monthlyLaborHours}</p>
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
                <p className="text-sm text-muted-foreground">Monthly Machine Hours</p>
                <p className="text-2xl font-bold">{stats.monthlyMachineHours}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Labor Costs</p>
                <p className="text-2xl font-bold">${stats.monthlyLaborCosts.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}