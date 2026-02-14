import { NextRequest, NextResponse } from 'next/server'
import { getActivities, createActivity } from '@/app/api/data/store'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId') || undefined
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    
    const activities = getActivities(customerId, limit)
    return NextResponse.json({ success: true, data: activities })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch activities' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const activity = createActivity(body)
    return NextResponse.json({ success: true, data: activity }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create activity' }, { status: 500 })
  }
}
