"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, User, Search, Users, Edit, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type Worker } from '@/lib/types'
import { WORKER_SKILL_LABELS } from '@/lib/workforce-utils'
import { getAllWorkers, updateWorker } from '@/lib/database'
import { toast } from '@/hooks/use-toast'
import WorkerForm from './workforce/worker-form'

export default function GlobalWorkers() {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [showWorkerForm, setShowWorkerForm] = useState(false)
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null)

  useEffect(() => {
    loadWorkers()
  }, [])

  const loadWorkers = async () => {
    setLoading(true)
    try {
      const workersData = await getAllWorkers()
      setWorkers(workersData)
    } catch (error) {
      console.error('Failed to load workers:', error)
      toast({
        title: "Load Failed",
        description: "Failed to load workers data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWorker = () => {
    setEditingWorker(null)
    setShowWorkerForm(true)
  }

  const handleEditWorker = (worker: Worker) => {
    setEditingWorker(worker)
    setShowWorkerForm(true)
  }

  const handleToggleWorkerStatus = async (worker: Worker) => {
    try {
      const updatedWorker: Worker = {
        ...worker,
        isActive: !worker.isActive,
        updatedAt: new Date()
      }
      
      await updateWorker(updatedWorker)
      await loadWorkers()
      
      toast({
        title: `Worker ${updatedWorker.isActive ? 'Activated' : 'Deactivated'}`,
        description: `${worker.name} has been ${updatedWorker.isActive ? 'activated' : 'deactivated'}.`
      })
    } catch (error) {
      console.error('Failed to update worker status:', error)
      toast({
        title: "Update Failed",
        description: "Failed to update worker status.",
        variant: "destructive"
      })
    }
  }

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = !searchTerm || 
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = showInactive || worker.isActive
    
    return matchesSearch && matchesStatus
  })

  const activeWorkerCount = workers.filter(w => w.isActive).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workers Database</h1>
          <p className="text-muted-foreground">Manage your workforce database</p>
        </div>
        <Button onClick={handleCreateWorker}>
          <Plus className="h-4 w-4 mr-2" />
          Add Worker
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Active Workers</p>
              <p className="text-2xl font-bold">{activeWorkerCount}</p>
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
                  placeholder="Search workers..."
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
        {filteredWorkers.map((worker) => (
          <Card key={worker.id} className={cn(
            "hover:bg-muted/30 transition-colors",
            !worker.isActive && "opacity-60"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{worker.name}</h3>
                      {!worker.isActive && (
                        <Badge variant="secondary" className="text-xs">Inactive</Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-2">
                      ${worker.hourlyRate}/hour
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {worker.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {WORKER_SKILL_LABELS[skill]}
                        </Badge>
                      ))}
                      {worker.skills.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{worker.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleWorkerStatus(worker)}
                  >
                    {worker.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditWorker(worker)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredWorkers.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-semibold mb-2">No Workers Found</h3>
              <p className="text-muted-foreground mb-4">
                Add workers to your database to get started
              </p>
              <Button onClick={handleCreateWorker}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Worker
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <WorkerForm
        worker={editingWorker}
        isOpen={showWorkerForm}
        onClose={() => {
          setShowWorkerForm(false)
          setEditingWorker(null)
        }}
        onSave={loadWorkers}
      />
    </div>
  )
}
