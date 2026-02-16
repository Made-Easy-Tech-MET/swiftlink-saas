import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import Button from '../components/common/Button'
import Card, { CardContent, CardHeader, CardTitle } from '../components/common/Card'
import Input from '../components/common/Input'
import { publicMenuOperations } from '../services/supabase'

export default function Menu() {
  const { restaurantId, tableNumber } = useParams()
  const [payload, setPayload] = useState(null)
  const [cart, setCart] = useState({})
  const [activeCategory, setActiveCategory] = useState('All')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await publicMenuOperations.getMenu(restaurantId, tableNumber)
        setPayload(data)
      } catch (e) {
        setError(e.message)
      }
    }
    load()
  }, [restaurantId, tableNumber])

  const categories = useMemo(() => {
    const items = payload?.menu || []
    const unique = new Set(items.map((item) => item.category || 'Uncategorized'))
    return ['All', ...Array.from(unique)]
  }, [payload])

  const filteredMenu = useMemo(() => {
    const items = payload?.menu || []
    if (activeCategory === 'All') return items
    return items.filter((item) => (item.category || 'Uncategorized') === activeCategory)
  }, [payload, activeCategory])

  const cartItems = useMemo(() => {
    if (!payload?.menu) return []
    return payload.menu
      .filter((item) => (cart[item.id] || 0) > 0)
      .map((item) => ({
        item_name: item.name,
        quantity: cart[item.id],
        unit_price: item.price
      }))
  }, [payload, cart])

  const total = cartItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)

  const placeOrder = async () => {
    setError('')
    setSuccess('')
    if (!cartItems.length) {
      setError('Please select at least one item.')
      return
    }
    try {
      await publicMenuOperations.createOrder(restaurantId, tableNumber, {
        customer_name: customerName || null,
        customer_phone: customerPhone || null,
        items: cartItems
      })
      setCart({})
      setSuccess('Order sent to kitchen. Thank you!')
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg p-4">
      <div className="max-w-3xl mx-auto space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>
              {payload?.restaurant?.name || 'Restaurant'} - Table {tableNumber}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Scan, order, and wait for your meal.</p>
          </CardContent>
        </Card>

        {categories.length > 1 && (
          <Card>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      activeCategory === category
                        ? 'bg-primary text-white border-primary'
                        : 'border-light-border dark:border-dark-border text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-border'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {(payload?.menu || []).length === 0 && (
          <Card>
            <CardContent>
              <p className="text-sm text-gray-500">Menu not available yet. Please ask staff.</p>
            </CardContent>
          </Card>
        )}

        {filteredMenu.map((item) => (
          <Card key={item.id}>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start gap-3">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover border border-light-border dark:border-dark-border"
                    />
                  )}
                  <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                  {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
                  <p className="text-sm text-gray-500">${item.price}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={() => setCart((prev) => ({ ...prev, [item.id]: Math.max((prev[item.id] || 0) - 1, 0) }))}>-</Button>
                  <span className="w-6 text-center">{cart[item.id] || 0}</span>
                  <Button variant="secondary" onClick={() => setCart((prev) => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }))}>+</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Your name (optional)" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            <Input placeholder="Phone (optional)" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
            <p className="font-semibold text-gray-900 dark:text-white">Total: ${total.toFixed(2)}</p>
            {error && <p className="text-sm text-danger">{error}</p>}
            {success && <p className="text-sm text-secondary">{success}</p>}
            <Button className="w-full" variant="primary" onClick={placeOrder}>
              Place Order
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
