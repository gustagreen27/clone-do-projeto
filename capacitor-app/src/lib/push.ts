import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

// Store for the device token
let deviceToken: string | null = null

// Callback for when token is received
type TokenCallback = (token: string) => void
const tokenCallbacks: TokenCallback[] = []

export function onTokenReceived(callback: TokenCallback) {
  tokenCallbacks.push(callback)
  // If we already have a token, call immediately
  if (deviceToken) {
    callback(deviceToken)
  }
}

export function getDeviceToken(): string | null {
  return deviceToken
}

export async function initPushNotifications() {
  // Only run on native platforms
  if (!Capacitor.isNativePlatform()) {
    console.log('[GhostPeek] Running in web mode - push notifications disabled')
    return
  }

  try {
    // Request permission
    const permResult = await PushNotifications.requestPermissions()
    
    if (permResult.receive === 'granted') {
      // Register for push notifications
      await PushNotifications.register()
      console.log('[GhostPeek] Push notifications registered')
    } else {
      console.log('[GhostPeek] Push notification permission denied')
      return
    }

    // Listen for registration success
    PushNotifications.addListener('registration', (token) => {
      deviceToken = token.value
      console.log('[GhostPeek] Device token:', token.value)
      
      // Send token to your backend
      sendTokenToBackend(token.value)
      
      // Notify all callbacks
      tokenCallbacks.forEach(cb => cb(token.value))
    })

    // Listen for registration errors
    PushNotifications.addListener('registrationError', (error) => {
      console.error('[GhostPeek] Registration error:', error)
    })

    // Listen for push notifications received
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('[GhostPeek] Push received:', notification)
      
      // Trigger haptic feedback
      triggerHaptic()
      
      // You can show an in-app notification here
      showInAppNotification(notification)
    })

    // Listen for push notification action (when user taps)
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('[GhostPeek] Push action:', notification)
    })

  } catch (error) {
    console.error('[GhostPeek] Error initializing push:', error)
  }
}

async function sendTokenToBackend(token: string) {
  try {
    // Replace with your actual backend URL
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://your-backend.com'
    
    await fetch(`${backendUrl}/api/push/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        platform: Capacitor.getPlatform(),
        appId: 'app.plantain7502.soybean5714',
        timestamp: new Date().toISOString(),
      }),
    })
    
    console.log('[GhostPeek] Token sent to backend')
  } catch (error) {
    console.error('[GhostPeek] Error sending token:', error)
  }
}

async function triggerHaptic() {
  try {
    await Haptics.impact({ style: ImpactStyle.Medium })
  } catch (e) {
    // Haptics not available
  }
}

// In-app notification handler
type NotificationData = {
  title?: string
  body?: string
  data?: Record<string, unknown>
}

const notificationListeners: ((data: NotificationData) => void)[] = []

export function onNotificationReceived(callback: (data: NotificationData) => void) {
  notificationListeners.push(callback)
}

function showInAppNotification(notification: { title?: string; body?: string; data?: Record<string, unknown> }) {
  notificationListeners.forEach(cb => cb({
    title: notification.title,
    body: notification.body,
    data: notification.data as Record<string, unknown>,
  }))
}

// Manual permission request
export async function requestPushPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    return false
  }
  
  const result = await PushNotifications.requestPermissions()
  
  if (result.receive === 'granted') {
    await PushNotifications.register()
    return true
  }
  
  return false
}

// Check current permission status
export async function checkPushPermission(): Promise<'granted' | 'denied' | 'prompt'> {
  if (!Capacitor.isNativePlatform()) {
    return 'denied'
  }
  
  const result = await PushNotifications.checkPermissions()
  
  // Map Capacitor's PermissionState to our expected types
  // 'prompt-with-rationale' is treated as 'prompt'
  const state = result.receive
  if (state === 'granted') return 'granted'
  if (state === 'denied') return 'denied'
  return 'prompt'
}
