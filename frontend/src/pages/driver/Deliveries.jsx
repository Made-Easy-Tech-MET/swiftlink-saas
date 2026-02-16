import { useState, useEffect } from 'react'
import { MapPin, Phone, Check, X, Navigation } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'
import { deliveryOperations } from '../../services/supabase'

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchDeliveries()
  }, [])

  const fetchDeliveries = async () => {
    try {
      const { data, error } = await deliveryOperations.getAll()
      if (data) {
        setDeliveries(data)
      }
    } catch (error) {
      console.error('Error fetching deliveries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateDeliveryStatus = async (deliveryId, newStatus) => {
    try {
      await deliveryOperations.updateStatus(deliveryId, newStatus)
      fetchDeliveries()
    } catch (error) {
      console.error('Error updating delivery status:', error)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      assigned: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      picked_up: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      in_transit: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const filteredDeliveries = deliveries.filter(delivery => {
    return statusFilter === 'all' || delivery.status === statusFilter
  })

  const getNextActions = (currentStatus) => {
    const actions = {
      assigned: [
        { label: 'Pick Up', status: 'picked_up', color: 'primary' }
      ],
      picked_up: [
        { label: 'Start Delivery', status: 'in_transit', color: 'primary' }
      ],
      in_transit: [
        { label: 'Delivered', status: 'delivered', color: 'secondary' },
        { label: 'Failed', status: 'failed', color: 'danger' }
      ],
      delivered: [],
      failed: []
    }
    return actions[currentStatus] || []
  }

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
      header: 'Restaurant',
      render: (row) => (
        <span className="text-gray-600 dark:text-gray-400">
          {row.restaurant_name || 'N/A'}
        </span>
      )
    },
    {
      header: 'Delivery Address',
      render: (row) => (
        <span className="text-gray-600 dark:text-gray-400">
          {row.delivery_address || 'N/A'}
        </span>
      )
    },
    {
      header: 'Earnings',
      render: (row) => (
        <span className="font-medium text-gray-900 dark:text-white">
          $5.00
        </span>
      )
    },
    {
      header: 'Status',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}>
          {row.status.replace('_', ' ')}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => {
        const nextActions = getNextActions(row.status)
        return (
          <div className="flex items-center gap-2">
            {nextActions.map((action) => (
              <Button
                key={action.status}
                variant={action.color}
                size="sm"
                onClick={() => handleUpdateDeliveryStatus(row.id, action.status)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )
      }
    }
  ]

  const statuses = ['all', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed']

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Deliveries Management
        </h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Assigned</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {deliveries.filter(d => d.status === 'assigned').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                <Navigation className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">In Transit</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {deliveries.filter(d => d.status === 'in_transit').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {deliveries.filter(d => d.status === 'delivered').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
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
        </CardContent>
      </Card>

      {/* Deliveries Table */}
      <Card>
        <CardContent className="p-0">
          <Table
            columns={columns}
            data={filteredDeliveries}
            emptyMessage="No deliveries found"
          />
        </CardContent>
      </Card>
    </div>
  )
}
