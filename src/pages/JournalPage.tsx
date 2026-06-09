import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/journal.css'
import { useAuth } from '../hooks/useAuth'
import { useJournalStore } from '../stores/journalStore'
import { useToastStore } from '../stores/toastStore'
import MoodPicker from '../components/journal/MoodPicker'

export default function JournalPage() {
  const { user } = useAuth()
  const todaysPrompt = useJournalStore((s) => s.todaysPrompt)
  const entries = useJournalStore((s) => s.entries)
  const loadPrompts = useJournalStore((s) => s.loadPrompts)
  const loadEntries = useJournalStore((s) => s.loadEntries)
  const saveEntry = useJournalStore((s) => s.saveEntry)
  const pushToast = useToastStore((s) => s.push)

  const [mood, setMood] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const taRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    void loadPrompts()
  }, [loadPrompts])
  useEffect(() => {
    if (user?.id) void loadEntries(user.id)
  }, [user?.id, loadEntries])

  const autosize = () => {
    const ta = taRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = `${ta.scrollHeight}px`
    }
  }

  const canSave = content.trim().length > 0 && !saving

  const handleSave = async () => {
    if (!user?.id || !canSave) return
    setSaving(true)
    const { isFirst } = await saveEntry({
      userId: user.id,
      promptId: todaysPrompt?.id ?? null,
      mood,
      content: content.trim(),
    })
    setSaving(false)
    if (isFirst) pushToast('🌱📖 A journal seed was planted in your Wild Meadow')
    setContent('')
    setMood('')
    if (taRef.current) taRef.current.style.height = 'auto'
  }

  return (
    <div className="journal">
      <div className="wrap">
        <h1>Greenhouse Journal</h1>

        <p className="prompt">
          {todaysPrompt ? todaysPrompt.prompt : 'What grew in you today?'}
        </p>

        <div>
          <p className="label" style={{ marginBottom: 8 }}>
            How are you feeling?
          </p>
          <MoodPicker value={mood} onChange={setMood} />
        </div>

        <textarea
          ref={taRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            autosize()
          }}
          placeholder="Let it grow here…"
        />

        <button type="button" className="save-btn" disabled={!canSave} onClick={handleSave}>
          {saving ? 'Planting…' : 'Save entry'}
        </button>

        {entries.length > 0 && (
          <div>
            <p className="label" style={{ marginBottom: 8 }}>
              Past entries
            </p>
            <div className="entries">
              {entries.map((e) => (
                <div key={e.id} className="entry">
                  <div className="entry-head">
                    <span>{e.entry_date}</span>
                    {e.mood && <span className="entry-mood">{e.mood}</span>}
                  </div>
                  <div className="entry-body">
                    {e.content.length > 120 ? `${e.content.slice(0, 120)}…` : e.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Link to="/garden" className="back-link">
          Back to garden
        </Link>
      </div>
    </div>
  )
}
