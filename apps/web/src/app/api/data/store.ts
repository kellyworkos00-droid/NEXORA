// In-memory data store (can be replaced with database later)
export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  website: string
  location: string
  industry: string
  employees: string
  status: 'Active' | 'Inactive' | 'Prospect'
  annualValue: string
  joinDate: string
  lastContact: string
  description: string
}

export interface Deal {
  id: string
  name: string
  customerId: string
  amount: string
  stage: string
  dueDate: string
  probability: number
  description?: string
}

export interface Activity {
  id: string
  type: 'call' | 'email' | 'meeting' | 'note' | 'task'
  title: string
  description: string
  timestamp: string
  actor?: string
  customerId?: string
}

// Mock data
const customersData: Customer[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    email: 'contact@acme.com',
    phone: '+1 (555) 123-4567',
    website: 'acme.com',
    location: 'San Francisco, CA',
    industry: 'Technology',
    employees: '500-1000',
    status: 'Active',
    annualValue: '$450K',
    joinDate: 'Jan 15, 2024',
    lastContact: '2 days ago',
    description: 'Leading enterprise software company specializing in cloud infrastructure and AI solutions.',
  },
  {
    id: '2',
    name: 'TechFlow Inc',
    email: 'sales@techflow.com',
    phone: '+1 (555) 987-6543',
    website: 'techflow.io',
    location: 'Austin, TX',
    industry: 'Software',
    employees: '50-100',
    status: 'Active',
    annualValue: '$120K',
    joinDate: 'Mar 22, 2024',
    lastContact: '1 week ago',
    description: 'Innovative startup focused on developer tools and automation.',
  },
  {
    id: '3',
    name: 'Global Ventures Ltd',
    email: 'info@globalventures.com',
    phone: '+1 (555) 456-7890',
    website: 'globalventures.co',
    location: 'New York, NY',
    industry: 'Consulting',
    employees: '100-500',
    status: 'Active',
    annualValue: '$280K',
    joinDate: 'Feb 10, 2024',
    lastContact: '3 days ago',
    description: 'Business consulting firm helping companies with digital transformation.',
  },
]

const dealsData: Deal[] = [
  {
    id: '1',
    name: 'Enterprise License Renewal',
    customerId: '1',
    amount: '$150K',
    stage: 'Negotiation',
    dueDate: 'Feb 28, 2026',
    probability: 75,
    description: 'Annual enterprise license renewal with new module upgrades',
  },
  {
    id: '2',
    name: 'Custom Integration Project',
    customerId: '1',
    amount: '$85K',
    stage: 'Proposal',
    dueDate: 'Mar 15, 2026',
    probability: 60,
    description: 'Custom integration with existing systems',
  },
  {
    id: '3',
    name: 'Support Contract Expansion',
    customerId: '1',
    amount: '$45K',
    stage: 'Discovery',
    dueDate: 'Apr 10, 2026',
    probability: 40,
    description: 'Expand support contract to 24/7 coverage',
  },
  {
    id: '4',
    name: 'Platform Migration',
    customerId: '2',
    amount: '$120K',
    stage: 'Proposal',
    dueDate: 'Mar 30, 2026',
    probability: 50,
    description: 'Migration to new cloud platform',
  },
  {
    id: '5',
    name: 'Consulting Project',
    customerId: '3',
    amount: '$200K',
    stage: 'Negotiation',
    dueDate: 'Mar 1, 2026',
    probability: 85,
    description: 'Digital transformation consulting services',
  },
]

