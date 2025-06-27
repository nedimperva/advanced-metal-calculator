import React from 'react'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'
import { useI18n } from '@/contexts/i18n-context'

// Base interface for all profile components
export interface BaseProfileProps {
  dimensions: Record<string, string | number>
  showDimensions?: boolean
  size?: 'small' | 'medium' | 'large'
  className?: string
}

// Common SVG patterns and definitions
const CommonSVGDefs = () => (
  <defs>
    <pattern id="steelCrosshatch" patternUnits="userSpaceOnUse" width="6" height="6">
      <path d="M0,6 L6,0 M-1,1 L1,-1 M5,7 L7,5" stroke="#64748b" strokeWidth="0.8" opacity="0.6"/>
    </pattern>
    <pattern id="steelCrosshatchDense" patternUnits="userSpaceOnUse" width="4" height="4">
      <path d="M0,4 L4,0 M-1,1 L1,-1 M3,5 L5,3" stroke="#475569" strokeWidth="0.6" opacity="0.8"/>
    </pattern>
    <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#dc2626" opacity="0.8"/>
    </marker>
    <marker id="arrowheadReverse" markerWidth="8" markerHeight="6" refX="1" refY="3" orient="auto">
      <polygon points="8 0, 0 3, 8 6" fill="#dc2626" opacity="0.8"/>
    </marker>
  </defs>
)

// Helper function to get size-based dimensions
const getSizeConfig = (size: 'small' | 'medium' | 'large' = 'medium') => {
  switch (size) {
    case 'small':
      return { 
        viewBox: "0 0 200 150", 
        fontSize: "10", 
        strokeWidth: "1.2", 
        containerClass: "h-32",
        dimOffset: 8,
        textOffset: 12
      }
    case 'large':
      return { 
        viewBox: "0 0 400 300", 
        fontSize: "16", 
        strokeWidth: "2.5", 
        containerClass: "h-96",
        dimOffset: 15,
        textOffset: 20
      }
    default:
      return { 
        viewBox: "0 0 300 200", 
        fontSize: "12", 
        strokeWidth: "1.8", 
        containerClass: "h-48",
        dimOffset: 10,
        textOffset: 15
      }
  }
}

// I-Beam Profile Component
export const IBeamProfile: React.FC<BaseProfileProps> = ({ 
  dimensions, 
  showDimensions = true, 
  size = 'medium', 
  className = "" 
}) => {
  const dims = {
    h: parseFloat(dimensions.h?.toString() || '200'),
    b: parseFloat(dimensions.b?.toString() || '100'),
    tw: parseFloat(dimensions.tw?.toString() || '6'),
    tf: parseFloat(dimensions.tf?.toString() || '10'),
  }
  
  const config = getSizeConfig(size)
  const centerX = size === 'large' ? 200 : size === 'small' ? 100 : 150
  const centerY = size === 'large' ? 150 : size === 'small' ? 75 : 100
  
  const scale = (size === 'large' ? 280 : size === 'small' ? 120 : 160) / Math.max(dims.h, dims.b)
  const scaledH = dims.h * scale
  const scaledB = dims.b * scale
  const scaledTw = dims.tw * scale
  const scaledTf = dims.tf * scale

  return (
    <div className={`bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 
                     rounded-lg border border-border/30 p-4 ${config.containerClass} ${className}`}>
      <svg viewBox={config.viewBox} className="w-full h-full">
        <CommonSVGDefs />
        
        <g transform={`translate(${centerX - scaledB/2}, ${centerY - scaledH/2})`}>
          {/* Top flange */}
          <rect x="0" y="0" width={scaledB} height={scaledTf} 
                fill="url(#steelCrosshatch)" stroke="#1e40af" strokeWidth={config.strokeWidth}/>
          
          {/* Web */}
          <rect x={scaledB/2 - scaledTw/2} y={scaledTf} 
                width={scaledTw} height={scaledH - 2*scaledTf} 
                fill="url(#steelCrosshatch)" stroke="#1e40af" strokeWidth={config.strokeWidth}/>
          
          {/* Bottom flange */}
          <rect x="0" y={scaledH - scaledTf} width={scaledB} height={scaledTf} 
                fill="url(#steelCrosshatch)" stroke="#1e40af" strokeWidth={config.strokeWidth}/>
          
          {/* Dimension lines and labels */}
          {showDimensions && (
            <g stroke="#dc2626" strokeWidth="1" fill="#dc2626" fontSize={config.fontSize} fontWeight="600">
              {/* Height dimension */}
              <line x1={scaledB + config.dimOffset} y1="0" x2={scaledB + config.dimOffset} y2={scaledH} 
                    markerStart="url(#arrowheadReverse)" markerEnd="url(#arrowhead)"/>
              <text x={scaledB + config.textOffset} y={scaledH/2} textAnchor="start" dominantBaseline="central">
                h = {dims.h}
              </text>
              
              {/* Width dimension */}
              <line x1="0" y1={scaledH + config.dimOffset} x2={scaledB} y2={scaledH + config.dimOffset}
                    markerStart="url(#arrowheadReverse)" markerEnd="url(#arrowhead)"/>
              <text x={scaledB/2} y={scaledH + config.textOffset} textAnchor="middle">
                b = {dims.b}
              </text>
              
              {/* Web thickness */}
              <text x={scaledB/2} y={scaledH/2} textAnchor="middle" dominantBaseline="central" 
                    className="fill-blue-700 dark:fill-blue-300" fontSize={config.fontSize}>
                tw = {dims.tw}
              </text>
              
              {/* Flange thickness */}
              <text x={scaledB/4} y={scaledTf/2} textAnchor="middle" dominantBaseline="central" 
                    className="fill-blue-700 dark:fill-blue-300" fontSize={config.fontSize}>
                tf = {dims.tf}
              </text>
            </g>
          )}
        </g>
      </svg>
    </div>
  )
}

