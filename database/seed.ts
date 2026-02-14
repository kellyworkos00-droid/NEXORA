import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo tenant
  const tenant = await prisma.tenant.upsert({
    where: { subdomain: 'demo' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Demo Corporation',
      subdomain: 'demo',
      plan: 'pro',
      status: 'active',
      settings: {
        timezone: 'UTC',
        currency: 'USD',
        language: 'en',
      },
    },
  })
  console.log('✅ Created demo tenant:', tenant.name)

  // Create demo admin user
  const passwordHash = await bcrypt.hash('Demo123!', 10)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@demo.nexora.ai' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'admin@demo.nexora.ai',
      passwordHash,
      name: 'Admin User',
      tenantId: tenant.id,
      role: 'admin',
      emailVerified: true,
    },
  })
  console.log('✅ Created admin user:', adminUser.email)

  // Create demo customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        tenantId: tenant.id,
        name: 'Acme Corporation',
        email: 'contact@acme.com',
        phone: '+1-555-0100',
        company: 'Acme Corp',
        status: 'active',
        tags: ['enterprise', 'high-value'],
        createdBy: adminUser.id,
      },
    }),
    prisma.customer.create({
      data: {
        tenantId: tenant.id,
        name: 'TechStart Inc',
        email: 'hello@techstart.io',
        phone: '+1-555-0101',
        company: 'TechStart',
        status: 'prospect',
        tags: ['startup', 'tech'],
        createdBy: adminUser.id,
      },
    }),
    prisma.customer.create({
      data: {
        tenantId: tenant.id,
        name: 'Global Ventures',
        email: 'info@globalventures.com',
        phone: '+1-555-0102',
        company: 'Global Ventures LLC',
        status: 'lead',
        tags: ['consulting'],
        createdBy: adminUser.id,
      },
    }),
  ])
  console.log(`✅ Created ${customers.length} demo customers`)

  // Create demo deals
  const deals = await Promise.all([
    prisma.deal.create({
      data: {
        tenantId: tenant.id,
        customerId: customers[0].id,
        title: 'Enterprise License - Annual',
        value: 150000,
        stage: 'negotiation',
        probability: 75,
        expectedCloseDate: new Date('2024-03-31'),
        assignedTo: adminUser.id,
      },
    }),
    prisma.deal.create({
      data: {
        tenantId: tenant.id,
        customerId: customers[1].id,
        title: 'Startup Package - Monthly',
        value: 5000,
        stage: 'proposal',
        probability: 50,
        expectedCloseDate: new Date('2024-02-28'),
        assignedTo: adminUser.id,
      },
    }),
    prisma.deal.create({
      data: {
        tenantId: tenant.id,
        customerId: customers[2].id,
        title: 'Consulting Services',
        value: 25000,
        stage: 'qualification',
        probability: 30,
        expectedCloseDate: new Date('2024-04-15'),
        assignedTo: adminUser.id,
      },
    }),
  ])
  console.log(`✅ Created ${deals.length} demo deals`)

  // Create demo activities
  const activities = await Promise.all([
    prisma.activity.create({
      data: {
        tenantId: tenant.id,
        customerId: customers[0].id,
        dealId: deals[0].id,
        type: 'meeting',
        subject: 'Demo presentation scheduled',
        description: 'Product demo with decision makers',
        dueDate: new Date('2024-02-15T14:00:00Z'),
        assignedTo: adminUser.id,
        createdBy: adminUser.id,
      },
    }),
    prisma.activity.create({
      data: {
        tenantId: tenant.id,
        customerId: customers[1].id,
        dealId: deals[1].id,
        type: 'call',
        subject: 'Follow-up call',
        description: 'Discuss pricing and implementation timeline',
        dueDate: new Date('2024-02-10T10:00:00Z'),
        assignedTo: adminUser.id,
        createdBy: adminUser.id,
      },
    }),
    prisma.activity.create({
      data: {
        tenantId: tenant.id,
        customerId: customers[2].id,
        type: 'email',
        subject: 'Send proposal',
        description: 'Email detailed proposal with ROI analysis',
        dueDate: new Date('2024-02-08T09:00:00Z'),
        completed: true,
        assignedTo: adminUser.id,
        createdBy: adminUser.id,
      },
    }),
  ])
  console.log(`✅ Created ${activities.length} demo activities`)

  console.log('✨ Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
