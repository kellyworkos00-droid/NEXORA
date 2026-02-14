'use client'

import { useTheme } from '@/lib/theme-provider'
import { Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  try {
    const { theme, toggleTheme } = useTheme()

    if (!mounted) return null

    return (
      <motion.button
        onClick={toggleTheme}
        className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle theme"
      >
        <motion.div
          initial={false}
          animate={{ rotate: theme === 'dark' ? 180 : 0, scale: theme === 'dark' ? 1 : 1 }}
          transition={{ duration: 0.3 }}
        >
          {theme === 'light' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </motion.div>
      </motion.button>
    )
  } catch (err) {
    // If theme provider not available, render null
    return null
  }
}
