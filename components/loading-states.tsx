"use client"

import { Loader2, Calculator, Cog, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

// Loading spinner with custom messages
interface LoadingSpinnerProps {
  message?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ 
  message = "Loading...", 
  size = "md", 
  className = "" 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 animate-spin text-muted-foreground",
    md: "h-6 w-6 animate-spin text-muted-foreground", 
    lg: "h-8 w-8 animate-spin text-muted-foreground"
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <Loader2 className={sizeClasses[size]} />
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  )
}

// Calculation loading with progress
interface CalculationLoadingProps {
  stage: string
  progress?: number
  details?: string
}

export function CalculationLoading({ stage, progress, details }: CalculationLoadingProps) {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calculator className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-medium">Calculating...</h3>
            <p className="text-sm text-muted-foreground">{stage}</p>
          </div>
        </div>
        
        {progress !== undefined && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-xs text-muted-foreground text-center">
              {progress}% complete
            </p>
          </div>
        )}
        
        {details && (
          <p className="text-xs text-muted-foreground mt-3 text-center">
            {details}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// Material loading skeleton
export function MaterialSelectorSkeleton() {
  return (
    <div className="space-y-4">
      {/* Material type grid skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
      
      {/* Grade selector skeleton */}
      <Skeleton className="h-12 w-full rounded-md" />
      
      {/* Properties card skeleton */}
      <Card className="bg-muted/30">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center p-2 bg-background/50 rounded">
                <Skeleton className="h-3 w-16 mx-auto mb-1" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Results loading skeleton
export function ResultsSkeleton() {
  return (
    <div className="space-y-4">
      {/* Main result */}
      <div className="text-center space-y-2 py-4">
        <Skeleton className="h-12 w-32 mx-auto" />
        <Skeleton className="h-4 w-16 mx-auto" />
      </div>
      
      {/* Properties grid */}
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="text-center p-2 bg-muted/50 rounded">
            <Skeleton className="h-3 w-20 mx-auto mb-1" />
            <Skeleton className="h-4 w-16 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Dimension inputs skeleton
export function DimensionInputsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Multi-stage loading with steps
interface MultiStageLoadingProps {
  stages: Array<{
    name: string
    description: string
    status: 'pending' | 'active' | 'completed' | 'error'
  }>
  currentStage?: number
}

export function MultiStageLoading({ stages, currentStage = 0 }: MultiStageLoadingProps) {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Cog className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Processing...</h3>
          </div>
          
          <div className="space-y-3">
            {stages.map((stage, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {stage.status === 'completed' && (
                    <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
                  )}
                  {stage.status === 'active' && (
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  )}
                  {stage.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                  {stage.status === 'pending' && (
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    stage.status === 'active' ? 'text-primary' :
                    stage.status === 'completed' ? 'text-green-600' :
                    stage.status === 'error' ? 'text-destructive' :
                    'text-muted-foreground'
                  }`}>
                    {stage.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stage.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Inline loading for buttons and small components
interface InlineLoadingProps {
  isLoading: boolean
  children: React.ReactNode
  loadingText?: string
  size?: "sm" | "md"
}

export function InlineLoading({ 
  isLoading, 
  children, 
  loadingText = "Loading...",
  size = "sm" 
}: InlineLoadingProps) {
  if (!isLoading) return <>{children}</>
  
  const spinnerSize = size === "sm" ? "h-3 w-3 animate-spin text-muted-foreground" : "h-4 w-4 animate-spin text-muted-foreground"
  
  return (
    <div className="flex items-center gap-2">
      <Loader2 className={spinnerSize} />
      <span className="text-sm">{loadingText}</span>
    </div>
  )
}

// Table loading skeleton
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-20" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={rowIndex} 
          className="grid gap-4" 
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-6 w-full" />
          ))}
        </div>
      ))}
    </div>
  )
}

// Page loading overlay
interface PageLoadingProps {
  message?: string
  isVisible: boolean
}

export function PageLoading({ message = "Loading application...", isVisible }: PageLoadingProps) {
  if (!isVisible) return null
  
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="p-8">
        <CardContent className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-lg font-medium">{message}</p>
          <p className="text-sm text-muted-foreground">Please wait...</p>
        </CardContent>
      </Card>
    </div>
  )
} 