// Rectangular Hollow Section (RHS) Profile Component
export const RHSProfile: React.FC<BaseProfileProps> = ({ 
  dimensions, 
  showDimensions = true, 
  size = 'medium', 
  className = "" 
}) => {
  const dims = {
    h: parseFloat(dimensions.h?.toString() || '100'),
    b: parseFloat(dimensions.b?.toString() || '60'),
    t: parseFloat(dimensions.t?.toString() || '5'),
  }
  
  const config = getSizeConfig(size)
  const centerX = size === 'large' ? 200 : size === 'small' ? 100 : 150
  const centerY = size === 'large' ? 150 : size === 'small' ? 75 : 100
  
  const scale = (size === 'large' ? 250 : size === 'small' ? 110 : 140) / Math.max(dims.h, dims.b)
  const scaledH = dims.h * scale
  const scaledB = dims.b * scale
  const scaledT = dims.t * scale

  return (
    <div className={`bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 
                     rounded-lg border border-border/30 p-4 ${config.containerClass} ${className}`}>
      <svg viewBox={config.viewBox} className="w-full h-full">
        <CommonSVGDefs />
        
        <g transform={`translate(${centerX - scaledB/2}, ${centerY - scaledH/2})`}>
          {/* Outer rectangle */}
          <rect x="0" y="0" width={scaledB} height={scaledH} 
                fill="url(#steelCrosshatch)" stroke="#1e40af" strokeWidth={config.strokeWidth}/>
          
          {/* Inner rectangle (hollow) */}
          <rect x={scaledT} y={scaledT} 
                width={scaledB - 2*scaledT} height={scaledH - 2*scaledT} 
                fill="white" stroke="#1e40af" strokeWidth={config.strokeWidth}/>
          
          {/* Dimension lines and labels */}
          {showDimensions && (
            <g stroke="#dc2626" strokeWidth="1" fill="#dc2626" fontSize={config.fontSize} fontWeight="600">
              {/* Height dimension */}
              <line x1={scaledB + config.dimOffset} y1="0" x2={scaledB + config.dimOffset} y2={scaledH}
                    markerStart="url(#arrowheadReverse)" markerEnd="url(#arrowhead)"/>
              <text x={scaledB + config.textOffset} y={scaledH/2} textAnchor="start" dominantBaseline="central">
                height = {dims.h}
              </text>
              
              {/* Width dimension */}
              <line x1="0" y1={scaledH + config.dimOffset} x2={scaledB} y2={scaledH + config.dimOffset}
                    markerStart="url(#arrowheadReverse)" markerEnd="url(#arrowhead)"/>
              <text x={scaledB/2} y={scaledH + config.textOffset} textAnchor="middle">
                width = {dims.b}
              </text>
              
              {/* Wall thickness indicator */}
              <text x={scaledT/2} y={scaledT + 5} textAnchor="start" 
                    className="fill-blue-700 dark:fill-blue-300" fontSize={config.fontSize}>
                thickness = {dims.t}
              </text>
            </g>
          )}
        </g>
      </svg>
    </div>
  )
}

// Square Hollow Section (SHS) Profile Component
export const SHSProfile: React.FC<BaseProfileProps> = ({ 
  dimensions, 
  showDimensions = true, 
  size = 'medium', 
  className = "" 
}) => {
  const dims = {
    a: parseFloat(dimensions.a?.toString() || '50'),
    t: parseFloat(dimensions.t?.toString() || '4'),
  }
  
  const config = getSizeConfig(size)
  const centerX = size === 'large' ? 200 : size === 'small' ? 100 : 150
  const centerY = size === 'large' ? 150 : size === 'small' ? 75 : 100
  
  const scale = (size === 'large' ? 200 : size === 'small' ? 80 : 120) / dims.a
  const scaledA = dims.a * scale
  const scaledT = dims.t * scale

  return (
    <div className={`bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 
                     rounded-lg border border-border/30 p-4 ${config.containerClass} ${className}`}>
      <svg viewBox={config.viewBox} className="w-full h-full">
        <CommonSVGDefs />
        
        <g transform={`translate(${centerX - scaledA/2}, ${centerY - scaledA/2})`}>
          {/* Outer square */}
          <rect x="0" y="0" width={scaledA} height={scaledA} 
                fill="url(#steelCrosshatch)" stroke="#1e40af" strokeWidth={config.strokeWidth}/>
          
          {/* Inner square (hollow) */}
          <rect x={scaledT} y={scaledT} 
                width={scaledA - 2*scaledT} height={scaledA - 2*scaledT} 
                fill="white" stroke="#1e40af" strokeWidth={config.strokeWidth}/>
          
          {/* Dimension lines and labels */}
          {showDimensions && (
            <g stroke="#dc2626" strokeWidth="1" fill="#dc2626" fontSize={config.fontSize} fontWeight="600">
              {/* Side dimension */}
              <line x1={scaledA + config.dimOffset} y1="0" x2={scaledA + config.dimOffset} y2={scaledA}
                    markerStart="url(#arrowheadReverse)" markerEnd="url(#arrowhead)"/>
              <text x={scaledA + config.textOffset} y={scaledA/2} textAnchor="start" dominantBaseline="central">
                side = {dims.a}
              </text>
              
              {/* Wall thickness indicator */}
              <text x={scaledT/2} y={scaledT + 5} textAnchor="start" 
                    className="fill-blue-700 dark:fill-blue-300" fontSize={config.fontSize}>
                thickness = {dims.t}
              </text>
            </g>
          )}
        </g>
      </svg>
    </div>
  )
}

