"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Plus, 
  Building, 
  Home, 
  Factory, 
  Wrench, 
  Users, 
  Calendar, 
  DollarSign,
  Clock
} from 'lucide-react'
import { useProjects } from '@/contexts/project-context'
import { ProjectStatus } from '@/lib/types'
import BackgroundElements from '@/components/background-elements'
import { toast } from '@/hooks/use-toast'

// Project template definitions
interface ProjectTemplate {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: 'residential' | 'commercial' | 'industrial' | 'infrastructure'
  estimatedDuration: string
  typicalBudgetRange: string
  commonMaterials: string[]
  tags: string[]
  defaultStatus: ProjectStatus
}

const projectTemplates: ProjectTemplate[] = [
  {
    id: 'residential-house',
    name: 'Residential House Construction',
    description: 'Complete construction of a single-family residential home with standard structural requirements.',
    icon: <Home className="h-8 w-8" />,
    category: 'residential',
    estimatedDuration: '6-12 months',
    typicalBudgetRange: '$200,000 - $500,000',
    commonMaterials: ['Steel beams', 'Concrete', 'Rebar', 'Wood framing', 'Roofing materials'],
    tags: ['residential', 'construction', 'house'],
    defaultStatus: ProjectStatus.PLANNING
  },
  {
    id: 'commercial-office',
    name: 'Commercial Office Building',
    description: 'Multi-story commercial office building with modern structural steel framework.',
    icon: <Building className="h-8 w-8" />,
    category: 'commercial',
    estimatedDuration: '12-24 months',
    typicalBudgetRange: '$1M - $10M',
    commonMaterials: ['Structural steel', 'Curtain wall', 'Concrete slabs', 'HVAC systems', 'Fire protection'],
    tags: ['commercial', 'office', 'multi-story'],
    defaultStatus: ProjectStatus.PLANNING
  },
  {
    id: 'industrial-warehouse',
    name: 'Industrial Warehouse',
    description: 'Large-scale warehouse facility with clear-span design and heavy-duty structural elements.',
    icon: <Factory className="h-8 w-8" />,
    category: 'industrial',
    estimatedDuration: '8-18 months',
    typicalBudgetRange: '$500,000 - $5M',
    commonMaterials: ['Pre-engineered steel', 'Metal roofing', 'Concrete foundations', 'Loading docks', 'Industrial lighting'],
    tags: ['industrial', 'warehouse', 'steel'],
    defaultStatus: ProjectStatus.PLANNING
  },
  {
    id: 'bridge-construction',
    name: 'Bridge Infrastructure',
    description: 'Bridge construction project including foundations, superstructure, and safety systems.',
    icon: <Wrench className="h-8 w-8" />,
    category: 'infrastructure',
    estimatedDuration: '18-36 months',
    typicalBudgetRange: '$2M - $50M',
    commonMaterials: ['Prestressed concrete', 'Structural steel', 'Rebar', 'Bridge bearings', 'Safety barriers'],
    tags: ['infrastructure', 'bridge', 'public'],
    defaultStatus: ProjectStatus.PLANNING
  },
  {
    id: 'residential-renovation',
    name: 'Home Renovation',
    description: 'Major renovation project including structural modifications and upgrades.',
    icon: <Home className="h-8 w-8" />,
    category: 'residential',
    estimatedDuration: '3-8 months',
    typicalBudgetRange: '$50,000 - $200,000',
    commonMaterials: ['Steel reinforcement', 'Lumber', 'Drywall', 'Insulation', 'Flooring'],
    tags: ['residential', 'renovation', 'remodel'],
    defaultStatus: ProjectStatus.PLANNING
  },
  {
    id: 'retail-store',
    name: 'Retail Store Buildout',
    description: 'Commercial retail space construction with custom layout and modern finishes.',
    icon: <Building className="h-8 w-8" />,
    category: 'commercial',
    estimatedDuration: '4-8 months',
    typicalBudgetRange: '$100,000 - $1M',
    commonMaterials: ['Light steel framing', 'Glass facades', 'Flooring systems', 'Lighting', 'Security systems'],
    tags: ['commercial', 'retail', 'interior'],
    defaultStatus: ProjectStatus.PLANNING
  }
]

const categoryLabels = {
  residential: 'Residential',
  commercial: 'Commercial',
  industrial: 'Industrial',
  infrastructure: 'Infrastructure'
}

