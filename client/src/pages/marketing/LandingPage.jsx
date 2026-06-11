import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  Brain,
  ClipboardCheck,
  LineChart,
  Wallet,
  GraduationCap,
  Check,
  TrendingUp,
  Sparkles,
} from 'lucide-react'
import { Button } from '../../components/shared/Button'
import { LogoIcon } from '../../components/shared/Logo'

const features = [
  {
    icon: BookOpen,
    title: 'Trade Journal',
    description:
      'Log every trade with the fields that actually matter: killzone, IFVG timeframe, confirmations, setup grade, and R:R achieved vs target.',
  },
  {
    icon: ClipboardCheck,
    title: 'Trade Checklist',
    description:
      'A three phase checklist (Pre Killzone, In Killzone, On Entry) that computes a live verdict: A+ Setup, B Setup, or DO NOT TRADE.',
  },
  {
    icon: Brain,
    title: 'Psychology System',
    description:
      'Baseline profile test, daily GO / CAUTION / NO GO checkins, and post session reflections that correlate mindset with P&L.',
  },
  {
    icon: LineChart,
    title: 'Real Analytics',
    description:
      'Equity curve with profit target and drawdown overlays, win rate by session/market/confirmation/grade, and weekly comparisons.',
  },
  {
    icon: Wallet,
    title: 'Prop Firm Tracker',
    description:
      'Built for Tradeify, Apex, and Topstep: trailing drawdown, consistency rule, daily loss limits, and payout projections.',
  },
  {
    icon: GraduationCap,
    title: 'The TradeEdge Method',
    description:
      'A complete 27 lesson curriculum covering market structure, killzones, the two confirmation rule, and the full trading process.',
  },
]

const freeFeatures = [
  '5 trades / month',
  'Trade checklist',
  'Psychology system',
  'Basic dashboard',
]

const proFeatures = [
  'Unlimited trade logging',
  'Full learning centre',
  'Full analytics suite',
  'Prop firm drawdown tracker',
  'Multiple accounts',
  'Screenshot uploads',
  'Weekly reviews',
  'CSV export',
  'Killzone reminders',
]

const propFirms = ['Tradeify', 'Apex', 'Topstep', 'FTMO', 'MyFundedFutures', 'Bulenox']

const stats = [
  { value: 27, suffix: '', label: 'Method lessons' },
  { value: 2, suffix: '', label: 'Confirmation rule' },
  { value: 40, suffix: '%', label: 'Max daily profit (consistency rule)' },
  { value: 20, suffix: '', label: 'Pro plan, £/mo', prefix: '£' },
]

/* ---------------------------------------------------------- */
/* Background                                                   */
/* ---------------------------------------------------------- */

function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <div
        className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-accent/20 blur-[120px] animate-blob-1"
      />
      <div
        className="absolute top-1/3 right-0 h-[450px] w-[450px] rounded-full bg-emerald-400/10 blur-[120px] animate-blob-2"
      />
      <div
        className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-accent/10 blur-[100px] animate-blob-1"
        style={{ animationDelay: '-9s' }}
      />
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #8888AA 1px, transparent 1px), linear-gradient(to bottom, #8888AA 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
    </div>
  )
}

/* ---------------------------------------------------------- */
/* Nav                                                          */
/* ---------------------------------------------------------- */

function NavBar() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <LogoIcon className="w-8 h-8" />
          <span className="text-lg font-bold tracking-tight text-primary">TradeEdge</span>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/fabians-trades">
            <Button variant="ghost" size="md">Fabian's Trades</Button>
          </Link>
          <Link to="/login">
            <Button variant="ghost" size="md">Sign in</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Get started
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  )
}

/* ---------------------------------------------------------- */
/* Hero                                                         */
/* ---------------------------------------------------------- */

const heroContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

const heroItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <motion.div
        variants={heroContainer}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-4xl px-4 sm:px-6 pt-24 pb-16 text-center"
      >
        <motion.div
          variants={heroItem}
          className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3.5 py-1.5 text-xs text-accent mb-6 shadow-[0_0_24px_-8px_rgba(0,200,150,0.6)]"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Built for funded NQ &amp; ES futures traders
        </motion.div>

        <motion.h1
          variants={heroItem}
          className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-primary leading-[1.05]"
        >
          Trade with discipline.
          <br />
          <span className="text-gradient animate-gradient bg-clip-text">
            Pass your evaluation.
          </span>
        </motion.h1>

        <motion.p
          variants={heroItem}
          className="mt-6 text-base sm:text-lg text-secondary max-w-2xl mx-auto"
        >
          TradeEdge combines a structured trade journal, a psychology &amp; discipline
          tracker, and the full ICT/SMC based TradeEdge Method into one tool, built
          specifically for prop firm traders on Tradeify, Apex, and Topstep.
        </motion.p>

        <motion.div
          variants={heroItem}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link to="/register" className="w-full sm:w-auto">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto shadow-[0_0_30px_-6px_rgba(0,200,150,0.6)]"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Start free
              </Button>
            </motion.div>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Sign in
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        <motion.p variants={heroItem} className="mt-4 text-xs text-secondary/70">
          Free tier available · No credit card required
        </motion.p>
      </motion.div>

      {/* Marquee of prop firms */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="relative border-y border-border/60 bg-surface/30 py-4 overflow-hidden"
      >
        <p className="text-center text-[10px] uppercase tracking-[0.2em] text-secondary/60 mb-3">
          Built around the rules of
        </p>
        <div className="relative flex overflow-hidden mask-fade">
          <div className="flex shrink-0 animate-marquee items-center gap-12 pr-12">
            {[...propFirms, ...propFirms].map((firm, i) => (
              <span
                key={`${firm}-${i}`}
                className="text-lg sm:text-xl font-bold text-secondary/40 whitespace-nowrap tracking-tight"
              >
                {firm}
              </span>
            ))}
          </div>
          <div className="flex shrink-0 animate-marquee items-center gap-12 pl-12" aria-hidden="true">
            {[...propFirms, ...propFirms].map((firm, i) => (
              <span
                key={`dup-${firm}-${i}`}
                className="text-lg sm:text-xl font-bold text-secondary/40 whitespace-nowrap tracking-tight"
              >
                {firm}
              </span>
            ))}
          </div>
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
      </motion.div>
    </section>
  )
}

/* ---------------------------------------------------------- */
/* Animated counter                                             */
/* ---------------------------------------------------------- */

function Counter({ value, suffix = '', prefix = '' }) {
  const motionVal = useMotionValue(0)
  const spring = useSpring(motionVal, { duration: 1500, bounce: 0 })
  const display = useTransform(spring, (v) => `${prefix}${Math.floor(v)}${suffix}`)
  const [text, setText] = useState(`${prefix}0${suffix}`)

  useEffect(() => {
    motionVal.set(value)
    const unsub = display.on('change', (v) => setText(v))
    return unsub
  }, [value])

  return <span>{text}</span>
}

function StatsBar() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-border bg-surface/60 backdrop-blur-sm px-4 py-5 text-center"
          >
            <p className="text-2xl sm:text-3xl font-bold font-mono text-accent">
              <Counter value={s.value} suffix={s.suffix} prefix={s.prefix} />
            </p>
            <p className="mt-1.5 text-xs text-secondary leading-snug">{s.label}</p>
          </div>
        ))}
      </motion.div>
    </section>
  )
}

/* ---------------------------------------------------------- */
/* Features                                                     */
/* ---------------------------------------------------------- */

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

function FeatureCard({ icon: Icon, title, description, index }) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-surface border border-border rounded-xl p-5 hover:border-accent/40 transition-colors overflow-hidden"
    >
      <div className="pointer-events-none absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-accent/10 via-transparent to-transparent" />
      <div className="relative w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-accent/15 transition-transform duration-300">
        <Icon className="w-5 h-5 text-accent" />
      </div>
      <h3 className="relative text-sm font-semibold text-primary mb-2">{title}</h3>
      <p className="relative text-sm text-secondary leading-relaxed">{description}</p>
    </motion.div>
  )
}

function Features() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-primary">
          Everything a funded trader needs
        </h2>
        <p className="mt-3 text-secondary max-w-xl mx-auto">
          One platform for journaling, discipline, psychology, and learning, purpose built
          around a single, fully articulated trading method.
        </p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        transition={{ staggerChildren: 0.08 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {features.map((f, i) => (
          <FeatureCard key={f.title} {...f} index={i} />
        ))}
      </motion.div>
    </section>
  )
}

/* ---------------------------------------------------------- */
/* Equity preview                                               */
/* ---------------------------------------------------------- */