// Circular Hollow Section (CHS) Profile Component
export const CHSProfile: React.FC<BaseProfileProps> = ({ 
  dimensions, 
  showDimensions = true, 
  size = 'medium', 
  className = "" 
}) => {
  const dims = {
    od: parseFloat(dimensions.od?.toString() || '60'),
    wt: parseFloat(dimensions.wt?.toString() || '5'),
  }
  
  const config = getSizeConfig(size)
  const centerX = size === 'large' ? 200 : size === 'small' ? 100 : 150
  const centerY = size === 'large' ? 150 : size === 'small' ? 75 : 100
  
  const scale = (size === 'large' ? 150 : size === 'small' ? 60 : 80) / dims.od
  const scaledOD = dims.od * scale
  const scaledWT = dims.wt * scale
  const innerDiameter = dims.od - 2 * dims.wt
  const scaledID = innerDiameter * scale

  return (
    <div className={`bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 
                     rounded-lg border border-border/30 p-4 ${config.containerClass} ${className}`}>
      <svg viewBox={config.viewBox} className="w-full h-full">
        <CommonSVGDefs />
        
        <g transform={`translate(${centerX}, ${centerY})`}>
          {/* Outer circle */}
          <circle r={scaledOD/2} fill="url(#steelCrosshatch)" stroke="#1e40af" strokeWidth={config.strokeWidth}/>
          
          {/* Inner circle (hollow) */}
          <circle r={scaledID/2} fill="white" stroke="#1e40af" strokeWidth={config.strokeWidth}/>
          
          {/* Center point */}
          <circle r="2" fill="#1e40af"/>
          
          {/* Dimension lines and labels */}
          {showDimensions && (
            <g stroke="#dc2626" strokeWidth="1" fill="#dc2626" fontSize={config.fontSize} fontWeight="600">
              {/* Outer diameter line */}
              <line x1={-scaledOD/2} y1="0" x2={scaledOD/2} y2="0" 
                    markerStart="url(#arrowheadReverse)" markerEnd="url(#arrowhead)"/>
              <text x="0" y={scaledOD/2 + config.textOffset} textAnchor="middle">
                OD = {dims.od}
              </text>
              
              {/* Wall thickness indicator */}
              <line x1={scaledID/2} y1="0" x2={scaledOD/2} y2="0" 
                    stroke="#059669" strokeWidth="2"/>
              <text x={scaledOD/2 - scaledWT/2} y="-8" textAnchor="middle" 
                    className="fill-emerald-700 dark:fill-emerald-300" fontSize={config.fontSize}>
                wt = {dims.wt}
              </text>
              
              {/* Inner diameter (optional) */}
              <text x="0" y="-scaledOD/2 - 5" textAnchor="middle" 
                    className="fill-slate-600 dark:fill-slate-400" fontSize={Math.max(8, parseInt(config.fontSize) - 2)}>
                ID = {innerDiameter.toFixed(1)}
              </text>
            </g>
          )}
        </g>
      </svg>
    </div>
  )
}

// Round Bar Profile Component
export const RoundBarProfile: React.FC<BaseProfileProps> = ({ 
  dimensions, 
  showDimensions = true, 
  size = 'medium', 
  className = "" 
}) => {
  const dims = {
    diameter: parseFloat(dimensions.diameter?.toString() || dimensions.d?.toString() || '50'),
  }
  
  const config = getSizeConfig(size)
  const centerX = size === 'large' ? 200 : size === 'small' ? 100 : 150
  const centerY = size === 'large' ? 150 : size === 'small' ? 75 : 100
  
  const scale = (size === 'large' ? 150 : size === 'small' ? 60 : 80) / dims.diameter
  const scaledD = dims.diameter * scale

  return (
    <div className={`bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 
                     rounded-lg border border-border/30 p-4 ${config.containerClass} ${className}`}>
      <svg viewBox={config.viewBox} className="w-full h-full">
        <CommonSVGDefs />
        
        <g transform={`translate(${centerX}, ${centerY})`}>
          {/* Solid circle */}
          <circle r={scaledD/2} fill="url(#steelCrosshatchDense)" stroke="#1e40af" strokeWidth={config.strokeWidth}/>
          
          {/* Center point */}
          <circle r="2" fill="#1e40af"/>
          
          {/* Dimension lines and labels */}
          {showDimensions && (
            <g stroke="#dc2626" strokeWidth="1" fill="#dc2626" fontSize={config.fontSize} fontWeight="600">
              {/* Diameter line */}
              <line x1={-scaledD/2} y1="0" x2={scaledD/2} y2="0" 
                    markerStart="url(#arrowheadReverse)" markerEnd="url(#arrowhead)"/>
              <text x="0" y={scaledD/2 + config.textOffset} textAnchor="middle">
                diameter = {dims.diameter}
              </text>
            </g>
          )}
        </g>
      </svg>
    </div>
  )
}

// Equal Angle Profile Component
export const EqualAngleProfile: React.FC<BaseProfileProps> = ({ 
  dimensions, 
  showDimensions = true, 
  size = 'medium', 
  className = "" 
}) => {
  const dims = {
    a: parseFloat(dimensions.a?.toString() || '50'),
    t: parseFloat(dimensions.t?.toString() || '5'),
  }
  
  const config = getSizeConfig(size)
  const centerX = size === 'large' ? 200 : size === 'small' ? 100 : 150
  const centerY = size === 'large' ? 150 : size === 'small' ? 75 : 100
  
  const scale = (size === 'large' ? 180 : size === 'small' ? 80 : 120) / dims.a
  const scaledA = dims.a * scale
  const scaledT = dims.t * scale

  return (
    <div className={`bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 
                     rounded-lg border border-border/30 p-4 ${config.containerClass} ${className}`}>
      <svg viewBox={config.viewBox} className="w-full h-full">
        <CommonSVGDefs />
        
        <g transform={`translate(${centerX - scaledA/2}, ${centerY - scaledA/2})`}>
          {/* L-shape path */}
          <path d={`M 0 ${scaledA} L 0 0 L ${scaledA} 0 L ${scaledA} ${scaledT} L ${scaledT} ${scaledT} L ${scaledT} ${scaledA} Z`}
                fill="url(#steelCrosshatch)" stroke="#1e40af" strokeWidth={config.strokeWidth}/>
          
          {/* Dimension lines and labels */}
          {showDimensions && (
            <g stroke="#dc2626" strokeWidth="1" fill="#dc2626" fontSize={config.fontSize} fontWeight="600">
              {/* Vertical leg dimension */}
              <line x1={scaledA + config.dimOffset} y1="0" x2={scaledA + config.dimOffset} y2={scaledA}
                    markerStart="url(#arrowheadReverse)" markerEnd="url(#arrowhead)"/>
              <text x={scaledA + config.textOffset} y={scaledA/2} textAnchor="start" dominantBaseline="central">
                a = {dims.a}
              </text>
              
              {/* Horizontal leg dimension */}
              <line x1="0" y1={scaledA + config.dimOffset} x2={scaledA} y2={scaledA + config.dimOffset}
                    markerStart="url(#arrowheadReverse)" markerEnd="url(#arrowhead)"/>
              <text x={scaledA/2} y={scaledA + config.textOffset} textAnchor="middle">
                a = {dims.a}
              </text>
              
              {/* Thickness indicator */}
              <text x={scaledT/2} y={scaledA - 5} textAnchor="start" 
                    className="fill-blue-700 dark:fill-blue-300" fontSize={config.fontSize}>
                t = {dims.t}
              </text>
            </g>
          )}
        </g>
      </svg>
    </div>
  )
}

