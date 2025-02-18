'use client'
import { useTheme } from 'next-themes'
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid'
import { useEffect, useState } from 'react'

export default function ThemeSwitch() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <button
      className="fixed top-4 right-4 p-2 rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm
        shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out
        hover:scale-110 active:scale-95 border border-gray-200 dark:border-gray-700"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <SunIcon className="w-6 h-6 text-yellow-500 transform transition-transform duration-200 rotate-0 hover:rotate-90" />
      ) : (
        <MoonIcon className="w-6 h-6 text-blue-600 transform transition-transform duration-200" />
      )}
    </button>
  )
}