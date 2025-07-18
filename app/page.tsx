"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calculator, BarChart3, FolderOpen, Package, Users, Clock, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useI18n } from "@/contexts/i18n-context"
import BackgroundElements from "@/components/background-elements"
import { SettingsButton } from "@/components/settings-button"

export default function HomePage() {
  const router = useRouter()
  const { t } = useI18n()

  const handleCalculatorNavigation = () => {
    router.push('/calculator')
  }

  const handleManagementNavigation = () => {
    router.push('/management')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <BackgroundElements />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
              SteelForge Pro
            </h1>
            <p className="text-xl text-muted-foreground">
              Professional Steel Fabrication Management Platform
            </p>
          </div>
          <SettingsButton />
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Calculator Section */}
          <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50" onClick={handleCalculatorNavigation}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Calculator className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Steel Calculator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground text-center">
                Advanced steel calculations, structural analysis, and material optimization tools
              </p>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <Calculator className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">Weight & Volume Calculator</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">Structural Analysis</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">Calculation History</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">Compare Calculations</span>
                </div>
              </div>

              <Button 
                className="w-full group-hover:bg-primary/90 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  handleCalculatorNavigation()
                }}
              >
                Enter Calculator
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Management Section */}
          <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50" onClick={handleManagementNavigation}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <FolderOpen className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Construction Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground text-center">
                Comprehensive project management, materials tracking, and workforce coordination
              </p>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <FolderOpen className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">Project Management</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <Package className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">Materials Tracking</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">Workforce Management</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">Timeline & Tasks</span>
                </div>
              </div>

              <Button 
                className="w-full group-hover:bg-primary/90 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  handleManagementNavigation()
                }}
              >
                Enter Management
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Choose your workspace to get started with professional steel fabrication management
          </p>
        </div>
      </div>
    </div>
  )
}