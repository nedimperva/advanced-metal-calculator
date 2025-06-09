"use client"

import React from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calculation } from "@/lib/types"
import { WEIGHT_UNITS } from "@/lib/unit-conversions"
import { ChevronRight, Copy, Edit, Trash2 } from "lucide-react"
import { cn } from '@/lib/utils'
import { Separator } from "@/components/ui/separator"

interface CalculationListItemProps {
  calculation: Calculation;
  onClick: (calculation: Calculation) => void;
  onClone?: (calculation: Calculation) => void;
  onEdit?: (calculation: Calculation) => void;
  onDelete?: (calculation: Calculation) => void;
  className?: string;
}

export function CalculationListItem({
  calculation: calc,
  onClick,
  onClone,
  onEdit,
  onDelete,
  className,
}: CalculationListItemProps) {
  const handleAction = (e: React.MouseEvent, action?: (calc: Calculation) => void) => {
    e.stopPropagation();
    action?.(calc);
  };
  
  return (
    <div
      onClick={() => onClick(calc)}
      className={cn(
        "bg-card hover:bg-muted/50 cursor-pointer transition-colors border rounded-lg",
        className
      )}
    >
      <div className="p-3">
        <div className="flex justify-between items-start gap-3">
          {/* Main Info */}
          <div className="flex-grow space-y-2">
            <div className="font-semibold text-sm flex items-center gap-2 flex-wrap">
              <span>{calc.materialName} {calc.profileName}</span>
              {calc.standardSize !== "Custom" && <span className="text-muted-foreground text-xs">({calc.standardSize})</span>}
            </div>
             {calc.projectName && (
              <Badge variant="outline" className="font-normal">{calc.projectName}</Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex items-center">
             {onClone && (
              <Button variant="ghost" size="icon" onClick={(e) => handleAction(e, onClone)} className="h-7 w-7" aria-label="Clone">
                <Copy className="h-3.5 w-3.5" />
              </Button>
            )}
             {onEdit && (
              <Button variant="ghost" size="icon" onClick={(e) => handleAction(e, onEdit)} className="h-7 w-7" aria-label="Edit">
                <Edit className="h-3.5 w-3.5" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="icon" onClick={(e) => handleAction(e, onDelete)} className="h-7 w-7 text-destructive hover:text-destructive" aria-label="Delete">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
             <ChevronRight className="h-4 w-4 text-muted-foreground ml-1" />
          </div>
        </div>

        <Separator className="my-2" />

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-xs">
           <div>
            <p className="text-muted-foreground font-normal">Unit Wt.</p>
            <p className="font-semibold">
              {calc.weight.toFixed(3)}{" "}
              <span className="text-muted-foreground font-normal">
                {WEIGHT_UNITS[calc.weightUnit as keyof typeof WEIGHT_UNITS]?.name.toLowerCase() ?? calc.weightUnit}
              </span>
            </p>
          </div>
          
          <div>
             <p className="text-muted-foreground font-normal">Quantity</p>
             <p className="font-semibold">{calc.quantity || 1}</p>
          </div>
          
          <div className="font-semibold">
            <p className="text-muted-foreground text-xs font-normal">Total Wt.</p>
            <span className="text-primary text-base">{(calc.weight * (calc.quantity || 1)).toFixed(3)}</span>
            <span className="text-muted-foreground ml-1">{WEIGHT_UNITS[calc.weightUnit as keyof typeof WEIGHT_UNITS]?.name.toLowerCase() ?? calc.weightUnit}</span>
          </div>

           {(calc.pricePerUnit && calc.pricePerUnit > 0) && (
            <div className="font-semibold">
              <p className="text-muted-foreground text-xs font-normal">Total Cost</p>
              <span className="text-green-600 dark:text-green-400 text-base">{(calc.weight * (calc.quantity || 1) * calc.pricePerUnit).toFixed(2)}</span>
              <span className="text-muted-foreground ml-1">{calc.currency}</span>
            </div>
           )}
        </div>
      </div>
    </div>
  )
} 