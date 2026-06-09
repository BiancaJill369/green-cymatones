import { useEffect } from 'react'
import { useToastStore } from '../../stores/toastStore'

function ToastItem({ id, text }: { id: number; text: string }) {
  const dismiss = useToastStore((s) => s.dismiss)
  useEffect(() => {
    const t = setTimeout(() => dismiss(id), 4000)
    return () => clearTimeout(t)
  }, [id, dismiss])
  return (
    <div className="rounded-full bg-night-sky/85 px-4 py-2 text-moon shadow-lg backdrop-blur">
      🌸 {text}
    </div>
  )
}

export default function Toasts() {
  const toasts = useToastStore((s) => s.toasts)
  if (!toasts.length) return null
  return (
    <div className="pointer-events-none fixed left-1/2 top-4 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} id={t.id} text={t.text} />
      ))}
    </div>
  )
}
