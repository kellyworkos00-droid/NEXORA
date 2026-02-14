import { NextRequest, NextResponse } from 'next/server'
import { getCustomerById, updateCustomer, deleteCustomer } from '@/app/api/data/store'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const customer = getCustomerById(params.id)
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: customer })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch customer' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const customer = updateCustomer(params.id, body)
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: customer })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update customer' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const success = deleteCustomer(params.id)
    if (!success) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete customer' }, { status: 500 })
  }
}