const categoryColors = {
  residential: 'bg-green-100 text-green-800 border-green-200',
  commercial: 'bg-blue-100 text-blue-800 border-blue-200',
  industrial: 'bg-orange-100 text-orange-800 border-orange-200',
  infrastructure: 'bg-purple-100 text-purple-800 border-purple-200'
}

export default function ProjectTemplatesPage() {
  const router = useRouter()
  const { createProject } = useProjects()
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isCreating, setIsCreating] = useState<string | null>(null)

  // Filter templates by category
  const filteredTemplates = selectedCategory === 'all' 
    ? projectTemplates 
    : projectTemplates.filter(template => template.category === selectedCategory)

  // Handle back navigation
  const handleBack = () => {
    router.push('/projects')
  }

  // Create project from template
  const handleCreateFromTemplate = async (template: ProjectTemplate) => {
    setIsCreating(template.id)
    
    try {
      const projectData = {
        name: `${template.name} Project`,
        description: template.description,
        status: template.defaultStatus,
        currency: 'USD',
        notes: `Created from ${template.name} template.\n\nCommon materials:\n${template.commonMaterials.map(m => `- ${m}`).join('\n')}`,
        tags: [...template.tags, 'template']
      }

      const projectId = await createProject(projectData)
      
      toast({
        title: "Project Created",
        description: `Successfully created project from ${template.name} template`,
      })
      
      router.push(`/projects/${projectId}/edit`)
    } catch (error) {
      console.error('Failed to create project from template:', error)
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create project",
        variant: "destructive"
      })
    } finally {
      setIsCreating(null)
    }
  }

  // Template card component
  const TemplateCard = ({ template }: { template: ProjectTemplate }) => (
    <Card className="group hover:shadow-lg transition-all duration-200 h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              {template.icon}
            </div>
            <Badge 
              variant="outline" 
              className={categoryColors[template.category]}
            >
              {categoryLabels[template.category]}
            </Badge>
          </div>
        </div>
        
        <CardTitle className="text-lg group-hover:text-primary transition-colors">
          {template.name}
        </CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {template.description}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Project Details */}
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Duration:</span>
            <span className="font-medium">{template.estimatedDuration}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Budget:</span>
            <span className="font-medium">{template.typicalBudgetRange}</span>
          </div>
        </div>

        {/* Common Materials */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Common Materials:</p>
          <div className="space-y-1">
            {template.commonMaterials.slice(0, 3).map((material, index) => (
              <p key={index} className="text-sm text-muted-foreground">
                • {material}
              </p>
            ))}
            {template.commonMaterials.length > 3 && (
              <p className="text-sm text-muted-foreground">
                • and {template.commonMaterials.length - 3} more...
              </p>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {template.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {template.tags.length > 4 && (
            <Badge variant="secondary" className="text-xs">
              +{template.tags.length - 4}
            </Badge>
          )}
        </div>

        {/* Action Button */}
        <Button 
          className="w-full mt-4"
          onClick={() => handleCreateFromTemplate(template)}
          disabled={isCreating === template.id}
        >
          {isCreating === template.id ? (
            <>
              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-transparent" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Use This Template
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      <BackgroundElements />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Project Templates</h1>
            <p className="text-muted-foreground">
              Start your project with pre-configured templates for common construction types
            </p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All Templates
          </Button>
          {Object.entries(categoryLabels).map(([category, label]) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {label}
            </Button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Templates Found</h3>
              <p className="text-muted-foreground mb-4">
                No templates match the selected category.
              </p>
              <Button onClick={() => setSelectedCategory('all')}>
                View All Templates
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Custom Project Option */}
        <Card className="mt-8 border-dashed border-2">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-3 bg-muted rounded-full">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Create Custom Project</h3>
                <p className="text-muted-foreground mb-4">
                  Need something different? Create a project from scratch with your own specifications.
                </p>
                <Button onClick={() => router.push('/projects/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Custom Project
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-8 p-6 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-2">About Project Templates</h4>
          <p className="text-sm text-muted-foreground">
            Templates provide a quick starting point for common project types. Each template includes:
          </p>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1">
            <li>• Pre-configured project settings and status</li>
            <li>• Common materials list for the project type</li>
            <li>• Typical duration and budget estimates</li>
            <li>• Relevant tags for organization</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            After creating a project from a template, you can customize all details to match your specific requirements.
          </p>
        </div>
      </div>
    </div>
  )
} 