'use client'

import { motion } from 'framer-motion'
import { 
  Brain, 
  Blocks, 
  Store, 
  Palette, 
  TrendingUp,
  CheckCircle2 
} from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'AI Core (Not AI Add-on)',
    description: 'AI is the foundation, not a feature. Predicts revenue, detects churn, suggests pricing, and automates decisions.',
    highlights: [
      'Revenue prediction',
      'Churn risk detection',
      'Automated insights',
      'Smart recommendations'
    ]
  },
  {
    icon: Blocks,
    title: 'Modular Architecture',
    description: 'Activate only what you need: CRM, Accounting, HR, POS, Inventory, Marketing, and more.',
    highlights: [
      'Pick your modules',
      'Seamless integration',
      'Unified AI brain',
      'Scale as you grow'
    ]
  },
  {
    icon: Store,
    title: 'Built-in Marketplace',
    description: 'Third-party plugins, industry templates, AI agents, and automations. Shopify-style ecosystem.',
    highlights: [
      'Plugin marketplace',
      'Revenue sharing',
      'Community-built',
      'Industry templates'
    ]
  },
  {
    icon: Palette,
    title: 'White Label Ready',
    description: 'Create sub-domains, white-label NEXORA, and resell to clients with your brand.',
    highlights: [
      'Full customization',
      'Your branding',
      'Sub-domains',
      'Reseller program'
    ]
  },
  {
    icon: TrendingUp,
    title: 'Predictive Decision Engine',
    description: 'Instead of dashboards showing what happened, NEXORA tells you what will happen.',
    highlights: [
      '"Stock runs out in 8 days"',
      '"Underpricing by 12%"',
      '"Client payment risk: 78%"',
      '"Hire salesperson in Q3"'
    ]
  },
]

export function FeaturesSection() {
  return (
    <section className="py-24 px-6 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              What Makes NEXORA
              <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                {' '}Better
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Unlike Salesforce, HubSpot, Zoho, or Odoo - we're built AI-native from day one
            </p>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="relative h-full p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 transition-all duration-300 hover:shadow-xl">
                {/* Icon */}
                <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  {feature.description}
                </p>

                {/* Highlights */}
                <ul className="space-y-2">
                  {feature.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
