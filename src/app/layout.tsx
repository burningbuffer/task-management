import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/components/providers/TRPCProvider";
import { NotificationProvider } from "@/components/providers/NotificationProvider";
import { TopNotificationBanner } from "@/components/TopNotificationBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Task Management - Sistema de Tarefas tRPC",
  description: "Sistema simples de gerenciamento de tarefas em memória exposto via tRPC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-neutral-950 text-neutral-100 min-h-screen`}
      >
        <TRPCProvider>
          <NotificationProvider>
            {/* Feedback visual de mensagens exibido no topo da página */}
            <TopNotificationBanner />
            {children}
          </NotificationProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}
