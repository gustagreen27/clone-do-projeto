"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellRing, Check, AlertCircle, Loader2 } from "lucide-react";

const VAPID_PUBLIC_KEY = 'BEGOGX70h3pvegsaiXd4nGV-dATbuI-a-3OLjo3Wb6bSG2xyTp7sBbv76Wt-BRvzejzt8LrxASDKKjIU4LS9X2U';

type AlertStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'unsupported';

export function EnableAlertsButton() {
  const [status, setStatus] = useState<AlertStatus>('idle');
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running as PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    // Check notification support and current permission
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setStatus('unsupported');
      return;
    }

    if (Notification.permission === 'granted') {
      checkExistingSubscription();
    } else if (Notification.permission === 'denied') {
      setStatus('denied');
    }
  }, []);

  async function checkExistingSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        setStatus('granted');
      }
    } catch (e) {
      console.error('[EnableAlerts] Error checking subscription:', e);
    }
  }

  async function handleEnableAlerts() {
    if (status === 'loading' || status === 'granted') return;

    setStatus('loading');

    try {
      // 1. Request notification permission (ONLY triggered by user click - Apple requirement)
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        setStatus('denied');
        return;
      }

      // 2. Register service worker if not already
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready;

      // 3. Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // 4. Send subscription to backend
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          device: {
            platform: getPlatform(),
            standalone: isStandalone,
            userAgent: navigator.userAgent,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription');
      }

      setStatus('granted');
      
      // Show success feedback with haptic if available
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 30, 50]);
      }

    } catch (error) {
      console.error('[EnableAlerts] Error:', error);
      setStatus('denied');
    }
  }

  function getPlatform(): string {
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
    if (/Android/.test(ua)) return 'android';
    if (/Mac/.test(ua)) return 'macos';
    if (/Win/.test(ua)) return 'windows';
    return 'unknown';
  }

  // If not in standalone mode on iOS, don't show the button
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS && !isStandalone && status !== 'granted') {
    return null;
  }

  if (status === 'unsupported') {
    return null;
  }

  return (
    <motion.button
      onClick={handleEnableAlerts}
      disabled={status === 'loading' || status === 'granted'}
      whileTap={{ scale: 0.98 }}
      className={`
        relative flex h-14 items-center justify-center gap-3 overflow-hidden rounded-2xl px-8 
        font-semibold shadow-lg transition-all duration-300
        ${status === 'granted'
          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/25'
          : status === 'denied'
          ? 'bg-gradient-to-r from-red-600/80 to-red-700/80 text-white/90'
          : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02]'
        }
      `}
    >
      {/* Shimmer effect for idle state */}
      {status === 'idle' && (
        <motion.div
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ translateX: ['100%', '-100%'] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        />
      )}

      <AnimatePresence mode="wait">
        {status === 'loading' ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-3"
          >
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Ativando...</span>
          </motion.div>
        ) : status === 'granted' ? (
          <motion.div
            key="granted"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
              <Check className="h-4 w-4" />
            </div>
            <span>Alertas Ativos</span>
            <BellRing className="h-5 w-5" />
          </motion.div>
        ) : status === 'denied' ? (
          <motion.div
            key="denied"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-3"
          >
            <AlertCircle className="h-5 w-5" />
            <span>Alertas Bloqueados</span>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-3"
          >
            <Bell className="h-5 w-5" />
            <span>Ativar Alertas de Venda</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
