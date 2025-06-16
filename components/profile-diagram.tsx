import React from 'react'

interface ProfileDiagramProps {
  profileType: string
  dimensions: Record<string, string>
  className?: string
}

export function ProfileDiagram({ profileType, dimensions, className = "" }: ProfileDiagramProps) {
  const renderDiagram = () => {
    const dims = Object.fromEntries(
      Object.entries(dimensions).map(([key, value]) => [key, parseFloat(value) || 0])
    )

    switch (profileType) {
      case 'ibeam':
        return renderIBeam(dims)
      case 'round':
        return renderRound(dims)
      case 'rhs':
        return renderRHS(dims)
      case 'shs':
        return renderSHS(dims)
      case 'equal_angle':
        return renderEqualAngle(dims)
      case 'channel':
        return renderChannel(dims)
      default:
        return renderGeneric()
    }
  }

  const renderIBeam = (dims: Record<string, number>) => {
    const { h = 200, b = 100, tw = 6, tf = 10 } = dims
    const scale = 180 / Math.max(h, b)
    const scaledH = h * scale
    const scaledB = b * scale
    const scaledTw = tw * scale
    const scaledTf = tf * scale

    return (
      <svg viewBox="0 0 200 200" className="w-full h-32">
        <defs>
          <pattern id="crosshatch" patternUnits="userSpaceOnUse" width="4" height="4">
            <path d="M0,4 L4,0 M-1,1 L1,-1 M3,5 L5,3" stroke="#94a3b8" strokeWidth="0.5"/>
          </pattern>
        </defs>
        
        <g transform={`translate(${100 - scaledB/2}, ${100 - scaledH/2})`}>
          {/* Top flange */}
          <rect x="0" y="0" width={scaledB} height={scaledTf} 
                fill="url(#crosshatch)" stroke="#3b82f6" strokeWidth="1"/>
          
          {/* Web */}
          <rect x={scaledB/2 - scaledTw/2} y={scaledTf} 
                width={scaledTw} height={scaledH - 2*scaledTf} 
                fill="url(#crosshatch)" stroke="#3b82f6" strokeWidth="1"/>
          
          {/* Bottom flange */}
          <rect x="0" y={scaledH - scaledTf} width={scaledB} height={scaledTf} 
                fill="url(#crosshatch)" stroke="#3b82f6" strokeWidth="1"/>
          
          {/* Dimension lines */}
          <g stroke="#ef4444" strokeWidth="0.5" fill="#ef4444" fontSize="8">
            {/* Height dimension */}
            <line x1={scaledB + 5} y1="0" x2={scaledB + 5} y2={scaledH} markerEnd="url(#arrowhead)"/>
            <text x={scaledB + 10} y={scaledH/2} textAnchor="start" dominantBaseline="central">h={h}</text>
            
            {/* Width dimension */}
            <line x1="0" y1={scaledH + 5} x2={scaledB} y2={scaledH + 5} markerEnd="url(#arrowhead)"/>
            <text x={scaledB/2} y={scaledH + 15} textAnchor="middle">b={b}</text>
          </g>
        </g>
        
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                  refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444"/>
          </marker>
        </defs>
      </svg>
    )
  }

  const renderRound = (dims: Record<string, number>) => {
    const { diameter = 50, d = diameter } = dims
    const radius = (d || diameter) / 2
    const scale = 80 / radius

    return (
      <svg viewBox="0 0 200 200" className="w-full h-32">
        <g transform="translate(100, 100)">
          <circle r={radius * scale} fill="none" stroke="#3b82f6" strokeWidth="2"/>
          <circle r={2} fill="#3b82f6"/>
          
          {/* Diameter line */}
          <line x1={-radius * scale} y1="0" x2={radius * scale} y2="0" 
                stroke="#ef4444" strokeWidth="1"/>
          
          {/* Dimension */}
          <text x="0" y={radius * scale + 15} textAnchor="middle" fill="#ef4444" fontSize="10">
            d={d || diameter}
          </text>
        </g>
      </svg>
    )
  }

  const renderRHS = (dims: Record<string, number>) => {
    const { h = 100, b = 60, t = 5 } = dims
    const scale = 140 / Math.max(h, b)
    const scaledH = h * scale
    const scaledB = b * scale
    const scaledT = t * scale

    return (
      <svg viewBox="0 0 200 200" className="w-full h-32">
        <g transform={`translate(${100 - scaledB/2}, ${100 - scaledH/2})`}>
          {/* Outer rectangle */}
          <rect x="0" y="0" width={scaledB} height={scaledH} 
                fill="url(#crosshatch)" stroke="#3b82f6" strokeWidth="1"/>
          
          {/* Inner rectangle (hollow) */}
          <rect x={scaledT} y={scaledT} 
                width={scaledB - 2*scaledT} height={scaledH - 2*scaledT} 
                fill="white" stroke="#3b82f6" strokeWidth="1"/>
          
          {/* Dimensions */}
          <g stroke="#ef4444" strokeWidth="0.5" fill="#ef4444" fontSize="8">
            <line x1={scaledB + 5} y1="0" x2={scaledB + 5} y2={scaledH}/>
            <text x={scaledB + 10} y={scaledH/2} textAnchor="start" dominantBaseline="central">h={h}</text>
            
            <line x1="0" y1={scaledH + 5} x2={scaledB} y2={scaledH + 5}/>
            <text x={scaledB/2} y={scaledH + 15} textAnchor="middle">b={b}</text>
            
            <text x="2" y="10" fontSize="6">t={t}</text>
          </g>
        </g>
      </svg>
    )
  }

  const renderSHS = (dims: Record<string, number>) => {
    const { a = 50, t = 4 } = dims
    const scale = 120 / a
    const scaledA = a * scale
    const scaledT = t * scale

    return (
      <svg viewBox="0 0 200 200" className="w-full h-32">
        <g transform={`translate(${100 - scaledA/2}, ${100 - scaledA/2})`}>
          {/* Outer square */}
          <rect x="0" y="0" width={scaledA} height={scaledA} 
                fill="url(#crosshatch)" stroke="#3b82f6" strokeWidth="1"/>
          
          {/* Inner square (hollow) */}
          <rect x={scaledT} y={scaledT} 
                width={scaledA - 2*scaledT} height={scaledA - 2*scaledT} 
                fill="white" stroke="#3b82f6" strokeWidth="1"/>
          
          {/* Dimensions */}
          <g stroke="#ef4444" strokeWidth="0.5" fill="#ef4444" fontSize="8">
            <line x1={scaledA + 5} y1="0" x2={scaledA + 5} y2={scaledA}/>
            <text x={scaledA + 10} y={scaledA/2} textAnchor="start" dominantBaseline="central">a={a}</text>
            
            <text x="2" y="10" fontSize="6">t={t}</text>
          </g>
        </g>
      </svg>
    )
  }

  const renderEqualAngle = (dims: Record<string, number>) => {
    const { a = 50, t = 5 } = dims
    const scale = 120 / a
    const scaledA = a * scale
    const scaledT = t * scale

    return (
      <svg viewBox="0 0 200 200" className="w-full h-32">
        <g transform={`translate(${100 - scaledA/2}, ${100 - scaledA/2})`}>
          {/* L-shape path */}
          <path d={`M 0 ${scaledA} L 0 0 L ${scaledA} 0 L ${scaledA} ${scaledT} L ${scaledT} ${scaledT} L ${scaledT} ${scaledA} Z`}
                fill="url(#crosshatch)" stroke="#3b82f6" strokeWidth="1"/>
          
          {/* Dimensions */}
          <g stroke="#ef4444" strokeWidth="0.5" fill="#ef4444" fontSize="8">
            <line x1={scaledA + 5} y1="0" x2={scaledA + 5} y2={scaledA}/>
            <text x={scaledA + 10} y={scaledA/2} textAnchor="start" dominantBaseline="central">a={a}</text>
            
            <text x="2" y={scaledA + 15} fontSize="6">t={t}</text>
          </g>
        </g>
      </svg>
    )
  }

  const renderChannel = (dims: Record<string, number>) => {
    const { h = 100, b = 50, tw = 5, tf = 8 } = dims
    const scale = 140 / Math.max(h, b)
    const scaledH = h * scale
    const scaledB = b * scale
    const scaledTw = tw * scale
    const scaledTf = tf * scale

    return (
      <svg viewBox="0 0 200 200" className="w-full h-32">
        <g transform={`translate(${100 - scaledB/2}, ${100 - scaledH/2})`}>
          {/* Channel shape */}
          <path d={`M 0 0 L ${scaledB} 0 L ${scaledB} ${scaledTf} L ${scaledTw} ${scaledTf} 
                    L ${scaledTw} ${scaledH - scaledTf} L ${scaledB} ${scaledH - scaledTf} 
                    L ${scaledB} ${scaledH} L 0 ${scaledH} Z`}
                fill="url(#crosshatch)" stroke="#3b82f6" strokeWidth="1"/>
          
          {/* Dimensions */}
          <g stroke="#ef4444" strokeWidth="0.5" fill="#ef4444" fontSize="8">
            <text x={scaledB/2} y={scaledH + 15} textAnchor="middle">b={b}</text>
            <text x={scaledB + 10} y={scaledH/2} textAnchor="start" dominantBaseline="central">h={h}</text>
          </g>
        </g>
      </svg>
    )
  }

  const renderGeneric = () => (
    <svg viewBox="0 0 200 200" className="w-full h-32">
      <g transform="translate(100, 100)">
        <rect x="-40" y="-30" width="80" height="60" 
              fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5"/>
        <text y="0" textAnchor="middle" fill="#64748b" fontSize="12">
          Profile View
        </text>
      </g>
    </svg>
  )

  return (
    <div className={`bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 
                     rounded-lg border border-border/30 p-4 ${className}`}>
      <div className="text-xs text-muted-foreground mb-2 text-center">Cross-Section View</div>
      {renderDiagram()}
    </div>
  )
} 