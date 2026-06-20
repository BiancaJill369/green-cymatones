/**
 * Gardener wardrobe — eight data-driven axes, ported from violet.cymatones'
 * gardener creator and RESKINNED to green + wildflower (no purple anywhere).
 *
 *   skin → hair color/style → accessory → outfit → fabric → cloth color → shoes
 *
 * IDs are stable — they're stored verbatim in green_profiles.avatar (JSONB)
 * and referenced by <Gardener> when drawing.
 */

export interface Option {
  id: string
  label: string
  hex?: string
  unlocked?: boolean
}

export interface GardenerAvatar {
  skin: string
  hair_color: string
  hair_style: string
  accessory: string
  outfit: string
  pattern: string
  cloth_color: string
  shoes: string
}

export const SKIN_TONES: Option[] = [
  { id: 'porcelain', label: 'Porcelain', hex: '#f4dac0' },
  { id: 'fair', label: 'Fair', hex: '#e6b896' },
  { id: 'warm', label: 'Warm', hex: '#cf9168' },
  { id: 'olive', label: 'Olive', hex: '#a87148' },
  { id: 'deep', label: 'Deep', hex: '#6f4427' },
  { id: 'rich', label: 'Rich', hex: '#3f2614' },
]

// natural shades + one wildflower fantasy color (cornflower) — no purple
export const HAIR_COLORS: Option[] = [
  { id: 'midnight', label: 'Midnight', hex: '#1a1410' },
  { id: 'chestnut', label: 'Chestnut', hex: '#5a3520' },
  { id: 'honey', label: 'Honey', hex: '#c68a3a' },
  { id: 'wheat', label: 'Wheat', hex: '#d8b878' },
  { id: 'copper', label: 'Copper', hex: '#b25a2a' },
  { id: 'silver', label: 'Silver', hex: '#b8b3a9' },
  { id: 'cornflower', label: 'Cornflower', hex: '#6f93da' },
  { id: 'sage', label: 'Sage', hex: '#86a06e' },
]

export const HAIR_STYLES: Option[] = [
  { id: 'pixie', label: 'Pixie' },
  { id: 'bob', label: 'Bob' },
  { id: 'long', label: 'Long' },
  { id: 'ponytail', label: 'Ponytail' },
  { id: 'braids', label: 'Braids' },
  { id: 'bun', label: 'Bun' },
  { id: 'curls', label: 'Curls' },
  { id: 'wavy', label: 'Wavy' },
]

export const HAIR_ACCESSORIES: Option[] = [
  { id: 'none', label: 'None' },
  { id: 'flower_crown', label: 'Flower crown' },
  { id: 'sun_hat', label: 'Sun hat' },
  { id: 'bandana', label: 'Bandana' },
  { id: 'single_bloom', label: 'Single bloom' },
  { id: 'leaf_clip', label: 'Leaf clip' },
]

export const OUTFITS: Option[] = [
  { id: 'sundress', label: 'Sundress' },
  { id: 'gardening_dress', label: 'Gardening dress' },
  { id: 'pinafore', label: 'Pinafore dress' },
  { id: 'wrap_dress', label: 'Wrap dress' },
  { id: 'overalls', label: 'Overalls' },
  { id: 'tunic_skirt', label: 'Tunic + skirt' },
  { id: 'romper', label: 'Romper' },
  { id: 'apron_dress', label: 'Apron dress' },
]

export const FABRIC_PATTERNS: Option[] = [
  { id: 'solid', label: 'Solid' },
  { id: 'floral', label: 'Floral' },
  { id: 'gingham', label: 'Gingham' },
  { id: 'polka', label: 'Polka' },
  { id: 'stripes', label: 'Stripes' },
  { id: 'leafy', label: 'Leafy' },
]

// green-forward palette with wildflower accents — no purple
export const CLOTH_COLORS: Option[] = [
  { id: 'fern', label: 'Fern', hex: '#4f7942' },
  { id: 'moss', label: 'Moss', hex: '#566e45' },
  { id: 'sage', label: 'Sage', hex: '#86a06e' },
  { id: 'meadow', label: 'Meadow', hex: '#7cb342' },
  { id: 'cornflower', label: 'Cornflower', hex: '#6f93da' },
  { id: 'poppy', label: 'Poppy', hex: '#e0563f' },
  { id: 'buttercup', label: 'Buttercup', hex: '#f2c14e' },
  { id: 'rose', label: 'Wild rose', hex: '#d98aa0' },
  { id: 'cream', label: 'Cream', hex: '#f5ecd8' },
  { id: 'sky', label: 'Sky', hex: '#a5c2d8' },
]

export const SHOES: Option[] = [
  { id: 'clogs', label: 'Clogs' },
  { id: 'boots', label: 'Boots' },
  { id: 'flats', label: 'Flats' },
  { id: 'sandals', label: 'Sandals' },
  { id: 'wellies', label: 'Wellies' },
  { id: 'barefoot', label: 'Barefoot' },
]

export const AXES: { key: keyof GardenerAvatar; label: string; options: Option[] }[] = [
  { key: 'skin', label: 'Skin', options: SKIN_TONES },
  { key: 'hair_color', label: 'Hair color', options: HAIR_COLORS },
  { key: 'hair_style', label: 'Hair style', options: HAIR_STYLES },
  { key: 'accessory', label: 'Accessory', options: HAIR_ACCESSORIES },
  { key: 'outfit', label: 'Outfit', options: OUTFITS },
  { key: 'pattern', label: 'Fabric', options: FABRIC_PATTERNS },
  { key: 'cloth_color', label: 'Cloth color', options: CLOTH_COLORS },
  { key: 'shoes', label: 'Shoes', options: SHOES },
]

/** A gentle starting avatar that feels nice on first paint. */
export const DEFAULT_AVATAR: GardenerAvatar = {
  skin: 'fair',
  hair_color: 'chestnut',
  hair_style: 'wavy',
  accessory: 'flower_crown',
  outfit: 'gardening_dress',
  pattern: 'floral',
  cloth_color: 'sage',
  shoes: 'clogs',
}

/** Roll a fresh avatar from random picks across every axis. */
export function randomAvatar(): GardenerAvatar {
  const pick = (list: Option[]) =>
    list.filter((o) => o.unlocked !== false)[
      Math.floor(Math.random() * list.filter((o) => o.unlocked !== false).length)
    ].id
  const visible = HAIR_ACCESSORIES.filter((a) => a.id !== 'none')
  return {
    skin: pick(SKIN_TONES),
    hair_color: pick(HAIR_COLORS),
    hair_style: pick(HAIR_STYLES),
    accessory:
      Math.random() < 0.7 ? visible[Math.floor(Math.random() * visible.length)].id : 'none',
    outfit: pick(OUTFITS),
    pattern: pick(FABRIC_PATTERNS),
    cloth_color: pick(CLOTH_COLORS),
    shoes: pick(SHOES),
  }
}

export function hexFor(list: Option[], id: string, fallback: string): string {
  return list.find((x) => x.id === id)?.hex ?? fallback
}
