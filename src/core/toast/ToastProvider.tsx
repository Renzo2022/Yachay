import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastPayload {
  type: ToastType
  message: string
}

interface Toast extends ToastPayload {
  id: string
}

interface ToastContextValue {
  showToast: (toast: ToastPayload) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

const TOAST_STYLES: Record<ToastType, string> = {
  success: 'bg-[#39FF14] text-black border-black',
  error: 'bg-[#EF4444] text-white border-black',
  info: 'bg-[#06B6D4] text-black border-black',
}

const TOAST_ICON: Record<ToastType, string> = {
  success: '✅',
  error: '⚠️',
  info: 'ℹ️',
}

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(({ type, message }: ToastPayload) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => removeToast(id), 4000)
  }, [removeToast])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`font-mono border-4 px-4 py-3 shadow-[4px_4px_0_0_#111] flex items-center gap-3 ${TOAST_STYLES[toast.type]}`}
          >
            <span>{TOAST_ICON[toast.type]}</span>
            <span className="text-sm">{toast.message}</span>
            <button
              type="button"
              className="ml-auto border-2 border-black px-2 py-1 text-xs"
              onClick={() => removeToast(toast.id)}
            >
              Cerrar
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
