import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'

// VAPID keys - in production, use environment variables
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BEGOGX70h3pvegsaiXd4nGV-dATbuI-a-3OLjo3Wb6bSG2xyTp7sBbv76Wt-BRvzejzt8LrxASDKKjIU4LS9X2U'
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'sXyROq2zgf2xDxmFfaQxEX3HzIOxwR_4vjQY4eDbI70'
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:admin@example.com'

webpush.setVapidDetails(
  VAPID_EMAIL,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
)

export interface PushPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: {
    type?: 'sale' | 'pix' | 'subscription' | 'refund' | 'custom'
    amount?: string
    product?: string
    url?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload: PushPayload = await request.json()
    
    if (!payload.title || !payload.body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      )
    }

    const subscriptions = global.pushSubscriptions
    
    if (!subscriptions || subscriptions.size === 0) {
      return NextResponse.json(
        { error: 'No subscriptions found', sent: 0 },
        { status: 200 }
      )
    }

    const pushPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icon-512.png',
      badge: payload.badge || '/icon-512.png',
      tag: payload.tag || `notification-${Date.now()}`,
      data: payload.data || {},
      timestamp: Date.now()
    })

    const results = await Promise.allSettled(
      Array.from(subscriptions.entries()).map(async ([key, subscription]) => {
        try {
          await webpush.sendNotification(
            subscription as webpush.PushSubscription,
            pushPayload
          )
          return { key, success: true }
        } catch (error: unknown) {
          const webPushError = error as { statusCode?: number }
          // Remove invalid subscriptions (410 Gone or 404 Not Found)
          if (webPushError.statusCode === 410 || webPushError.statusCode === 404) {
            subscriptions.delete(key)
            console.log(`[Push] Removed expired subscription: ${key}`)
          }
          return { key, success: false, error }
        }
      })
    )

    const successful = results.filter(
      r => r.status === 'fulfilled' && r.value.success
    ).length
    
    const failed = results.length - successful

    console.log(`[Push] Sent to ${successful}/${results.length} devices`)

    return NextResponse.json({
      success: true,
      sent: successful,
      failed,
      total: results.length
    })
  } catch (error) {
    console.error('[Push] Send error:', error)
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    )
  }
}
