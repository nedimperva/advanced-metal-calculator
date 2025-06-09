"use client"

import React, { Suspense, useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useProjectManagement } from '@/hooks/use-project-management'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Loader2, Edit3, Trash2, Download, Archive, Plus, ArrowLeft, Settings, BarChart3, AlertTriangle, Home } from 'lucide-react'
import { Project, ProjectFormData, Calculation } from '@/lib/types'
import { cn } from '@/lib/utils'
import { CalculationListItem } from '@/components/calculation-list-item'
import { toast } from '@/hooks/use-toast'
import Link from 'next/link'

const PROJECT_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f59e0b' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Cyan', value: '#06b6d4' },
]

const PROJECT_STATUS_LABELS: Record<Project['status'], string> = {
  active: 'Active',
  completed: 'Completed',
  archived: 'Archived',
  'on-hold': 'On Hold'
}

function ManageProjectsPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const {
    projects,
    isLoading,
    getProjectCalculations,
    updateProject,
    deleteProject,
    exportProject,
    deleteCalculation,
  } = useProjectManagement()

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const [deleteCalcDialogOpen, setDeleteCalcDialogOpen] = useState(false)
  const [calcToDelete, setCalcToDelete] = useState<Calculation | null>(null)

  const [editFormData, setEditFormData] = useState<ProjectFormData | null>(null)

  const selectedProject = projects.find(p => p.id === selectedProjectId)

  useEffect(() => {
    const projectIdFromQuery = searchParams.get('projectId')
    if (projectIdFromQuery && projects.find(p => p.id === projectIdFromQuery)) {
      setSelectedProjectId(projectIdFromQuery)
    } else if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id)
    }
  }, [searchParams, projects, selectedProjectId])

  useEffect(() => {
    if (selectedProject) {
      setEditFormData({
        name: selectedProject.name,
        description: selectedProject.description || '',
        client: selectedProject.client || '',
        location: selectedProject.location || '',
        status: selectedProject.status,
        tags: selectedProject.tags || [],
        color: selectedProject.color || PROJECT_COLORS[0].value
      })
      setEditMode(false)
    } else {
      setEditFormData(null)
    }
  }, [selectedProject])

  const handleSaveEdit = async () => {
    if (!selectedProject || !editFormData) return
    const success = await updateProject(selectedProject.id, editFormData)
    if (success) {
      setEditMode(false)
      toast({ title: "Project Updated", description: "Your changes have been saved." })
    }
  }

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return
    await deleteProject(projectToDelete.id)
    setDeleteDialogOpen(false)
    if (selectedProjectId === projectToDelete.id) {
      const remainingProjects = projects.filter(p => p.id !== projectToDelete.id)
      setSelectedProjectId(remainingProjects.length > 0 ? remainingProjects[0].id : null)
    }
    setProjectToDelete(null)
  }
  
  const handleEditCalculation = (calc: Calculation) => {
    router.push(`/?loadCalculationId=${calc.id}`)
  }

  const handleDeleteCalculationClick = (calc: Calculation) => {
    setCalcToDelete(calc);
    setDeleteCalcDialogOpen(true);
  }

  const handleDeleteCalculationConfirm = async () => {
    if (!calcToDelete) return;
    await deleteCalculation(calcToDelete.id);
    setDeleteCalcDialogOpen(false);
    setCalcToDelete(null);
    toast({ title: "Calculation Deleted", description: "The calculation has been removed from the project." })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold">Manage Projects</h1>
            <Button asChild variant="outline">
              <Link href="/">
                <span className="flex items-center">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Calculator
                </span>
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4">
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Project List */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>All Projects</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {projects.map(p => (
                  <Button
                    key={p.id}
                    variant={selectedProjectId === p.id ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedProjectId(p.id)}
                  >
                    <span className="flex items-center">
                      <span
                        className="w-2 h-2 rounded-full mr-2"
                        style={{ backgroundColor: p.color }}
                      />
                      {p.name}
                    </span>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Project Details */}
          <div className="md:col-span-2 lg:col-span-3">
            {selectedProject && editFormData ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedProject.color }} />
                        {selectedProject.name}
                      </CardTitle>
                      <CardDescription>
                        {PROJECT_STATUS_LABELS[selectedProject.status]}
                      </CardDescription>
                    </div>
                    {!editMode && (
                       <Button onClick={() => setEditMode(true)} variant="outline">
                         <span className="flex items-center">
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit Project
                         </span>
                       </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    {editMode ? (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="projectName">Project Name</Label>
                          <Input id="projectName" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} />
                        </div>
                        <div>
                          <Label htmlFor="projectDesc">Description</Label>
                          <Textarea id="projectDesc" value={editFormData.description} onChange={e => setEditFormData({...editFormData, description: e.target.value})} />
                        </div>
                         <div>
                          <Label htmlFor="projectStatus">Status</Label>
                          <Select value={editFormData.status} onValueChange={(status: Project['status']) => setEditFormData({...editFormData, status})}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                              {Object.entries(PROJECT_STATUS_LABELS).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                         <div>
                          <Label>Color</Label>
                          <div className="flex gap-2 pt-2">
                            {PROJECT_COLORS.map(color => (
                              <button key={color.value} onClick={() => setEditFormData({...editFormData, color: color.value})} className={cn("w-6 h-6 rounded-full", editFormData.color === color.value && "ring-2 ring-primary ring-offset-2") } style={{backgroundColor: color.value}}/>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button onClick={() => setEditMode(false)} variant="ghost"><span>Cancel</span></Button>
                          <Button onClick={handleSaveEdit}><span>Save Changes</span></Button>
                        </div>
                      </div>
                    ) : (
                       <p className="text-sm text-muted-foreground">{selectedProject.description || "No description provided."}</p>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Calculations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                     {getProjectCalculations(selectedProject.id).length > 0 ? (
                      getProjectCalculations(selectedProject.id)
                        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                        .map(calc => (
                          <CalculationListItem
                            key={calc.id}
                            calculation={calc}
                            onClick={() => handleEditCalculation(calc)}
                            onEdit={() => handleEditCalculation(calc)}
                            onDelete={() => handleDeleteCalculationClick(calc)}
                          />
                        ))
                    ) : (
                      <p className="text-center py-4 text-muted-foreground">No calculations in this project.</p>
                    )}
                  </CardContent>
                </Card>

                 <Card>
                  <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button variant="destructive" onClick={() => handleDeleteClick(selectedProject)}>
                      <span className="flex items-center">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Project
                      </span>
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      This action is permanent and cannot be undone.
                    </p>
                  </CardContent>
                </Card>

              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">Select a project to see its details.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel><span>Cancel</span></AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <span>Delete</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteCalcDialogOpen} onOpenChange={setDeleteCalcDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the calculation. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel><span>Cancel</span></AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCalculationConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            ><span>Delete</span></AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function ManageProjectsPage() {
  return (
    <Suspense fallback={null}>
      <ManageProjectsPageInner />
    </Suspense>
  )
}
