'use client'

import { motion } from 'framer-motion'
import { Check, Sparkles, Zap, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'

const plans = [
  {
    name: 'Freemium',
    price: 0,
    period: 'forever',
    description: 'Perfect for trying out NEXORA',
    icon: Sparkles,
    features: [
      'Up to 3 users',
      'Basic CRM',
      '100 AI credits/month',
      'Email support',
      '1 GB storage',
      'Community access'
    ],
    cta: 'Start Free',
    popular: false
  },
  {
    name: 'Growth',
    price: 49,
    period: '/month',
    description: 'For growing businesses',
    icon: Zap,
    features: [
      'Up to 25 users',
      'All modules included',
      '1,000 AI credits/month',
      'Priority support',
      '50 GB storage',
      'Advanced automation',
      'Custom workflows',
      'Analytics dashboard'
    ],
    cta: 'Start 14-day trial',
    popular: true
  },
  {
    name: 'Pro',
    price: 149,
    period: '/month',
    description: 'For established companies',
    icon: Zap,
    features: [
      'Up to 100 users',
      'AI predictions',
      '5,000 AI credits/month',
      'Advanced workflows',
      '500 GB storage',
      'API access',
      'Custom integrations',
      'Dedicated manager',
      'SLA guarantee'
    ],
    cta: 'Start 14-day trial',
    popular: false
  },
  {
    name: 'Enterprise',
    price: null,
    period: 'custom',
    description: 'For large organizations',
    icon: Crown,
    features: [
      'Unlimited users',
      'Dedicated cloud',
      'Unlimited AI credits',
      'Custom AI model',
      'White-label options',
      'On-premise available',
      'Advanced security',
      '24/7 phone support',
      'Custom SLA',
      'Training & onboarding'
    ],
    cta: 'Contact Sales',
    popular: false
  }
]

export function PricingSection() {
  return (
    <section className="py-24 px-6 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Simple, Transparent
              <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                {' '}Pricing
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Start free, scale as you grow. No hidden fees.
            </p>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="px-4 py-1 rounded-full bg-gradient-to-r from-primary-600 to-purple-600 text-white text-sm font-medium">
                    Most Popular
                  </div>
                </div>
              )}

              <div className={`relative h-full p-8 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl ${
                plan.popular
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/50'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}>
                {/* Icon */}
                <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-6">
                  <plan.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>

                {/* Plan Name */}
                <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="mb-4">
                  {plan.price !== null ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold text-slate-900 dark:text-white">
                        ${plan.price}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">{plan.period}</span>
                    </div>
                  ) : (
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">
                      Custom
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  {plan.description}
                </p>

                {/* CTA Button */}
                <Button
                  className={`w-full mb-8 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700'
                      : ''
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                  size="lg"
                >
                  {plan.cta}
                </Button>

                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600 dark:text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 text-center text-sm text-slate-600 dark:text-slate-400"
        >
          <p>All plans include SSL, automatic backups, and 99.9% uptime SLA.</p>
          <p className="mt-2">AI credits can be purchased separately at $0.01 per credit.</p>
        </motion.div>
      </div>
    </section>
  )
}
