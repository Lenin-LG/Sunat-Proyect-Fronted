import React, { useState, useEffect } from "react"
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react"
import { cn } from "../../lib/utils"

export type ToastType = "success" | "error" | "info" | "warning"

export interface ToastMessage {
  id: string
  message: string
  type: ToastType
  duration?: number
}

type ToastListener = (toast: ToastMessage) => void
const listeners = new Set<ToastListener>()

export const toast = {
  show(message: string, type: ToastType = "info", duration = 4000) {
    const id = Math.random().toString(36).substring(2, 9)
    const toastMsg: ToastMessage = { id, message, type, duration }
    listeners.forEach((listener) => listener(toastMsg))
    return id
  },
  success(message: string, duration?: number) {
    return this.show(message, "success", duration)
  },
  error(message: string, duration?: number) {
    return this.show(message, "error", duration)
  },
  warning(message: string, duration?: number) {
    return this.show(message, "warning", duration)
  },
  info(message: string, duration?: number) {
    return this.show(message, "info", duration)
  },
  subscribe(listener: ToastListener) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    const unsubscribe = toast.subscribe((newToast) => {
      setToasts((prev) => [...prev, newToast])

      if (newToast.duration !== 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== newToast.id))
        }, newToast.duration || 4000)
      }
    })

    return unsubscribe
  }, [])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 w-full max-w-sm pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          let iconColor = "text-blue-500"
          let Icon = Info
          let borderColor = "border-blue-500/30"
          let progressBg = "bg-blue-500"

          if (t.type === "success") {
            iconColor = "text-emerald-500 dark:text-emerald-400"
            Icon = CheckCircle2
            borderColor = "border-emerald-500/20 dark:border-emerald-500/30"
            progressBg = "bg-emerald-500"
          } else if (t.type === "error") {
            iconColor = "text-rose-500 dark:text-rose-400"
            Icon = XCircle
            borderColor = "border-rose-500/20 dark:border-rose-500/30"
            progressBg = "bg-rose-500"
          } else if (t.type === "warning") {
            iconColor = "text-amber-500 dark:text-amber-400"
            Icon = AlertTriangle
            borderColor = "border-amber-500/20 dark:border-amber-500/30"
            progressBg = "bg-amber-500"
          }

          return (
            <div
              key={t.id}
              className={cn(
                "pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/90 dark:bg-slate-900/95 backdrop-blur-md border shadow-2xl text-slate-100 overflow-hidden relative group transition-all duration-300 hover:scale-[1.02] animate-fade-in",
                borderColor
              )}
              style={{
                animation: "slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards"
              }}
            >
              {/* Type Accent Progress Bar */}
              {t.duration !== 0 && (
                <div
                  className={cn("absolute bottom-0 left-0 h-0.5 w-full origin-left", progressBg)}
                  style={{
                    animation: `shrinkWidth ${t.duration || 4000}ms linear forwards`
                  }}
                />
              )}

              <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", iconColor)} />

              <div className="flex-1 min-w-0 pr-2">
                <p className="text-xs font-semibold text-slate-100 leading-normal break-words">
                  {t.message}
                </p>
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-500 hover:text-slate-300 rounded-md p-1 transition-colors hover:bg-slate-800/50 shrink-0 self-start -mt-1 -mr-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>

      {/* Slide and shrink animations injection */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes shrinkWidth {
          from {
            transform: scaleX(1);
          }
          to {
            transform: scaleX(0);
          }
        }
      `}</style>
    </>
  )
}
