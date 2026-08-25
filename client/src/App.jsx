import React, { useState, useEffect } from 'react'
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Search,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  Phone,
  Mail,
  UserCheck,
  UserMinus,
  RefreshCw
} from 'lucide-react'

function App() {
  // State variables
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Search and Pagination
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 5

  // Modals and Forms
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'Active'
  })

  // Notifications
  const [notification, setNotification] = useState(null)

  // Trigger notification helper
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => {
      setNotification(null)
    }, 4000)
  }

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1) // Reset page to 1 when search query changes
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch Stats
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/v1/users/stats')
      if (!res.ok) throw new Error('Failed to fetch statistics')
      const data = await res.json()
      setStats(data)
    } catch (err) {
      console.error('Error fetching statistics:', err)
    }
  }

  // Fetch Users
  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      let url = `/api/v1/users?page=${currentPage}&limit=${limit}`
      if (debouncedSearch.trim() !== '') {
        url = `/api/v1/users/search/${encodeURIComponent(debouncedSearch.trim())}?page=${currentPage}&limit=${limit}`
      }
      const res = await fetch(url)
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch users')
      }
      
      setUsers(data.users || [])
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      setError(err.message)
      showNotification(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Load data when page or debounced search changes
  useEffect(() => {
    fetchUsers()
    fetchStats()
  }, [currentPage, debouncedSearch])

  // Form submission: Add User
  const handleAddUser = async (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      showNotification('All fields are required', 'error')
      return
    }

    try {
      const res = await fetch('/api/v1/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create user')
      }

      showNotification('User created successfully!', 'success')
      setShowAddModal(false)
      setFormData({ name: '', email: '', phone: '', status: 'Active' })
      fetchUsers()
      fetchStats()
    } catch (err) {
      showNotification(err.message, 'error')
    }
  }

  // Form submission: Edit User
  const handleEditUser = async (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      showNotification('All fields are required', 'error')
      return
    }

    try {
      const res = await fetch(`/api/v1/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update user')
      }

      showNotification('User updated successfully!', 'success')
      setShowEditModal(false)
      setSelectedUser(null)
      setFormData({ name: '', email: '', phone: '', status: 'Active' })
      fetchUsers()
      fetchStats()
    } catch (err) {
      showNotification(err.message, 'error')
    }
  }

  // Form submission: Delete User
  const handleDeleteUser = async () => {
    try {
      const res = await fetch(`/api/v1/users/${selectedUser._id}`, {
        method: 'DELETE'
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete user')
      }

      showNotification('User deleted successfully!', 'success')
      setShowDeleteModal(false)
      setSelectedUser(null)
      fetchUsers()
      fetchStats()
    } catch (err) {
      showNotification(err.message, 'error')
    }
  }

  // Helper to open Edit Modal
  const openEditModal = (user) => {
    setSelectedUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status
    })
    setShowEditModal(true)
  }

  // Helper to open Delete Modal
  const openDeleteModal = (user) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased pb-12">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl border transition-all duration-300 transform translate-y-0 ${
          notification.type === 'success' 
            ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200' 
            : 'bg-rose-950/90 border-rose-500 text-rose-200'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-emerald-400" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-400" />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
          <button 
            onClick={() => setNotification(null)}
            className="ml-2 hover:bg-slate-800 rounded-full p-1 transition-colors"
          >
            <X className="h-4 w-4 opacity-75" />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 backdrop-blur bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-md shadow-indigo-500/20">
              <Users size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight sm:text-2xl">User Registry</h1>
              <p className="text-xs text-slate-400 mt-0.5">MERN Stack User Administration</p>
            </div>
          </div>
          <button
            onClick={() => {
              setFormData({ name: '', email: '', phone: '', status: 'Active' })
              setShowAddModal(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-sm transition-all hover:shadow-lg hover:shadow-indigo-500/20 cursor-pointer"
          >
            <UserPlus size={16} />
            <span className="hidden sm:inline">Add New User</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Statistics Cards */}
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {/* Card 1: Total Users */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-sm font-medium text-slate-400">Total Users</p>
              <h3 className="text-2xl font-bold text-slate-100 mt-1">{stats.total}</h3>
            </div>
            <div className="p-3 bg-slate-800 text-slate-300 rounded-lg">
              <Users size={24} />
            </div>
          </div>

          {/* Card 2: Active Users */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-sm font-medium text-slate-400">Active Users</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">{stats.active}</h3>
            </div>
            <div className="p-3 bg-emerald-950/30 text-emerald-400 rounded-lg border border-emerald-900/30">
              <UserCheck size={24} />
            </div>
          </div>

          {/* Card 3: Inactive Users */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-sm font-medium text-slate-400">Inactive Users</p>
              <h3 className="text-2xl font-bold text-slate-400 mt-1">{stats.inactive}</h3>
            </div>
            <div className="p-3 bg-slate-800/50 text-slate-400 rounded-lg">
              <UserMinus size={24} />
            </div>
          </div>
        </section>

        {/* User Search & Table Card */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
          {/* Search & Actions Header */}
          <div className="p-5 border-b border-slate-800 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Search size={18} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, phone or status..."
                className="w-full bg-slate-950 text-slate-100 placeholder-slate-500 text-sm rounded-lg pl-10 pr-10 py-2.5 border border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <button
              onClick={() => {
                fetchUsers()
                fetchStats()
              }}
              className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white px-3 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                <p className="text-sm text-slate-400">Loading user registry...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16 px-4">
                <AlertCircle className="mx-auto h-12 w-12 text-rose-500 mb-3" />
                <h3 className="text-lg font-semibold text-slate-200">Failed to load users</h3>
                <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">{error}</p>
                <button
                  onClick={fetchUsers}
                  className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-20 px-4">
                <Users className="mx-auto h-12 w-12 text-slate-600 mb-3" />
                <h3 className="text-lg font-semibold text-slate-300">No users found</h3>
                <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                  {debouncedSearch ? `No matches found for "${debouncedSearch}"` : 'Get started by adding your first user to the registry.'}
                </p>
                {!debouncedSearch && (
                  <button
                    onClick={() => {
                      setFormData({ name: '', email: '', phone: '', status: 'Active' })
                      setShowAddModal(true)
                    }}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus size={16} />
                    Add User
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/40 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Contact Info</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Created Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-200">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-slate-300">
                            <Mail size={14} className="text-slate-500" />
                            <span>{user.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-300">
                            <Phone size={14} className="text-slate-500" />
                            <span>{user.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          user.status === 'Active'
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700/55'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                        {new Date(user.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-950/20 rounded-lg transition-colors cursor-pointer"
                            title="Edit User"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(user)}
                            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Footer */}
          {!loading && users.length > 0 && (
            <div className="bg-slate-900/50 px-6 py-4 border-t border-slate-800 flex items-center justify-between text-sm">
              <div className="text-slate-400">
                Page <span className="font-semibold text-slate-200">{currentPage}</span> of{' '}
                <span className="font-semibold text-slate-200">{totalPages}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg border border-slate-700 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg border border-slate-700 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus size={18} className="text-indigo-500" />
                Add New User
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-850 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. john@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +1 (555) 123-4567"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit size={18} className="text-indigo-500" />
                Edit User Details
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedUser(null)
                }}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-850 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleEditUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. john@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +1 (555) 123-4567"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedUser(null)
                  }}
                  className="px-4 py-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden transform transition-all p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-500">
              <AlertCircle size={24} />
              <h3 className="text-lg font-bold text-white">Delete User</h3>
            </div>
            
            <p className="text-sm text-slate-300">
              Are you sure you want to delete <span className="font-semibold text-white">{selectedUser?.name}</span>? 
              This action is permanent and cannot be undone.
            </p>

            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedUser(null)
                }}
                className="px-4 py-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App