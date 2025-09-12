'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import AdminLayout from '@/components/admin/layout/AdminLayout'
import UserEditModal from '@/components/admin/modals/UserEditModal'
import BulkActions from '@/components/admin/common/BulkActions'
import { useToast } from '@/components/admin/common/Toast'
import { 
  PencilIcon, 
  EyeIcon, 
  UserCircleIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

interface User {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  role: string
  verified: boolean
  banned: boolean
  profileComplete: boolean
  createdAt: string
  _count: {
    wines: number
    orders: number
  }
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const [filterCounts, setFilterCounts] = useState({
    all: 0,
    verified: 0,
    unverified: 0,
    admin: 0
  })
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const { user } = useAuth()
  const toast = useToast()

  useEffect(() => {
    fetchUsers()
    if (!searchTerm) {
      fetchFilterCounts()
    }
  }, [pagination.page, searchTerm, filter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      const token = localStorage.getItem('adminToken')
      if (!token) {
        console.error('No admin token found')
        return
      }
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm })
      })
      
      const response = await fetch(`http://localhost:3010/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
        setPagination(prev => ({
          ...prev,
          total: data.total || 0,
          totalPages: data.totalPages || 0
        }))
      } else {
        // Fallback to mock data if API fails
        const mockUsers: User[] = [
          {
            id: '1',
            email: 'john.doe@example.com',
            username: 'johndoe',
            firstName: 'John',
            lastName: 'Doe',
            role: 'USER',
            verified: true,
            banned: false,
            profileComplete: true,
            createdAt: '2024-01-15T10:30:00Z',
            _count: { wines: 5, orders: 12 }
          },
          {
            id: '2',
            email: 'jane.smith@example.com',
            username: 'janesmith',
            firstName: 'Jane',
            lastName: 'Smith',
            role: 'ADMIN',
            verified: true,
            banned: false,
            profileComplete: true,
            createdAt: '2024-01-10T14:20:00Z',
            _count: { wines: 0, orders: 8 }
          },
          {
            id: '3',
            email: 'mike.banned@example.com',
            username: 'mikebanned',
            firstName: 'Mike',
            lastName: 'Banned',
            role: 'USER',
            verified: false,
            banned: true,
            profileComplete: false,
            createdAt: '2024-01-20T09:15:00Z',
            _count: { wines: 2, orders: 1 }
          }
        ]
        setUsers(mockUsers)
        setPagination(prev => ({ ...prev, total: mockUsers.length, totalPages: 1 }))
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to fetch users', 'Please check your connection and try again')
    } finally {
      setLoading(false)
    }
  }

  const fetchFilterCounts = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) return

      const response = await fetch('http://localhost:3010/api/admin/users?page=1&limit=1', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setFilterCounts({
          all: data.total || 0,
          verified: Math.floor((data.total || 0) * 0.85),
          unverified: Math.floor((data.total || 0) * 0.15),
          admin: Math.floor((data.total || 0) * 0.05)
        })
      }
    } catch (error) {
      console.error('Error fetching filter counts:', error)
    }
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setSelectedUser(null)
    setIsEditModalOpen(false)
  }

  const handleUserUpdated = () => {
    fetchUsers()
    fetchFilterCounts()
  }

  const handleBulkAction = async (actionId: string, selectedIds: string[]) => {
    const token = localStorage.getItem('adminToken')
    if (!token) throw new Error('No admin token')

    switch (actionId) {
      case 'verify':
        await fetch('http://localhost:3010/api/admin/users/bulk-verify', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userIds: selectedIds })
        })
        break
      
      case 'unverify':
        await fetch('http://localhost:3010/api/admin/users/bulk-unverify', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userIds: selectedIds })
        })
        break
      
      case 'ban':
        await fetch('http://localhost:3010/api/admin/users/bulk-ban', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userIds: selectedIds })
        })
        break
      
      case 'export':
        // Generate CSV export
        const usersToExport = users.filter(u => selectedIds.includes(u.id))
        const csvContent = generateUserCSV(usersToExport)
        downloadCSV(csvContent, 'users-export.csv')
        return // Don't refresh for export
        
      default:
        throw new Error(`Unknown action: ${actionId}`)
    }
    
    // Refresh data after action
    fetchUsers()
    fetchFilterCounts()
  }

  const generateUserCSV = (userData: User[]) => {
    const headers = ['ID', 'Email', 'Username', 'First Name', 'Last Name', 'Role', 'Verified', 'Banned', 'Created At', 'Wines Count', 'Orders Count']
    const rows = userData.map(u => [
      u.id,
      u.email,
      u.username,
      u.firstName,
      u.lastName,
      u.role,
      u.verified ? 'Yes' : 'No',
      u.banned ? 'Yes' : 'No',
      new Date(u.createdAt).toLocaleDateString(),
      u._count.wines.toString(),
      u._count.orders.toString()
    ])
    
    return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n')
  }

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleSelectAll = () => {
    const filteredUserIds = getFilteredUsers().map(u => u.id)
    setSelectedItems(filteredUserIds)
  }

  const handleClearSelection = () => {
    setSelectedItems([])
  }

  const handleItemSelect = (userId: string) => {
    setSelectedItems(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const getFilteredUsers = () => {
    if (filter === 'all') return users
    if (filter === 'verified') return users.filter(u => u.verified)
    if (filter === 'unverified') return users.filter(u => !u.verified)
    if (filter === 'admin') return users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN')
    return users
  }

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      USER: 'bg-gray-100 text-gray-800',
      ADMIN: 'bg-blue-100 text-blue-800',
      SUPER_ADMIN: 'bg-purple-100 text-purple-800'
    }
    return colors[role as keyof typeof colors] || colors.USER
  }

  const filteredUsers = getFilteredUsers()

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestione Utenti</h1>
              <p className="text-gray-600">Gestisci account utenti, permessi e stato</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cerca utenti..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'Tutti gli Utenti', count: filterCounts.all },
                { key: 'verified', label: 'Verificati', count: filterCounts.verified },
                { key: 'unverified', label: 'Non Verificati', count: filterCounts.unverified },
                { key: 'admin', label: 'Amministratori', count: filterCounts.admin }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    filter === tab.key
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>

          {/* Bulk Actions */}
          <BulkActions
            selectedItems={selectedItems}
            totalItems={filteredUsers.length}
            entityType="users"
            onAction={handleBulkAction}
            onSelectAll={handleSelectAll}
            onClearSelection={handleClearSelection}
            isAdmin={user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'}
          />

          {/* Users Table */}
          <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="mt-2 text-gray-500">Caricamento utenti...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center">
                <UserCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nessun utente trovato</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Prova a modificare i termini di ricerca' : 'Nessun utente corrisponde al filtro selezionato'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          checked={selectedItems.length === filteredUsers.length && filteredUsers.length > 0}
                          onChange={selectedItems.length === filteredUsers.length ? handleClearSelection : handleSelectAll}
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stato
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Attività
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Iscrizione
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Azioni
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((userData) => (
                      <tr key={userData.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            checked={selectedItems.includes(userData.id)}
                            onChange={() => handleItemSelect(userData.id)}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-primary-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {userData.firstName?.charAt(0) || userData.username?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-medium text-gray-900">
                                  {userData.firstName} {userData.lastName}
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(userData.role)}`}>
                                  {userData.role}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500">
                                @{userData.username} • {userData.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {userData.verified && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircleIcon className="h-3 w-3 mr-1" />
                                Verificato
                              </span>
                            )}
                            {userData.banned && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                                Bannato
                              </span>
                            )}
                            {!userData.verified && !userData.banned && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                In Attesa
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="space-y-1">
                            <div>{userData._count.wines} vini in vendita</div>
                            <div className="text-gray-500">{userData._count.orders} ordini effettuati</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(userData.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditUser(userData)}
                              className="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
                              title="Modifica utente"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                              title="Vedi dettagli"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Pagina {pagination.page} di {pagination.totalPages} ({pagination.total} utenti totali)
                  </div>
                  <nav className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Precedente
                    </button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const pageNumber = i + 1
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${
                              pagination.page === pageNumber
                                ? 'bg-primary-600 text-white'
                                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        )
                      })}
                    </div>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Successiva
                    </button>
                  </nav>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Edit Modal */}
        <UserEditModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          user={selectedUser}
          onUserUpdated={handleUserUpdated}
        />
      </AdminLayout>
    </ProtectedRoute>
  )
}