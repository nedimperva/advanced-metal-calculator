"use client"

import React from 'react'
import { useMediaQuery } from '@/hooks/use-media-query'
import BackgroundElements from '@/components/background-elements'
import ProjectDashboard from '@/components/project-dashboard'
import MobileProjectDashboard from '@/components/mobile-project-dashboard'

export default function ProjectsPage() {
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative">
      <BackgroundElements />
      
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          {isDesktop ? (
            <ProjectDashboard />
          ) : (
            <MobileProjectDashboard />
          )}
        </div>
      </div>
    </div>
  )
} 