function EquityPreview() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative bg-surface border border-border rounded-2xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center overflow-hidden"
      >
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl animate-glow-pulse" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs text-accent mb-4">
            <TrendingUp className="w-3.5 h-3.5" />
            GO: Ready to trade
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-3">
            Know exactly when you're ready to trade.
          </h2>
          <p className="text-secondary leading-relaxed">
            Every morning, TradeEdge runs a quick checkin across sleep, stress, focus,
            and financial pressure. If you're not in the right state, it tells you,
            before you take a trade you'll regret.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative bg-background border border-border rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-secondary uppercase tracking-wider">
              Equity Curve
            </span>
            <span className="text-xs text-accent font-mono">+$2,480.00</span>
          </div>
          <svg viewBox="0 0 320 120" className="w-full h-32">
            <defs>
              <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00C896" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#00C896" stopOpacity="0" />
              </linearGradient>
            </defs>
            <motion.path
              d="M0,90 L40,85 L80,70 L120,75 L160,55 L200,60 L240,35 L280,25 L320,15 L320,120 L0,120 Z"
              fill="url(#equityFill)"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.6 }}
            />
            <motion.polyline
              fill="none"
              stroke="#00C896"
              strokeWidth="2"
              points="0,90 40,85 80,70 120,75 160,55 200,60 240,35 280,25 320,15"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease: 'easeInOut', delay: 0.2 }}
            />
            <circle cx="320" cy="15" r="4" fill="#00C896">
              <animate attributeName="r" values="4;8;4" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </svg>
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
            <div>
              <p className="text-[10px] text-secondary uppercase tracking-wider">Win Rate</p>
              <p className="text-sm font-mono text-primary mt-1">64%</p>
            </div>
            <div>
              <p className="text-[10px] text-secondary uppercase tracking-wider">Avg R:R</p>
              <p className="text-sm font-mono text-primary mt-1">2.10R</p>
            </div>
            <div>
              <p className="text-[10px] text-secondary uppercase tracking-wider">Streak</p>
              <p className="text-sm font-mono text-accent mt-1">5 wins</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ---------------------------------------------------------- */
/* Pricing                                                       */
/* ---------------------------------------------------------- */

function PricingCard({ name, price, period, description, items, highlight, cta, index }) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className={
        'rounded-2xl border p-6 flex flex-col relative ' +
        (highlight
          ? 'border-accent/60 bg-accent/[0.04] shadow-[0_0_50px_-12px_rgba(0,200,150,0.5)]'
          : 'border-border bg-surface')
      }
    >
      {highlight && (
        <span className="absolute -top-3 left-6 bg-accent text-background text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg shadow-accent/30">
          Most Popular
        </span>
      )}
      <h3 className="text-lg font-bold text-primary">{name}</h3>
      <p className="text-sm text-secondary mt-1">{description}</p>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-3xl font-bold text-primary font-mono">{price}</span>
        {period && <span className="text-sm text-secondary">/{period}</span>}
      </div>
      <ul className="mt-6 space-y-2.5 flex-1">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-secondary">
            <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            {item}
          </li>
        ))}
      </ul>
      <Link to="/register" className="mt-6">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button variant={highlight ? 'primary' : 'secondary'} size="md" className="w-full">
            {cta}
          </Button>
        </motion.div>
      </Link>
    </motion.div>
  )
}

function Pricing() {
  return (
    <section className="mx-auto max-w-4xl px-4 sm:px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-primary">Simple pricing</h2>
        <p className="mt-3 text-secondary">Start free. Upgrade when you're ready to go all in.</p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
      >
        <PricingCard
          name="Free"
          price="£0"
          description="For traders just getting started"
          items={freeFeatures}
          cta="Create free account"
        />
        <PricingCard
          name="Pro"
          price="£20"
          period="month"
          description="For serious funded traders"
          items={proFeatures}
          highlight
          cta="Start Pro"
        />
      </motion.div>
    </section>
  )
}

/* ---------------------------------------------------------- */
/* Final CTA                                                     */
/* ---------------------------------------------------------- */

function FinalCTA() {
  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 via-surface to-surface px-6 sm:px-12 py-12 text-center"
      >
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-[500px] rounded-full bg-accent/20 blur-3xl animate-glow-pulse" />
        <h2 className="relative text-2xl sm:text-4xl font-bold text-primary">
          Stop guessing. Start tracking.
        </h2>
        <p className="relative mt-3 text-secondary max-w-xl mx-auto">
          Join TradeEdge today and bring discipline, structure, and data to every trade.
        </p>
        <div className="relative mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/register" className="w-full sm:w-auto">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto shadow-[0_0_30px_-6px_rgba(0,200,150,0.6)]"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Create your free account
              </Button>
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </section>
  )
}

/* ---------------------------------------------------------- */
/* Footer                                                        */
/* ---------------------------------------------------------- */

function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <LogoIcon className="w-6 h-6" />
          <span className="text-sm font-bold text-primary">TradeEdge</span>
        </div>
        <p className="text-xs text-secondary/70 text-center">
          © {new Date().getFullYear()} TradeEdge. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

/* ---------------------------------------------------------- */
/* Page                                                          */
/* ---------------------------------------------------------- */

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <AnimatedBackground />
      <NavBar />
      <Hero />
      <StatsBar />
      <Features />
      <EquityPreview />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  )
}
