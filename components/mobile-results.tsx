"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CheckCircle, Info, BarChart3, Layers, Save, Share2, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { animations, safeAnimation } from "@/lib/animations"
import { WEIGHT_UNITS, LENGTH_UNITS } from "@/lib/unit-conversions"
import type { StructuralProperties, PricingModel } from "@/lib/types"
import { Input, UnitInput } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import PricingModelSelector from "@/components/pricing-model-selector"
import { 
  PRICING_MODELS, 
  calculateUnitCost, 
  calculateTotalCost 
} from "@/lib/pricing-models"

interface MobileResultsProps {
  weight: number
  weightUnit: string
  structuralProperties: StructuralProperties
  volume: number
  className?: string
  onSave?: () => void
  onShare?: () => void
  onAdvancedAnalysis?: () => void
  // Pricing props
  quantity?: string
  setQuantity?: (quantity: string) => void
  pricePerUnit?: string
  setPricePerUnit?: (price: string) => void
  currency?: string
  pricingModel?: PricingModel
  setPricingModel?: (model: PricingModel) => void
  profileCategory?: string
  profileType?: string
  length?: string
  lengthUnit?: string
}

export function MobileResults({ 
  weight, 
  weightUnit, 
  structuralProperties, 
  volume, 
  className,
  onSave,
  onShare,
  onAdvancedAnalysis,
  // Pricing props
  quantity = "1",
  setQuantity,
  pricePerUnit = "",
  setPricePerUnit,
  currency = "USD",
  pricingModel = "per_kg",
  setPricingModel,
  profileCategory = "",
  profileType = "",
  length = "1000",
  lengthUnit = "mm"
}: MobileResultsProps) {
  const DetailedResultsModal = () => (
    <DialogContent className="max-w-sm mx-4 max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Detailed Results
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4">
        {/* Main Result */}
        <div className="text-center bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-xl">
          <div className="text-3xl font-bold text-primary">
            {weight.toFixed(4)}
          </div>
          <div className="text-sm text-muted-foreground">
            {WEIGHT_UNITS[weightUnit as keyof typeof WEIGHT_UNITS].name}
          </div>
        </div>

        {/* Basic Properties */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-muted/50 rounded">
            <div className="text-xs text-muted-foreground">Cross-sectional Area</div>
            <div className="font-semibold">{structuralProperties.area.toFixed(4)} cm²</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded">
            <div className="text-xs text-muted-foreground">Volume</div>
            <div className="font-semibold">{volume.toFixed(4)} cm³</div>
          </div>
        </div>

        <Separator />

        {/* Structural Properties */}
        <div>
          <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Structural Properties
          </h4>
          
          {/* Moment of Inertia */}
          <div className="space-y-2 mb-4">
            <div className="text-xs font-medium text-muted-foreground">MOMENT OF INERTIA</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-muted/30 rounded">
                <span className="text-muted-foreground">Ix:</span>
                <div className="font-medium">{structuralProperties.momentOfInertiaX.toFixed(2)} cm⁴</div>
              </div>
              <div className="p-2 bg-muted/30 rounded">
                <span className="text-muted-foreground">Iy:</span>
                <div className="font-medium">{structuralProperties.momentOfInertiaY.toFixed(2)} cm⁴</div>
              </div>
            </div>
          </div>

          {/* Section Modulus */}
          <div className="space-y-2 mb-4">
            <div className="text-xs font-medium text-muted-foreground">SECTION MODULUS</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-muted/30 rounded">
                <span className="text-muted-foreground">Sx:</span>
                <div className="font-medium">{structuralProperties.sectionModulusX.toFixed(2)} cm³</div>
              </div>
              <div className="p-2 bg-muted/30 rounded">
                <span className="text-muted-foreground">Sy:</span>
                <div className="font-medium">{structuralProperties.sectionModulusY.toFixed(2)} cm³</div>
              </div>
            </div>
          </div>

          {/* Radius of Gyration */}
          <div className="space-y-2 mb-4">
            <div className="text-xs font-medium text-muted-foreground">RADIUS OF GYRATION</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-muted/30 rounded">
                <span className="text-muted-foreground">rx:</span>
                <div className="font-medium">{structuralProperties.radiusOfGyrationX.toFixed(2)} cm</div>
              </div>
              <div className="p-2 bg-muted/30 rounded">
                <span className="text-muted-foreground">ry:</span>
                <div className="font-medium">{structuralProperties.radiusOfGyrationY.toFixed(2)} cm</div>
              </div>
            </div>
          </div>

          {/* Additional Properties */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">ADDITIONAL PROPERTIES</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-muted/30 rounded">
                <span className="text-muted-foreground">Perimeter:</span>
                <div className="font-medium">{structuralProperties.perimeter.toFixed(2)} cm</div>
              </div>
              <div className="p-2 bg-muted/30 rounded">
                <span className="text-muted-foreground">Weight/Length:</span>
                <div className="font-medium">{structuralProperties.weight.toFixed(3)} kg/m</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  )

  return (
    <div className={cn("space-y-3", className)}>
      <Card className={cn(
        "backdrop-blur-sm bg-card/90 border-accent/20 shadow-lg",
        safeAnimation(animations.cardHover)
      )}>
        <CardHeader className="pb-2">
          <CardTitle className={cn(
            "text-base flex items-center justify-between",
            safeAnimation(animations.fadeIn)
          )}>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-foreground" />
              Results
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Info className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DetailedResultsModal />
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Current Pricing Display - Mobile */}
          <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg mb-3">
            <span>Defaults: {currency} • {PRICING_MODELS[pricingModel].name}</span>
            <span className="text-foreground">Change in Settings</span>
          </div>

          {/* Quantity and Price Inputs - Mobile */}
          {setQuantity && setPricePerUnit && (
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <Label htmlFor="mobile-quantity" className="text-xs">Quantity</Label>
                <UnitInput
                  id="mobile-quantity"
                  unit="pcs"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="1"
                  min={0.001}
                  step={1}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="mobile-price" className="text-xs">
                  Price {PRICING_MODELS[pricingModel].name}
                </Label>
                <UnitInput
                  id="mobile-price"
                  unit={`${currency}/${PRICING_MODELS[pricingModel].unit}`}
                  value={pricePerUnit}
                  onChange={(e) => setPricePerUnit(e.target.value)}
                  placeholder="0.00"
                  min={0}
                  step={0.01}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          )}

          {/* Main Result - Mobile Optimized */}
                  <div className={cn(
          "text-center bg-accent/10 border border-accent/20 p-4 rounded-xl",
          safeAnimation(animations.scaleIn)
        )}>
          <div className="text-2xl font-bold text-foreground">
            {weight.toFixed(4)}
          </div>
          <div className="text-xs text-muted-foreground">
            {WEIGHT_UNITS[weightUnit as keyof typeof WEIGHT_UNITS].name}
          </div>
        </div>

          {/* Pricing Results - Mobile */}
                  {pricePerUnit && parseFloat(pricePerUnit) > 0 && (
          <>
            {/* Single Unit Cost */}
            <div className="text-center p-3 bg-accent/10 border border-accent/20 rounded-lg">
              <div className="text-lg font-bold text-foreground">
                {currency} {calculateUnitCost(
                  pricingModel,
                  parseFloat(pricePerUnit),
                  weight,
                  parseFloat(length),
                  weightUnit,
                  lengthUnit
                ).toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">Unit Cost</div>
            </div>

            {/* Total Cost (if quantity > 1) */}
            {parseFloat(quantity) !== 1 && parseFloat(quantity) > 0 && (
              <div className="text-center p-3 bg-accent/20 border border-accent/30 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">
                  Total ({quantity} {parseFloat(quantity) === 1 ? 'piece' : 'pieces'}
                  {pricingModel !== 'per_unit' && !(pricingModel === 'per_kg' && weightUnit === 'kg') && (
                    <span>
                      = {(() => {
                        const qtyNum = parseFloat(quantity)
                        if (pricingModel === 'per_kg') {
                          const weightInKg = (weight * (WEIGHT_UNITS[weightUnit as keyof typeof WEIGHT_UNITS]?.factor || 1)) / 1000
                          return `${(qtyNum * weightInKg).toFixed(3)} kg`
                        }
                        if (pricingModel === 'per_meter') {
                          // Use proper length unit conversion
                          const lengthInCm = parseFloat(length || '1000') * (LENGTH_UNITS[lengthUnit as keyof typeof LENGTH_UNITS]?.factor || 1)
                          const lengthInMeters = lengthInCm / 100 // Convert cm to meters
                          return `${(qtyNum * lengthInMeters).toFixed(2)} m`
                        }
                        return ''
                      })()}
                    </span>
                  )})
                </div>
                <div className="text-xl font-bold text-foreground">
                  {currency} {calculateTotalCost(
                    pricingModel,
                    parseFloat(pricePerUnit),
                    weight,
                    parseFloat(length),
                    parseFloat(quantity),
                    weightUnit,
                    lengthUnit
                  ).toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">Total Cost</div>
              </div>
            )}
          </>
        )}

          {/* Key Properties - Simplified for Mobile */}
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 bg-muted/50 rounded border border-border/50">
              <div className="text-xs text-muted-foreground font-medium">Area</div>
              <div className="font-semibold text-sm">{structuralProperties.area.toFixed(2)} cm²</div>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded border border-border/50">
              <div className="text-xs text-muted-foreground font-medium">Volume</div>
              <div className="font-semibold text-sm">{volume.toFixed(2)} cm³</div>
            </div>
          </div>

          {/* Key Structural Properties - Most Important Only */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Moment of Inertia (Ix):</span>
              <span className="font-medium">{structuralProperties.momentOfInertiaX.toFixed(1)} cm⁴</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Section Modulus (Sx):</span>
              <span className="font-medium">{structuralProperties.sectionModulusX.toFixed(1)} cm³</span>
            </div>
          </div>

          {/* Action hint */}
          <div className="text-center pt-2 border-t border-border/50">
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Info className="h-3 w-3" />
              Tap info button for detailed properties
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-3 border-t border-border/50">
            {onSave && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onSave}
                className="flex-1 h-8"
              >
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
            )}
            {onShare && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onShare}
                className="flex-1 h-8"
              >
                <Share2 className="h-3 w-3 mr-1" />
                Share
              </Button>
            )}
            {onAdvancedAnalysis && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onAdvancedAnalysis}
                className="flex-1 h-8"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                Analysis
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 