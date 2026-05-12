'use client'

import { useState, useEffect } from 'react'
import { Bell, Send, Smartphone, CreditCard, QrCode, RefreshCw, Repeat, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usePush } from '@/hooks/use-push'

const NOTIFICATION_TEMPLATES = [
  {
    id: 'sale',
    name: 'Venda Cartão',
    icon: CreditCard,
    color: 'bg-green-500',
    title: 'Nova venda aprovada!',
    body: 'Produto XYZ - R$ 497,00',
    type: 'sale'
  },
  {
    id: 'pix',
    name: 'Venda Pix',
    icon: QrCode,
    color: 'bg-teal-500',
    title: 'Pix confirmado!',
    body: 'Curso ABC - R$ 197,00',
    type: 'pix'
  },
  {
    id: 'subscription',
    name: 'Assinatura',
    icon: Repeat,
    color: 'bg-blue-500',
    title: 'Nova assinatura!',
    body: 'Plano Premium - R$ 47,00/mês',
    type: 'subscription'
  },
  {
    id: 'refund',
    name: 'Reembolso',
    icon: RefreshCw,
    color: 'bg-orange-500',
    title: 'Reembolso solicitado',
    body: 'Produto XYZ - R$ 497,00',
    type: 'refund'
  }
]

export default function AdminPage() {
  const { isSupported, isSubscribed, permission, toggle, isLoading } = usePush()
  const [subscriberCount, setSubscriberCount] = useState(0)
  const [sending, setSending] = useState(false)
  const [lastResult, setLastResult] = useState<string | null>(null)
  
  // Custom notification form
  const [customTitle, setCustomTitle] = useState('')
  const [customBody, setCustomBody] = useState('')

  // Fetch subscriber count
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch('/api/push/subscribe')
        const data = await res.json()
        setSubscriberCount(data.count || 0)
      } catch (e) {
        console.error('Failed to fetch count:', e)
      }
    }
    
    fetchCount()
    const interval = setInterval(fetchCount, 5000)
    return () => clearInterval(interval)
  }, [])

  // Send notification
  const sendNotification = async (title: string, body: string, type?: string) => {
    setSending(true)
    setLastResult(null)
    
    try {
      const res = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          body,
          data: { type }
        })
      })
      
      const data = await res.json()
      
      if (data.error && data.sent === 0) {
        setLastResult(`Nenhum dispositivo inscrito`)
      } else if (data.success) {
        setLastResult(`Enviado para ${data.sent}/${data.total} dispositivo(s)`)
      } else {
        setLastResult(`Erro: ${data.error}`)
      }
    } catch (e) {
      setLastResult('Falha ao enviar notificação')
      console.error('Send error:', e)
    } finally {
      setSending(false)
    }
  }

  const sendCustom = () => {
    if (customTitle && customBody) {
      sendNotification(customTitle, customBody, 'custom')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
            <Bell className="w-8 h-8 text-orange-500" />
            Push Aura Admin
          </h1>
          <p className="text-gray-400">Gerencie e envie notificações push</p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">Dispositivos Inscritos</CardDescription>
              <CardTitle className="text-3xl text-white">{subscriberCount}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">Este Dispositivo</CardDescription>
              <CardTitle className="text-lg text-white">
                {!isSupported ? (
                  <span className="text-red-400">Não suportado</span>
                ) : isSubscribed ? (
                  <span className="text-green-400">Inscrito</span>
                ) : (
                  <span className="text-yellow-400">Não inscrito</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isSupported && (
                <Button 
                  onClick={toggle} 
                  disabled={isLoading}
                  variant={isSubscribed ? "outline" : "default"}
                  size="sm"
                  className="w-full"
                >
                  {isLoading ? 'Aguarde...' : isSubscribed ? 'Desinscrever' : 'Inscrever'}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">Permissão</CardDescription>
              <CardTitle className="text-lg text-white capitalize">
                {permission === 'granted' ? (
                  <span className="text-green-400">Concedida</span>
                ) : permission === 'denied' ? (
                  <span className="text-red-400">Negada</span>
                ) : permission === 'unsupported' ? (
                  <span className="text-gray-400">Não suportado</span>
                ) : (
                  <span className="text-yellow-400">Pendente</span>
                )}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Quick Send Templates */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Envio Rápido
            </CardTitle>
            <CardDescription className="text-gray-400">
              Clique para enviar uma notificação de teste
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {NOTIFICATION_TEMPLATES.map((template) => (
                <Button
                  key={template.id}
                  onClick={() => sendNotification(template.title, template.body, template.type)}
                  disabled={sending}
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-2 border-gray-600 hover:bg-gray-700"
                >
                  <div className={`w-10 h-10 rounded-full ${template.color} flex items-center justify-center`}>
                    <template.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm text-white">{template.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Custom Notification */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-500" />
              Notificação Personalizada
            </CardTitle>
            <CardDescription className="text-gray-400">
              Crie e envie uma notificação customizada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-300">Título</Label>
              <Input
                id="title"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Ex: Nova venda realizada!"
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body" className="text-gray-300">Mensagem</Label>
              <Textarea
                id="body"
                value={customBody}
                onChange={(e) => setCustomBody(e.target.value)}
                placeholder="Ex: Produto ABC - R$ 297,00"
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                rows={3}
              />
            </div>
            <Button 
              onClick={sendCustom}
              disabled={sending || !customTitle || !customBody}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {sending ? 'Enviando...' : 'Enviar Notificação'}
            </Button>
          </CardContent>
        </Card>

        {/* Result */}
        {lastResult && (
          <div className={`text-center p-4 rounded-lg ${
            lastResult.includes('Erro') || lastResult.includes('Falha') || lastResult.includes('Nenhum')
              ? 'bg-red-500/20 text-red-300'
              : 'bg-green-500/20 text-green-300'
          }`}>
            {lastResult}
          </div>
        )}

        {/* Instructions */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-purple-500" />
              Como Usar no iPhone
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-3">
            <ol className="list-decimal list-inside space-y-2">
              <li>Abra este site no <strong>Safari</strong> do iPhone (iOS 16.4+)</li>
              <li>Toque no botão <strong>Compartilhar</strong> (quadrado com seta)</li>
              <li>Selecione <strong>&quot;Adicionar à Tela de Início&quot;</strong></li>
              <li>Abra o app pela tela de início</li>
              <li>Toque em <strong>&quot;Inscrever&quot;</strong> e permita as notificações</li>
              <li>Pronto! Agora você receberá notificações push reais</li>
            </ol>
            <p className="text-sm text-gray-500 mt-4">
              Nota: Push notifications em PWA só funcionam no iOS 16.4 ou superior, 
              e o site deve ser adicionado à tela de início.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
