import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage or default to 'light'
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light'
    }
    return 'light'
  })

  const [language, setLanguage] = useState(() => {
    // Get language from localStorage or default to 'en'
    if (typeof window !== 'undefined') {
      return localStorage.getItem('language') || 'en'
    }
    return 'en'
  })

  useEffect(() => {
    // Update localStorage and document class when theme changes
    localStorage.setItem('theme', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  useEffect(() => {
    // Update localStorage when language changes
    localStorage.setItem('language', language)
    document.documentElement.lang = language
  }, [language])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const changeLanguage = (lang) => {
    setLanguage(lang)
  }

  const value = {
    theme,
    toggleTheme,
    language,
    changeLanguage,
    isDark: theme === 'dark'
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
