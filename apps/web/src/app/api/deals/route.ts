import { NextRequest, NextResponse } from 'next/server'
import { getDeals, createDeal } from '@/app/api/data/store'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId') || undefined
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    
    const deals = getDeals(customerId, limit)
    return NextResponse.json({ success: true, data: deals })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch deals' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const deal = createDeal(body)
    return NextResponse.json({ success: true, data: deal }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create deal' }, { status: 500 })
  }
}
