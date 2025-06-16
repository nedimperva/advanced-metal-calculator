"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'
import { SettingsModal } from '@/components/settings-modal'

export function SettingsButton() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsSettingsOpen(true)}
        className="h-9 w-9"
        aria-label="Settings"
      >
        <Settings className="h-4 w-4" />
      </Button>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  )
} 