"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, CheckCircle2, AlertCircle, Smartphone } from "lucide-react";
import { usePush } from "@/hooks/use-push";

interface NotificationPermissionProps {
  onClose?: () => void;
}

export function NotificationPermission({ onClose }: NotificationPermissionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState<"intro" | "requesting" | "success" | "denied">("intro");
  const { isSupported, isSubscribed, subscribe, permission, isLoading } = usePush();

  useEffect(() => {
    // Show modal after a short delay if not subscribed
    const timer = setTimeout(() => {
      if (isSupported && !isSubscribed && permission !== "denied") {
        setIsVisible(true);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [isSupported, isSubscribed, permission]);

  const handleEnable = async () => {
    setStep("requesting");
    const success = await subscribe();
    setStep(success ? "success" : "denied");
    
    if (success) {
      setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 2000);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isSupported || isSubscribed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 sm:items-center"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm overflow-hidden rounded-3xl bg-gradient-to-b from-zinc-900 to-black border border-white/10 shadow-2xl"
          >
            {/* Header gradient line */}
            <div className="h-1 w-full bg-gradient-to-r from-green-500 via-emerald-400 to-teal-500" />
            
            <div className="p-6">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute right-4 top-5 rounded-full p-1.5 text-white/40 hover:bg-white/10 hover:text-white/80 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {step === "intro" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center"
                >
                  {/* Icon */}
                  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/10 ring-1 ring-green-500/30">
                    <motion.div
                      animate={{ 
                        rotate: [0, -10, 10, -10, 10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3
                      }}
                    >
                      <Bell className="h-10 w-10 text-green-400" />
                    </motion.div>
                  </div>

                  {/* Title */}
                  <h2 className="mb-2 text-xl font-semibold text-white tracking-tight">
                    Ativar Notificacoes
                  </h2>
                  
                  {/* Description */}
                  <p className="mb-6 text-sm text-white/60 leading-relaxed">
                    Receba alertas de vendas em tempo real diretamente no seu iPhone, mesmo com o app fechado.
                  </p>

                  {/* Features */}
                  <div className="mb-6 space-y-3 text-left">
                    {[
                      "Alertas instantaneos de vendas",
                      "Notificacoes mesmo em background",
                      "Som personalizado estilo iPhone"
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20">
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                        </div>
                        <span className="text-sm text-white/80">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={handleEnable}
                    disabled={isLoading}
                    className="w-full rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-green-500/25 transition-all hover:shadow-green-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    Ativar Notificacoes Push
                  </button>

                  {/* Skip */}
                  <button
                    onClick={handleClose}
                    className="mt-4 text-sm text-white/40 hover:text-white/60 transition-colors"
                  >
                    Agora nao
                  </button>
                </motion.div>
              )}

              {step === "requesting" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 text-center"
                >
                  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-12 w-12 rounded-full border-2 border-green-500/30 border-t-green-500"
                    />
                  </div>
                  <h2 className="mb-2 text-xl font-semibold text-white">
                    Aguardando permissao...
                  </h2>
                  <p className="text-sm text-white/60">
                    Toque em &quot;Permitir&quot; no popup do sistema
                  </p>
                </motion.div>
              )}

              {step === "success" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15 }}
                    className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20"
                  >
                    <CheckCircle2 className="h-10 w-10 text-green-400" />
                  </motion.div>
                  <h2 className="mb-2 text-xl font-semibold text-white">
                    Notificacoes Ativadas!
                  </h2>
                  <p className="text-sm text-white/60">
                    Voce recebera alertas de vendas em tempo real
                  </p>
                </motion.div>
              )}

              {step === "denied" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-6 text-center"
                >
                  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-orange-500/20">
                    <AlertCircle className="h-10 w-10 text-orange-400" />
                  </div>
                  <h2 className="mb-2 text-xl font-semibold text-white">
                    Permissao Necessaria
                  </h2>
                  <p className="mb-4 text-sm text-white/60">
                    Para receber notificacoes, ative nas configuracoes:
                  </p>
                  <div className="rounded-2xl bg-white/5 p-4 text-left text-sm text-white/70">
                    <div className="flex items-center gap-2 mb-2">
                      <Smartphone className="h-4 w-4" />
                      <span className="font-medium text-white/90">No iPhone:</span>
                    </div>
                    <p>Ajustes → Push Aura → Notificacoes → Permitir</p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="mt-5 w-full rounded-2xl bg-white/10 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/20"
                  >
                    Entendi
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
