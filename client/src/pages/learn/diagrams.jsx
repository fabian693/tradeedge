// Inline SVG diagrams for the Learning Centre.
// Colours match tailwind.config.js theme tokens.
const ACCENT = '#00C896'   // bullish / longs
const DANGER = '#E74C3C'   // bearish / shorts
const WARNING = '#F5A623'  // highlight / zones
const SECONDARY = '#8888AA'
const PRIMARY = '#F0F0F5'
const BORDER = '#2A2A3A'

function DiagramFrame({ children, caption, viewBox = '0 0 640 220' }) {
  return (
    <div className="my-4 rounded-xl border border-border bg-surface2 p-4">
      <svg viewBox={viewBox} className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
        {children}
      </svg>
      {caption && <p className="text-xs text-secondary text-center mt-2">{caption}</p>}
    </div>
  )
}

// A small OHLC candle
function Candle({ x, openY, closeY, highY, lowY, width = 16, bullish }) {
  const color = bullish ? ACCENT : DANGER
  const bodyTop = Math.min(openY, closeY)
  const bodyHeight = Math.max(Math.abs(closeY - openY), 2)
  return (
    <g>
      <line x1={x} x2={x} y1={highY} y2={lowY} stroke={color} strokeWidth="1.5" />
      <rect x={x - width / 2} y={bodyTop} width={width} height={bodyHeight} fill={color} />
    </g>
  )
}

export function MarketStructureDiagram() {
  return (
    <DiagramFrame caption="Uptrend = Higher Highs + Higher Lows · Downtrend = Lower Highs + Lower Lows">
      {/* Uptrend panel */}
      <text x="20" y="20" fill={PRIMARY} fontSize="12" fontWeight="700">Uptrend (Bullish)</text>
      <polyline points="20,170 90,60 150,110 220,30 280,80" fill="none" stroke={SECONDARY} strokeWidth="2" />
      <line x1="90" y1="60" x2="280" y2="60" stroke={BORDER} strokeDasharray="4 4" />
      <line x1="20" y1="170" x2="220" y2="170" stroke={BORDER} strokeDasharray="4 4" />
      {[
        { x: 90, y: 60, label: 'H' },
        { x: 150, y: 110, label: 'HL' },
        { x: 220, y: 30, label: 'HH' },
        { x: 280, y: 80, label: 'HL' },
      ].map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill={ACCENT} />
          <text x={p.x} y={p.y - 10} fill={PRIMARY} fontSize="11" textAnchor="middle" fontWeight="600">{p.label}</text>
        </g>
      ))}

      {/* Divider */}
      <line x1="330" y1="10" x2="330" y2="200" stroke={BORDER} />

      {/* Downtrend panel */}
      <text x="360" y="20" fill={PRIMARY} fontSize="12" fontWeight="700">Downtrend (Bearish)</text>
      <polyline points="360,50 430,160 490,110 560,190 620,140" fill="none" stroke={SECONDARY} strokeWidth="2" />
      <line x1="430" y1="160" x2="620" y2="160" stroke={BORDER} strokeDasharray="4 4" />
      <line x1="360" y1="50" x2="560" y2="50" stroke={BORDER} strokeDasharray="4 4" />
      {[
        { x: 430, y: 160, label: 'L' },
        { x: 490, y: 110, label: 'LH' },
        { x: 560, y: 190, label: 'LL' },
        { x: 620, y: 140, label: 'LH' },
      ].map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill={DANGER} />
          <text x={p.x} y={p.y - 10} fill={PRIMARY} fontSize="11" textAnchor="middle" fontWeight="600">{p.label}</text>
        </g>
      ))}
    </DiagramFrame>
  )
}

