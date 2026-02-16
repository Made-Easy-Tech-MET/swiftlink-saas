import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card, { CardContent, CardHeader, CardTitle } from '../../components/common/Card'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { useAuth } from '../../context/AuthContext'
import { restaurantProfileOperations } from '../../services/supabase'

export default function RestaurantOnboarding() {
  const { restaurantProfile, refreshRestaurantProfile } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    logo_url: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (restaurantProfile) {
      setForm({
        name: restaurantProfile.name || '',
        description: restaurantProfile.description || '',
        address: restaurantProfile.address || '',
        phone: restaurantProfile.phone || '',
        logo_url: restaurantProfile.logo_url || ''
      })
    }
  }, [restaurantProfile])

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await restaurantProfileOperations.updateMe({
        name: form.name,
        description: form.description || null,
        address: form.address,
        phone: form.phone || null,
        logo_url: form.logo_url
      })
      await refreshRestaurantProfile()
      navigate('/restaurant/dashboard', { replace: true })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg p-4 sm:p-6 flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Complete Your Restaurant Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Add your restaurant details so your QR menu shows the right branding.
          </p>
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
          <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Restaurant name" value={form.name} onChange={handleChange('name')} required />
            <Input label="Phone" value={form.phone} onChange={handleChange('phone')} />
            <Input label="Address" value={form.address} onChange={handleChange('address')} required />
            <Input label="Logo URL" value={form.logo_url} onChange={handleChange('logo_url')} required />
            <div className="md:col-span-2">
              <Input label="Description" value={form.description} onChange={handleChange('description')} />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" variant="primary" loading={loading} className="w-full">
                Save and continue
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
