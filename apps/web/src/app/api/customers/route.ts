import { NextRequest, NextResponse } from 'next/server'
import { getCustomers, createCustomer } from '@/app/api/data/store'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    
    const customers = getCustomers(limit)
    return NextResponse.json({ success: true, data: customers })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch customers' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const customer = createCustomer(body)
    return NextResponse.json({ success: true, data: customer }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create customer' }, { status: 500 })
  }
}
