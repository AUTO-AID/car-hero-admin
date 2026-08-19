"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/application/contexts/auth-context";

const getSocketUrl = () => {
  const configuredApiBase = process.env.NEXT_PUBLIC_API_URL;
  if (configuredApiBase && !configuredApiBase.includes("localhost:3000")) {
    try {
      const url = new URL(configuredApiBase);
      return `${url.protocol}//${url.host}/notifications`;
    } catch {
      return "http://localhost:3001/notifications";
    }
  }
  return "http://localhost:3001/notifications";
};

export function useSocket() {
  const { token, admin } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token || !admin?.id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        queueMicrotask(() => {
          setSocket(null);
          setIsConnected(false);
        });
      }
      return;
    }

    const socketUrl = getSocketUrl();
    const client = io(socketUrl, {
      auth: { token: `Bearer ${token}` },
      transports: ["polling", "websocket"],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketRef.current = client;
    queueMicrotask(() => setSocket(client));

    client.on("connect", () => {
      setIsConnected(true);
      client.emit("join_notifications", {});
    });

    client.on("disconnect", () => {
      setIsConnected(false);
    });

    return () => {
      client.disconnect();
      socketRef.current = null;
      queueMicrotask(() => {
        setSocket(null);
        setIsConnected(false);
      });
    };
  }, [token, admin?.id]);

  return { socket, isConnected };
}
