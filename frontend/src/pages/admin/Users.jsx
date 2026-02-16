import { useState, useEffect } from 'react'
import { Search, UserCheck, UserX, MoreVertical } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'
import { userOperations } from '../../services/supabase'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await userOperations.getAll()
      if (data) {
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await userOperations.update(userId, { is_active: !currentStatus })
      fetchUsers()
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const columns = [
    {
      header: 'User',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-medium">
              {row.full_name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {row.full_name}
            </p>
            <p className="text-sm text-gray-500">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Role',
      render: (row) => (
        <span className={`
          px-3 py-1 rounded-full text-xs font-medium
          ${row.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : ''}
          ${row.role === 'restaurant' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : ''}
          ${row.role === 'driver' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : ''}
        `}>
          {row.role}
        </span>
      )
    },
    {
      header: 'Status',
      render: (row) => (
        <span className={`
          px-3 py-1 rounded-full text-xs font-medium
          ${row.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}
        `}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Joined',
      render: (row) => (
        <span className="text-gray-500 dark:text-gray-400">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant={row.is_active ? 'danger' : 'secondary'}
            size="sm"
            onClick={() => handleToggleUserStatus(row.id, row.is_active)}
          >
            {row.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Users Management
        </h2>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={roleFilter === 'all' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setRoleFilter('all')}
              >
                All
              </Button>
              <Button
                variant={roleFilter === 'restaurant' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setRoleFilter('restaurant')}
              >
                Restaurants
              </Button>
              <Button
                variant={roleFilter === 'driver' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setRoleFilter('driver')}
              >
                Drivers
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table
            columns={columns}
            data={filteredUsers}
            emptyMessage="No users found"
          />
        </CardContent>
      </Card>
    </div>
  )
}
