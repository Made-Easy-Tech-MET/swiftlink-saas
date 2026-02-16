import { useState } from 'react'
import { Menu, Sun, Moon, Globe, Bell, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const translations = {
  en: {
    profile: 'Profile',
    settings: 'Settings',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    language: 'Language'
  },
  fr: {
    profile: 'Profil',
    settings: 'Parametres',
    darkMode: 'Mode sombre',
    lightMode: 'Mode clair',
    language: 'Langue'
  }
}

export default function Header({ title, onMenuClick }) {
  const { user } = useAuth()
  const { theme, toggleTheme, language, changeLanguage } = useTheme()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLangMenu, setShowLangMenu] = useState(false)
  const t = translations[language] || translations.en

  const toggleLanguage = () => {
    changeLanguage(language === 'en' ? 'fr' : 'en')
    setShowLangMenu(false)
  }

  return (
    <header className="sticky top-0 z-30 bg-light-surface dark:bg-dark-surface border-b border-light-border dark:border-dark-border">
      <div className="flex items-center justify-between px-3 py-3 sm:px-4 lg:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
              title={t.language}
            >
              <Globe size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-light-surface dark:bg-dark-surface rounded-lg shadow-lg border border-light-border dark:border-dark-border py-1">
                <button
                  onClick={toggleLanguage}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-border"
                >
                  {language === 'en' ? 'Francais' : 'English'}
                </button>
              </div>
            )}
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
            title={theme === 'dark' ? t.lightMode : t.darkMode}
          >
            {theme === 'dark' ? (
              <Sun size={20} className="text-gray-400" />
            ) : (
              <Moon size={20} className="text-gray-600" />
            )}
          </button>

          <button className="hidden sm:inline-flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors relative">
            <Bell size={20} className="text-gray-600 dark:text-gray-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-light-surface dark:bg-dark-surface rounded-lg shadow-lg border border-light-border dark:border-dark-border py-1">
                <div className="px-4 py-2 border-b border-light-border dark:border-dark-border">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-border">
                  {t.profile}
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-border">
                  {t.settings}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
