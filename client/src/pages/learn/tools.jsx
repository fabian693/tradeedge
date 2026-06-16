import { useState, useEffect } from 'react'
import { ExternalLink, Clock, Calculator, TrendingUp } from 'lucide-react'

// ─── NQ Risk Calculator ───────────────────────────────────────────────────────

export function NQRiskCalculator() {
  const [accountSize, setAccountSize] = useState(50000)
  const [riskPct, setRiskPct] = useState(1)
  const [stopPoints, setStopPoints] = useState(20)

  const dollarRisk = (accountSize * riskPct) / 100
  const mnqContracts = stopPoints > 0 ? Math.floor(dollarRisk / (stopPoints * 2)) : 0
  const nqContracts = stopPoints > 0 ? Math.floor(dollarRisk / (stopPoints * 20)) : 0
  const mesContracts = stopPoints > 0 ? Math.floor(dollarRisk / (stopPoints * 5)) : 0
  const esContracts = stopPoints > 0 ? Math.floor(dollarRisk / (stopPoints * 50)) : 0

  return (
    <div className="my-4 rounded-xl border border-border bg-surface2 p-5 space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <Calculator className="w-4 h-4 text-accent" />
        <span className="text-sm font-semibold text-primary">NQ / ES Risk Calculator</span>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-medium text-secondary uppercase tracking-wider block mb-1.5">Account Size ($)</label>
          <input
            type="number"
            value={accountSize}
            onChange={e => setAccountSize(Number(e.target.value))}
            className="w-full bg-surface border border-border rounded-lg text-sm text-primary px-3 py-2 focus:outline-none focus:border-accent/60"
            placeholder="50000"
            min={0}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-secondary uppercase tracking-wider block mb-1.5">Risk %</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0.25}
              max={3}
              step={0.25}
              value={riskPct}
              onChange={e => setRiskPct(Number(e.target.value))}
              className="flex-1 accent-accent"
            />
            <span className="text-sm font-mono text-accent w-10 text-right">{riskPct}%</span>
          </div>
          <div className="flex justify-between text-xs text-secondary/60 mt-1">
            <span>0.25%</span><span>1%</span><span>2%</span><span>3%</span>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-secondary uppercase tracking-wider block mb-1.5">Stop Loss (points)</label>
          <input
            type="number"
            value={stopPoints}
            onChange={e => setStopPoints(Number(e.target.value))}
            className="w-full bg-surface border border-border rounded-lg text-sm text-primary px-3 py-2 focus:outline-none focus:border-accent/60"
            placeholder="20"
            min={1}
          />
        </div>
      </div>

      {/* Dollar risk summary */}
      <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 flex items-center justify-between">
        <span className="text-sm text-secondary">Max $ at risk</span>
        <span className="text-xl font-mono font-bold text-accent">${dollarRisk.toFixed(0)}</span>
      </div>

      {/* Contracts output */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface border border-border rounded-xl p-3">
          <p className="text-xs text-secondary mb-0.5">MNQ contracts</p>
          <p className="text-2xl font-mono font-bold text-primary">{mnqContracts}</p>
          <p className="text-xs text-secondary/60 mt-1">1 pt = $2 · Nasdaq micro</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-3">
          <p className="text-xs text-secondary mb-0.5">NQ contracts</p>
          <p className="text-2xl font-mono font-bold text-primary">{nqContracts}</p>
          <p className="text-xs text-secondary/60 mt-1">1 pt = $20 · Nasdaq full</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-3">
          <p className="text-xs text-secondary mb-0.5">MES contracts</p>
          <p className="text-2xl font-mono font-bold text-primary">{mesContracts}</p>
          <p className="text-xs text-secondary/60 mt-1">1 pt = $5 · S&P micro</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-3">
          <p className="text-xs text-secondary mb-0.5">ES contracts</p>
          <p className="text-2xl font-mono font-bold text-primary">{esContracts}</p>
          <p className="text-xs text-secondary/60 mt-1">1 pt = $50 · S&P full</p>
        </div>
      </div>
      <p className="text-xs text-secondary/60">Fractional contracts are rounded down to the nearest whole contract.</p>
    </div>
  )
}

// ─── Session Clock ────────────────────────────────────────────────────────────

function getESTDate() {
  // Returns a Date adjusted to EST (UTC-5) / EDT (UTC-4) accounting for DST
  const now = new Date()
  const estOffset = -5 * 60 // EST base offset in minutes
  const isDST = (() => {
    const jan = new Date(now.getFullYear(), 0, 1).getTimezoneOffset()
    const jul = new Date(now.getFullYear(), 6, 1).getTimezoneOffset()
    return now.getTimezoneOffset() < Math.max(jan, jul)
  })()
  const offsetMs = (estOffset + (isDST ? 60 : 0)) * 60 * 1000
  return new Date(now.getTime() + now.getTimezoneOffset() * 60 * 1000 + offsetMs)
}

function toMinutes(h, m) { return h * 60 + m }

const KILLZONES = [
  { name: 'London', start: toMinutes(2, 0), end: toMinutes(5, 0), color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
  { name: 'New York', start: toMinutes(8, 30), end: toMinutes(11, 0), color: 'text-accent', bg: 'bg-accent/10 border-accent/20' },
]

function pad(n) { return String(n).padStart(2, '0') }

export function SessionClock() {
  const [now, setNow] = useState(getESTDate())

  useEffect(() => {
    const id = setInterval(() => setNow(getESTDate()), 1000)
    return () => clearInterval(id)
  }, [])

  const currentMinutes = toMinutes(now.getHours(), now.getMinutes())

  const activeKZ = KILLZONES.find(kz => currentMinutes >= kz.start && currentMinutes < kz.end)

  // Find next killzone
  const nextKZ = (() => {
    const upcoming = KILLZONES.filter(kz => kz.start > currentMinutes)
    if (upcoming.length > 0) return upcoming[0]
    // wrap to tomorrow's London
    return { ...KILLZONES[0], start: KILLZONES[0].start + 24 * 60 }
  })()

  const minsToNext = nextKZ.start - currentMinutes
  const hrs = Math.floor(minsToNext / 60)
  const mins = minsToNext % 60
  const secs = 59 - now.getSeconds()

  const estTimeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} EST`

  return (
    <div className="my-4 rounded-xl border border-border bg-surface2 p-5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Clock className="w-4 h-4 text-accent" />
        <span className="text-sm font-semibold text-primary">Live Session Clock</span>
        <span className="ml-auto font-mono text-sm text-secondary">{estTimeStr}</span>
      </div>

      {/* Active killzone */}
      {activeKZ ? (
        <div className={`rounded-xl border p-4 ${activeKZ.bg}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wider ${activeKZ.color}`}>Active Now</p>
              <p className={`text-xl font-bold ${activeKZ.color} mt-0.5`}>{activeKZ.name} Killzone</p>
            </div>
            <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
          </div>
          <p className="text-xs text-secondary mt-2">
            Closes at {activeKZ.name === 'London' ? '05:00' : '11:00'} EST — {toMinutes(activeKZ.end === toMinutes(5,0) ? 5 : 11, 0) - currentMinutes} min remaining
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-secondary">Market Status</p>
          <p className="text-xl font-bold text-secondary mt-0.5">Off Hours</p>
          <p className="text-xs text-secondary/60 mt-1">No active killzone — mark your levels and prepare</p>
        </div>
      )}

      {/* Countdown to next */}
      {!activeKZ && (
        <div className="rounded-xl border border-border p-4">
          <p className="text-xs text-secondary uppercase tracking-wider mb-2">Next Killzone — {nextKZ.name}</p>
          <div className="flex gap-3">
            {[{ label: 'HRS', val: pad(hrs) }, { label: 'MIN', val: pad(mins) }, { label: 'SEC', val: pad(secs) }].map(({ label, val }) => (
              <div key={label} className="text-center flex-1 bg-surface2 rounded-lg py-2">
                <p className="text-2xl font-mono font-bold text-primary">{val}</p>
                <p className="text-xs text-secondary/60 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Killzone reference */}
      <div className="grid grid-cols-2 gap-3">
        {KILLZONES.map(kz => {
          const startH = Math.floor(kz.start / 60)
          const startM = kz.start % 60
          const endH = Math.floor(kz.end / 60)
          const endM = kz.end % 60
          const isActive = activeKZ?.name === kz.name
          return (
            <div key={kz.name} className={`rounded-lg border p-3 ${isActive ? kz.bg : 'border-border'}`}>
              <p className={`text-xs font-semibold ${isActive ? kz.color : 'text-secondary'}`}>{kz.name}</p>
              <p className={`text-sm font-mono font-bold mt-0.5 ${isActive ? kz.color : 'text-primary'}`}>
                {pad(startH)}:{pad(startM)}–{pad(endH)}:{pad(endM)} EST
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── TradingView Indicator Card ───────────────────────────────────────────────

export function TradingViewIndicatorCard() {
  return (
    <div className="my-4 rounded-xl border border-border bg-surface2 p-5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp className="w-4 h-4 text-accent" />
        <span className="text-sm font-semibold text-primary">Recommended TradingView Indicator</span>
      </div>

      <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-primary text-sm">ICT Killzones & Pivots — TFO</p>
            <p className="text-xs text-secondary mt-0.5">by TFO (public script, free)</p>
          </div>
          <a
            href="https://www.tradingview.com/script/nW5oGfdO-ICT-Killzones-Pivots-TFO/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-background rounded-lg text-xs font-semibold hover:bg-accent/90 transition-colors shrink-0"
          >
            <ExternalLink className="w-3 h-3" />
            Open in TradingView
          </a>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">What it shows</p>
          <div className="space-y-1.5">
            {[
              'Shaded London and NY killzone windows directly on your chart',
              'ICT pivot levels (previous day/week/month highs and lows)',
              'Session open lines (midnight open, Asia open, London open, NY open)',
              'Colour-coded sessions so you instantly know which window you\'re in',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                <p className="text-sm text-primary/90">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">How to add it</p>
          <div className="space-y-1">
            {[
              '1. Click "Open in TradingView" above',
              '2. Click the "Add to chart" button on the script page',
              '3. In indicator settings, set your local timezone',
              '4. Verify the shaded windows match London (02–05 EST) and NY (08:30–11 EST)',
            ].map((step, i) => (
              <p key={i} className="text-sm text-primary/90">{step}</p>
            ))}
          </div>
        </div>

        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
          <p className="text-xs text-warning font-semibold mb-0.5">Timezone check</p>
          <p className="text-xs text-secondary">Verify your timezone is set correctly in the indicator settings at the start of each week, especially after daylight saving time changes.</p>
        </div>
      </div>
    </div>
  )
}
