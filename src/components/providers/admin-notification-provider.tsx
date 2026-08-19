"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSocket } from "@/application/hooks/use-socket";
import { queryKeys } from "@/infrastructure/query/query-keys";
import type { NotificationType } from "@/domain/entities/notification.types";

const RealTimeNotificationContext = createContext(null);

export function AdminNotificationProvider({ children }: { children: React.ReactNode }) {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (notification: NotificationType) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unread });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.stats });

      const event = typeof notification.data?.event === "string" ? notification.data.event : "";
      if (event.startsWith("provider.registration.")) {
        queryClient.invalidateQueries({ queryKey: queryKeys.providers.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      }

      toast.info(notification.title || "تنبيه إداري جديد", {
        description: notification.body || "يوجد تحديث جديد يحتاج لمراجعتك",
        duration: 8000,
      });
      
      playOrderChime();
    };

    const handleUnreadCount = (payload: { count?: number }) => {
      const count = Number(payload?.count ?? 0);
      queryClient.setQueryData(queryKeys.notifications.unread, { count, data: { count } });
    };

    socket.on("notification", handleNotification);
    socket.on("unread_count", handleUnreadCount);
    return () => {
      socket.off("notification", handleNotification);
      socket.off("unread_count", handleUnreadCount);
    };
  }, [socket, queryClient]);

  return (
    <RealTimeNotificationContext.Provider value={null}>
      {children}
    </RealTimeNotificationContext.Provider>
  );
}

function playOrderChime() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, audioCtx.currentTime); 
    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  } catch {
    // Ignore audio errors
  }
}
