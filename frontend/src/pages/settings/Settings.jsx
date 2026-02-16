import { useEffect, useState } from 'react'
import { User, Bell, Lock, Globe, Palette, Save, Store } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { restaurantProfileOperations, storageOperations } from '../../services/supabase'

const translations = {
  en: {
    profile: 'Profile Settings',
    notifications: 'Notifications',
    security: 'Security',
    appearance: 'Appearance',
    language: 'Language',
    save: 'Save Changes',
    fullName: 'Full Name',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    saveSuccess: 'Settings saved successfully!'
  },
  fr: {
    profile: 'Paramètres du profil',
    notifications: 'Notifications',
    security: 'Sécurité',
    appearance: 'Apparence',
    language: 'Langue',
    save: 'Enregistrer',
    fullName: 'Nom complet',
    email: 'Email',
    phone: 'Téléphone',
    address: 'Adresse',
    saveSuccess: 'Paramètres enregistrés avec succès!'
  }
}

export default function Settings() {
  const { user, role, restaurantProfile, refreshRestaurantProfile } = useAuth()
  const { theme, toggleTheme, language, changeLanguage } = useTheme()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    logo_url: ''
  })
  const [restaurantSaving, setRestaurantSaving] = useState(false)
  const [restaurantError, setRestaurantError] = useState('')
  
  const [formData, setFormData] = useState({
    fullName: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  })

  const t = translations[language]

  useEffect(() => {
    if (restaurantProfile) {
      setRestaurantForm({
        name: restaurantProfile.name || '',
        description: restaurantProfile.description || '',
        address: restaurantProfile.address || '',
        phone: restaurantProfile.phone || '',
        logo_url: restaurantProfile.logo_url || ''
      })
    }
  }, [restaurantProfile])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setSuccess(true)
    setLoading(false)
    
    setTimeout(() => {
      setSuccess(false)
    }, 3000)
  }

  const handleRestaurantChange = (field) => (e) => {
    setRestaurantForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleLogoUpload = async (file) => {
    if (!user?.id || !file) return
    setRestaurantError('')
    try {
      const url = await storageOperations.uploadRestaurantLogo(user.id, file)
      setRestaurantForm((prev) => ({ ...prev, logo_url: url }))
    } catch (e) {
      setRestaurantError(e.message)
    }
  }

  const saveRestaurantProfile = async () => {
    setRestaurantError('')
    setRestaurantSaving(true)
    try {
      await restaurantProfileOperations.updateMe({
        name: restaurantForm.name,
        description: restaurantForm.description || null,
        address: restaurantForm.address,
        phone: restaurantForm.phone || null,
        logo_url: restaurantForm.logo_url
      })
      await refreshRestaurantProfile()
    } catch (e) {
      setRestaurantError(e.message)
    } finally {
      setRestaurantSaving(false)
    }
  }

  return (
    <div className="space-y-6 fade-in max-w-4xl">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Settings
      </h2>

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-100 border border-green-200 rounded-lg text-green-700">
          {t.saveSuccess}
        </div>
      )}

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User size={20} />
            {t.profile}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t.fullName}
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
              />
              <Input
                label={t.email}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled
              />
              <Input
                label={t.phone}
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
              <Input
                label={t.address}
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                loading={loading}
              >
                <Save size={20} className="mr-2" />
                {t.save}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {role === 'restaurant' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store size={20} />
              Restaurant Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Complete your restaurant details for the QR menu.
            </p>
            {restaurantError && <p className="text-sm text-danger mb-3">{restaurantError}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Restaurant name" value={restaurantForm.name} onChange={handleRestaurantChange('name')} />
              <Input label="Phone" value={restaurantForm.phone} onChange={handleRestaurantChange('phone')} />
              <Input label="Address" value={restaurantForm.address} onChange={handleRestaurantChange('address')} />
              <Input label="Logo URL" value={restaurantForm.logo_url} onChange={handleRestaurantChange('logo_url')} />
              <div className="md:col-span-2">
                <Input label="Description" value={restaurantForm.description} onChange={handleRestaurantChange('description')} />
              </div>
              <div className="md:col-span-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleLogoUpload(e.target.files?.[0])}
                />
              </div>
            </div>
            <div className="mt-4">
              <Button variant="primary" loading={restaurantSaving} onClick={saveRestaurantProfile}>
                Save restaurant profile
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette size={20} />
            {t.appearance}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
              <p className="text-sm text-gray-500">
                {theme === 'dark' ? 'Currently using dark theme' : 'Currently using light theme'}
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${theme === 'dark' ? 'bg-primary' : 'bg-gray-200'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe size={20} />
            {t.language}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <button
              onClick={() => changeLanguage('en')}
              className={`
                px-4 py-2 rounded-lg border transition-colors
                ${language === 'en' 
                  ? 'border-primary bg-primary/10 text-primary' 
                  : 'border-light-border dark:border-dark-border text-gray-600 dark:text-gray-400'
                }
              `}
            >
              English
            </button>
            <button
              onClick={() => changeLanguage('fr')}
              className={`
                px-4 py-2 rounded-lg border transition-colors
                ${language === 'fr' 
                  ? 'border-primary bg-primary/10 text-primary' 
                  : 'border-light-border dark:border-dark-border text-gray-600 dark:text-gray-400'
                }
              `}
            >
              Français
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell size={20} />
            {t.notifications}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Order Notifications</p>
                <p className="text-sm text-gray-500">Get notified about new orders</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary">
                <span className="inline-block h-4 w-4 transform translate-x-6 rounded-full bg-white" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Delivery Updates</p>
                <p className="text-sm text-gray-500">Get notified about delivery status changes</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary">
                <span className="inline-block h-4 w-4 transform translate-x-6 rounded-full bg-white" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Marketing Emails</p>
                <p className="text-sm text-gray-500">Receive promotional emails</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                <span className="inline-block h-4 w-4 transform translate-x-1 rounded-full bg-white" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock size={20} />
            {t.security}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Change Password</p>
                <p className="text-sm text-gray-500">Update your password regularly</p>
              </div>
              <Button variant="secondary" size="sm">
                Change
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">Add an extra layer of security</p>
              </div>
              <Button variant="secondary" size="sm">
                Enable
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
