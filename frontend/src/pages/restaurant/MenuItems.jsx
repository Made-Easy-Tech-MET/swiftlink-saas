import { useEffect, useMemo, useState } from 'react'
import Card, { CardContent, CardHeader, CardTitle } from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { menuItemOperations, storageOperations } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'

const emptyForm = {
  name: '',
  description: '',
  category: '',
  price: '',
  image_url: '',
  is_available: true
}

export default function MenuItems() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  const load = async () => {
    setError('')
    try {
      const { data } = await menuItemOperations.getAll()
      setItems(data || [])
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleChange = (field) => (e) => {
    const value = field === 'is_available' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await menuItemOperations.create({
        ...form,
        price: Number(form.price) || 0
      })
      setForm(emptyForm)
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file) => {
    if (!user?.id || !file) return
    setUploading(true)
    setError('')
    try {
      const url = await storageOperations.uploadMenuImage(user.id, file)
      setForm((prev) => ({ ...prev, image_url: url }))
    } catch (e) {
      setError(e.message)
    } finally {
      setUploading(false)
    }
  }

  const toggleAvailability = async (item) => {
    try {
      await menuItemOperations.update(item.id, { is_available: !item.is_available })
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  const removeItem = async (item) => {
    try {
      await menuItemOperations.remove(item.id)
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  const grouped = useMemo(() => {
    const map = new Map()
    items.forEach((item) => {
      const key = item.category || 'Uncategorized'
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(item)
    })
    return Array.from(map.entries())
  }, [items])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Menu Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Add dishes and publish them to your QR menu.</p>
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
          <form onSubmit={handleCreate} className="mt-4 grid grid-cols-1 lg:grid-cols-6 gap-3">
            <Input value={form.name} onChange={handleChange('name')} placeholder="Item name" required />
            <Input value={form.category} onChange={handleChange('category')} placeholder="Category" />
            <Input value={form.price} onChange={handleChange('price')} placeholder="Price" type="number" step="0.01" required />
            <Input value={form.description} onChange={handleChange('description')} placeholder="Description" />
            <div className="flex flex-col gap-2">
              <Input value={form.image_url} onChange={handleChange('image_url')} placeholder="Image URL" />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files?.[0])}
              />
              {uploading && <p className="text-xs text-gray-500">Uploading image...</p>}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Available</label>
              <input type="checkbox" checked={form.is_available} onChange={handleChange('is_available')} />
            </div>
            <div className="lg:col-span-6">
              <Button type="submit" variant="primary" loading={loading} className="w-full lg:w-auto">
                Add Item
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {grouped.length === 0 && (
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">No menu items yet. Add your first dish above.</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {grouped.map(([category, list]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle>{category}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {list.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-light-border dark:border-dark-border pb-3">
                  <div className="flex items-start gap-3">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-14 h-14 rounded-lg object-cover border border-light-border dark:border-dark-border"
                      />
                    )}
                    <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                    {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
                    <p className="text-sm text-gray-500">${Number(item.price || 0).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant={item.is_available ? 'secondary' : 'primary'} onClick={() => toggleAvailability(item)}>
                      {item.is_available ? 'Disable' : 'Enable'}
                    </Button>
                    <Button variant="danger" onClick={() => removeItem(item)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
