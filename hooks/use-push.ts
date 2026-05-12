'use client'

import { useState, useEffect, useCallback } from 'react'

const VAPID_PUBLIC_KEY = 'BEGOGX70h3pvegsaiXd4nGV-dATbuI-a-3OLjo3Wb6bSG2xyTp7sBbv76Wt-BRvzejzt8LrxASDKKjIU4LS9X2U'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export type PushPermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported'

export function usePush() {
  const [permission, setPermission] = useState<PushPermissionState>('prompt')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Check if push is supported
  const isSupported = typeof window !== 'undefined' && 
    'serviceWorker' in navigator && 
    'PushManager' in window &&
    'Notification' in window

  // Initialize service worker and check subscription status
  useEffect(() => {
    if (!isSupported) {
      setPermission('unsupported')
      return
    }

    const init = async () => {
      try {
        // Register service worker
        const reg = await navigator.serviceWorker.register('/sw.js')
        setRegistration(reg)

        // Check notification permission
        setPermission(Notification.permission as PushPermissionState)

        // Check if already subscribed
        const subscription = await reg.pushManager.getSubscription()
        setIsSubscribed(!!subscription)
      } catch (err) {
        console.error('[Push] Init error:', err)
        setError('Falha ao inicializar notificações')
      }
    }

    init()
  }, [isSupported])

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!registration || !isSupported) return false

    setIsLoading(true)
    setError(null)

    try {
      // Request notification permission
      const permission = await Notification.requestPermission()
      setPermission(permission as PushPermissionState)

      if (permission !== 'granted') {
        setError('Permissão de notificação negada')
        setIsLoading(false)
        return false
      }

      // Subscribe to push manager
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      })

      // Send subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON())
      })

      if (!response.ok) {
        throw new Error('Failed to save subscription')
      }

      setIsSubscribed(true)
      setIsLoading(false)
      return true
    } catch (err) {
      console.error('[Push] Subscribe error:', err)
      setError('Falha ao ativar notificações')
      setIsLoading(false)
      return false
    }
  }, [registration, isSupported])

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!registration) return false

    setIsLoading(true)
    setError(null)

    try {
      const subscription = await registration.pushManager.getSubscription()
      
      if (subscription) {
        // Unsubscribe locally
        await subscription.unsubscribe()
        
        // Remove from server
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription.toJSON())
        })
      }

      setIsSubscribed(false)
      setIsLoading(false)
      return true
    } catch (err) {
      console.error('[Push] Unsubscribe error:', err)
      setError('Falha ao desativar notificações')
      setIsLoading(false)
      return false
    }
  }, [registration])

  // Toggle subscription
  const toggle = useCallback(async () => {
    if (isSubscribed) {
      return unsubscribe()
    } else {
      return subscribe()
    }
  }, [isSubscribed, subscribe, unsubscribe])

  return {
    permission,
    isSubscribed,
    isLoading,
    isSupported,
    error,
    subscribe,
    unsubscribe,
    toggle
  }
}
