import type React from 'react'

const GRID = 88

const DOTS: Array<{
  col: number; row: number
  dir: 'right' | 'left' | 'down' | 'up'
  dur: number; delay: number
  size: number       // dot diameter px
  breathe: number   // breathe animation duration s
  trailLen: number  // trail length px
}> = [
  // Horizontal
  { col: 1,  row: 2,  dir: 'right', dur: 11, delay:  0,  size: 4, breathe: 2.8, trailLen: 80  },
  { col: 4,  row: 5,  dir: 'right', dur: 15, delay: -4,  size: 3, breathe: 3.5, trailLen: 56  },
  { col: 8,  row: 1,  dir: 'left',  dur: 13, delay: -2,  size: 4, breathe: 2.4, trailLen: 72  },
  { col: 12, row: 7,  dir: 'left',  dur: 10, delay: -6,  size: 3, breathe: 3.8, trailLen: 48  },
  { col: 3,  row: 9,  dir: 'right', dur: 17, delay: -3,  size: 3, breathe: 4.2, trailLen: 60  },
  { col: 7,  row: 3,  dir: 'left',  dur: 12, delay: -1,  size: 5, breathe: 2.2, trailLen: 96  },
  // Vertical
  { col: 2,  row: 0,  dir: 'down',  dur: 12, delay: -2,  size: 3, breathe: 3.2, trailLen: 56  },
  { col: 5,  row: 4,  dir: 'down',  dur: 16, delay: -5,  size: 4, breathe: 2.6, trailLen: 80  },
  { col: 9,  row: 1,  dir: 'up',    dur: 11, delay: -1,  size: 3, breathe: 4.0, trailLen: 48  },
  { col: 11, row: 6,  dir: 'up',    dur: 14, delay: -3,  size: 4, breathe: 2.9, trailLen: 72  },
  { col: 6,  row: 8,  dir: 'down',  dur: 18, delay:  0,  size: 3, breathe: 3.6, trailLen: 60  },
  { col: 14, row: 3,  dir: 'up',    dur: 10, delay: -7,  size: 5, breathe: 2.1, trailLen: 96  },
]

function trailStyle(
  dir: 'right' | 'left' | 'down' | 'up',
  size: number,
  trailLen: number,
): React.CSSProperties {
  const isH = dir === 'left' || dir === 'right'
  // Bright at the dot, fades to transparent behind it
  const grad = isH
    ? `linear-gradient(${dir === 'right' ? '270deg' : '90deg'},
         rgba(52,211,153,0.22) 0%,
         rgba(16,185,129,0.05) 60%,
         transparent 100%)`
    : `linear-gradient(${dir === 'down' ? '0deg' : '180deg'},
         rgba(52,211,153,0.22) 0%,
         rgba(16,185,129,0.05) 60%,
         transparent 100%)`

  if (isH) {
    return {
      position: 'absolute',
      width:    trailLen,
      height:   size,
      top:      0,
      left:     dir === 'right' ? -trailLen : size,
      borderRadius: 9999,
      background: grad,
      pointerEvents: 'none',
    }
  }
  return {
    position: 'absolute',
    width:    size,
    height:   trailLen,
    left:     0,
    top:      dir === 'down' ? -trailLen : size,
    borderRadius: 9999,
    background: grad,
    pointerEvents: 'none',
  }
}

export default function GridBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {/* Grid lines — painted once */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(16,185,129,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16,185,129,0.05) 1px, transparent 1px)
          `,
          backgroundSize: `${GRID}px ${GRID}px`,
        }}
      />

      {/* Intersection dots — static radial pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(16,185,129,0.22) 1.2px, transparent 1.2px)`,
          backgroundSize: `${GRID}px ${GRID}px`,
        }}
      />

      {/* Moving dots */}
      {DOTS.map((d, i) => (
        <div
          key={i}
          className="grid-dot"
          style={{
            width:  d.size,
            height: d.size,
            left:   d.col * GRID - d.size / 2,
            top:    d.row * GRID - d.size / 2,
            // Multi-layer box-shadow: tight core glow + wide diffuse bloom
            boxShadow: [
              `0 0 ${d.size * 1.5}px ${d.size * 0.5}px rgba(209,250,229,0.25)`,
              `0 0 ${d.size * 4}px   ${d.size}px     rgba(52,211,153,0.15)`,
              `0 0 ${d.size * 10}px  ${d.size * 2}px rgba(16,185,129,0.06)`,
            ].join(', '),
            animation: `dot-${d.dir} ${d.dur}s ${d.delay}s linear infinite`,
            // Pass breathe duration as CSS var for the ::before pseudo
            ['--breathe-dur' as string]: `${d.breathe}s`,
          }}
        >
          <span style={trailStyle(d.dir, d.size, d.trailLen)} />
        </div>
      ))}
    </div>
  )
}