const activitiesData: Activity[] = [
  {
    id: '1',
    type: 'email',
    title: 'Email sent to Acme Corporation',
    description: 'Quarterly business review proposal shared',
    timestamp: '2 hours ago',
    actor: 'You',
    customerId: '1',
  },
  {
    id: '2',
    type: 'call',
    title: 'Call with TechFlow Inc',
    description: 'Discussed integration roadmap and timelines',
    timestamp: '4 hours ago',
    actor: 'Sarah Chen',
    customerId: '2',
  },
  {
    id: '3',
    type: 'meeting',
    title: 'Team sync completed',
    description: 'Weekly pipeline review meeting',
    timestamp: '1 day ago',
    actor: 'Calendar',
  },
  {
    id: '4',
    type: 'note',
    title: 'Deal moved to negotiation',
    description: 'Global Ventures contract progressing',
    timestamp: '1 day ago',
    actor: 'Mike Johnson',
    customerId: '3',
  },
  {
    id: '5',
    type: 'email',
    title: 'Follow-up email sent',
    description: 'Reminded about pending proposal review',
    timestamp: '2 days ago',
    actor: 'You',
    customerId: '1',
  },
  {
    id: '6',
    type: 'meeting',
    title: 'Customer onboarding call',
    description: 'New customer TechFlow Inc orientation',
    timestamp: '2 days ago',
    actor: 'Support Team',
    customerId: '2',
  },
]

// In-memory storage (simulates database)
let customers = [...customersData]
let deals = [...dealsData]
let activities = [...activitiesData]

// Customer methods
export const getCustomers = (limit?: number): Customer[] => {
  return limit ? customers.slice(0, limit) : customers
}

export const getCustomerById = (id: string): Customer | undefined => {
  return customers.find(c => c.id === id)
}

export const createCustomer = (customer: Omit<Customer, 'id'>): Customer => {
  const newCustomer: Customer = {
    ...customer,
    id: (Math.max(...customers.map(c => parseInt(c.id)), 0) + 1).toString(),
  }
  customers.push(newCustomer)
  return newCustomer
}

export const updateCustomer = (id: string, updates: Partial<Customer>): Customer | undefined => {
  const index = customers.findIndex(c => c.id === id)
  if (index === -1) return undefined
  customers[index] = { ...customers[index], ...updates }
  return customers[index]
}

export const deleteCustomer = (id: string): boolean => {
  const index = customers.findIndex(c => c.id === id)
  if (index === -1) return false
  customers.splice(index, 1)
  return true
}

// Deal methods
export const getDeals = (customerId?: string, limit?: number): Deal[] => {
  let filtered = customerId ? deals.filter(d => d.customerId === customerId) : deals
  return limit ? filtered.slice(0, limit) : filtered
}

export const getDealById = (id: string): Deal | undefined => {
  return deals.find(d => d.id === id)
}

export const createDeal = (deal: Omit<Deal, 'id'>): Deal => {
  const newDeal: Deal = {
    ...deal,
    id: (Math.max(...deals.map(d => parseInt(d.id)), 0) + 1).toString(),
  }
  deals.push(newDeal)
  return newDeal
}

export const updateDeal = (id: string, updates: Partial<Deal>): Deal | undefined => {
  const index = deals.findIndex(d => d.id === id)
  if (index === -1) return undefined
  deals[index] = { ...deals[index], ...updates }
  return deals[index]
}

export const deleteDeal = (id: string): boolean => {
  const index = deals.findIndex(d => d.id === id)
  if (index === -1) return false
  deals.splice(index, 1)
  return true
}

// Activity methods
export const getActivities = (customerId?: string, limit?: number): Activity[] => {
  let filtered = customerId ? activities.filter(a => a.customerId === customerId) : activities
  return limit ? filtered.slice(0, limit) : filtered
}

export const getActivityById = (id: string): Activity | undefined => {
  return activities.find(a => a.id === id)
}

export const createActivity = (activity: Omit<Activity, 'id'>): Activity => {
  const newActivity: Activity = {
    ...activity,
    id: (Math.max(...activities.map(a => parseInt(a.id)), 0) + 1).toString(),
  }
  activities.push(newActivity)
  return newActivity
}

export const deleteActivity = (id: string): boolean => {
  const index = activities.findIndex(a => a.id === id)
  if (index === -1) return false
  activities.splice(index, 1)
  return true
}
