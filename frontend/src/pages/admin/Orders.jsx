import { useState, useEffect } from 'react'
import { Search, Filter } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'
import { orderOperations } from '../../services/supabase'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const { data, error } = await orderOperations.getAll()
      if (data) {
        setOrders(data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      preparing: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      ready: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
      picked_up: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const columns = [
    {
      header: 'Order #',
      render: (row) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {row.order_number}
        </span>
      )
    },
    {
      header: 'Customer',
      render: (row) => (
        <span className="text-gray-600 dark:text-gray-400">
          {row.customer_name || 'N/A'}
        </span>
      )
    },
    {
      header: 'Restaurant',
      render: (row) => (
        <span className="text-gray-600 dark:text-gray-400">
          {row.restaurant_name || 'N/A'}
        </span>
      )
    },
    {
      header: 'Total',
      render: (row) => (
        <span className="font-medium text-gray-900 dark:text-white">
          ${row.total}
        </span>
      )
    },
    {
      header: 'Status',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Date',
      render: (row) => (
        <span className="text-gray-500 dark:text-gray-400">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      )
    }
  ]

  const statuses = ['all', 'pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled']

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Orders Management
        </h2>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {statuses.map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table
            columns={columns}
            data={filteredOrders}
            emptyMessage="No orders found"
          />
        </CardContent>
      </Card>
    </div>
  )
}
