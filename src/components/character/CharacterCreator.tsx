import { useState } from 'react'
import type { CSSProperties } from 'react'
import '../../styles/character.css'
import { useAuth } from '../../hooks/useAuth'
import type { GreenCharacterType } from '../../stores/userStore'

export interface CharacterDef {
  type: GreenCharacterType
  label: string
  emoji: string
  blurb: string
  color: string
}

export const CHARACTERS: CharacterDef[] = [
  { type: 'moss_sprite', label: 'Moss Sprite', emoji: '🌿', blurb: 'Soft, patient, close to the ground', color: '#7bbf8a' },
  { type: 'fern_walker', label: 'Fern Walker', emoji: '🍃', blurb: 'Curious, unfurling, always exploring', color: '#4f7942' },
  { type: 'vine_weaver', label: 'Vine Weaver', emoji: '🌱', blurb: 'Connective, persistent, binds things', color: '#50c878' },
  { type: 'pond_guardian', label: 'Pond Guardian', emoji: '💧', blurb: 'Calm, reflective, deep', color: '#01796f' },
  { type: 'bark_sage', label: 'Bark Sage', emoji: '🪵', blurb: 'Grounded, wise, weathered', color: '#5a3b22' },
  { type: 'dew_drop', label: 'Dew Drop', emoji: '💦', blurb: 'Fresh, bright, new each morning', color: '#87ceeb' },
]

interface Props {
  onClose: () => void
  dismissable: boolean
}

export default function CharacterCreator({ onClose, dismissable }: Props) {
  const { user, greenProfile, updateCharacter } = useAuth()
  const [type, setType] = useState<GreenCharacterType | null>(greenProfile?.character_type ?? null)
  const [name, setName] = useState(greenProfile?.character_name || greenProfile?.display_name || '')
  const [saving, setSaving] = useState(false)

  const canSubmit = !!type && name.trim().length > 0 && !saving

  const submit = async () => {
    if (!user?.id || !type || !canSubmit) return
    setSaving(true)
    await updateCharacter(user.id, type, name.trim())
    setSaving(false)
    onClose()
  }

  return (
    <div className="creator">
      <div className="creator-card">
        <h1>Who tends this garden?</h1>

        <div className="char-grid">
          {CHARACTERS.map((c) => (
            <button
              key={c.type}
              type="button"
              className={`char-tile${type === c.type ? ' selected' : ''}`}
              style={{ '--ch': c.color } as CSSProperties}
              onClick={() => {
                setType(c.type)
                if (!name.trim()) setName(greenProfile?.display_name || '')
              }}
            >
              <span className="char-emoji">{c.emoji}</span>
              <span className="char-name">{c.label}</span>
              <span className="char-blurb">{c.blurb}</span>
            </button>
          ))}
        </div>

        <label className="char-field">
          <span>Name your character</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name your character"
            maxLength={40}
          />
        </label>

        <div className="creator-actions">
          {dismissable && (
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
          )}
          <button type="button" className="btn-primary" disabled={!canSubmit} onClick={submit}>
            {saving ? 'Entering…' : 'Enter the garden'}
          </button>
        </div>
      </div>
    </div>
  )
}
