'use client'

import { motion } from 'framer-motion'
import { X, Check } from 'lucide-react'

const competitors = [
  {
    name: 'Salesforce',
    problems: ['Too complex', 'Expensive', 'Poor UX', 'Slow implementation']
  },
  {
    name: 'HubSpot',
    problems: ['Limited ERP', 'Basic AI', 'Module silos', 'Pricing scales fast']
  },
  {
    name: 'Zoho',
    problems: ['Not AI-native', 'Fragmented UX', 'Weak automation', 'Poor integration']
  },
  {
    name: 'Odoo',
    problems: ['Outdated UI', 'Complex setup', 'Plugin chaos', 'Support issues']
  },
]

const nexoraAdvantages = [
  'AI-native from the core',
  'Beautiful, modern UI',
  'Modular & flexible',
  'Affordable pricing',
  'Developer-friendly',
  'Unified ecosystem',
  'Predictive intelligence',
  'White-label ready'
]

export function ComparisonSection() {
  return (
    <section className="py-24 px-6 bg-slate-50 dark:bg-slate-950">
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
              Why Switch to
              <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                {' '}NEXORA?
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              See how we compare to the traditional players
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Competitors' Problems */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Traditional Systems</h3>
              <p className="text-slate-600 dark:text-slate-400">What's holding them back</p>
            </div>

            <div className="space-y-4">
              {competitors.map((competitor, index) => (
                <div
                  key={competitor.name}
                  className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                >
                  <h4 className="font-bold text-lg mb-3 text-slate-900 dark:text-white">
                    {competitor.name}
                  </h4>
                  <ul className="space-y-2">
                    {competitor.problems.map((problem) => (
                      <li key={problem} className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                        <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <span>{problem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>

          {/* NEXORA Advantages */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                NEXORA
              </h3>
              <p className="text-slate-600 dark:text-slate-400">Built for the future</p>
            </div>

            <div className="p-8 rounded-xl bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-950 dark:to-purple-950 border-2 border-primary-200 dark:border-primary-800">
              <ul className="space-y-4">
                {nexoraAdvantages.map((advantage, index) => (
                  <motion.li
                    key={advantage}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-lg font-medium text-slate-900 dark:text-white">
                      {advantage}
                    </span>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-8 pt-8 border-t border-primary-200 dark:border-primary-800">
                <p className="text-sm text-slate-600 dark:text-slate-300 italic">
                  "NEXORA isn't just another CRM or ERP. It's a complete rethinking of how businesses should operate in the AI era."
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
