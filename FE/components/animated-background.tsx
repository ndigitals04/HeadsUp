"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { useTheme } from "next-themes"

interface Particle {
  id: number
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  symbol: string
  color: string
  opacity: number
  rotation: number
  rotationSpeed: number
}

export function AnimatedBackground() {
  const { theme } = useTheme()
  const [particles, setParticles] = useState<Particle[]>([])
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Web3 symbols with better variety
  const symbols = useMemo(() => [
    '₿', '⟠', '◊', '⬢', '⬡', '◈', '◇', '⟡', '⬟', '⬠',
    '▲', '▼', '◀', '▶', '⬆', '⬇', '⬅', '➡',
    '●', '○', '◐', '◑', '◒', '◓', '⚬', '⚭',
    '⟐', '⟑', '⟒', '⟓', '⟔', '⟕', '⟖', '⟗'
  ], [])

  // Optimized color schemes
  const colorSchemes = useMemo(() => ({
    dark: [
      'rgba(0, 255, 255, 0.6)',    // Cyber blue
      'rgba(0, 255, 127, 0.6)',    // Neon green  
      'rgba(138, 43, 226, 0.6)',   // Electric purple
      'rgba(255, 215, 0, 0.6)',    // Gold
      'rgba(255, 20, 147, 0.6)',   // Deep pink
      'rgba(50, 205, 50, 0.6)',    // Lime green
    ],
    light: [
      'rgba(0, 150, 200, 0.4)',
      'rgba(50, 150, 50, 0.4)', 
      'rgba(100, 50, 150, 0.4)',
      'rgba(200, 150, 0, 0.4)',
      'rgba(150, 50, 100, 0.4)',
      'rgba(0, 100, 100, 0.4)',
    ]
  }), [])

  // Optimized particle creation
  const createParticle = useCallback((id: number): Particle => {
    const colors = theme === 'dark' ? colorSchemes.dark : colorSchemes.light
    return {
      id,
      x: Math.random() * dimensions.width,
      y: Math.random() * dimensions.height,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.5 + 0.3,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 2,
    }
  }, [dimensions, theme, symbols, colorSchemes])

  // Initialize particles with performance optimization
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    if (dimensions.width === 0) return
    
    // Adaptive particle count based on screen size and performance
    const particleCount = Math.min(50, Math.floor(dimensions.width * dimensions.height / 15000))
    const newParticles = Array.from({ length: particleCount }, (_, i) => createParticle(i))
    setParticles(newParticles)
  }, [dimensions, createParticle])

  // Optimized animation loop with RAF
  useEffect(() => {
    let animationId: number
    let lastTime = 0
    const targetFPS = 60
    const frameInterval = 1000 / targetFPS

    const animate = (currentTime: number) => {
      if (currentTime - lastTime >= frameInterval) {
        setParticles(prevParticles => 
          prevParticles.map(particle => {
            let newX = particle.x + particle.speedX
            let newY = particle.y + particle.speedY
            let newRotation = particle.rotation + particle.rotationSpeed

            // Wrap around screen edges
            if (newX > dimensions.width + 20) newX = -20
            if (newX < -20) newX = dimensions.width + 20
            if (newY > dimensions.height + 20) newY = -20
            if (newY < -20) newY = dimensions.height + 20

            return {
              ...particle,
              x: newX,
              y: newY,
              rotation: newRotation,
            }
          })
        )
        lastTime = currentTime
      }
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [dimensions])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Neural network grid */}
      <div className="absolute inset-0 opacity-20 data-grid" />
      
      {/* Holographic overlay */}
      <div className="absolute inset-0 opacity-30 holographic" />
      
      {/* Optimized particles */}
      <div className="absolute inset-0">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute transition-opacity duration-1000 will-change-transform"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              fontSize: `${particle.size * 8}px`,
              color: particle.color,
              opacity: particle.opacity,
              transform: `rotate(${particle.rotation}deg)`,
              filter: 'drop-shadow(0 0 6px currentColor)',
              fontFamily: 'monospace',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          >
            {particle.symbol}
          </div>
        ))}
      </div>
      
      {/* Ambient glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-blue/10 rounded-full blur-3xl animate-float-gentle" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-purple/10 rounded-full blur-3xl animate-float-gentle" style={{ animationDelay: '2s' }} />
      <div className="absolute top-3/4 left-3/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-float-gentle" style={{ animationDelay: '4s' }} />
    </div>
  )
}