// Unequal Angle Profile Component
export const UnequalAngleProfile: React.FC<BaseProfileProps> = ({ 
  dimensions, 
  showDimensions = true, 
  size = 'medium', 
  className = "" 
}) => {
  const dims = {
    a: parseFloat(dimensions.a?.toString() || '80'),
    b: parseFloat(dimensions.b?.toString() || '60'),
    t: parseFloat(dimensions.t?.toString() || '6'),
  }
  
  const config = getSizeConfig(size)
  const centerX = size === 'large' ? 200 : size === 'small' ? 100 : 150
  const centerY = size === 'large' ? 150 : size === 'small' ? 75 : 100
  
  const maxDim = Math.max(dims.a, dims.b)
  const scale = (size === 'large' ? 180 : size === 'small' ? 80 : 120) / maxDim
  const scaledA = dims.a * scale
  const scaledB = dims.b * scale
  const scaledT = dims.t * scale

  return (
    <div className={`bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 
                     rounded-lg border border-border/30 p-4 ${config.containerClass} ${className}`}>
      <svg viewBox={config.viewBox} className="w-full h-full">
        <CommonSVGDefs />
        
        <g transform={`translate(${centerX - scaledA/2}, ${centerY - scaledB/2})`}>
          {/* Unequal L-shape path */}
          <path d={`M 0 ${scaledB} L 0 0 L ${scaledA} 0 L ${scaledA} ${scaledT} L ${scaledT} ${scaledT} L ${scaledT} ${scaledB} Z`}
                fill="url(#steelCrosshatch)" stroke="#1e40af" strokeWidth={config.strokeWidth}/>
          
          {/* Dimension lines and labels */}
          {showDimensions && (
            <g stroke="#dc2626" strokeWidth="1" fill="#dc2626" fontSize={config.fontSize} fontWeight="600">
              {/* Longer leg dimension (horizontal) */}
              <line x1="0" y1={scaledB + config.dimOffset} x2={scaledA} y2={scaledB + config.dimOffset}
                    markerStart="url(#arrowheadReverse)" markerEnd="url(#arrowhead)"/>
              <text x={scaledA/2} y={scaledB + config.textOffset} textAnchor="middle">
                a = {dims.a}
              </text>
              
              {/* Shorter leg dimension (vertical) */}
              <line x1={scaledA + config.dimOffset} y1="0" x2={scaledA + config.dimOffset} y2={scaledB}
                    markerStart="url(#arrowheadReverse)" markerEnd="url(#arrowhead)"/>
              <text x={scaledA + config.textOffset} y={scaledB/2} textAnchor="start" dominantBaseline="central">
                b = {dims.b}
              </text>
              
              {/* Thickness indicator */}
              <text x={scaledT/2} y={scaledB - 5} textAnchor="start" 
                    className="fill-blue-700 dark:fill-blue-300" fontSize={config.fontSize}>
                t = {dims.t}
              </text>
              
              {/* Unequal notation */}
              <text x={scaledA/2} y={-10} textAnchor="middle" 
                    className="fill-blue-700 dark:fill-blue-300" fontSize={config.fontSize}>
                L (a ≠ b)
              </text>
            </g>
          )}
        </g>
      </svg>
    </div>
  )
}

// Plate Profile Component
export const PlateProfile: React.FC<BaseProfileProps> = ({ 
  dimensions, 
  showDimensions = true, 
  size = 'medium', 
  className = "" 
}) => {
  const dims = {
    length: parseFloat(dimensions.length?.toString() || '200'),
    width: parseFloat(dimensions.width?.toString() || '100'),
    thickness: parseFloat(dimensions.thickness?.toString() || '10'),
  }
  
  const config = getSizeConfig(size)
  const centerX = size === 'large' ? 200 : size === 'small' ? 100 : 150
  const centerY = size === 'large' ? 150 : size === 'small' ? 75 : 100
  
  const scale = (size === 'large' ? 250 : size === 'small' ? 100 : 140) / Math.max(dims.length, dims.width)
  const scaledL = dims.length * scale
  const scaledW = dims.width * scale

  return (
    <div className={`bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 
                     rounded-lg border border-border/30 p-4 ${config.containerClass} ${className}`}>
      <svg viewBox={config.viewBox} className="w-full h-full">
        <CommonSVGDefs />
        
        <g transform={`translate(${centerX - scaledL/2}, ${centerY - scaledW/2})`}>
          {/* Plate rectangle */}
          <rect x="0" y="0" width={scaledL} height={scaledW} 
                fill="url(#steelCrosshatch)" stroke="#1e40af" strokeWidth={config.strokeWidth}/>
          
          {/* Dimension lines and labels */}
          {showDimensions && (
            <g stroke="#dc2626" strokeWidth="1" fill="#dc2626" fontSize={config.fontSize} fontWeight="600">
              {/* Length dimension */}
              <line x1="0" y1={scaledW + config.dimOffset} x2={scaledL} y2={scaledW + config.dimOffset}
                    markerStart="url(#arrowheadReverse)" markerEnd="url(#arrowhead)"/>
              <text x={scaledL/2} y={scaledW + config.textOffset} textAnchor="middle">
                length = {dims.length}
              </text>
              
              {/* Width dimension */}
              <line x1={scaledL + config.dimOffset} y1="0" x2={scaledL + config.dimOffset} y2={scaledW}
                    markerStart="url(#arrowheadReverse)" markerEnd="url(#arrowhead)"/>
              <text x={scaledL + config.textOffset} y={scaledW/2} textAnchor="start" dominantBaseline="central">
                width = {dims.width}
              </text>
              
              {/* Thickness indicator */}
              <text x={scaledL/2} y={scaledW/2} textAnchor="middle" dominantBaseline="central" 
                    className="fill-blue-700 dark:fill-blue-300" fontSize={config.fontSize}>
                thickness = {dims.thickness}
              </text>
            </g>
          )}
        </g>
      </svg>
    </div>
  )
}

