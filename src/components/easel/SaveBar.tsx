import { useState } from 'react'
import type { RefObject } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useArtStore } from '../../stores/artStore'
import { useSeedStore } from '../../stores/seedStore'
import { useToastStore } from '../../stores/toastStore'
import type { GameHandle } from './gameTypes'

interface Props {
  gameType: string
  gameRef: RefObject<GameHandle | null>
  onSaved?: () => void
}

export default function SaveBar({ gameType, gameRef, onSaved }: Props) {
  const { user } = useAuth()
  const saveCreation = useArtStore((s) => s.saveCreation)
  const grantSeed = useSeedStore((s) => s.grantSeed)
  const pushToast = useToastStore((s) => s.push)
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!user?.id || !gameRef.current || saving) return
    setSaving(true)

    // 1. let the game draw to an offscreen canvas
    const src = document.createElement('canvas')
    await gameRef.current.renderToCanvas(src)

    // 2. scale to ~320px wide for a small thumbnail
    const scale = src.width ? 320 / src.width : 1
    const out = document.createElement('canvas')
    out.width = 320
    out.height = Math.max(1, Math.round(src.height * scale))
    const ctx = out.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, out.width, out.height)
      ctx.drawImage(src, 0, 0, out.width, out.height)
    }
    const thumbnail = out.toDataURL('image/jpeg', 0.6)
    const state = gameRef.current.getState()

    await saveCreation({ userId: user.id, gameType, title: title.trim() || 'Untitled', thumbnail, state })
    const g = await grantSeed({ userId: user.id, activityType: 'art', sourceKey: 'art' })
    setSaving(false)
    setTitle('')
    if (g.granted && g.bloom) {
      pushToast(`🌱 Saved! You earned a ${g.bloom.display_name} seed — it'll bloom tomorrow`)
    } else {
      pushToast('🎨 Saved to your gallery')
    }
    onSaved?.()
  }

  return (
    <div className="save-bar">
      <input
        className="save-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (optional)"
        maxLength={60}
      />
      <button type="button" className="save-btn" disabled={saving} onClick={save}>
        {saving ? 'Saving…' : 'Save to gallery'}
      </button>
    </div>
  )
}
