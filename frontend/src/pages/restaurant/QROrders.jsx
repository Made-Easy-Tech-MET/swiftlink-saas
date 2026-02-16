import { useEffect, useState } from 'react'
import Card, { CardContent, CardHeader, CardTitle } from '../../components/common/Card'
import Button from '../../components/common/Button'
import { qrOrderOperations } from '../../services/supabase'

const statusFlow = ['pending', 'preparing', 'ready']

export default function QROrders() {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')

  const loadOrders = async () => {
    try {
      const { data } = await qrOrderOperations.getKitchenOrders()
      setOrders(data || [])
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const nextStatus = (status) => {
    const idx = statusFlow.indexOf(status)
    if (idx === -1 || idx === statusFlow.length - 1) return null
    return statusFlow[idx + 1]
  }

  const handleAdvance = async (order) => {
    const to = nextStatus(order.status)
    if (!to) return
    try {
      await qrOrderOperations.updateStatus(order.id, to)
      loadOrders()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Kitchen QR Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Manage incoming QR table orders: Pending -&gt; Preparing -&gt; Ready.</p>
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        </CardContent>
      </Card>

      <div className="space-y-3">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Table {order.table_number}</p>
                  <p className="text-sm text-gray-500 capitalize">{order.status}</p>
                  <p className="text-sm text-gray-500">Total: ${order.total}</p>
                </div>
                <Button variant="primary" onClick={() => handleAdvance(order)} disabled={!nextStatus(order.status)}>
                  {nextStatus(order.status) ? `Mark ${nextStatus(order.status)}` : 'Completed'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
