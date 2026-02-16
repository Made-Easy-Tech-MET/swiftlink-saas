import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, QrCode, Trash2 } from 'lucide-react'
import Card, { CardContent, CardHeader, CardTitle } from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { restaurantTableOperations } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'

export default function Tables() {
  const { subscriptionPlan } = useAuth()
  const [tableNumber, setTableNumber] = useState('')
  const [tableName, setTableName] = useState('')
  const [tables, setTables] = useState([])
  const [error, setError] = useState('')
  const isFreeLimitReached = subscriptionPlan === 'free' && tables.length >= 5

  const loadTables = async () => {
    try {
      const { data } = await restaurantTableOperations.getAll()
      setTables(data || [])
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => {
    loadTables()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await restaurantTableOperations.create({
        table_number: Number(tableNumber),
        table_name: tableName || undefined
      })
      setTableNumber('')
      setTableName('')
      loadTables()
    } catch (e) {
      setError(e.message)
    }
  }

  const handleDelete = async (id) => {
    try {
      await restaurantTableOperations.remove(id)
      loadTables()
    } catch (e) {
      setError(e.message)
    }
  }

  const buildQrImage = (url) => {
    const encoded = encodeURIComponent(url)
    return `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encoded}`
  }

  const handleCopy = async (url) => {
    try {
      await navigator.clipboard.writeText(url)
    } catch (e) {
      setError('Unable to copy QR link')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>QR Tables</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Plan: <span className="font-medium capitalize">{subscriptionPlan}</span>
            {subscriptionPlan === 'free' ? ' (max 5 tables)' : ' (unlimited tables)'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Tables used: <span className="font-medium">{tables.length}</span>
            {subscriptionPlan === 'free' ? ' / 5' : ' / unlimited'}
          </p>
          {isFreeLimitReached && (
            <p className="mt-2 text-sm text-warning">
              Free limit reached. <Link to="/pricing" className="underline">Upgrade</Link> to add more tables.
            </p>
          )}
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
          <form onSubmit={handleCreate} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} placeholder="Table number" required />
            <Input value={tableName} onChange={(e) => setTableName(e.target.value)} placeholder="Table name (optional)" />
            <Button type="submit" variant="primary" disabled={isFreeLimitReached}>
              <Plus size={16} className="mr-2" />
              Add Table
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tables.map((table) => (
          <Card key={table.id}>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  {table.qr_code_url && (
                    <img
                      src={buildQrImage(table.qr_code_url)}
                      alt={`QR for table ${table.table_number}`}
                      className="w-20 h-20 rounded-lg border border-light-border dark:border-dark-border bg-white"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{table.table_name || `Table ${table.table_number}`}</p>
                    <p className="text-sm text-gray-500 break-all">{table.qr_code_url}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(table.qr_code_url)}
                    className="px-3 py-2 text-sm rounded-md border border-light-border dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-border"
                  >
                    Copy link
                  </button>
                  <a href={table.qr_code_url} target="_blank" rel="noreferrer" className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-dark-border">
                    <QrCode size={16} />
                  </a>
                  <button onClick={() => handleDelete(table.id)} className="p-2 rounded-md text-danger hover:bg-danger/10">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
