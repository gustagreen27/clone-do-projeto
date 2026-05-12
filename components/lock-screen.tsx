"use client";

import { useState, useEffect } from "react";
import { NotificationStack } from "./notification-stack";
import { generateRandomNotification } from "@/lib/notifications";
import { Volume2, VolumeX, Bell, Trash2 } from "lucide-react";

export function LockScreen() {
  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [autoSimulate, setAutoSimulate] = useState(true);
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    function updateTime() {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
      setDate(
        now.toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })
      );
    }
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const triggerNotification = () => {
    const n = generateRandomNotification();
    window.dispatchEvent(new CustomEvent("hotmart:new", { detail: n }));
  };

  const clearNotifications = () => {
    window.dispatchEvent(new CustomEvent("hotmart:clear"));
  };

  return (
    <div className="lock-screen relative min-h-screen w-full overflow-hidden">
      {/* Wallpaper */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1200&q=80')`,
        }}
      />
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Status bar */}
        <div className="flex items-center justify-between px-6 py-3">
          <span className="text-sm font-medium text-white">{time}</span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-white/70">5G</span>
            <div className="flex gap-0.5">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-2.5 w-0.5 rounded-full bg-white"
                  style={{ height: 4 + i * 2 }}
                />
              ))}
            </div>
            <div className="ml-1 flex h-4 w-6 items-center justify-center rounded-sm border border-white/50">
              <div className="h-2 w-3 rounded-sm bg-white" />
            </div>
          </div>
        </div>

        {/* Clock */}
        <div className="mt-8 text-center">
          <h1 className="text-7xl font-light tracking-tight text-white drop-shadow-lg sm:text-8xl">
            {time}
          </h1>
          <p className="mt-1 text-lg font-normal capitalize text-white/90 drop-shadow">
            {date}
          </p>
        </div>

        {/* Notifications */}
        <div className="mt-8 flex-1">
          <NotificationStack autoSimulate={autoSimulate} soundOn={soundOn} />
        </div>

        {/* Controls */}
        <div className="safe-area-bottom sticky bottom-0 flex items-center justify-center gap-3 bg-gradient-to-t from-black/60 to-transparent px-6 pb-8 pt-6">
          <button
            onClick={triggerNotification}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 backdrop-blur-md transition-colors hover:bg-white/25 active:scale-95"
            title="Enviar notificação"
          >
            <Bell className="h-5 w-5 text-white" />
          </button>
          <button
            onClick={() => setAutoSimulate(!autoSimulate)}
            className={`flex h-12 items-center gap-2 rounded-full px-4 backdrop-blur-md transition-colors active:scale-95 ${
              autoSimulate
                ? "bg-green-500/30 text-green-300"
                : "bg-white/15 text-white/70"
            }`}
          >
            <span className="text-sm font-medium">
              {autoSimulate ? "Auto: ON" : "Auto: OFF"}
            </span>
          </button>
          <button
            onClick={() => setSoundOn(!soundOn)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 backdrop-blur-md transition-colors hover:bg-white/25 active:scale-95"
            title={soundOn ? "Desativar som" : "Ativar som"}
          >
            {soundOn ? (
              <Volume2 className="h-5 w-5 text-white" />
            ) : (
              <VolumeX className="h-5 w-5 text-white/50" />
            )}
          </button>
          <button
            onClick={clearNotifications}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 backdrop-blur-md transition-colors hover:bg-red-500/30 active:scale-95"
            title="Limpar notificações"
          >
            <Trash2 className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
