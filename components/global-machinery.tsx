"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Wrench, Search, Cog, Edit, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type Machinery } from '@/lib/types'
import { MACHINERY_TYPE_LABELS } from '@/lib/workforce-utils'
import { getAllMachinery, updateMachinery } from '@/lib/database'
import { toast } from '@/hooks/use-toast'
import MachineryForm from './workforce/machinery-form'

export default function GlobalMachinery() {
  const [machinery, setMachinery] = useState<Machinery[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [showMachineryForm, setShowMachineryForm] = useState(false)
  const [editingMachinery, setEditingMachinery] = useState<Machinery | null>(null)

  useEffect(() => {
    loadMachinery()
  }, [])

  const loadMachinery = async () => {
    setLoading(true)
    try {
      const machineryData = await getAllMachinery()
      setMachinery(machineryData)
    } catch (error) {
      console.error('Failed to load machinery:', error)
      toast({
        title: "Load Failed",
        description: "Failed to load machinery data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMachinery = () => {
    setEditingMachinery(null)
    setShowMachineryForm(true)
  }

  const handleEditMachinery = (machine: Machinery) => {
    setEditingMachinery(machine)
    setShowMachineryForm(true)
  }

  const handleToggleMachineryStatus = async (machine: Machinery) => {
    try {
      const updatedMachinery: Machinery = {
        ...machine,
        isActive: !machine.isActive,
        updatedAt: new Date()
      }
      
      await updateMachinery(updatedMachinery)
      await loadMachinery()
      
      toast({
        title: `Machinery ${updatedMachinery.isActive ? 'Activated' : 'Deactivated'}`,
        description: `${machine.name} has been ${updatedMachinery.isActive ? 'activated' : 'deactivated'}.`
      })
    } catch (error) {
      console.error('Failed to update machinery status:', error)
      toast({
        title: "Update Failed",
        description: "Failed to update machinery status.",
        variant: "destructive"
      })
    }
  }

  const filteredMachinery = machinery.filter(machine => {
    const matchesSearch = !searchTerm || 
      machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = showInactive || machine.isActive
    
    return matchesSearch && matchesStatus
  })

  const activeMachineryCount = machinery.filter(m => m.isActive).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Machinery Database</h1>
          <p className="text-muted-foreground">Manage your equipment and machinery</p>
        </div>
        <Button onClick={handleCreateMachinery}>
          <Plus className="h-4 w-4 mr-2" />
          Add Machinery
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Cog className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Active Machinery</p>
              <p className="text-2xl font-bold">{activeMachineryCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search machinery..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Button
              variant={showInactive ? "default" : "outline"}
              onClick={() => setShowInactive(!showInactive)}
              className="flex items-center gap-2"
            >
              {showInactive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {showInactive ? 'Hide Inactive' : 'Show Inactive'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filteredMachinery.map((machine) => (
          <Card key={machine.id} className={cn(
            "hover:bg-muted/30 transition-colors",
            !machine.isActive && "opacity-60"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Wrench className="h-6 w-6 text-orange-600" />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{machine.name}</h3>
                      {!machine.isActive && (
                        <Badge variant="secondary" className="text-xs">Inactive</Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {MACHINERY_TYPE_LABELS[machine.type]}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-2">
                      ${machine.hourlyRate}/hour
                      {machine.model && ` • ${machine.model}`}
                      {machine.serialNumber && ` • SN: ${machine.serialNumber}`}
                    </div>
                    
                    {machine.maintenanceSchedule && (
                      <div className="flex gap-2">
                        {machine.maintenanceSchedule.lastMaintenance && (
                          <Badge variant="secondary" className="text-xs">
                            Last: {new Date(machine.maintenanceSchedule.lastMaintenance).toLocaleDateString()}
                          </Badge>
                        )}
                        {machine.maintenanceSchedule.nextMaintenance && (
                          <Badge variant="outline" className="text-xs">
                            Next: {new Date(machine.maintenanceSchedule.nextMaintenance).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleMachineryStatus(machine)}
                  >
                    {machine.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditMachinery(machine)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredMachinery.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <Cog className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-semibold mb-2">No Machinery Found</h3>
              <p className="text-muted-foreground mb-4">
                Add machinery to your database to get started
              </p>
              <Button onClick={handleCreateMachinery}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Machine
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <MachineryForm
        machinery={editingMachinery}
        isOpen={showMachineryForm}
        onClose={() => {
          setShowMachineryForm(false)
          setEditingMachinery(null)
        }}
        onSave={loadMachinery}
      />
    </div>
  )
} 