export function LiquidityDiagram() {
  return (
    <DiagramFrame caption="Equal highs/lows and session extremes are where stop orders cluster — your TP targets">
      {/* BSL line */}
      <line x1="20" y1="40" x2="620" y2="40" stroke={WARNING} strokeDasharray="6 4" strokeWidth="1.5" />
      <text x="24" y="32" fill={WARNING} fontSize="11" fontWeight="700">Buy Side Liquidity (BSL) — stops above equal highs</text>

      {/* Price path with equal highs touching BSL and equal lows touching SSL */}
      <polyline
        points="20,150 90,42 160,150 230,42 300,150 370,110 440,40 510,110 580,40"
        fill="none" stroke={PRIMARY} strokeWidth="2"
      />
      <circle cx="90" cy="42" r="4" fill={WARNING} />
      <circle cx="230" cy="42" r="4" fill={WARNING} />
      <text x="160" y="32" fill={SECONDARY} fontSize="10" textAnchor="middle">equal highs</text>

      {/* SSL line */}
      <line x1="20" y1="190" x2="620" y2="190" stroke={ACCENT} strokeDasharray="6 4" strokeWidth="1.5" />
      <text x="24" y="206" fill={ACCENT} fontSize="11" fontWeight="700">Sell Side Liquidity (SSL) — stops below equal lows</text>

      {/* arrows pointing to pools */}
      <path d="M440,40 L460,20" stroke={WARNING} strokeWidth="1.5" markerEnd="url(#arrowBSL)" />
      <defs>
        <marker id="arrowBSL" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={WARNING} />
        </marker>
      </defs>
    </DiagramFrame>
  )
}

export function FVGDiagram() {
  // Three candles: C1 (small), C2 (big displacement up), C3 (small) — gap between C1 high and C3 low
  return (
    <DiagramFrame caption="Bullish FVG: a 3-candle gap left behind by a fast displacement move — price often returns to fill it">
      {/* gap zone */}
      <rect x="160" y="70" width="120" height="50" fill={WARNING} opacity="0.18" />
      <text x="220" y="105" fill={WARNING} fontSize="11" fontWeight="700" textAnchor="middle">FVG</text>

      <Candle x="120" openY="150" closeY="120" highY="155" lowY="115" bullish />
      <text x="120" y="180" fill={SECONDARY} fontSize="10" textAnchor="middle">C1</text>

      <Candle x="200" openY="120" closeY="55" highY="125" lowY="50" bullish />
      <text x="200" y="180" fill={SECONDARY} fontSize="10" textAnchor="middle">C2 (displacement)</text>

      <Candle x="280" openY="55" closeY="35" highY="60" lowY="30" bullish />
      <text x="280" y="180" fill={SECONDARY} fontSize="10" textAnchor="middle">C3</text>

      {/* annotations for gap edges */}
      <line x1="100" y1="115" x2="320" y2="115" stroke={BORDER} strokeDasharray="4 4" />
      <text x="330" y="119" fill={SECONDARY} fontSize="10">C1 high</text>
      <line x1="100" y1="70" x2="320" y2="70" stroke={BORDER} strokeDasharray="4 4" />
      <text x="330" y="74" fill={SECONDARY} fontSize="10">C3 low</text>

      {/* return arrow */}
      <path d="M400,40 C 470,80 460,150 360,160" fill="none" stroke={SECONDARY} strokeWidth="1.5" markerEnd="url(#arrowFvg)" />
      <text x="480" y="60" fill={SECONDARY} fontSize="11" textAnchor="middle">price often{' '}retraces{' '}to{' '}fill{' '}the{' '}FVG</text>
      <defs>
        <marker id="arrowFvg" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={SECONDARY} />
        </marker>
      </defs>
    </DiagramFrame>
  )
}

export function IFVGDiagram() {
  // Show: bullish FVG created, then displacement down with a body close through it (inversion),
  // then price retesting the IFVG from below as the entry trigger.
  return (
    <DiagramFrame caption="An FVG that price closes BODY through becomes an IFVG — your entry trigger when price returns to retest it" viewBox="0 0 640 240">
      {/* original FVG zone (now inverted, becomes resistance) */}
      <rect x="60" y="80" width="110" height="45" fill={SECONDARY} opacity="0.15" />
      <text x="115" y="73" fill={SECONDARY} fontSize="10" textAnchor="middle">original FVG</text>

      <Candle x="80" openY="160" closeY="130" highY="165" lowY="125" bullish />
      <Candle x="140" openY="130" closeY="65" highY="135" lowY="60" bullish />

      {/* displacement down candle closing BODY through the FVG */}
      <Candle x="220" openY="65" closeY="150" highY="60" lowY="155" bullish={false} />
      <text x="220" y="178" fill={DANGER} fontSize="10" textAnchor="middle" fontWeight="700">
        <tspan x="220" dy="0">body close</tspan>
        <tspan x="220" dy="12">through FVG</tspan>
      </text>

      {/* Inverted zone now acts as resistance */}
      <rect x="260" y="80" width="110" height="45" fill={DANGER} opacity="0.18" />
      <text x="315" y="73" fill={DANGER} fontSize="10" textAnchor="middle" fontWeight="700">IFVG (resistance)</text>

      {/* price pulls back down then returns to retest IFVG from below */}
      <Candle x="300" openY="150" closeY="180" highY="145" lowY="185" bullish={false} />
      <Candle x="380" openY="180" closeY="135" highY="185" lowY="130" bullish />
      <Candle x="440" openY="135" closeY="100" highY="140" lowY="95" bullish />

      {/* entry arrow */}
      <path d="M440,98 L460,80" stroke={ACCENT} strokeWidth="1.5" markerEnd="url(#arrowEntry)" />
      <text x="540" y="80" fill={ACCENT} fontSize="11" textAnchor="middle" fontWeight="700">entry: retest{' '}of IFVG</text>
      <defs>
        <marker id="arrowEntry" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={ACCENT} />
        </marker>
      </defs>
    </DiagramFrame>
  )
}

