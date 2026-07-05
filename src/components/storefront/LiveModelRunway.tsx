import React, { useEffect, useRef, useState } from 'react'
import { Sparkles, Play, Pause } from 'lucide-react'

interface LiveModelRunwayProps {
  productName: string
  designUrl: string
  garmentColor?: string
  isActive?: boolean
}

export const LiveModelRunway: React.FC<LiveModelRunwayProps> = ({
  productName,
  designUrl,
  garmentColor = '#101010',
  isActive = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(isActive)
  const animationFrameRef = useRef<number | null>(null)
  const imageCacheRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    setIsPlaying(isActive)
  }, [isActive])

  useEffect(() => {
    // Pre-cache design image overlay
    if (designUrl) {
      const img = new Image()
      img.src = designUrl
      img.onload = () => {
        imageCacheRef.current = img
      }
    }
  }, [designUrl])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = (canvas.width = 400)
    let height = (canvas.height = 500)
    let frame = 0

    const drawRunway = (time: number) => {
      ctx.clearRect(0, 0, width, height)

      // 1. Dark Futuristic Cyber Runway Background
      ctx.fillStyle = '#050505'
      ctx.fillRect(0, 0, width, height)

      // Neon grid lines receding into perspective
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.2)' // purple-500/20
      ctx.lineWidth = 1

      const horizonY = height * 0.4
      const gridCount = 14
      const timeOffset = (time * 0.03) % 1 // Moves grid backward

      // Draw perspective vanishing lines
      for (let i = 0; i <= gridCount; i++) {
        const xRatio = i / gridCount
        const startX = width * 0.5 + (xRatio - 0.5) * 80
        const endX = width * 0.5 + (xRatio - 0.5) * width * 2
        ctx.beginPath()
        ctx.moveTo(startX, horizonY)
        ctx.lineTo(endX, height)
        ctx.stroke()
      }

      // Draw horizontal walking grid lines moving closer
      for (let j = 0; j < 8; j++) {
        const progress = (j + timeOffset) / 8
        const gridY = horizonY + progress * (height - horizonY)
        const gridWidth = 80 + progress * (width * 1.5 - 80)
        ctx.strokeStyle = `rgba(168, 85, 247, ${progress * 0.25})`
        ctx.beginPath()
        ctx.moveTo(width * 0.5 - gridWidth * 0.5, gridY)
        ctx.lineTo(width * 0.5 + gridWidth * 0.5, gridY)
        ctx.stroke()
      }

      // 2. Compute runway model walk cycle physics
      const walkCycle = time * 0.08
      const swayX = Math.sin(walkCycle) * 16 // Side to side hips sway
      const shoulderSway = -Math.sin(walkCycle) * 6 // Opposite shoulder sway
      const bounceY = Math.abs(Math.sin(walkCycle * 2)) * 6 // Walking vertical bounce
      
      // Model positioning
      const modelCenterX = width * 0.5 + swayX
      const modelCenterY = height * 0.52 + bounceY

      // 3. Render High-Fashion Cyberpunk Vector Model
      // Shadow floor glow
      const shadowGrad = ctx.createRadialGradient(
        modelCenterX, height * 0.9, 5,
        modelCenterX, height * 0.9, 45
      )
      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.6)')
      shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = shadowGrad
      ctx.beginPath()
      ctx.ellipse(modelCenterX, height * 0.9, 35, 10, 0, 0, Math.PI * 2)
      ctx.fill()

      // Model Skin/Silhouette Style (High-end metallic black)
      ctx.fillStyle = '#141414'
      ctx.strokeStyle = '#303030'
      ctx.lineWidth = 1.5

      // Left leg walk animation
      const leftFootX = modelCenterX - 18 + Math.sin(walkCycle) * 12
      const leftFootY = height * 0.9 - Math.max(0, Math.cos(walkCycle)) * 14
      ctx.beginPath()
      ctx.moveTo(modelCenterX - 10, modelCenterY + 60) // Hip left
      ctx.lineTo(modelCenterX - 12 + Math.sin(walkCycle) * 6, modelCenterY + 100) // Knee left
      ctx.lineTo(leftFootX, leftFootY) // Foot left
      ctx.stroke()

      // Right leg walk animation
      const rightFootX = modelCenterX + 18 - Math.sin(walkCycle) * 12
      const rightFootY = height * 0.9 - Math.max(0, -Math.cos(walkCycle)) * 14
      ctx.beginPath()
      ctx.moveTo(modelCenterX + 10, modelCenterY + 60) // Hip right
      ctx.lineTo(modelCenterX + 12 - Math.sin(walkCycle) * 6, modelCenterY + 100) // Knee right
      ctx.lineTo(rightFootX, rightFootY) // Foot right
      ctx.stroke()

      // Torso fabric coat (draw in configured garmentColor)
      ctx.fillStyle = garmentColor
      ctx.beginPath()
      ctx.moveTo(modelCenterX - 22 + shoulderSway, modelCenterY - 60) // Left Shoulder
      ctx.lineTo(modelCenterX + 22 - shoulderSway, modelCenterY - 60) // Right Shoulder
      ctx.lineTo(modelCenterX + 18, modelCenterY + 60) // Right Hip
      ctx.lineTo(modelCenterX - 18, modelCenterY + 60) // Left Hip
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Left arm swing
      const leftHandX = modelCenterX - 36 + Math.cos(walkCycle) * 14
      const leftHandY = modelCenterY + 20 - Math.sin(walkCycle) * 8
      ctx.beginPath()
      ctx.moveTo(modelCenterX - 22 + shoulderSway, modelCenterY - 60) // Shoulder
      ctx.lineTo(modelCenterX - 30 + shoulderSway * 0.5, modelCenterY - 10) // Elbow
      ctx.lineTo(leftHandX, leftHandY) // Hand
      ctx.stroke()

      // Right arm swing
      const rightHandX = modelCenterX + 36 - Math.cos(walkCycle) * 14
      const rightHandY = modelCenterY + 20 + Math.sin(walkCycle) * 8
      ctx.beginPath()
      ctx.moveTo(modelCenterX + 22 - shoulderSway, modelCenterY - 60) // Shoulder
      ctx.lineTo(modelCenterX + 30 - shoulderSway * 0.5, modelCenterY - 10) // Elbow
      ctx.lineTo(rightHandX, rightHandY) // Hand
      ctx.stroke()

      // Model neck and head (High fashion cyber visor look)
      ctx.fillStyle = '#181818'
      ctx.beginPath()
      ctx.arc(modelCenterX, modelCenterY - 78, 12, 0, Math.PI * 2) // Head
      ctx.fill()
      ctx.stroke()

      // Glowing Neon Visor
      ctx.strokeStyle = '#a855f7' // purple glow
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(modelCenterX - 10, modelCenterY - 80)
      ctx.lineTo(modelCenterX + 10, modelCenterY - 80)
      ctx.stroke()

      // 4. Overlap & Distort custom printed design image onto walking chest
      const designImg = imageCacheRef.current
      if (designImg) {
        ctx.save()
        // Center of the chest coordinates
        const chestX = modelCenterX + (shoulderSway * 0.25)
        const chestY = modelCenterY - 10
        const designWidth = 28
        const designHeight = 32

        // Move to chest center, apply sway rotation and scale
        ctx.translate(chestX, chestY)
        ctx.rotate(shoulderSway * 0.05) // Chest tilts slightly as model steps

        // Render clip mask to blend design inside shirt layout limits
        ctx.beginPath()
        ctx.rect(-designWidth * 0.5, -designHeight * 0.5, designWidth, designHeight)
        
        // Draw the product print artwork
        ctx.globalAlpha = 0.85
        ctx.drawImage(designImg, -designWidth * 0.5, -designHeight * 0.5, designWidth, designHeight)
        ctx.restore()
      }

      // Neon runway spotlight ring overlay
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.ellipse(modelCenterX, height * 0.9, 45, 13, 0, 0, Math.PI * 2)
      ctx.stroke()
    }

    const renderLoop = () => {
      frame++
      drawRunway(frame)
      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(renderLoop)
      }
    }

    renderLoop()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPlaying, designUrl, garmentColor])

  return (
    <div className="relative w-full h-full overflow-hidden bg-neutral-950 flex flex-col items-center justify-center group/runway">
      {/* Dynamic Runway Stage Canvas */}
      <canvas 
        ref={canvasRef} 
        className="w-full h-full max-h-[480px] object-contain transition-all duration-500" 
      />

      {/* Futuristic runway camera stats overlay */}
      <div className="absolute top-3 left-3 flex flex-col text-[8px] font-mono text-purple-400 opacity-60 group-hover/runway:opacity-100 transition-opacity">
        <span>CAM: RUNWAY_CENTRAL</span>
        <span>FPS: 60 // SYNC: OK</span>
        <span>GRID_VANISH: 14.5deg</span>
      </div>

      <div className="absolute top-3 right-3 inline-flex items-center gap-1 text-[8px] font-bold text-white px-2 py-0.5 rounded bg-brand-500/10 border border-brand-500/20 uppercase tracking-widest animate-pulse">
        <Sparkles className="h-2 w-2 text-brand-400" />
        Live Ramp Walk
      </div>

      {/* Bottom control row */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover/runway:opacity-100 transition-opacity duration-300">
        <span className="text-[10px] text-gray-500 font-mono truncate max-w-[70%]">
          Wearing: {productName}
        </span>
        <button
          onClick={(e) => {
            e.preventDefault()
            setIsPlaying(!isPlaying)
          }}
          className="p-1.5 rounded bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  )
}
