# Ghost Peek - iOS App

App nativo para iOS com notificacoes push reais usando Capacitor.

## Bundle ID
```
app.plantain7502.soybean5714
```

## Setup Local

```bash
cd capacitor-app
npm install
npm run build
npx cap add ios
npx cap sync ios
npx cap open ios
```

## Build no Codemagic

1. Push para o GitHub
2. Conecte o repositorio no Codemagic
3. Configure as credenciais iOS no Codemagic:
   - Certificado .p12
   - Provisioning Profile
4. Execute o workflow `ios-capacitor-build`

## Estrutura

```
capacitor-app/
├── src/
│   ├── App.tsx          # App principal
│   ├── main.tsx         # Entry point
│   ├── index.css        # Estilos
│   └── lib/
│       ├── push.ts      # Push notifications nativas
│       └── sound.ts     # Som de notificacao
├── public/              # Assets estaticos
├── capacitor.config.json
├── app.json            # Config Expo/EAS
└── package.json
```

## Notificacoes Push

O app usa `@capacitor/push-notifications` para:
- Registrar o device token
- Receber notificacoes em primeiro plano
- Feedback haptico ao receber notificacao

### Backend Integration

O token e enviado para `/api/push/register` com:
```json
{
  "token": "device-token-here",
  "platform": "ios",
  "appId": "app.plantain7502.soybean5714"
}
```
