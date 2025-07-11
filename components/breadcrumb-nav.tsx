"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home, FolderOpen, Plus, Edit, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
  current?: boolean
}

interface BreadcrumbNavProps {
  items?: BreadcrumbItem[]
  className?: string
}

// Generate breadcrumbs from pathname
function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = []

  // Always start with home
  breadcrumbs.push({
    label: 'Calculator',
    href: '/',
    icon: <Home className="h-4 w-4" />
  })

  // Handle project routes - projects are now handled within the main tab system
  // No separate project routes exist

  return breadcrumbs
}

export function BreadcrumbNav({ items, className }: BreadcrumbNavProps) {
  const pathname = usePathname()
  
  // Use provided items or generate from pathname
  const breadcrumbs = items || generateBreadcrumbsFromPath(pathname)

  if (breadcrumbs.length <= 1) {
    return null // Don't show breadcrumbs for single items
  }

  return (
    <nav 
      className={cn(
        "flex items-center space-x-1 text-sm text-muted-foreground",
        className
      )}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1
          const isCurrent = item.current || isLast

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground/50" />
              )}
              
              {item.href && !isCurrent ? (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1 hover:text-foreground transition-colors",
                    "rounded px-2 py-1 hover:bg-muted/50"
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded",
                    isCurrent 
                      ? "text-foreground font-medium bg-muted/30" 
                      : "text-muted-foreground"
                  )}
                  aria-current={isCurrent ? "page" : undefined}
                >
                  {item.icon}
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// Enhanced breadcrumb for project pages with project name
interface ProjectBreadcrumbNavProps extends BreadcrumbNavProps {
  projectName?: string
  projectId?: string
}

export function ProjectBreadcrumbNav({ projectName, projectId, ...props }: ProjectBreadcrumbNavProps) {
  const pathname = usePathname()
  
  if (props.items) {
    return <BreadcrumbNav {...props} />
  }

  // Generate breadcrumbs with project name if available
  const breadcrumbs = generateBreadcrumbsFromPath(pathname)
  
  // Replace generic project label with actual project name
  if (projectName && projectId) {
    const projectBreadcrumbIndex = breadcrumbs.findIndex(item => 
      item.href === `/projects/${projectId}`
    )
    
    if (projectBreadcrumbIndex >= 0) {
      breadcrumbs[projectBreadcrumbIndex] = {
        ...breadcrumbs[projectBreadcrumbIndex],
        label: projectName
      }
    }
  }

  return <BreadcrumbNav {...props} items={breadcrumbs} />
}

export default BreadcrumbNav 