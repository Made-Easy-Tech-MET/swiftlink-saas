import { useEffect, useMemo, useState } from 'react'
import { RefreshCw, ShieldAlert, ShieldCheck } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import Card, { CardContent, CardHeader, CardTitle } from '../../components/common/Card'
import Table from '../../components/common/Table'
import Button from '../../components/common/Button'
import { subscriptionOperations } from '../../services/supabase'

const planPrice = { free: 0, pro: 9.99, ultimate: 19.99 }
const chartColors = ['#0EA5E9', '#10B981', '#F59E0B']

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([])
  const [error, setError] = useState('')

  const load = async () => {
    setError('')
    try {
      await subscriptionOperations.refreshStatuses()
      const { data } = await subscriptionOperations.getAll()
      setSubscriptions(data || [])
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const mrr = useMemo(
    () =>
      subscriptions
        .filter((s) => s.status === 'active')
        .reduce((sum, s) => sum + (s.monthly_price ?? planPrice[s.plan] ?? 0), 0),
    [subscriptions]
  )

  const distribution = useMemo(() => {
    const base = { free: 0, pro: 0, ultimate: 0 }
    subscriptions.forEach((s) => {
      if (base[s.plan] !== undefined) base[s.plan] += 1
    })
    return Object.entries(base).map(([name, value]) => ({ name, value }))
  }, [subscriptions])

  const statusBars = useMemo(() => {
    const base = { active: 0, expired: 0, blocked: 0 }
    subscriptions.forEach((s) => {
      if (base[s.status] !== undefined) base[s.status] += 1
    })
    return Object.entries(base).map(([status, count]) => ({ status, count }))
  }, [subscriptions])

  const onBlock = async (id) => {
    await subscriptionOperations.block(id)
    load()
  }
  const onUnblock = async (id) => {
    await subscriptionOperations.unblock(id)
    load()
  }

  const columns = [
    { header: 'User', render: (row) => <span>{row.user?.full_name || row.user?.email || row.user_id}</span> },
    { header: 'Role', render: (row) => <span className="capitalize">{row.role}</span> },
    { header: 'Plan', render: (row) => <span className="capitalize">{row.plan}</span> },
    { header: 'Status', render: (row) => <span className="capitalize">{row.status}</span> },
    { header: 'MRR', render: (row) => <span>${row.monthly_price ?? planPrice[row.plan] ?? 0}</span> },
    {
      header: 'Actions',
      render: (row) =>
        row.status === 'blocked' ? (
          <Button size="sm" variant="secondary" onClick={() => onUnblock(row.id)}>
            <ShieldCheck size={14} className="mr-1" />
            Unblock
          </Button>
        ) : (
          <Button size="sm" variant="danger" onClick={() => onBlock(row.id)}>
            <ShieldAlert size={14} className="mr-1" />
            Block
          </Button>
        )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription Control</h2>
        <Button variant="secondary" onClick={load}>
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </Button>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">MRR</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">${mrr.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">Active</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{statusBars.find((s) => s.status === 'active')?.count || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">Blocked</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{statusBars.find((s) => s.status === 'blocked')?.count || 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distribution} dataKey="value" nameKey="name" outerRadius={100}>
                  {distribution.map((entry, index) => (
                    <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusBars}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0EA5E9" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table columns={columns} data={subscriptions} emptyMessage="No subscriptions found" />
        </CardContent>
      </Card>
    </div>
  )
}