// Hexagonal Bar Profile Component
export const HexBarProfile: React.FC<BaseProfileProps> = ({ 
  dimensions, 
  showDimensions = true, 
  size = 'medium', 
  className = "" 
}) => {
  const dims = {
    distance: parseFloat(dimensions.distance?.toString() || dimensions.d?.toString() || '50'),
  }
  
  const config = getSizeConfig(size)
  const centerX = size === 'large' ? 200 : size === 'small' ? 100 : 150
  const centerY = size === 'large' ? 150 : size === 'small' ? 75 : 100
  
  const scale = (size === 'large' ? 150 : size === 'small' ? 60 : 80) / dims.distance
  const scaledDistance = dims.distance * scale
  
  // Calculate hexagon vertices
  const radius = scaledDistance / (2 * Math.cos(Math.PI / 6)) // Distance from center to vertex
  const vertices = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * Math.PI) / 3
    return {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle)
    }
  })

  return (
    <div className={`bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 
                     rounded-lg border border-border/30 p-4 ${config.containerClass} ${className}`}>
      <svg viewBox={config.viewBox} className="w-full h-full">
        <CommonSVGDefs />
        
        <g transform={`translate(${centerX}, ${centerY})`}>
          {/* Hexagon */}
          <polygon 
            points={vertices.map(v => `${v.x},${v.y}`).join(' ')}
            fill="url(#steelCrosshatchDense)" 
            stroke="#1e40af" 
            strokeWidth={config.strokeWidth}
          />
          
          {/* Center point */}
          <circle r="2" fill="#1e40af"/>
          
          {/* Dimension lines and labels */}
          {showDimensions && (
            <g stroke="#dc2626" strokeWidth="1" fill="#dc2626" fontSize={config.fontSize} fontWeight="600">
              {/* Across flats dimension line */}
              <line x1={-scaledDistance/2} y1="0" x2={scaledDistance/2} y2="0" 
                    markerStart="url(#arrowheadReverse)" markerEnd="url(#arrowhead)"/>
              <text x="0" y={scaledDistance/2 + config.textOffset} textAnchor="middle">
                across flats = {dims.distance}
              </text>
            </g>
          )}
        </g>
      </svg>
    </div>
  )
}

// Flat Bar Profile Component
export const FlatBarProfile: React.FC<BaseProfileProps> = ({ 
  dimensions, 
  showDimensions = true, 
  size = 'medium', 
  className = "" 
}) => {
  const dims = {
    width: parseFloat(dimensions.width?.toString() || dimensions.b?.toString() || '50'),
    thickness: parseFloat(dimensions.thickness?.toString() || dimensions.t?.toString() || '5'),
  }
  
  const config = getSizeConfig(size)
  const centerX = size === 'large' ? 200 : size === 'small' ? 100 : 150
  const centerY = size === 'large' ? 150 : size === 'small' ? 75 : 100
  
  const scale = (size === 'large' ? 200 : size === 'small' ? 80 : 120) / dims.width
  const scaledWidth = dims.width * scale
  const scaledThickness = dims.thickness * scale

  return (
    <div className={`bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 
                     rounded-lg border border-border/30 p-4 ${config.containerClass} ${className}`}>
      <svg viewBox={config.viewBox} className="w-full h-full">
        <CommonSVGDefs />
        
        <g transform={`translate(${centerX - scaledWidth/2}, ${centerY - scaledThickness/2})`}>
          {/* Flat bar rectangle */}
          <rect x="0" y="0" width={scaledWidth} height={scaledThickness} 
                fill="url(#steelCrosshatchDense)" stroke="#1e40af" strokeWidth={config.strokeWidth}/>
          
          {/* Dimension lines and labels */}
          {showDimensions && (
            <g stroke="#dc2626" strokeWidth="1" fill="#dc2626" fontSize={config.fontSize} fontWeight="600">
              {/* Width dimension */}
              <line x1="0" y1={scaledThickness + config.dimOffset} x2={scaledWidth} y2={scaledThickness + config.dimOffset}
                    markerStart="url(#arrowheadReverse)" markerEnd="url(#arrowhead)"/>
              <text x={scaledWidth/2} y={scaledThickness + config.textOffset} textAnchor="middle">
                width = {dims.width}
              </text>
              
              {/* Thickness dimension */}
              <line x1={scaledWidth + config.dimOffset} y1="0" x2={scaledWidth + config.dimOffset} y2={scaledThickness}
                    markerStart="url(#arrowheadReverse)" markerEnd="url(#arrowhead)"/>
              <text x={scaledWidth + config.textOffset} y={scaledThickness/2} textAnchor="start" dominantBaseline="central">
                thickness = {dims.thickness}
              </text>
            </g>
          )}
        </g>
      </svg>
    </div>
  )
}

// Solid Square Bar Profile Component (for solid bars, not hollow)
export const SquareBarProfile: React.FC<BaseProfileProps> = ({ 
  dimensions, 
  showDimensions = true, 
  size = 'medium', 
  className = "" 
}) => {
  const dims = {
    a: parseFloat(dimensions.a?.toString() || dimensions.side?.toString() || '50'),
  }
  
  const config = getSizeConfig(size)
  const centerX = size === 'large' ? 200 : size === 'small' ? 100 : 150
  const centerY = size === 'large' ? 150 : size === 'small' ? 75 : 100
  
  const scale = (size === 'large' ? 200 : size === 'small' ? 80 : 120) / dims.a
  const scaledA = dims.a * scale

  return (
    <div className={`bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 
                     rounded-lg border border-border/30 p-4 ${config.containerClass} ${className}`}>
      <svg viewBox={config.viewBox} className="w-full h-full">
        <CommonSVGDefs />
        
        <g transform={`translate(${centerX - scaledA/2}, ${centerY - scaledA/2})`}>
          {/* Solid square */}
          <rect x="0" y="0" width={scaledA} height={scaledA} 
                fill="url(#steelCrosshatchDense)" stroke="#1e40af" strokeWidth={config.strokeWidth}/>
          
          {/* Dimension lines and labels */}
          {showDimensions && (
            <g stroke="#dc2626" strokeWidth="1" fill="#dc2626" fontSize={config.fontSize} fontWeight="600">
              {/* Side dimension */}
              <line x1={scaledA + config.dimOffset} y1="0" x2={scaledA + config.dimOffset} y2={scaledA}
                    markerStart="url(#arrowheadReverse)" markerEnd="url(#arrowhead)"/>
              <text x={scaledA + config.textOffset} y={scaledA/2} textAnchor="start" dominantBaseline="central">
                side = {dims.a}
              </text>
            </g>
          )}
        </g>
      </svg>
    </div>
  )
}

