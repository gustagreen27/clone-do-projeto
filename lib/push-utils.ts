/**
 * Push Notification Utilities
 * Captura e gerencia o subscription object para envio ao backend
 */

export interface PushSubscriptionData {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  language: string;
  standalone: boolean;
  timestamp: number;
}

/**
 * Converte um ArrayBuffer para string Base64 URL-safe
 */
function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return "";
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Extrai os dados do subscription object
 */
export function extractSubscriptionData(
  subscription: PushSubscription
): PushSubscriptionData {
  const p256dh = subscription.getKey("p256dh");
  const auth = subscription.getKey("auth");

  return {
    endpoint: subscription.endpoint,
    expirationTime: subscription.expirationTime,
    keys: {
      p256dh: arrayBufferToBase64(p256dh),
      auth: arrayBufferToBase64(auth),
    },
  };
}

/**
 * Captura informações do dispositivo
 */
export function getDeviceInfo(): DeviceInfo {
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    standalone: isStandalone,
    timestamp: Date.now(),
  };
}

/**
 * Verifica se o dispositivo suporta Web Push
 */
export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/**
 * Verifica se é um dispositivo iOS
 */
export function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || 
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

/**
 * Verifica se o app está instalado como PWA
 */
export function isInstalledPWA(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/**
 * Gera um ID único para o dispositivo (persistido no localStorage)
 */
export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  
  const key = "push_aura_device_id";
  let deviceId = localStorage.getItem(key);
  
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(key, deviceId);
  }
  
  return deviceId;
}

/**
 * Prepara payload completo para enviar ao backend
 */
export function prepareSubscriptionPayload(subscription: PushSubscription) {
  return {
    subscription: extractSubscriptionData(subscription),
    device: {
      ...getDeviceInfo(),
      id: getDeviceId(),
      isIOS: isIOS(),
      isPWA: isInstalledPWA(),
    },
  };
}
