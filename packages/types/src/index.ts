// User & Authentication Types
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  tenantId: string
  role: UserRole
  status: UserStatus
  createdAt: Date
  updatedAt: Date
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
  GUEST = 'guest',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

// Tenant (Multi-tenancy) Types
export interface Tenant {
  id: string
  name: string
  subdomain: string
  plan: SubscriptionPlan
  settings: TenantSettings
  whiteLabel?: WhiteLabelConfig
  createdAt: Date
  updatedAt: Date
}

export interface TenantSettings {
  timezone: string
  currency: string
  language: string
  features: string[]
  integrations: Record<string, any>
}

export interface WhiteLabelConfig {
  brandName: string
  logo: string
  primaryColor: string
  secondaryColor: string
  customDomain?: string
}

// Subscription Types
export enum SubscriptionPlan {
  FREE = 'free',
  GROWTH = 'growth',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

export interface Subscription {
  id: string
  tenantId: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  aiCredits: number
  users: number
  storage: number
  features: string[]
  billingCycle: 'monthly' | 'yearly'
  amount: number
  nextBillingDate: Date
  createdAt: Date
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  TRIAL = 'trial',
  PAST_DUE = 'past_due',
  CANCELLED = 'cancelled',
}

// CRM Types
export interface Customer {
  id: string
  tenantId: string
  name: string
  email: string
  phone?: string
  company?: string
  status: CustomerStatus
  tags: string[]
  customFields: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export enum CustomerStatus {
  LEAD = 'lead',
  PROSPECT = 'prospect',
  ACTIVE = 'active',
  CHURNED = 'churned',
}

export interface Deal {
  id: string
  tenantId: string
  customerId: string
  title: string
  value: number
  stage: DealStage
  probability: number
  expectedCloseDate?: Date
  assignedTo?: string
  createdAt: Date
  updatedAt: Date
}

export enum DealStage {
  QUALIFICATION = 'qualification',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost',
}

// AI Types
export interface AIPrediction {
  id: string
  tenantId: string
  type: PredictionType
  input: any
  output: any
  confidence: number
  createdAt: Date
}

export enum PredictionType {
  REVENUE = 'revenue',
  CHURN = 'churn',
  INVENTORY = 'inventory',
  PRICING = 'pricing',
  HIRING = 'hiring',
}

export interface AIInsight {
  id: string
  tenantId: string
  type: InsightType
  title: string
  description: string
  confidence: number
  priority: Priority
  impact: Impact
  actionable: boolean
  createdAt: Date
}

export enum InsightType {
  OPPORTUNITY = 'opportunity',
  RISK = 'risk',
  ANOMALY = 'anomaly',
  TREND = 'trend',
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum Impact {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

// Workflow & Automation Types
export interface Workflow {
  id: string
  tenantId: string
  name: string
  description?: string
  trigger: WorkflowTrigger
  actions: WorkflowAction[]
  enabled: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface WorkflowTrigger {
  type: TriggerType
  config: Record<string, any>
}

export enum TriggerType {
  MANUAL = 'manual',
  SCHEDULE = 'schedule',
  EVENT = 'event',
  WEBHOOK = 'webhook',
}

export interface WorkflowAction {
  id: string
  type: ActionType
  config: Record<string, any>
  order: number
}

export enum ActionType {
  EMAIL = 'email',
  NOTIFICATION = 'notification',
  API_CALL = 'api_call',
  DATABASE_UPDATE = 'database_update',
  AI_TASK = 'ai_task',
}

// Marketplace Types
export interface MarketplacePlugin {
  id: string
  name: string
  description: string
  category: PluginCategory
  price: number
  rating: number
  downloads: number
  author: string
  version: string
  compatibility: string[]
  createdAt: Date
}

export enum PluginCategory {
  CRM = 'crm',
  ERP = 'erp',
  MARKETING = 'marketing',
  ANALYTICS = 'analytics',
  AI = 'ai',
  INTEGRATION = 'integration',
  TEMPLATE = 'template',
}

// Export all types
export * from './api'
