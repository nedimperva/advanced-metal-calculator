"use client"

import React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  PRICING_MODELS, 
  type PricingModel, 
  getPricingDisplayUnit,
  getRecommendedPricingModel
} from "@/lib/pricing-models"

interface PricingModelSelectorProps {
  pricingModel: PricingModel
  setPricingModel: (model: PricingModel) => void
  currency: string
  profileCategory: string
  profileType: string
  className?: string
  showRecommendation?: boolean
}

export default function PricingModelSelector({
  pricingModel,
  setPricingModel,
  currency,
  profileCategory,
  profileType,
  className,
  showRecommendation = true
}: PricingModelSelectorProps) {
  
  const recommendedModel = getRecommendedPricingModel(profileCategory, profileType)
  const isRecommended = pricingModel === recommendedModel

  const handleModelChange = (newModel: string) => {
    setPricingModel(newModel as PricingModel)
  }

  const applyRecommendation = () => {
    setPricingModel(recommendedModel)
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Pricing Model Selection */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Pricing Model</label>
          {showRecommendation && !isRecommended && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={applyRecommendation}
                    className="h-6 px-2 text-xs"
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Use {PRICING_MODELS[recommendedModel].name}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Recommended for {profileCategory}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        <Select value={pricingModel} onValueChange={handleModelChange}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(PRICING_MODELS).map((model) => (
              <SelectItem key={model.key} value={model.key}>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{model.icon}</span>
                  <div className="flex flex-col">
                    <span className="font-medium">{model.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {model.description}
                    </span>
                  </div>
                  {model.key === recommendedModel && (
                    <Badge variant="secondary" className="text-xs ml-auto">
                      Recommended
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Current Model Info */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="text-base">{PRICING_MODELS[pricingModel].icon}</span>
        <span>
          Price unit: <strong>{getPricingDisplayUnit(pricingModel, currency)}</strong>
        </span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3 w-3 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>{PRICING_MODELS[pricingModel].tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
} 