"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"

export default function BackgroundElements() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions to match window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    // Initial resize
    resizeCanvas()

    // Listen for window resize
    window.addEventListener("resize", resizeCanvas)

    // Blueprint grid pattern
    const drawBlueprintGrid = () => {
      const isDark = theme === "dark"

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Major grid color
      ctx.strokeStyle = isDark ? "rgba(59, 130, 246, 0.15)" : "rgba(59, 130, 246, 0.1)"

      // Major grid
      const majorGridSize = 100
      ctx.lineWidth = 1

      for (let x = 0; x < canvas.width; x += majorGridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      for (let y = 0; y < canvas.height; y += majorGridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Minor grid color
      ctx.strokeStyle = isDark ? "rgba(59, 130, 246, 0.05)" : "rgba(59, 130, 246, 0.05)"

      // Minor grid
      const minorGridSize = 20
      ctx.lineWidth = 0.5

      for (let x = 0; x < canvas.width; x += minorGridSize) {
        if (x % majorGridSize !== 0) {
          // Skip lines that overlap with major grid
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x, canvas.height)
          ctx.stroke()
        }
      }

      for (let y = 0; y < canvas.height; y += minorGridSize) {
        if (y % majorGridSize !== 0) {
          // Skip lines that overlap with major grid
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(canvas.width, y)
          ctx.stroke()
        }
      }

      // Draw some engineering symbols/shapes
      drawEngineeringSymbols(ctx, canvas.width, canvas.height, isDark)
    }

    const drawEngineeringSymbols = (ctx: CanvasRenderingContext2D, width: number, height: number, isDark: boolean) => {
      // Set symbol color
      ctx.strokeStyle = isDark ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.15)"
      ctx.lineWidth = 1.5

      // Draw I-beam symbols
      const numSymbols = Math.floor((width * height) / 300000) // Scale with canvas size

      for (let i = 0; i < numSymbols; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const size = 15 + Math.random() * 30
        const rotation = Math.random() * Math.PI

        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(rotation)

        // Randomly choose between different engineering symbols
        const symbolType = Math.floor(Math.random() * 4)

        switch (symbolType) {
          case 0: // I-beam
            drawIBeam(ctx, size)
            break
          case 1: // Angle
            drawAngle(ctx, size)
            break
          case 2: // Circle (pipe)
            drawPipe(ctx, size)
            break
          case 3: // Rectangle (tube)
            drawTube(ctx, size)
            break
        }

        ctx.restore()
      }
    }

    const drawIBeam = (ctx: CanvasRenderingContext2D, size: number) => {
      const halfSize = size / 2
      const flangeWidth = size
      const webThickness = size / 6

      // Top flange
      ctx.beginPath()
      ctx.moveTo(-flangeWidth / 2, -halfSize)
      ctx.lineTo(flangeWidth / 2, -halfSize)
      ctx.stroke()

      // Web
      ctx.beginPath()
      ctx.moveTo(0, -halfSize)
      ctx.lineTo(0, halfSize)
      ctx.stroke()

      // Bottom flange
      ctx.beginPath()
      ctx.moveTo(-flangeWidth / 2, halfSize)
      ctx.lineTo(flangeWidth / 2, halfSize)
      ctx.stroke()
    }

    const drawAngle = (ctx: CanvasRenderingContext2D, size: number) => {
      ctx.beginPath()
      ctx.moveTo(-size / 2, -size / 2)
      ctx.lineTo(-size / 2, size / 2)
      ctx.lineTo(size / 2, size / 2)
      ctx.stroke()
    }

    const drawPipe = (ctx: CanvasRenderingContext2D, size: number) => {
      ctx.beginPath()
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2)
      ctx.stroke()

      // Inner circle for pipe
      ctx.beginPath()
      ctx.arc(0, 0, size / 3, 0, Math.PI * 2)
      ctx.stroke()
    }

    const drawTube = (ctx: CanvasRenderingContext2D, size: number) => {
      const halfSize = size / 2

      // Outer rectangle
      ctx.beginPath()
      ctx.rect(-halfSize, -halfSize / 1.5, size, size / 1.5)
      ctx.stroke()

      // Inner rectangle
      const thickness = size / 6
      ctx.beginPath()
      ctx.rect(-halfSize + thickness, -halfSize / 1.5 + thickness, size - thickness * 2, size / 1.5 - thickness * 2)
      ctx.stroke()
    }

    // Draw initial grid
    drawBlueprintGrid()

    // Redraw when theme changes
    const observer = new MutationObserver(() => {
      drawBlueprintGrid()
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas)
      observer.disconnect()
    }
  }, [theme])

  return (
    <>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background to-background via-primary/5 z-0" />

      {/* Blueprint grid canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-70" style={{ pointerEvents: "none" }} />

      {/* Decorative elements */}
      <div className="absolute top-1/4 -left-20 w-60 h-60 bg-primary/20 rounded-full filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute bottom-1/4 -right-20 w-60 h-60 bg-secondary/20 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute top-2/3 left-1/3 w-60 h-60 bg-accent/20 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
    </>
  )
}
