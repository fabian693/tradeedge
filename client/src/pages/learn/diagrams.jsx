// Inline SVG diagram + real chart screenshots for the Learning Centre.
// Colours match tailwind.config.js theme tokens.
const ACCENT = '#00C896'   // bullish / longs
const DANGER = '#E74C3C'   // bearish / shorts
const SECONDARY = '#8888AA'
const PRIMARY = '#F0F0F5'
const BORDER = '#2A2A3A'

import liquidityImg from '../../assets/learn/liquidity.png'
import fvgImg from '../../assets/learn/fvg.png'
import ifvgImg from '../../assets/learn/ifvg.png'
import premiumDiscountImg from '../../assets/learn/premium-discount.png'
import smtNqImg from '../../assets/learn/smt-nq.png'
import smtEsImg from '../../assets/learn/smt-es.png'

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

function ImageFrame({ children, caption }) {
  return (
    <div className="my-4 rounded-xl border border-border bg-surface2 p-4">
      {children}
      {caption && <p className="text-xs text-secondary text-center mt-2">{caption}</p>}
    </div>
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
    <ImageFrame caption="Equal highs form a liquidity pool — price runs the level to trigger resting stop orders before reversing">
      <img src={liquidityImg} alt="Buy-side liquidity above equal highs" className="w-full h-auto rounded-lg" />
    </ImageFrame>
  )
}

export function FVGDiagram() {
  return (
    <ImageFrame caption="A Fair Value Gap (FVG) — the imbalance left behind by a fast displacement move, often revisited before the trend continues">
      <img src={fvgImg} alt="Fair Value Gap on a chart" className="w-full h-auto rounded-lg" />
    </ImageFrame>
  )
}

export function IFVGDiagram() {
  return (
    <ImageFrame caption="An Inversion Fair Value Gap (IFVG) — price closes through the original FVG, flipping it into a level to watch for entries on retest">
      <img src={ifvgImg} alt="Inversion Fair Value Gap on a chart" className="w-full h-auto rounded-lg" />
    </ImageFrame>
  )
}

export function SMTDivergenceDiagram() {
  return (
    <ImageFrame caption="SMT Divergence: NQ prints a new high while ES fails to confirm it — a sign of a likely liquidity sweep rather than a real breakout">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <img src={smtNqImg} alt="NQ making a new high" className="w-full h-auto rounded-lg" />
        <img src={smtEsImg} alt="ES failing to confirm the new high" className="w-full h-auto rounded-lg" />
      </div>
    </ImageFrame>
  )
}

export function PremiumDiscountDiagram() {
  return (
    <ImageFrame caption="Premium & Discount: the 50% equilibrium splits the range — only take longs in the discount (below 0.5), shorts in the premium (above 0.5)">
      <img src={premiumDiscountImg} alt="Premium and discount zones on a chart" className="w-full h-auto rounded-lg" />
    </ImageFrame>
  )
}
