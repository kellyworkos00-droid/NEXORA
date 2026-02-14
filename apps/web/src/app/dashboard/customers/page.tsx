import DashboardLayout from '@/components/dashboard/dashboard-layout'
import CustomerList from '@/components/dashboard/customer-list'

export default function CustomersPage() {
  return (
    <DashboardLayout>
      <CustomerList />
    </DashboardLayout>
  )
}