export function SMTDivergenceDiagram() {
  return (
    <DiagramFrame caption="Bearish SMT: NQ makes a new session high, ES fails to confirm it — a liquidity sweep, not a real breakout" viewBox="0 0 640 240">
      <text x="20" y="20" fill={PRIMARY} fontSize="12" fontWeight="700">NQ</text>
      <line x1="20" y1="60" x2="300" y2="60" stroke={BORDER} strokeDasharray="4 4" />
      <text x="305" y="64" fill={SECONDARY} fontSize="10">prior high</text>
      <polyline points="20,120 80,90 140,130 200,60 260,100" fill="none" stroke={ACCENT} strokeWidth="2" />
      <circle cx="200" cy="60" r="4" fill={ACCENT} />
      <text x="200" y="45" fill={ACCENT} fontSize="11" textAnchor="middle" fontWeight="700">new high</text>

      <line x1="330" y1="10" x2="330" y2="230" stroke={BORDER} />

      <text x="360" y="20" fill={PRIMARY} fontSize="12" fontWeight="700">ES</text>
      <line x1="360" y1="80" x2="620" y2="80" stroke={BORDER} strokeDasharray="4 4" />
      <text x="345" y="84" fill={SECONDARY} fontSize="10" textAnchor="end">prior high</text>
      <polyline points="360,130 420,100 480,140 540,95 600,115" fill="none" stroke={DANGER} strokeWidth="2" />
      <circle cx="540" cy="95" r="4" fill={DANGER} />
      <text x="540" y="80" fill={DANGER} fontSize="11" textAnchor="middle" fontWeight="700">lower high</text>

      <text x="480" y="200" fill={WARNING} fontSize="12" textAnchor="middle" fontWeight="700">SMT Divergence → short bias</text>
    </DiagramFrame>
  )
}

export function PremiumDiscountDiagram() {
  return (
    <DiagramFrame caption="Bullish bias: only take longs while price is in the discount (below equilibrium)" viewBox="0 0 640 220">
      {/* range box */}
      <rect x="80" y="20" width="480" height="160" fill="none" stroke={BORDER} strokeWidth="1.5" />

      {/* premium zone */}
      <rect x="80" y="20" width="480" height="80" fill={DANGER} opacity="0.12" />
      <text x="570" y="60" fill={DANGER} fontSize="11" fontWeight="700">Premium</text>
      <text x="570" y="75" fill={SECONDARY} fontSize="10">look for shorts</text>

      {/* discount zone */}
      <rect x="80" y="100" width="480" height="80" fill={ACCENT} opacity="0.12" />
      <text x="570" y="145" fill={ACCENT} fontSize="11" fontWeight="700">Discount</text>
      <text x="570" y="160" fill={SECONDARY} fontSize="10">look for longs</text>

      {/* equilibrium line */}
      <line x1="80" y1="100" x2="560" y2="100" stroke={PRIMARY} strokeDasharray="6 4" strokeWidth="1.5" />
      <text x="84" y="96" fill={PRIMARY} fontSize="11" fontWeight="700">50% Equilibrium</text>

      {/* range high / low labels */}
      <text x="84" y="16" fill={SECONDARY} fontSize="10">range high</text>
      <text x="84" y="196" fill={SECONDARY} fontSize="10">range low</text>

      {/* price path entering discount and reversing up */}
      <polyline points="120,40 200,90 280,150 360,165 440,120 520,60" fill="none" stroke={PRIMARY} strokeWidth="2" />
      <circle cx="360" cy="165" r="4" fill={ACCENT} />
      <text x="360" y="190" fill={ACCENT} fontSize="10" textAnchor="middle" fontWeight="700">entry zone (discount)</text>
    </DiagramFrame>
  )
}
