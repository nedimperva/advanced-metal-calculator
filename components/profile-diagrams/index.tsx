import React from 'react'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'

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
                h = {dims.h}
              </text>
              
              {/* Width dimension */}
              <line x1="0" y1={scaledH + config.dimOffset} x2={scaledB} y2={scaledH + config.dimOffset}
                    markerStart="url(#arrowheadReverse)" markerEnd="url(#arrowhead)"/>
              <text x={scaledB/2} y={scaledH + config.textOffset} textAnchor="middle">
                b = {dims.b}
              </text>
              
              {/* Wall thickness indicator */}
              <text x={scaledT/2} y={scaledT + 5} textAnchor="start" 
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
                a = {dims.a}
              </text>
              
              {/* Wall thickness indicator */}
              <text x={scaledT/2} y={scaledT + 5} textAnchor="start" 
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
                d = {dims.diameter}
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
                L = {dims.length}
              </text>
              
              {/* Width dimension */}
              <line x1={scaledL + config.dimOffset} y1="0" x2={scaledL + config.dimOffset} y2={scaledW}
                    markerStart="url(#arrowheadReverse)" markerEnd="url(#arrowhead)"/>
              <text x={scaledL + config.textOffset} y={scaledW/2} textAnchor="start" dominantBaseline="central">
                W = {dims.width}
              </text>
              
              {/* Thickness indicator */}
              <text x={scaledL/2} y={scaledW/2} textAnchor="middle" dominantBaseline="central" 
                    className="fill-blue-700 dark:fill-blue-300" fontSize={config.fontSize}>
                t = {dims.thickness}
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
  const [isVisible, setIsVisible] = React.useState(defaultVisible)

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
        <div className="text-sm font-medium text-foreground">Cross-Section View</div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(!isVisible)}
          className="text-xs h-8"
        >
          {isVisible ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
          {isVisible ? 'Hide' : 'Show'}
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