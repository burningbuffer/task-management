"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export type NotificationType = "success" | "error" | "info";

export interface NotificationState {
  id: string;
  type: NotificationType;
  message: string;
}

interface NotificationContextValue {
  notification: NotificationState | null;
  notifySuccess: (message: string) => void;
  notifyError: (message: string) => void;
  clearNotification: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const notifySuccess = useCallback((message: string) => {
    setNotification({
      id: crypto.randomUUID(),
      type: "success",
      message,
    });
  }, []);

  const notifyError = useCallback((message: string) => {
    setNotification({
      id: crypto.randomUUID(),
      type: "error",
      message,
    });
  }, []);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // Limpa automaticamente o feedback visual após 5 segundos
  useEffect(() => {
    if (!notification) return;

    const timer = setTimeout(() => {
      setNotification(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification]);

  return (
    <NotificationContext.Provider
      value={{ notification, notifySuccess, notifyError, clearNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification deve ser utilizado dentro de um NotificationProvider.");
  }
  return context;
}
