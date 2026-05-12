"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share, Plus, X, Smartphone } from "lucide-react";

export function IOSInstallBanner() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if running on iOS Safari and NOT in standalone mode
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    
    // Check if already dismissed in this session
    const wasDismissed = sessionStorage.getItem('ios-banner-dismissed');
    
    if (isIOS && isSafari && !isStandalone && !wasDismissed) {
      // Show after a short delay
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    setShow(false);
    sessionStorage.setItem('ios-banner-dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {show && !dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe"
        >
          <div className="mx-auto max-w-md overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 shadow-2xl ring-1 ring-white/10">
            {/* Header */}
            <div className="relative flex items-center gap-4 p-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                <Smartphone className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">
                  Instalar Ghost Peek
                </h3>
                <p className="text-sm text-zinc-400">
                  Receba alertas mesmo com o app fechado
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="absolute right-3 top-3 rounded-full p-1.5 text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Instructions */}
            <div className="border-t border-white/5 bg-black/20 p-4">
              <p className="mb-4 text-center text-sm text-zinc-400">
                Para receber notificacoes em tempo real:
              </p>
              
              <div className="space-y-3">
                {/* Step 1 */}
                <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20">
                    <span className="text-sm font-bold text-blue-400">1</span>
                  </div>
                  <div className="flex flex-1 items-center gap-2">
                    <span className="text-sm text-zinc-300">Toque em</span>
                    <div className="flex items-center gap-1 rounded-md bg-blue-500/20 px-2 py-1">
                      <Share className="h-4 w-4 text-blue-400" />
                      <span className="text-xs font-medium text-blue-400">Compartilhar</span>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
                    <span className="text-sm font-bold text-emerald-400">2</span>
                  </div>
                  <div className="flex flex-1 items-center gap-2">
                    <span className="text-sm text-zinc-300">Selecione</span>
                    <div className="flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-1">
                      <Plus className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs font-medium text-emerald-400">Tela de Inicio</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefit tag */}
              <div className="mt-4 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 px-4 py-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-emerald-400">
                  Notificacoes push reais no iOS 16.4+
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