// Solid Rectangular Bar Profile Component (for solid bars, not hollow)
export const RectangularBarProfile: React.FC<BaseProfileProps> = ({ 
  dimensions, 
  showDimensions = true, 
  size = 'medium', 
  className = "" 
}) => {
  const dims = {
    h: parseFloat(dimensions.h?.toString() || dimensions.height?.toString() || '100'),
    b: parseFloat(dimensions.b?.toString() || dimensions.width?.toString() || '60'),
  }
  
  const config = getSizeConfig(size)
  const centerX = size === 'large' ? 200 : size === 'small' ? 100 : 150
  const centerY = size === 'large' ? 150 : size === 'small' ? 75 : 100
  
  const scale = (size === 'large' ? 250 : size === 'small' ? 110 : 140) / Math.max(dims.h, dims.b)
  const scaledH = dims.h * scale
  const scaledB = dims.b * scale

  return (
    <div className={`bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 
                     rounded-lg border border-border/30 p-4 ${config.containerClass} ${className}`}>
      <svg viewBox={config.viewBox} className="w-full h-full">
        <CommonSVGDefs />
        
        <g transform={`translate(${centerX - scaledB/2}, ${centerY - scaledH/2})`}>
          {/* Solid rectangle */}
          <rect x="0" y="0" width={scaledB} height={scaledH} 
                fill="url(#steelCrosshatchDense)" stroke="#1e40af" strokeWidth={config.strokeWidth}/>
          
          {/* Dimension lines and labels */}
          {showDimensions && (
            <g stroke="#dc2626" strokeWidth="1" fill="#dc2626" fontSize={config.fontSize} fontWeight="600">
              {/* Height dimension */}
              <line x1={scaledB + config.dimOffset} y1="0" x2={scaledB + config.dimOffset} y2={scaledH}
                    markerStart="url(#arrowheadReverse)" markerEnd="url(#arrowhead)"/>
              <text x={scaledB + config.textOffset} y={scaledH/2} textAnchor="start" dominantBaseline="central">
                height = {dims.h}
              </text>
              
              {/* Width dimension */}
              <line x1="0" y1={scaledH + config.dimOffset} x2={scaledB} y2={scaledH + config.dimOffset}
                    markerStart="url(#arrowheadReverse)" markerEnd="url(#arrowhead)"/>
              <text x={scaledB/2} y={scaledH + config.textOffset} textAnchor="middle">
                width = {dims.b}
              </text>
            </g>
          )}
        </g>
      </svg>
    </div>
  )
}

// Cross-Section Viewer Component with Toggle
interface CrossSectionViewerProps {
  profileType: string
  dimensions: Record<string, string>
  className?: string
  defaultVisible?: boolean
  size?: 'small' | 'medium' | 'large'
}

