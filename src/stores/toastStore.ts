import { create } from 'zustand'

export interface Toast {
  id: number
  text: string
}

let nextId = 1

interface ToastState {
  toasts: Toast[]
  push: (text: string) => void
  dismiss: (id: number) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (text) => set((s) => ({ toasts: [...s.toasts, { id: nextId++, text }] })),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
