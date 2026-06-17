import { useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useSeedStore } from '../../stores/seedStore'
import type { BagSeed } from '../../stores/seedStore'
import { useToastStore } from '../../stores/toastStore'

// little emblem per bloom species
const SEED_ICON: Record<string, string> = {
  sage: '🌿',
  lavender: '💜',
  cornflower: '🌸',
  starflower: '⭐',
  poppy: '🌺',
  oak: '🌳',
  willow: '🌲',
}

const BED_LABEL: Record<string, string> = {
  herb: 'Herb Garden',
  tree: 'Forest Floor',
  wildflower: 'Wild Meadow',
}

export default function SeedBagPanel({ onArrange }: { onArrange: () => void }) {
  const { user } = useAuth()
  const bag = useSeedStore((s) => s.bag)
  const loadBag = useSeedStore((s) => s.loadBag)
  const plantFromBag = useSeedStore((s) => s.plantFromBag)
  const pushToast = useToastStore((s) => s.push)

  useEffect(() => {
    if (user?.id) void loadBag(user.id)
  }, [user?.id, loadBag])

  const plant = async (seed: BagSeed) => {
    const ok = await plantFromBag(seed)
    pushToast(
      ok
        ? `🌱 ${seed.bloom.display_name} planted in your ${BED_LABEL[seed.bloom.category] ?? 'garden'}`
        : 'Could not plant that seed — try again',
    )
  }

  return (
    <div className="seed-bag">
      <div className="wrap">
        <h1>Seed Bag</h1>
        <p className="sb-sub">
          Seeds you’ve earned are waiting here. Plant one to grow it — it blooms by tomorrow.
        </p>

        {bag.length === 0 ? (
          <p className="sb-empty">
            Your Seed Bag is empty. Draw an oracle card, read an angel number, journal, make art, or
            listen for 7 minutes to earn seeds.
          </p>
        ) : (
          <ul className="sb-list">
            {bag.map((seed) => (
              <li key={seed.id} className="sb-item">
                <span className="sb-icon">{SEED_ICON[seed.bloom.render_key] ?? '🌱'}</span>
                <span className="sb-meta">
                  <span className="sb-name">{seed.bloom.display_name}</span>
                  <span className="sb-bed">{BED_LABEL[seed.bloom.category] ?? 'Garden'}</span>
                </span>
                <button type="button" className="sb-plant" onClick={() => void plant(seed)}>
                  Plant
                </button>
              </li>
            ))}
          </ul>
        )}

        <button type="button" className="sb-arrange" onClick={onArrange}>
          ✎ Arrange Garden
        </button>
      </div>
    </div>
  )
}
