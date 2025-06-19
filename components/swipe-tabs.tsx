import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/use-media-query'

interface SwipeTabData {
  value: string
  label: React.ReactNode
  icon?: React.ReactNode
  shortLabel?: string
}

interface SwipeTabsProps {
  value: string
  onValueChange: (value: string) => void
  tabs: SwipeTabData[]
  className?: string
  enableSwipe?: boolean
  stickyTabs?: boolean
  children: React.ReactNode
}

export function SwipeTabs({
  value,
  onValueChange,
  tabs,
  className,
  enableSwipe = true,
  stickyTabs = false,
  children
}: SwipeTabsProps) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const isMobile = !useMediaQuery("(min-width: 640px)")

  const currentIndex = tabs.findIndex(tab => tab.value === value)
  const isFirstTab = currentIndex === 0
  const isLastTab = currentIndex === tabs.length - 1

  const goToPreviousTab = useCallback(() => {
    if (!isFirstTab) {
      onValueChange(tabs[currentIndex - 1].value)
    }
  }, [isFirstTab, currentIndex, tabs, onValueChange])

  const goToNextTab = useCallback(() => {
    if (!isLastTab) {
      onValueChange(tabs[currentIndex + 1].value)
    }
  }, [isLastTab, currentIndex, tabs, onValueChange])

  // Touch event handlers for swipe navigation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enableSwipe) return
    
    const touch = e.touches[0]
    setTouchStart({ x: touch.clientX, y: touch.clientY })
    setIsDragging(false)
    setDragOffset(0)
  }, [enableSwipe])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart || !enableSwipe) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStart.x
    const deltaY = touch.clientY - touchStart.y

    // Only handle horizontal swipes (prevent vertical scroll interference)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      setIsDragging(true)
      setDragOffset(deltaX)
      e.preventDefault() // Prevent scrolling
    }
  }, [touchStart, enableSwipe])

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !enableSwipe) return

    const threshold = 50 // Minimum swipe distance
    
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0 && !isFirstTab) {
        // Swipe right - go to previous tab
        goToPreviousTab()
      } else if (dragOffset < 0 && !isLastTab) {
        // Swipe left - go to next tab
        goToNextTab()
      }
    }

    // Reset state
    setTouchStart(null)
    setIsDragging(false)
    setDragOffset(0)
  }, [touchStart, enableSwipe, dragOffset, isFirstTab, isLastTab, goToPreviousTab, goToNextTab])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return // Don't interfere with input fields
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          goToPreviousTab()
          break
        case 'ArrowRight':
          e.preventDefault()
          goToNextTab()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToPreviousTab, goToNextTab])

  return (
    <div className={cn("relative", className)}>
      <Tabs value={value} onValueChange={onValueChange} className="w-full">
        {/* Tab Navigation with Swipe Indicators */}
        <div className={cn("relative", stickyTabs && "sticky top-0 z-50 backdrop-blur-sm bg-background/95 border-b border-border/50 pb-2")}>
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-1">
                {tab.icon}
                <span className={cn("", isMobile ? "hidden sm:inline" : "")}>
                  {isMobile && tab.shortLabel ? tab.shortLabel : tab.label}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Navigation Arrows (Mobile) */}
          {isMobile && (
            <div className="flex justify-between items-center mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousTab}
                disabled={isFirstTab}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Tab Indicator Dots */}
              <div className="flex gap-1">
                {tabs.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full",
                      index === currentIndex ? "bg-primary" : "bg-muted"
                    )}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={goToNextTab}
                disabled={isLastTab}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Swipe Instructions (Mobile) */}
          {enableSwipe && isMobile && (
            <div className="text-xs text-muted-foreground text-center mt-2">
              Swipe left/right to navigate • Use arrow keys
            </div>
          )}
        </div>

        {/* Tab Content with Swipe Animation */}
        <div
          ref={containerRef}
          className="relative overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className={cn(
              "",
              isDragging && ""
            )}
            style={{
              transform: `translateX(${isDragging ? dragOffset : 0}px)`
            }}
          >
            <div className={cn("", isDragging && "pointer-events-none")}>
              {children}
            </div>
          </div>

          {/* Swipe Feedback Overlay */}
          {isDragging && (
            <div className="absolute inset-0 bg-background/20 pointer-events-none">
              <div className="flex items-center justify-center h-full">
                <div className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-medium">
                  {dragOffset > 0 ? (
                    <>← Previous</>
                  ) : (
                    <>Next →</>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Tabs>
    </div>
  )
}

// Content component to maintain the expected API
SwipeTabs.Content = function SwipeTabsContent({ 
  value, 
  className, 
  children 
}: { 
  value: string
  className?: string
  children: React.ReactNode 
}) {
  return (
    <TabsContent value={value} className={className}>
      {children}
    </TabsContent>
  )
}

// Hook for managing swipe tab state
export function useSwipeTabState(initialTab: string, tabs: string[]) {
  const [activeTab, setActiveTab] = useState(initialTab)

  const goToNextTab = useCallback(() => {
    const currentIndex = tabs.indexOf(activeTab)
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1])
    }
  }, [activeTab, tabs])

  const goToPreviousTab = useCallback(() => {
    const currentIndex = tabs.indexOf(activeTab)
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1])
    }
  }, [activeTab, tabs])

  const goToTab = useCallback((tabValue: string) => {
    if (tabs.includes(tabValue)) {
      setActiveTab(tabValue)
    }
  }, [tabs])

  return {
    activeTab,
    setActiveTab,
    goToNextTab,
    goToPreviousTab,
    goToTab,
    currentIndex: tabs.indexOf(activeTab),
    isFirstTab: tabs.indexOf(activeTab) === 0,
    isLastTab: tabs.indexOf(activeTab) === tabs.length - 1
  }
} 