'use client'

import { useState } from 'react'
import { Plus, Search, Filter, MoreVertical, Mail, Phone, Building } from 'lucide-react'

interface Customer {
  id: string
  name: string
  email: string
  company: string
  status: 'lead' | 'prospect' | 'active' | 'churned'
  tags: string[]
  value: number
  lastContact: string
}

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    email: 'contact@acme.com',
    company: 'Acme Corp',
    status: 'active',
    tags: ['enterprise', 'high-value'],
    value: 150000,
    lastContact: '2024-01-15',
  },
  {
    id: '2',
    name: 'TechStart Inc',
    email: 'hello@techstart.io',
    company: 'TechStart',
    status: 'prospect',
    tags: ['startup', 'tech'],
    value: 5000,
    lastContact: '2024-02-01',
  },
  {
    id: '3',
    name: 'Global Ventures',
    email: 'info@globalventures.com',
    company: 'Global Ventures LLC',
    status: 'lead',
    tags: ['consulting'],
    value: 25000,
    lastContact: '2024-02-05',
  },
]

const statusColors = {
  lead: 'bg-gray-100 text-gray-700',
  prospect: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  churned: 'bg-red-100 text-red-700',
}

export default function CustomerList() {
  const [customers] = useState<Customer[]>(mockCustomers)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.company.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 mt-1">Manage your customer relationships</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          <Plus className="h-5 w-5" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="lead">Lead</option>
            <option value="prospect">Prospect</option>
            <option value="active">Active</option>
            <option value="churned">Churned</option>
          </select>

          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="h-5 w-5" />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* Customer table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tags
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Contact
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-semibold">
                      {customer.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {customer.name}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Building className="h-3 w-3 mr-1" />
                        {customer.company}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Mail className="h-3 w-3 mr-1 text-gray-400" />
                      {customer.email}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      statusColors[customer.status]
                    }`}
                  >
                    {customer.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                    {customer.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${customer.value.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(customer.lastContact).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {filteredCustomers.length} of {customers.length} customers
        </p>
        <div className="flex space-x-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
            Previous
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