export const CrossSectionViewer: React.FC<CrossSectionViewerProps> = ({ 
  profileType, 
  dimensions, 
  className = "",
  defaultVisible = false,
  size = 'medium'
}) => {
  const { t, language } = useI18n()
  const [isVisible, setIsVisible] = React.useState(defaultVisible)
  
  // Simple translation for Show/Hide
  const showText = language === 'bs' ? 'Prikaži' : 'Show'
  const hideText = language === 'bs' ? 'Sakrij' : 'Hide'

  const renderProfile = () => {
    const props: BaseProfileProps = {
      dimensions,
      showDimensions: true,
      size,
      className: ""
    }

    switch (profileType) {
      case 'ibeam':
        return <IBeamProfile {...props} />
      case 'hec':
        return <HECProfile {...props} />
      case 'wbeam':
      case 'w':
        return <WBeamProfile {...props} />
      case 'channel':
      case 'c':
        return <CChannelProfile {...props} />
      case 'rhs':
        return <RHSProfile {...props} />
      case 'shs':
        return <SHSProfile {...props} />
      case 'chs':
        return <CHSProfile {...props} />
      case 'round':
        return <RoundBarProfile {...props} />
      case 'equal_angle':
        return <EqualAngleProfile {...props} />
      case 'unequal_angle':
        return <UnequalAngleProfile {...props} />
      case 'plate':
      case 'sheetMetal':
      case 'checkeredPlate':
      case 'perforatedPlate':
        return <PlateProfile {...props} />
      case 'hexagonal':
      case 'hexBar':
        return <HexBarProfile {...props} />
      case 'flat':
      case 'flatBar':
        return <FlatBarProfile {...props} />
      case 'square':
        return <SquareBarProfile {...props} />
      case 'rectangular':
        return <RectangularBarProfile {...props} />
      default:
        return (
          <div className="h-32 bg-muted/30 rounded-lg border border-dashed border-border/50 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="text-sm">Cross-Section</div>
              <div className="text-xs">Profile view not available</div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-foreground">{t('crossSectionView')}</div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(!isVisible)}
          className="text-xs h-8"
        >
          {isVisible ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
          {isVisible ? hideText : showText}
        </Button>
      </div>
      
      {isVisible && (
        <div className="animate-in slide-in-from-top-2 duration-300">
          {renderProfile()}
          <div className="mt-2 text-xs text-muted-foreground text-center">
            Engineering cross-section with dimensional annotations
          </div>
        </div>
      )}
    </div>
  )
}

// HEC Beam Profile Component (Heavy European Column)
export const HECProfile: React.FC<BaseProfileProps> = ({ 
  dimensions, 
  showDimensions = true, 
  size = 'medium', 
  className = "" 
}) => {
  const dims = {
    h: parseFloat(dimensions.h?.toString() || '300'),
    b: parseFloat(dimensions.b?.toString() || '300'),
    tw: parseFloat(dimensions.tw?.toString() || '15'),
    tf: parseFloat(dimensions.tf?.toString() || '25'),
    r: parseFloat(dimensions.r?.toString() || '27'),
  }
  
  const config = getSizeConfig(size)
  const centerX = size === 'large' ? 200 : size === 'small' ? 100 : 150
  const centerY = size === 'large' ? 150 : size === 'small' ? 75 : 100
  
  const scale = (size === 'large' ? 280 : size === 'small' ? 120 : 160) / Math.max(dims.h, dims.b)
  const scaledH = dims.h * scale
  const scaledB = dims.b * scale
  const scaledTw = dims.tw * scale
  const scaledTf = dims.tf * scale
  const scaledR = dims.r * scale

  return (
    <div className={`bg-gradient-to-br from-slate-50 to-orange-50 dark:from-slate-900 dark:to-orange-950 
                     rounded-lg border border-border/30 p-4 ${config.containerClass} ${className}`}>
      <svg viewBox={config.viewBox} className="w-full h-full">
        <CommonSVGDefs />
        
        <g transform={`translate(${centerX - scaledB/2}, ${centerY - scaledH/2})`}>
          {/* Top flange - thicker for HEC */}
          <rect x="0" y="0" width={scaledB} height={scaledTf} 
                fill="url(#steelCrosshatchDense)" stroke="#dc2626" strokeWidth={config.strokeWidth}/>
          
          {/* Web - thicker for HEC */}
          <rect x={scaledB/2 - scaledTw/2} y={scaledTf} 
                width={scaledTw} height={scaledH - 2*scaledTf} 
                fill="url(#steelCrosshatchDense)" stroke="#dc2626" strokeWidth={config.strokeWidth}/>
          
          {/* Bottom flange - thicker for HEC */}
          <rect x="0" y={scaledH - scaledTf} width={scaledB} height={scaledTf} 
                fill="url(#steelCrosshatchDense)" stroke="#dc2626" strokeWidth={config.strokeWidth}/>
          
          {/* Root radius indicators */}
          <circle cx={scaledB/2 - scaledTw/2} cy={scaledTf} r={scaledR/3} 
                  fill="none" stroke="#dc2626" strokeWidth="1" opacity="0.5"/>
          <circle cx={scaledB/2 + scaledTw/2} cy={scaledTf} r={scaledR/3} 
                  fill="none" stroke="#dc2626" strokeWidth="1" opacity="0.5"/>
          
          {/* Dimension lines and labels */}
          {showDimensions && (
            <g stroke="#dc2626" strokeWidth="1" fill="#dc2626" fontSize={config.fontSize} fontWeight="600">
              {/* Height dimension */}
              <line x1={scaledB + config.dimOffset} y1="0" x2={scaledB + config.dimOffset} y2={scaledH} 
                    markerStart="url(#arrowheadReverse)" markerEnd="url(#arrowhead)"/>
              <text x={scaledB + config.textOffset} y={scaledH/2} textAnchor="start" dominantBaseline="central">
                h = {dims.h}
              </text>
              
              {/* Width dimension */}
              <line x1="0" y1={scaledH + config.dimOffset} x2={scaledB} y2={scaledH + config.dimOffset}
                    markerStart="url(#arrowheadReverse)" markerEnd="url(#arrowhead)"/>
              <text x={scaledB/2} y={scaledH + config.textOffset} textAnchor="middle">
                b = {dims.b}
              </text>
              
              {/* Web thickness */}
              <text x={scaledB/2} y={scaledH/2} textAnchor="middle" dominantBaseline="central" 
                    className="fill-red-700 dark:fill-red-300" fontSize={config.fontSize - 1}>
                tw = {dims.tw}
              </text>
              
              {/* Flange thickness */}
              <text x={scaledB/4} y={scaledTf/2} textAnchor="middle" dominantBaseline="central" 
                    className="fill-red-700 dark:fill-red-300" fontSize={config.fontSize - 1}>
                tf = {dims.tf}
              </text>
              
              {/* Root radius */}
              <text x={scaledB - 10} y={scaledTf + 10} textAnchor="end" 
                    className="fill-red-600 dark:fill-red-400" fontSize={config.fontSize - 2}>
                r = {dims.r}
              </text>
            </g>
          )}
        </g>
      </svg>
    </div>
  )
}

// W-Beam Profile Component (American Wide Flange) - Enhanced Professional Version
export const WBeamProfile: React.FC<BaseProfileProps> = ({ 
  dimensions, 
  showDimensions = true, 
  size = 'medium', 
  className = "" 
}) => {
  const dims = {
    h: parseFloat(dimensions.h?.toString() || dimensions.d?.toString() || '203'),
    b: parseFloat(dimensions.b?.toString() || dimensions.bf?.toString() || '133'),
    tw: parseFloat(dimensions.tw?.toString() || '6.5'),
    tf: parseFloat(dimensions.tf?.toString() || '7.9'),
  }
  
  const config = getSizeConfig(size)
  const centerX = size === 'large' ? 200 : size === 'small' ? 100 : 150
  const centerY = size === 'large' ? 150 : size === 'small' ? 75 : 100
  
  const scale = (size === 'large' ? 280 : size === 'small' ? 120 : 160) / Math.max(dims.h, dims.b)
  const scaledH = dims.h * scale
  const scaledB = dims.b * scale
  const scaledTw = dims.tw * scale
  const scaledTf = dims.tf * scale

  return (
    <div className={`bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950 
                     rounded-xl border border-green-200/40 dark:border-green-800/40 p-4 shadow-lg backdrop-blur-sm 
                     ${config.containerClass} ${className}`}>
      <svg viewBox={config.viewBox} className="w-full h-full drop-shadow-sm">
        <defs>
          <CommonSVGDefs />
          <linearGradient id="wbeamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#065f46" />
            <stop offset="30%" stopColor="#047857" />
            <stop offset="70%" stopColor="#059669" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <pattern id="wbeamCrosshatch" patternUnits="userSpaceOnUse" width="8" height="8">
            <rect width="8" height="8" fill="#047857" opacity="0.1"/>
            <path d="M0,8 L8,0 M-2,2 L2,-2 M6,10 L10,6" stroke="#065f46" strokeWidth="0.8" opacity="0.6"/>
          </pattern>
        </defs>
        
        <g transform={`translate(${centerX - scaledB/2}, ${centerY - scaledH/2})`}>
          {/* Top flange with tapered edges */}
          <path d={`M0 0 L${scaledB} 0 L${scaledB} ${scaledTf} L${Number(scaledB*0.85)} ${scaledTf} L${Number(scaledB*0.15)} ${scaledTf} L0 ${scaledTf} Z`}
                fill="url(#wbeamGradient)" stroke="#065f46" strokeWidth="2" className="drop-shadow-sm"/>
          
          {/* Web */}
          <rect x={scaledB/2 - scaledTw/2} y={scaledTf} 
                width={scaledTw} height={Number(scaledH - 2*scaledTf)}
                fill="url(#wbeamCrosshatch)" stroke="#065f46" strokeWidth="1.5" className="drop-shadow-sm"/>
          
          {/* Bottom flange with tapered edges */}
          <path d={`M0 ${Number(scaledH - scaledTf)} L${Number(scaledB*0.15)} ${Number(scaledH - scaledTf)} L${Number(scaledB*0.85)} ${Number(scaledH - scaledTf)} L${scaledB} ${Number(scaledH - scaledTf)} L${scaledB} ${scaledH} L0 ${scaledH} Z`}
                fill="url(#wbeamGradient)" stroke="#065f46" strokeWidth="2" className="drop-shadow-sm"/>
          
          {/* Dimension lines and labels */}
          {showDimensions && (
            <g stroke="#dc2626" strokeWidth="1.2" fill="#dc2626" fontSize={config.fontSize} fontWeight="700">
              {/* Height dimension */}
              <line x1={scaledB + config.dimOffset} y1="0" x2={scaledB + config.dimOffset} y2={scaledH} 
                    markerStart="url(#arrowheadReverse)" markerEnd="url(#arrowhead)"/>
              <text x={scaledB + config.textOffset} y={scaledH/2} textAnchor="start" dominantBaseline="central"
                    className="fill-red-700 dark:fill-red-300 font-bold">
                d = {dims.h}
              </text>
              
              {/* Width dimension */}
              <line x1="0" y1={scaledH + config.dimOffset} x2={scaledB} y2={scaledH + config.dimOffset}
                    markerStart="url(#arrowheadReverse)" markerEnd="url(#arrowhead)"/>
              <text x={scaledB/2} y={scaledH + config.textOffset} textAnchor="middle"
                    className="fill-red-700 dark:fill-red-300 font-bold">
                bf = {dims.b}
              </text>
              
              {/* Web thickness */}
              <text x={scaledB/2} y={scaledH/2} textAnchor="middle" dominantBaseline="central" 
                    className="fill-green-800 dark:fill-green-200 font-semibold" fontSize="10">
                tw = {dims.tw}
              </text>
              
              {/* Flange thickness */}
              <text x={scaledB/4} y={scaledTf/2} textAnchor="middle" dominantBaseline="central" 
                    className="fill-green-800 dark:fill-green-200 font-semibold" fontSize="10">
                tf = {dims.tf}
              </text>
            </g>
          )}
        </g>
      </svg>
    </div>
  )
}

// C-Channel Profile Component (American Standard Channel) - Enhanced Professional Version
export const CChannelProfile: React.FC<BaseProfileProps> = ({ 
  dimensions, 
  showDimensions = true, 
  size = 'medium', 
  className = "" 
}) => {
  const dims = {
    h: parseFloat(dimensions.h?.toString() || dimensions.d?.toString() || '152'),
    b: parseFloat(dimensions.b?.toString() || dimensions.bf?.toString() || '51'),
    tw: parseFloat(dimensions.tw?.toString() || '6.4'),
    tf: parseFloat(dimensions.tf?.toString() || '9.7'),
  }
  
  const config = getSizeConfig(size)
  const centerX = size === 'large' ? 200 : size === 'small' ? 100 : 150
  const centerY = size === 'large' ? 150 : size === 'small' ? 75 : 100
  
  const scale = (size === 'large' ? 280 : size === 'small' ? 120 : 160) / Math.max(dims.h, dims.b * 2)
  const scaledH = dims.h * scale
  const scaledB = dims.b * scale
  const scaledTw = dims.tw * scale
  const scaledTf = dims.tf * scale

  return (
    <div className={`bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-purple-950 dark:via-violet-950 dark:to-indigo-950 
                     rounded-xl border border-purple-200/40 dark:border-purple-800/40 p-4 shadow-lg backdrop-blur-sm 
                     ${config.containerClass} ${className}`}>
      <svg viewBox={config.viewBox} className="w-full h-full drop-shadow-sm">
        <defs>
          <CommonSVGDefs />
          <linearGradient id="channelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6b21a8" />
            <stop offset="30%" stopColor="#7c3aed" />
            <stop offset="70%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <pattern id="channelCrosshatch" patternUnits="userSpaceOnUse" width="8" height="8">
            <rect width="8" height="8" fill="#7c3aed" opacity="0.1"/>
            <path d="M0,8 L8,0 M-2,2 L2,-2 M6,10 L10,6" stroke="#6b21a8" strokeWidth="0.8" opacity="0.6"/>
          </pattern>
        </defs>
        
        <g transform={`translate(${centerX - scaledB/2}, ${centerY - scaledH/2})`}>
          {/* Web (vertical part) with rounded corners */}
          <rect x="0" y="0" width={scaledTw} height={scaledH} rx="1"
                fill="url(#channelCrosshatch)" stroke="#6b21a8" strokeWidth="1.5" className="drop-shadow-sm"/>
          
          {/* Top flange with rounded corners */}
          <rect x="0" y="0" width={scaledB} height={scaledTf} rx="1"
                fill="url(#channelGradient)" stroke="#6b21a8" strokeWidth="2" className="drop-shadow-sm"/>
          
          {/* Bottom flange with rounded corners */}
          <rect x="0" y={scaledH - scaledTf} width={scaledB} height={scaledTf} rx="1"
                fill="url(#channelGradient)" stroke="#6b21a8" strokeWidth="2" className="drop-shadow-sm"/>
          
          {/* Dimension lines and labels */}
          {showDimensions && (
            <g stroke="#dc2626" strokeWidth="1.2" fill="#dc2626" fontSize={config.fontSize} fontWeight="700">
              {/* Height dimension */}
              <line x1={-config.dimOffset} y1="0" x2={-config.dimOffset} y2={scaledH} 
                    markerStart="url(#arrowheadReverse)" markerEnd="url(#arrowhead)"/>
              <text x={-config.textOffset} y={scaledH/2} textAnchor="end" dominantBaseline="central"
                    className="fill-red-700 dark:fill-red-300 font-bold">
                d = {dims.h}
              </text>
              
              {/* Flange width dimension */}
              <line x1="0" y1={scaledH + config.dimOffset} x2={scaledB} y2={scaledH + config.dimOffset}
                    markerStart="url(#arrowheadReverse)" markerEnd="url(#arrowhead)"/>
              <text x={scaledB/2} y={scaledH + config.textOffset} textAnchor="middle"
                    className="fill-red-700 dark:fill-red-300 font-bold">
                bf = {dims.b}
              </text>
              
              {/* Web thickness */}
              <text x={scaledTw/2} y={scaledH/2} textAnchor="middle" dominantBaseline="central" 
                    className="fill-purple-800 dark:fill-purple-200 font-semibold" fontSize="10">
                tw = {dims.tw}
              </text>
              
              {/* Flange thickness */}
              <text x={scaledB/2} y={scaledTf/2} textAnchor="middle" dominantBaseline="central" 
                    className="fill-purple-800 dark:fill-purple-200 font-semibold" fontSize="10">
                tf = {dims.tf}
              </text>
            </g>
          )}
        </g>
      </svg>
    </div>
  )
} 