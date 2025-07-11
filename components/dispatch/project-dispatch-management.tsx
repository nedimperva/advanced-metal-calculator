"use client"

import React, { useState } from 'react'
import type { Project, DispatchNote } from '@/lib/types'
import { DispatchNotesList } from './dispatch-notes-list'
import { CreateDispatchNote } from './create-dispatch-note'
import { BulkMaterialInput } from './bulk-material-input'

interface ProjectDispatchManagementProps {
  project: Project
  onUpdate?: () => void
}

export function ProjectDispatchManagement({ project, onUpdate }: ProjectDispatchManagementProps) {
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit' | 'bulk-materials'>('list')
  const [selectedDispatch, setSelectedDispatch] = useState<DispatchNote | undefined>()

  const handleCreateNew = () => {
    setSelectedDispatch(undefined)
    setCurrentView('create')
  }

  const handleEditDispatch = (dispatch: DispatchNote) => {
    setSelectedDispatch(dispatch)
    setCurrentView('edit')
  }

  const handleViewDispatch = (dispatch: DispatchNote) => {
    setSelectedDispatch(dispatch)
    setCurrentView('bulk-materials')
  }

  const handleSuccess = (dispatch: DispatchNote) => {
    setCurrentView('list')
    setSelectedDispatch(undefined)
    onUpdate?.()
  }

  const handleCancel = () => {
    setCurrentView('list')
    setSelectedDispatch(undefined)
  }

  const handleBulkMaterialsSuccess = () => {
    setCurrentView('list')
    setSelectedDispatch(undefined)
    onUpdate?.()
  }

  switch (currentView) {
    case 'create':
      return (
        <CreateDispatchNote
          projectId={project.id}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )

    case 'edit':
      return (
        <CreateDispatchNote
          projectId={project.id}
          editingDispatch={selectedDispatch}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )

    case 'bulk-materials':
      return (
        <BulkMaterialInput
          dispatchNoteId={selectedDispatch?.id || ''}
          onSuccess={handleBulkMaterialsSuccess}
          onCancel={handleCancel}
          existingMaterials={selectedDispatch?.materials}
        />
      )

    default:
      return (
        <DispatchNotesList
          projectId={project.id}
          onCreateNew={handleCreateNew}
          onEditDispatch={handleEditDispatch}
          onViewDispatch={handleViewDispatch}
        />
      )
  }
}