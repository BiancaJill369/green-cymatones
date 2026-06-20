import { useState } from 'react'
import '../../styles/mirror.css'
import { useAuth } from '../../hooks/useAuth'
import { useUserStore } from '../../stores/userStore'
import { useToastStore } from '../../stores/toastStore'
import Gardener from './Gardener'
import { AXES, DEFAULT_AVATAR, randomAvatar } from '../../lib/gardenerOptions'
import type { GardenerAvatar, Option } from '../../lib/gardenerOptions'

/**
 * The Garden Mirror — green + wildflower gardener creator (ported from violet).
 * Opens over the still-mounted garden; never touches the audio. Saves the
 * avatar config to green_profiles.avatar and keeps character_name.
 */
export default function MirrorCreator({
  onClose,
  dismissable,
}: {
  onClose: () => void
  dismissable: boolean
}) {
  const { user, greenProfile } = useAuth()
  const updateAvatar = useUserStore((s) => s.updateAvatar)
  const pushToast = useToastStore((s) => s.push)

  const [avatar, setAvatar] = useState<GardenerAvatar>(() => ({
    ...DEFAULT_AVATAR,
    ...(greenProfile?.avatar || {}),
  }))
  const [name, setName] = useState(greenProfile?.character_name ?? '')
  const [busy, setBusy] = useState(false)

  const setAxis = (key: keyof GardenerAvatar, value: string) =>
    setAvatar((a) => ({ ...a, [key]: value }))

  const save = async () => {
    if (!user?.id || busy) return
    const trimmed = name.trim()
    if (!trimmed) {
      pushToast('Give your gardener a name first 🌱')
      return
    }
    setBusy(true)
    await updateAvatar(user.id, avatar, trimmed)
    setBusy(false)
    pushToast('Your gardener is ready ✨')
    onClose()
  }

  return (
    <div
      className="mirror-bg"
      onClick={(e) => {
        if (e.target === e.currentTarget && dismissable) onClose()
      }}
    >
      <div className="mirror-modal" role="dialog" aria-modal="true" aria-label="The garden mirror">
        {dismissable && (
          <button type="button" className="mirror-x" onClick={onClose} aria-label="Close">
            ×
          </button>
        )}
        <h2 className="mirror-title">The Garden Mirror</h2>
        <p className="mirror-sub">Your gardener, however you want them today.</p>

        <div className="mirror-body">
          <aside className="mirror-preview">
            <Gardener avatar={avatar} size={220} ariaLabel="Live preview of your gardener" />
            <input
              className="mirror-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name your gardener"
              maxLength={48}
              autoComplete="off"
            />
          </aside>

          <div className="mirror-axes">
            {AXES.map((axis) => (
              <Axis
                key={axis.key}
                label={axis.label}
                options={axis.options}
                value={avatar[axis.key]}
                onChange={(v) => setAxis(axis.key, v)}
              />
            ))}
          </div>
        </div>

        <div className="mirror-actions">
          <button type="button" className="mr-soft" onClick={() => setAvatar(randomAvatar())}>
            surprise me ✨
          </button>
          {dismissable && (
            <button type="button" className="mr-soft" onClick={onClose}>
              cancel
            </button>
          )}
          <button type="button" className="mr-primary" onClick={() => void save()} disabled={busy}>
            {busy ? 'saving…' : 'Save gardener'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Axis({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: Option[]
  value: string
  onChange: (id: string) => void
}) {
  const current = options.find((o) => o.id === value)
  return (
    <div className="mr-axis">
      <div className="mr-axis-head">
        <span className="mr-axis-label">{label}</span>
        <span className="mr-axis-value">{current?.label ?? ''}</span>
      </div>
      <div className="mr-chips">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`mr-chip${opt.id === value ? ' is-active' : ''}`}
            onClick={() => onChange(opt.id)}
            aria-pressed={opt.id === value}
            title={opt.label}
          >
            {opt.hex && <span className="mr-swatch" style={{ background: opt.hex }} aria-hidden="true" />}
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
