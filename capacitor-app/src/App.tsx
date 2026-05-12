import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CreditCard, QrCode, RefreshCw, DollarSign, Trash2, Zap } from 'lucide-react'
import { onNotificationReceived, getDeviceToken, checkPushPermission, requestPushPermission } from './lib/push'
import { playNotificationSound, initAudio } from './lib/sound'

type NotificationType = 'credit_card' | 'pix' | 'subscription' | 'refund' | 'sale'

interface Notification {
  id: string
  type: NotificationType
  title: string
  body: string
  amount: string
  timestamp: Date
}

const notificationConfig: Record<NotificationType, { icon: typeof CreditCard; color: string; glowClass: string }> = {
  credit_card: { icon: CreditCard, color: 'text-emerald-400', glowClass: 'glow-success' },
  pix: { icon: QrCode, color: 'text-emerald-400', glowClass: 'glow-success' },
  subscription: { icon: RefreshCw, color: 'text-blue-400', glowClass: 'glow-success' },
  refund: { icon: DollarSign, color: 'text-amber-400', glowClass: 'glow-warning' },
  sale: { icon: Zap, color: 'text-emerald-400', glowClass: 'glow-success' },
}

const sampleNotifications: Omit<Notification, 'id' | 'timestamp'>[] = [
  { type: 'credit_card', title: 'Venda Aprovada', body: 'Curso de Marketing Digital', amount: 'R$ 497,00' },
  { type: 'pix', title: 'Pix Recebido', body: 'Mentoria Premium', amount: 'R$ 1.997,00' },
  { type: 'subscription', title: 'Nova Assinatura', body: 'Plano Anual VIP', amount: 'R$ 97,00/mês' },
  { type: 'sale', title: 'Venda Confirmada', body: 'E-book Exclusivo', amount: 'R$ 47,00' },
  { type: 'credit_card', title: 'Venda Aprovada', body: 'Pack de Templates', amount: 'R$ 197,00' },
]

export default function App() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt')
  const [deviceToken, setDeviceToken] = useState<string | null>(null)
  const [autoMode, setAutoMode] = useState(false)

  // Initialize audio
  useEffect(() => {
    initAudio()
  }, [])

  // Update time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
      setDate(now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  // Check push permission
  useEffect(() => {
    checkPushPermission().then(setPermissionStatus)
    setDeviceToken(getDeviceToken())
  }, [])

  // Listen for push notifications
  useEffect(() => {
    onNotificationReceived((data) => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: (data.data?.type as NotificationType) || 'sale',
        title: data.title || 'Nova Venda',
        body: data.body || 'Produto vendido',
        amount: (data.data?.amount as string) || 'R$ 0,00',
        timestamp: new Date(),
      }
      setNotifications(prev => [newNotification, ...prev].slice(0, 10))
      playNotificationSound()
    })
  }, [])

  // Auto mode - simulate notifications
  useEffect(() => {
    if (!autoMode) return
    
    const interval = setInterval(() => {
      simulateNotification()
    }, Math.random() * 8000 + 4000) // 4-12 seconds

    return () => clearInterval(interval)
  }, [autoMode])

  const simulateNotification = () => {
    const sample = sampleNotifications[Math.floor(Math.random() * sampleNotifications.length)]
    const newNotification: Notification = {
      ...sample,
      id: Date.now().toString(),
      timestamp: new Date(),
    }
    setNotifications(prev => [newNotification, ...prev].slice(0, 10))
    playNotificationSound()
  }

  const handleRequestPermission = async () => {
    const granted = await requestPushPermission()
    setPermissionStatus(granted ? 'granted' : 'denied')
    setDeviceToken(getDeviceToken())
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900/50 via-black to-black pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen px-6 pt-16 pb-8">
        {/* Header - Time and Date */}
        <div className="text-center mb-8">
          <h1 className="text-7xl font-thin tracking-tight mb-2">{time}</h1>
          <p className="text-lg text-dark-400 capitalize">{date}</p>
        </div>

        {/* Push Status Banner */}
        {permissionStatus !== 'granted' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="notification-card p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Ativar Notificacoes</p>
                  <p className="text-xs text-dark-400">Receba alertas de vendas em tempo real</p>
                </div>
              </div>
              <button
                onClick={handleRequestPermission}
                className="px-4 py-2 bg-emerald-500 rounded-full text-sm font-semibold text-black"
              >
                Ativar
              </button>
            </div>
          </motion.div>
        )}

        {/* Device Token (for debugging) */}
        {deviceToken && (
          <div className="notification-card p-3 mb-6 overflow-hidden">
            <p className="text-xs text-dark-400 mb-1">Device Token:</p>
            <p className="text-xs font-mono text-emerald-400 truncate">{deviceToken}</p>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 space-y-3 overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {notifications.map((notification) => {
              const config = notificationConfig[notification.type]
              const Icon = config.icon
              
              return (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: -100 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className={`notification-card p-4 ${config.glowClass}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-sm truncate">{notification.title}</p>
                        <span className={`text-sm font-bold ${config.color}`}>{notification.amount}</span>
                      </div>
                      <p className="text-sm text-dark-400 truncate">{notification.body}</p>
                      <p className="text-xs text-dark-500 mt-1">
                        {notification.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
          
          {notifications.length === 0 && (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-dark-700 mx-auto mb-4" />
              <p className="text-dark-500">Nenhuma notificacao ainda</p>
              <p className="text-dark-600 text-sm">Toque no botao abaixo para simular</p>
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={simulateNotification}
            className="w-14 h-14 rounded-full ios-blur flex items-center justify-center active:scale-95 transition-transform"
          >
            <Bell className="w-6 h-6" />
          </button>
          
          <button
            onClick={() => setAutoMode(!autoMode)}
            className={`h-14 px-6 rounded-full flex items-center gap-2 transition-all active:scale-95 ${
              autoMode 
                ? 'bg-emerald-500/30 text-emerald-300' 
                : 'ios-blur text-dark-300'
            }`}
          >
            <Zap className={`w-5 h-5 ${autoMode ? 'animate-pulse' : ''}`} />
            <span className="font-medium">{autoMode ? 'Auto ON' : 'Auto OFF'}</span>
          </button>
          
          <button
            onClick={clearNotifications}
            className="w-14 h-14 rounded-full ios-blur flex items-center justify-center active:scale-95 transition-transform"
          >
            <Trash2 className="w-6 h-6" />
          </button>
        </div>

        {/* App Name */}
        <div className="text-center mt-6">
          <p className="text-xs text-dark-600 tracking-widest uppercase">Ghost Peek</p>
        </div>
      </div>
    </div>
  )
}
