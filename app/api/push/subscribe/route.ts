import { NextRequest, NextResponse } from 'next/server'

// In-memory store for subscriptions (will reset on server restart)
// For production, use a database like Supabase
declare global {
  // eslint-disable-next-line no-var
  var pushSubscriptions: Map<string, PushSubscriptionJSON>
}

if (!global.pushSubscriptions) {
  global.pushSubscriptions = new Map()
}

export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json()
    
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription' },
        { status: 400 }
      )
    }

    // Use endpoint as unique key
    const key = Buffer.from(subscription.endpoint).toString('base64').slice(0, 32)
    global.pushSubscriptions.set(key, subscription)
    
    console.log(`[Push] New subscription added. Total: ${global.pushSubscriptions.size}`)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Subscription added',
      totalSubscriptions: global.pushSubscriptions.size
    })
  } catch (error) {
    console.error('[Push] Subscribe error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const subscription = await request.json()
    
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription' },
        { status: 400 }
      )
    }

    const key = Buffer.from(subscription.endpoint).toString('base64').slice(0, 32)
    global.pushSubscriptions.delete(key)
    
    console.log(`[Push] Subscription removed. Total: ${global.pushSubscriptions.size}`)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Subscription removed' 
    })
  } catch (error) {
    console.error('[Push] Unsubscribe error:', error)
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    count: global.pushSubscriptions.size
  })
}
