import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import Modal from '../common/Modal'
import Button from '../common/Button'
import { useAuth } from '../../context/AuthContext'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { role, isRestaurantProfileComplete } = useAuth()
  const [showProfileModal, setShowProfileModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (role !== 'restaurant' || isRestaurantProfileComplete) return
    const dismissed = localStorage.getItem('swiftlink_profile_prompt_dismissed') === '1'
    if (dismissed) return
    const timer = setTimeout(() => {
      setShowProfileModal(true)
    }, 5000)
    return () => clearTimeout(timer)
  }, [role, isRestaurantProfileComplete])

  const handleCloseModal = () => {
    localStorage.setItem('swiftlink_profile_prompt_dismissed', '1')
    setShowProfileModal(false)
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-64 min-w-0">
        <Header 
          title="Dashboard" 
          onMenuClick={() => setSidebarOpen(true)} 
        />
        
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      <Modal
        isOpen={showProfileModal}
        onClose={handleCloseModal}
        title="Complete your restaurant profile"
      >
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Add your restaurant name, logo, and details so your online menu looks professional.
        </p>
        <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:justify-end">
          <Button variant="secondary" onClick={handleCloseModal}>
            Later
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setShowProfileModal(false)
              navigate('/restaurant/settings')
            }}
          >
            Complete now
          </Button>
        </div>
      </Modal>
    </div>
  )
}
