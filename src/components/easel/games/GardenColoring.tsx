import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { GameHandle } from '../gameTypes'

// coloring-book look: clean black outlines, white fill to start
const LINE = '#21301f'
const WHITE = '#ffffff'
const PALETTE = [
  '#5ce08a', '#34a853', '#2c6b3f', '#1f4a2c',
  '#9dc183', '#c9e29b', '#ffd76b', '#e8a64a',
  '#f48fb1', '#c77dd6', '#7aa6e0', '#5ec8c0',
  '#e0563f', '#8a5a2b', '#f4f9f0', WHITE,
]

const GardenColoring = forwardRef<GameHandle>((_props, ref) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [fills, setFills] = useState<Record<string, string>>({})
  const [color, setColor] = useState(PALETTE[0])
  const [design, setDesign] = useState<string | null>(null)

  const fillOf = (id: string) => fills[id] ?? WHITE
  const paint = (id: string) => setFills((f) => ({ ...f, [id]: color }))
  const reg = (id: string, io = true) => ({
    fill: fillOf(id),
    stroke: LINE,
    strokeWidth: 1.6,
    vectorEffect: 'non-scaling-stroke' as const,
    ...(io
      ? { onClick: () => paint(id), style: { cursor: 'pointer' as const } }
      : { style: { pointerEvents: 'none' as const } }),
  })

  // ---- shape builders ----
  const petalD = (cx: number, cy: number, r1: number, r2: number, w: number) =>
    `M${cx} ${cy - r1} Q${cx + w} ${cy - (r1 + r2) / 2} ${cx} ${cy - r2} Q${cx - w} ${cy - (r1 + r2) / 2} ${cx} ${cy - r1} Z`

  const ring = (
    pfx: string, cx: number, cy: number, n: number, r1: number, r2: number, w: number, rot = 0, io = true,
  ): ReactNode[] =>
    Array.from({ length: n }, (_, i) => (
      <path
        key={`${pfx}${i}`}
        d={petalD(cx, cy, r1, r2, w)}
        transform={`rotate(${rot + (360 / n) * i} ${cx} ${cy})`}
        {...reg(`${pfx}${i}`, io)}
      />
    ))

  const leafAt = (id: string, x: number, y: number, ang: number, len: number, wid: number, io = true) => (
    <path
      key={id}
      d={`M0 0 Q${wid} ${-len * 0.45} 0 ${-len} Q${-wid} ${-len * 0.45} 0 0 Z`}
      transform={`translate(${x} ${y}) rotate(${ang})`}
      {...reg(id, io)}
    />
  )

  const circ = (id: string, x: number, y: number, r: number, io = true) => (
    <circle key={id} cx={x} cy={y} r={r} {...reg(id, io)} />
  )

  // a flower: 5 petals (one region) + a center (another region) on an optional stem
  const flowerAt = (pfx: string, cx: number, cy: number, r: number, io = true): ReactNode[] => {
    const pet = Array.from({ length: 5 }, (_, i) => {
      const a = (Math.PI * 2 * i) / 5 - Math.PI / 2
      return (
        <ellipse
          key={`${pfx}p${i}`}
          cx={cx + Math.cos(a) * r}
          cy={cy + Math.sin(a) * r}
          rx={r * 0.62}
          ry={r * 0.9}
          transform={`rotate(${(360 / 5) * i} ${cx + Math.cos(a) * r} ${cy + Math.sin(a) * r})`}
          {...reg(`${pfx}_pet`, io)}
        />
      )
    })
    return [...pet, circ(`${pfx}_ctr`, cx, cy, r * 0.55, io)]
  }

  // ---- the 12 designs (viewBox 0 0 400 500) ----
  const DESIGNS: { key: string; name: string; build: (io?: boolean) => ReactNode }[] = [
    {
      key: 'rose_mandala', name: 'Rose Mandala',
      build: (io = true) => (
        <g>
          {ring('rm1', 200, 250, 16, 150, 212, 18, 0, io)}
          {ring('rm2', 200, 250, 12, 102, 160, 21, 15, io)}
          {ring('rm3', 200, 250, 10, 62, 110, 18, 0, io)}
          {ring('rm4', 200, 250, 8, 30, 68, 16, 22, io)}
          {circ('rm_c', 200, 250, 30, io)}
        </g>
      ),
    },
    {
      key: 'succulent', name: 'Succulent Rosette',
      build: (io = true) => (
        <g>
          {ring('su1', 200, 250, 14, 150, 216, 15, 0, io)}
          {ring('su2', 200, 250, 11, 108, 166, 15, 12, io)}
          {ring('su3', 200, 250, 9, 70, 122, 14, 0, io)}
          {ring('su4', 200, 250, 7, 36, 84, 12, 25, io)}
          {ring('su5', 200, 250, 5, 12, 48, 10, 0, io)}
        </g>
      ),
    },
    {
      key: 'kaleidoscope', name: 'Leaf Kaleidoscope',
      build: (io = true) => (
        <g>
          {ring('kl1', 200, 250, 8, 150, 232, 14, 0, io)}
          {ring('kl2', 200, 250, 12, 96, 176, 22, 15, io)}
          {ring('kl3', 200, 250, 12, 46, 110, 16, 0, io)}
          {ring('kl4', 200, 250, 6, 14, 50, 12, 30, io)}
          {circ('kl_c', 200, 250, 14, io)}
        </g>
      ),
    },
    {
      key: 'lotus_pond', name: 'Lotus Pond',
      build: (io = true) => (
        <g>
          {circ('lp_pad1', 78, 392, 48, io)}
          {circ('lp_pad2', 318, 408, 56, io)}
          {circ('lp_pad3', 168, 452, 40, io)}
          {ring('lo1', 200, 208, 10, 92, 154, 24, 0, io)}
          {ring('lo2', 200, 208, 8, 42, 100, 19, 18, io)}
          {circ('lo_c', 200, 208, 26, io)}
          {circ('lp_d1', 58, 300, 11, io)}
          {circ('lp_d2', 344, 300, 13, io)}
          {circ('lp_d3', 336, 472, 9, io)}
        </g>
      ),
    },
    {
      key: 'oak_wreath', name: 'Oak-leaf Wreath',
      build: (io = true) => {
        const items: ReactNode[] = []
        const cx = 200, cy = 250, R = 150
        for (let i = 0; i < 12; i++) {
          const a = (360 / 12) * i
          const rad = (a * Math.PI) / 180
          items.push(leafAt(`ow_l${i}`, cx + Math.cos(rad) * R, cy + Math.sin(rad) * R, a + 90, 78, 30, io))
        }
        for (let i = 0; i < 6; i++) {
          const a = (360 / 6) * i + 30
          const rad = (a * Math.PI) / 180
          const x = cx + Math.cos(rad) * (R - 6)
          const y = cy + Math.sin(rad) * (R - 6)
          items.push(<ellipse key={`ow_a${i}`} cx={x} cy={y} rx={9} ry={12} {...reg(`ow_ab${i}`, io)} />)
          items.push(<path key={`ow_ac${i}`} d={`M${x - 10} ${y - 8} a10 6 0 0 1 20 0 z`} {...reg(`ow_ac${i}`, io)} />)
        }
        items.push(circ('ow_c', cx, cy, 24, io))
        return <g>{items}</g>
      },
    },
    {
      key: 'fern_frond', name: 'Fern Frond',
      build: (io = true) => {
        const items: ReactNode[] = [
          <path key="fr_stem" d="M200 470 C196 360 204 230 200 70" {...reg('fr_stem', io)} fill="none" strokeWidth={4} />,
        ]
        for (let i = 0; i < 13; i++) {
          const y = 440 - i * 28
          const len = 90 - i * 5
          items.push(leafAt(`fr_l${i}`, 200, y, -62, len, len * 0.3, io))
          items.push(leafAt(`fr_r${i}`, 200, y, 62, len, len * 0.3, io))
        }
        return <g>{items}</g>
      },
    },
    {
      key: 'monstera', name: 'Monstera Leaf',
      build: (io = true) => {
        const items: ReactNode[] = [
          <path key="mo_mid" d="M200 480 L200 110" {...reg('mo_mid', io)} fill="none" strokeWidth={4} />,
        ]
        const segs = [
          [40, 'M200 150 C120 150 80 210 96 280 C150 250 190 220 200 180 Z'],
          [-40, 'M200 150 C280 150 320 210 304 280 C250 250 210 220 200 180 Z'],
          [40, 'M200 240 C110 250 70 320 92 390 C150 350 192 300 200 260 Z'],
          [-40, 'M200 240 C290 250 330 320 308 390 C250 350 208 300 200 260 Z'],
          [40, 'M200 330 C130 350 104 410 120 462 C168 430 196 380 200 348 Z'],
          [-40, 'M200 330 C270 350 296 410 280 462 C232 430 204 380 200 348 Z'],
          [0, 'M200 110 C168 110 150 138 168 168 C188 150 200 140 200 124 Z'],
          [0, 'M200 110 C232 110 250 138 232 168 C212 150 200 140 200 124 Z'],
        ]
        segs.forEach(([, d], i) => items.push(<path key={`mo_s${i}`} d={d as string} {...reg(`mo_s${i}`, io)} />))
        return <g>{items}</g>
      },
    },
    {
      key: 'meadow', name: 'Wildflower Meadow',
      build: (io = true) => {
        const items: ReactNode[] = []
        const fls: [number, number, number][] = [
          [80, 180, 34], [200, 130, 40], [320, 185, 32], [130, 270, 30], [270, 285, 30], [200, 250, 26],
        ]
        fls.forEach(([x, y, r], i) => {
          items.push(<rect key={`md_st${i}`} x={x - 2.5} y={y} width={5} height={470 - y} rx={2.5} {...reg(`md_st${i}`, io)} />)
          items.push(leafAt(`md_lf${i}`, x, y + 80, i % 2 ? 40 : -40, 46, 16, io))
          items.push(...flowerAt(`md_f${i}`, x, y, r, io))
        })
        // grass tufts along the base
        for (let i = 0; i < 5; i++) {
          const x = 40 + i * 80
          items.push(<path key={`md_g${i}`} d={`M${x} 480 Q${x - 14} 430 ${x - 6} 410 M${x} 480 Q${x + 14} 430 ${x + 6} 410 M${x} 480 L${x} 412`} {...reg(`md_g${i}`, io)} fill="none" strokeWidth={3} />)
        }
        return <g>{items}</g>
      },
    },
    {
      key: 'vine_arch', name: 'Climbing Vine Arch',
      build: (io = true) => {
        const items: ReactNode[] = [
          <path key="va_l" d="M60 490 C40 300 120 150 200 96" {...reg('va_l', io)} fill="none" strokeWidth={5} />,
          <path key="va_r" d="M340 490 C360 300 280 150 200 96" {...reg('va_r', io)} fill="none" strokeWidth={5} />,
        ]
        const pts: [number, number, number][] = [
          [70, 380, -50], [92, 290, -40], [132, 210, -30], [175, 140, -20],
          [330, 380, 50], [308, 290, 40], [268, 210, 30], [225, 140, 20],
        ]
        pts.forEach(([x, y, a], i) => items.push(leafAt(`va_lf${i}`, x, y, a, 50, 20, io)))
        items.push(...flowerAt('va_f1', 200, 110, 28, io))
        items.push(...flowerAt('va_f2', 110, 250, 22, io))
        items.push(...flowerAt('va_f3', 290, 250, 22, io))
        return <g>{items}</g>
      },
    },
    {
      key: 'herb_border', name: 'Herb-Garden Border',
      build: (io = true) => {
        const items: ReactNode[] = [
          <rect key="hb_f" x={20} y={20} width={360} height={460} rx={16} {...reg('hb_frame', io)} fill="none" strokeWidth={3} />,
        ]
        for (let i = 0; i < 4; i++) {
          const x = 90 + i * 75
          items.push(<rect key={`hb_st${i}`} x={x - 2} y={120} width={4} height={300} rx={2} {...reg(`hb_st${i}`, io)} />)
          for (let j = 0; j < 7; j++) {
            const y = 410 - j * 40
            const len = 30 + j
            items.push(leafAt(`hb_l${i}_${j}a`, x, y, -55, len, len * 0.35, io))
            items.push(leafAt(`hb_l${i}_${j}b`, x, y, 55, len, len * 0.35, io))
          }
          items.push(<g key={`hb_top${i}`}>{flowerAt(`hb_f${i}`, x, 110, 16, io)}</g>)
        }
        return <g>{items}</g>
      },
    },
    {
      key: 'blossom_branch', name: 'Blossom Branch',
      build: (io = true) => {
        const items: ReactNode[] = [
          <path key="bb_br" d="M30 470 C140 430 200 380 250 300 C290 235 330 160 380 110" {...reg('bb_branch', io)} fill="none" strokeWidth={6} />,
        ]
        const blooms: [number, number, number][] = [
          [120, 432, 26], [195, 372, 30], [255, 296, 28], [300, 226, 26], [338, 156, 24], [372, 112, 22],
        ]
        blooms.forEach(([x, y, r], i) => items.push(...flowerAt(`bb_f${i}`, x, y, r, io)))
        const buds: [number, number][] = [[160, 300], [230, 250], [200, 440]]
        buds.forEach(([x, y], i) => items.push(<ellipse key={`bb_b${i}`} cx={x} cy={y} rx={9} ry={13} {...reg(`bb_b${i}`, io)} />))
        items.push(leafAt('bb_lf1', 150, 410, 30, 40, 16, io))
        items.push(leafAt('bb_lf2', 280, 270, -20, 40, 16, io))
        return <g>{items}</g>
      },
    },
    {
      key: 'mushroom_moss', name: 'Mushroom & Moss',
      build: (io = true) => {
        const items: ReactNode[] = []
        const shrooms: [number, number, number][] = [[140, 300, 1.2], [250, 340, 1], [200, 230, 0.8]]
        shrooms.forEach(([x, y, s], i) => {
          const cw = 70 * s
          items.push(<rect key={`mm_st${i}`} x={x - 11 * s} y={y} width={22 * s} height={120 * s} rx={10 * s} {...reg(`mm_st${i}`, io)} />)
          items.push(<path key={`mm_cap${i}`} d={`M${x - cw} ${y + 6} a${cw} ${cw * 0.78} 0 0 1 ${cw * 2} 0 Z`} {...reg(`mm_cap${i}`, io)} />)
          items.push(circ(`mm_sp${i}a`, x - cw * 0.4, y - cw * 0.2, 6 * s, io))
          items.push(circ(`mm_sp${i}b`, x + cw * 0.35, y - cw * 0.3, 5 * s, io))
        })
        // moss mounds along the base
        const mounds: [number, number, number][] = [[70, 470, 60], [200, 478, 80], [330, 470, 64]]
        mounds.forEach(([x, y, w], i) =>
          items.push(<path key={`mm_mo${i}`} d={`M${x - w} ${y} a${w} ${w * 0.5} 0 0 1 ${w * 2} 0 Z`} {...reg(`mm_mo${i}`, io)} />),
        )
        items.push(...flowerAt('mm_f1', 90, 410, 16, io))
        items.push(...flowerAt('mm_f2', 320, 415, 16, io))
        items.push(leafAt('mm_lf', 300, 460, 30, 40, 16, io))
        return <g>{items}</g>
      },
    },
  ]

  useImperativeHandle(ref, () => ({
    getState: () => fills,
    renderToCanvas: async (canvas) => {
      const svg = svgRef.current
      if (!svg) return
      const xml = new XMLSerializer().serializeToString(svg)
      const data = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(xml)))
      await new Promise<void>((resolve) => {
        const img = new Image()
        img.onload = () => {
          canvas.width = 400
          canvas.height = 500
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, 400, 500)
            ctx.drawImage(img, 0, 0, 400, 500)
          }
          resolve()
        }
        img.onerror = () => resolve()
        img.src = data
      })
    },
  }))

  // ---- design picker ----
  if (!design) {
    return (
      <div className="coloring">
        <p className="coloring-pick">Choose a botanical page to color</p>
        <div className="design-grid">
          {DESIGNS.map((d) => (
            <button key={d.key} type="button" className="design-tile" onClick={() => setDesign(d.key)}>
              <svg className="design-thumb" viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg">
                <rect x={0} y={0} width={400} height={500} fill="#fff" />
                {d.build(false)}
              </svg>
              <span className="dt-name">{d.name}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const cur = DESIGNS.find((d) => d.key === design)!
  return (
    <div className="coloring">
      <button type="button" className="design-back" onClick={() => setDesign(null)}>
        ← All designs
      </button>

      <svg
        ref={svgRef}
        className="coloring-canvas portrait"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 400 500"
        width="400"
        height="500"
      >
        <rect x={0} y={0} width={400} height={500} fill="#fff" pointerEvents="none" />
        {cur.build(true)}
      </svg>

      <div className="palette palette-dock" role="group" aria-label="Colors">
        {PALETTE.map((c) => (
          <button
            key={c}
            type="button"
            className={`swatch${color === c ? ' active' : ''}`}
            style={{ background: c }}
            aria-label={`color ${c}`}
            onClick={() => setColor(c)}
          />
        ))}
      </div>
    </div>
  )
})
GardenColoring.displayName = 'GardenColoring'
export default GardenColoring
