import { useEffect, useMemo } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useSeedStore } from '../../stores/seedStore'
import type { BagSeed } from '../../stores/seedStore'

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

interface BagGroup {
  key: string
  seed: BagSeed // a representative (the one we'll plant next)
  count: number
}

export default function SeedBagPanel({
  onPlant,
  onArrange,
}: {
  onPlant: (seed: BagSeed) => void
  onArrange: () => void
}) {
  const { user } = useAuth()
  const bag = useSeedStore((s) => s.bag)
  const loadBag = useSeedStore((s) => s.loadBag)

  useEffect(() => {
    if (user?.id) void loadBag(user.id)
  }, [user?.id, loadBag])

  // group unplaced seeds by bloom, with a count
  const groups = useMemo(() => {
    const map = new Map<string, BagGroup>()
    for (const seed of bag) {
      const key = seed.bloom.render_key
      const g = map.get(key)
      if (g) g.count += 1
      else map.set(key, { key, seed, count: 1 })
    }
    return [...map.values()]
  }, [bag])

  return (
    <div className="seed-bag">
      <div className="wrap">
        <h1>Seed Bag</h1>
        <p className="sb-sub">
          Seeds you’ve earned are waiting here. Tap one to choose where it grows — it blooms by tomorrow.
        </p>

        {groups.length === 0 ? (
          <p className="sb-empty">
            Your Seed Bag is empty. Draw an oracle card, read an angel number, journal, make art, or
            listen for 7 minutes to earn seeds.
          </p>
        ) : (
          <ul className="sb-list">
            {groups.map((g) => (
              <li key={g.key}>
                <button type="button" className="sb-item" onClick={() => onPlant(g.seed)}>
                  <span className="sb-icon">{SEED_ICON[g.seed.bloom.render_key] ?? '🌱'}</span>
                  <span className="sb-meta">
                    <span className="sb-name">{g.seed.bloom.display_name}</span>
                    <span className="sb-bed">{BED_LABEL[g.seed.bloom.category] ?? 'Garden'}</span>
                  </span>
                  {g.count > 1 && <span className="sb-count">×{g.count}</span>}
                  <span className="sb-plant">Plant</span>
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
