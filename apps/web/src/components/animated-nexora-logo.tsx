'use client'

import { motion } from 'framer-motion'

interface AnimatedNexoraLogoProps {
  size?: 'sm' | 'md' | 'lg'
}

export function AnimatedNexoraLogo({ size = 'md' }: AnimatedNexoraLogoProps) {
  const sizeMap = {
    sm: { center: 40, radius: 25, text: 'text-lg' },
    md: { center: 60, radius: 35, text: 'text-3xl' },
    lg: { center: 80, radius: 50, text: 'text-5xl' },
  }

  const config = sizeMap[size]

  const modules = [
    { label: 'ERP', angle: 45, color: '#00d9ff' },
    { label: 'HR', angle: 90, color: '#00d9ff' },
    { label: 'SCM', angle: 135, color: '#00d9ff' },
    { label: 'SCM', angle: 180, color: '#00d9ff' },
    { label: 'POS', angle: 225, color: '#d946ef' },
    { label: 'ERM', angle: 270, color: '#d946ef' },
  ]

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      {/* Animated Logo */}
      <div className="relative" style={{ width: config.center * 4, height: config.center * 4 }}>
        {/* Animated Orbits */}
        {[1, 2, 3].map((orbit) => (
          <motion.div
            key={`orbit-${orbit}`}
            className="absolute top-1/2 left-1/2 border border-gradient -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: config.radius * 2 * orbit,
              height: config.radius * 2 * orbit,
              borderImage: 'linear-gradient(45deg, #a855f7 0%, #06b6d4 100%)',
              opacity: 0.3,
            }}
            animate={{ rotate: orbit % 2 === 0 ? 360 : -360 }}
            transition={{
              duration: 15 + orbit * 3.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}

        {/* Module Dots */}
        {modules.map((module, index) => {
          const radian = (module.angle * Math.PI) / 180
          const x = Math.cos(radian) * config.radius * 1.8
          const y = Math.sin(radian) * config.radius * 1.8

          return (
            <motion.div
              key={`module-${index}`}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              animate={{
                x: x * (1 + 0.2 * Math.sin(Date.now() / 1000 + index)),
                y: y * (1 + 0.2 * Math.sin(Date.now() / 1000 + index + Math.PI / 3)),
              }}
              transition={{ duration: 0.1, type: 'tween' }}
            >
              <motion.div
                className="w-4 h-4 rounded-full cursor-pointer"
                style={{ backgroundColor: module.color }}
                whileHover={{ scale: 1.5 }}
                whileTap={{ scale: 0.9 }}
              />
            </motion.div>
          )
        })}

        {/* Center AI Circle */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{
            width: config.center,
            height: config.center,
          }}
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400"
            animate={{
              boxShadow: [
                '0 0 25px rgba(217, 70, 239, 0.6)',
                '0 0 50px rgba(0, 217, 255, 0.9)',
                '0 0 25px rgba(217, 70, 239, 0.6)',
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-1 rounded-full bg-gray-900 dark:bg-gray-950 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
          >
            <span className={`font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-300 ${config.text}`}>
              AI
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* Text */}
      <motion.h1
        className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-cyan-400"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        NEXORA
      </motion.h1>

      {/* Tagline */}
      <p className="text-center text-gray-600 dark:text-gray-400 text-sm max-w-xs">
        The AI-Powered Business Operating System
      </p>
    </div>
  )
}
