#!/bin/bash

# Push Aura - Capacitor Setup Script
# Este script prepara o projeto para build iOS com Capacitor

set -e

echo "=== Push Aura - Capacitor Setup ==="
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

BUNDLE_ID="app.plantain7502.soybean5714"
APP_NAME="Push Aura"

# 1. Build do Next.js
echo -e "${YELLOW}[1/6] Building Next.js app...${NC}"
pnpm build

# 2. Criar pasta capacitor-wrapper se não existir
echo -e "${YELLOW}[2/6] Setting up Capacitor wrapper...${NC}"
mkdir -p capacitor-wrapper
cd capacitor-wrapper

# 3. Inicializar package.json se não existir
if [ ! -f "package.json" ]; then
  echo '{"name": "push-aura-capacitor", "private": true}' > package.json
fi

# 4. Instalar Capacitor
echo -e "${YELLOW}[3/6] Installing Capacitor...${NC}"
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/push-notifications

# 5. Inicializar Capacitor
echo -e "${YELLOW}[4/6] Initializing Capacitor...${NC}"
if [ ! -f "capacitor.config.json" ]; then
  npx cap init "$APP_NAME" "$BUNDLE_ID" --web-dir ../out
fi

# 6. Copiar arquivos de build
echo -e "${YELLOW}[5/6] Copying build files...${NC}"
rm -rf www
cp -r ../out www

# 7. Adicionar plataforma iOS
echo -e "${YELLOW}[6/6] Adding iOS platform...${NC}"
npx cap add ios 2>/dev/null || true
npx cap sync ios

echo ""
echo -e "${GREEN}=== Setup Complete! ===${NC}"
echo ""
echo "Next steps:"
echo "  1. cd capacitor-wrapper/ios/App"
echo "  2. pod install"
echo "  3. open App.xcworkspace"
echo "  4. Configure signing in Xcode"
echo "  5. Build and run!"
echo ""
echo "Bundle ID: $BUNDLE_ID"
