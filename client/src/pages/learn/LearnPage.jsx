import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  GraduationCap, BookOpen, ChevronRight, CheckCircle2, AlertTriangle,
  Lightbulb, Target, Clock, ChevronDown, ChevronUp, Menu, X, Lock, Zap,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../../components/shared/Button'
import {
  MarketStructureDiagram,
  LiquidityDiagram,
  FVGDiagram,
  IFVGDiagram,
  SMTDivergenceDiagram,
  PremiumDiscountDiagram,
} from './diagrams'
import { NQRiskCalculator, SessionClock, TradingViewIndicatorCard } from './tools'

const LESSON_DIAGRAMS = {
  'p1-l1': MarketStructureDiagram,
  'p1-l2': LiquidityDiagram,
  'p2-l4': FVGDiagram,
  'p2-l5': IFVGDiagram,
  'p2-l6': SMTDivergenceDiagram,
  'p2-l7': PremiumDiscountDiagram,
}

const LESSON_TOOLS = {
  'p6-l1': NQRiskCalculator,
  'p6-l2': TradingViewIndicatorCard,
  'p6-l3': SessionClock,
}

// ─── Content ────────────────────────────────────────────────────────────────

const CURRICULUM = [
  {
    id: 'p1',
    part: 1,
    title: 'Market Foundations',
    subtitle: 'Knowledge needed for any trading strategy',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10 border-blue-400/20',
    dot: 'bg-blue-400',
    lessons: [
      {
        id: 'p1-l1',
        title: 'What is Market Structure',
        readTime: '6 min',
        sections: [
          {
            heading: 'Explanation',
            body: `Market structure is the backbone of all price analysis. It describes how price moves — forming a series of highs and lows that tell you whether buyers or sellers are currently in control.

**Uptrend (Bullish Structure):** Price creates Higher Highs (HH) and Higher Lows (HL). Each rally pushes above the previous peak, and each pullback holds above the previous trough. This tells you buyers are willing to pay more each time.

**Downtrend (Bearish Structure):** Price creates Lower Highs (LH) and Lower Lows (LL). Each rally fails below the previous high, and each drop pushes below the previous low. Sellers are in control.

**How to identify the current trend:**
1. Identify the most recent confirmed swing high and swing low on the 1D timeframe
2. Ask: is the latest high above or below the previous high?
3. Ask: is the latest low above or below the previous low?
4. If HH + HL → bullish. If LH + LL → bearish. If mixed → unclear.

**When market structure is unclear — don't trade.** If you cannot clearly identify whether structure is bullish or bearish, there is no trade. Unclear structure means the market is in consolidation or range. The TradeEdge Method only trades with structure, never against it and never in choppy conditions.`,
          },
          {
            heading: 'Why It Matters',
            body: `Every trade in the TradeEdge Method begins with market structure. Your daily bias — the single most important decision you make each session — is derived from the 1D structure.

If you skip structure analysis and trade into a counter-trend move, you are fighting the dominant order flow. Even with perfect entries, counter-trend trades have lower probability and smaller reward potential because the market will naturally reverse toward structure.

Trading with structure means the market is already moving in your direction. You are joining the move, not predicting a reversal.`,
          },
          {
            heading: 'Common Mistakes',
            body: `**Using the wrong timeframe.** Structure on a 1-minute chart is noise. The TradeEdge Method uses the 1D chart for structure and bias, not intraday charts.

**Forcing a bias.** If price is in consolidation between two clear levels, the structure is unclear. Many traders label one of those as HH or LL to justify a trade. This is a cognitive bias called confirmation bias. If you are unsure, write "Neutral" in your checklist and do not trade.

**Confusing a pullback with a structure break.** A healthy uptrend will pull back and form a Higher Low before continuing. Don't call this a bearish structure shift — wait for a Lower High to form after the pullback before considering a bias change.

**Not updating bias intraday.** Structure is dynamic. If NQ makes a new session high and then ES shows SMT divergence (does not confirm the new high), this is a potential structure shift signal — covered in the SMT Divergence lesson.`,
          },
          {
            heading: 'Quick Summary',
            body: `• Uptrend = HH + HL. Downtrend = LH + LL.\n• Set your bias on the 1D timeframe before every session.\n• If structure is unclear → Neutral bias → No trade.\n• Never trade against the dominant structure.\n• Update your bias if SMT divergence appears at a key level intraday.`,
          },
        ],
      },
      {
        id: 'p1-l2',
        title: 'What is Liquidity',
        readTime: '7 min',
        sections: [
          {
            heading: 'Explanation',
            body: `Liquidity is where unfilled orders rest in the market. Understanding liquidity is what separates ICT/SMC traders from retail traders who simply look at support and resistance levels.

**Where orders rest:**
- Stop-loss orders cluster just beyond obvious swing highs and lows
- Limit orders sit at previous session highs and lows
- Equal highs and equal lows are magnets — every trader can see them, so every trader places their stop just beyond them

**Buy Side Liquidity (BSL):** Rests above swing highs, equal highs, and previous session highs. When price sweeps BSL, it triggers buy stops, creating a surge of buying. Smart money sells into this buying pressure.

**Sell Side Liquidity (SSL):** Rests below swing lows, equal lows, and previous session lows. When price sweeps SSL, it triggers sell stops, creating a surge of selling. Smart money buys into this selling pressure.

**Equal highs and lows as liquidity pools:** When price makes two or three equal highs or lows, every retail trader sees this as strong resistance or support and places their stop just beyond it. This creates a dense pool of orders — a prime liquidity target.

**Previous session highs and lows:** The most obvious liquidity levels in the market. Yesterday's high has stops above it. Yesterday's low has stops below it. These become your primary trade targets every session.`,
          },
          {
            heading: 'Why It Matters',
            body: `In the TradeEdge Method, liquidity is your target — not your support/resistance. You do not buy at support and sell at resistance. You set your Take Profit at the opposing liquidity pool.

If you are long (buying), your target is Buy Side Liquidity above the market — the previous session high, equal highs, or a clear swing high where stops are resting.

If you are short (selling), your target is Sell Side Liquidity below the market — the previous session low, equal lows, or a clear swing low.

This is why your RR is often 1:2 or better. You are entering at a precise level (the IFVG) and targeting a pool of liquidity that price is naturally drawn to.`,
          },
          {
            heading: 'Common Mistakes',
            body: `**Exiting too early.** Traders often take profit before reaching the liquidity pool because price starts to slow down. Trust the target. Price is drawn to liquidity — let it arrive.

**Not marking liquidity levels before the session.** Your pre-killzone checklist item "Session highs and lows marked" exists for this reason. Mark yesterday's high and low, the current week's high and low, and any equal highs/lows visible on the 1D/4H chart before you sit down to trade.

**Confusing thin liquidity with strong liquidity.** A level that was tested once is not a strong liquidity pool. Equal highs that formed over multiple sessions, or a previous day high that was clearly respected, carry more orders and are stronger targets.`,
          },
          {
            heading: 'Quick Summary',
            body: `• BSL rests above highs. SSL rests below lows.\n• Equal highs and equal lows are prime liquidity targets.\n• Previous session highs and lows are your main daily targets.\n• Your TP in the TradeEdge Method is always set at a liquidity pool.\n• Mark all liquidity levels before every session — it's in the checklist.`,
          },
        ],
      },
      {
        id: 'p1-l3',
        title: 'Understanding Sessions',
        readTime: '5 min',
        sections: [
          {
            heading: 'Explanation',
            body: `The futures market runs nearly 24 hours, but not all hours are equal. Volume and volatility are concentrated into specific windows. Trading outside these windows is the number one reason retail traders take unnecessary losses.

**London Session (Killzone: 02:00–05:00 EST):**
- Highest volume period of the European day
- NQ and ES often establish the direction for the full day during this window
- Frequently sweeps the Asian session's range (highs or lows made overnight)
- Creates the FVGs and IFVGs that set up the NY session

**New York Session (Killzone: 08:30–11:00 EST):**
- Highest absolute volume in futures markets
- Major news releases hit during this window (NFP, CPI, FOMC)
- Often continues or reverses the London move
- The 09:30 NYSE open creates significant displacement moves

**Why volume matters:** Volume creates displacement. Displacement creates FVGs. FVGs create IFVGs. Without volume, price moves are weak, wicks are long, and candle bodies don't close with conviction. The TradeEdge Method requires clean body closes — and those only happen with volume.

**What happens between sessions:** Between 05:00–08:30 EST (London close to NY open) and after 11:00 EST, volume drops dramatically. Price often moves sideways, creates fake moves, or chops without direction. Many traders take losses in these dead zones because the setups look identical to killzone setups but have no follow-through.`,
          },
          {
            heading: 'Why It Matters',
            body: `The TradeEdge Method is entirely killzone-based. If the London killzone window closes without a setup, you do not trade London. You wait for NY. If NY closes without a setup, you do not trade that day. You journal "No trade — no setup" and move on.

This constraint is a feature, not a limitation. It filters out the 70% of the trading day where conditions do not favour the strategy. Most retail traders give back their killzone profits by trading the dead zones out of boredom or FOMO.`,
          },
          {
            heading: 'Common Mistakes',
            body: `**Trading after the killzone window closes.** The setup may look clean at 11:30 EST, but without killzone volume, the body close won't hold and the follow-through won't arrive.

**Ignoring the Asian range.** The overnight Asian session creates a range (high and low). London often sweeps one side of this range to grab liquidity before moving in the true direction. Marking the Asian range helps you anticipate the London sweep direction.

**Trading through major news.** High-impact news events (NFP, CPI, FOMC) can spike volatility in unpredictable ways. The checklist requires you to check the economic calendar before every session. If a major release falls within 30 minutes of your killzone, consider reducing size or skipping entirely.`,
          },
          {
            heading: 'Quick Summary',
            body: `• London Killzone: 02:00–05:00 EST\n• NY Killzone: 08:30–11:00 EST\n• Only trade within these windows — never outside them.\n• Volume creates displacement which creates the setups.\n• Mark the Asian session range before London opens.\n• Check the calendar — no high-impact news near your killzone.`,
          },
        ],
      },
      {
        id: 'p1-l4',
        title: 'Reading Price Action',
        readTime: '6 min',
        sections: [
          {
            heading: 'Explanation',
            body: `Price action is the story of supply and demand told through candles. The TradeEdge Method focuses on two specific price action signals: displacement and the candle body close.

**What displacement looks like:**
Displacement is a strong, fast move in one direction with minimal pullback. Characteristics:
- Large candle bodies (body is 70%+ of the candle's range)
- Consecutive candles in the same direction without opposing candles
- Creates a Fair Value Gap (FVG) in its wake
- Moves through previous swing points without slowing

Displacement is the engine of the TradeEdge setup. When displacement occurs through an FVG (inverting it into an IFVG), that's your trigger zone.

**Weak moves — what to avoid:**
- Small bodies with large wicks (indecision)
- Candles that close in the middle of their range
- Price moving sideways with no directional intent
- Moves that don't create FVGs or close through key levels

**Strong candle bodies vs wicks:**
The TradeEdge Method is explicit: only a clean candle BODY close through an FVG counts as an inversion. Wicks piercing the gap do not count. This single rule eliminates dozens of false signals per week.

**When price is delivering with intent:**
- Multiple consecutive candles in the same colour
- Each candle's open is near the previous candle's close
- Bodies are at least 60% of the total range
- Volume is visibly higher than the surrounding candles

**When to stay out:**
- Mixed candle colours (alternating red/green)
- Long upper and lower wicks on the same candle
- Price spinning around a level without clean rejection
- Pre-news / post-news volatility spikes`,
          },
          {
            heading: 'Why It Matters',
            body: `The entire TradeEdge entry trigger — the IFVG with a clean body close — is a price action concept. If you cannot read whether a move has conviction, you will take low-quality IFVG signals that fail immediately after entry.

Strong body closes through IFVGs mean institutional order flow is driving the move. Wick pierces mean retail traders are probing the level without conviction from larger participants.`,
          },
          {
            heading: 'Common Mistakes',
            body: `**Accepting wick closes as body closes.** This is the most common error in TradeEdge entries. If the candle closes with a wick through the IFVG and the body does not fully close through, wait for the next candle.

**Chasing after displacement.** If you miss the IFVG close and price has moved 30+ points away from the entry zone, the trade is over. Do not chase. Another setup will come.

**Ignoring context.** A clean body close on a 1-minute chart during dead hours is not the same as a clean body close during the NY killzone. Context — time of day, volume, and alignment with higher timeframe structure — determines whether the signal has institutional backing.`,
          },
          {
            heading: 'Quick Summary',
            body: `• Displacement = fast, decisive moves with large candle bodies.\n• Only a clean candle BODY close through an IFVG counts — never a wick.\n• Strong delivery: bodies 70%+ of candle range, consecutive same-colour candles.\n• Weak delivery: wicks, mixed colours, choppy action → stay out.\n• Context matters: killzone + structure alignment = valid signal.`,
          },
        ],
      },
      {
        id: 'p1-l5',
        title: 'Risk Management Fundamentals',
        readTime: '8 min',
        sections: [
          {
            heading: 'Explanation',
            body: `Risk management is the only variable fully within your control. Market direction is not. Entry timing is not. But how much you risk on each trade, and how you manage the position, is entirely yours.

**Risk-Reward Ratio (RR):**
RR describes how much reward you target for every dollar you risk. A 1:2 RR means if you risk $100, your target is $200.

The TradeEdge Method requires a minimum 1:1 RR and recommends 1:1.5 or better. Here's why this matters mathematically:

| Win Rate | Minimum RR to be profitable |
|---|---|
| 40% | 1:1.5 |
| 50% | 1:1 |
| 60% | 1:0.67 |

At a 50% win rate with 1:1.5 RR:
- 10 trades: 5 wins × $150 = $750, 5 losses × $100 = $500 → Net: +$250

**Why win rate alone means nothing:**
A trader with 70% win rate but 1:0.3 RR (average) is losing money. A trader with 45% win rate but 1:2.5 RR is profitable. Always calculate both.

**Position sizing basics:**
On a prop firm account, standard guidance is 1–2% risk per trade. For a $50,000 account:
- 1% risk = $500 per trade
- If your SL is 20 points on NQ (1 point = $20 for micros): $500 / (20 × $2) = 12.5 micros → 12 MNQ contracts
- If using minis (1 point = $20 for ES, $20 for NQ minis): $500 / (20 × $20) = 1.25 → 1 NQ contract

**How drawdown works on funded accounts:**
Prop firms typically use one of:
- **Trailing drawdown (EOD):** Drawdown floor rises with your highest end-of-day balance. Never violated by intraday swings.
- **Static drawdown:** Fixed from starting balance. Never changes.
- **Daily loss limit:** Maximum you can lose in a single day, resets daily.

**The maths behind consistency:**
The 40% consistency rule (common at Tradeify) means no single day's profit should exceed 40% of your total profit to date. This prevents "lottery day" trading where one big win masks a poor overall performance. It forces consistent, repeatable execution.`,
          },
          {
            heading: 'Why It Matters',
            body: `Funded accounts have hard rules. Violate the drawdown and the account is closed, immediately. No exceptions. Risk management is not a suggestion — it is survival.

Even beyond prop firm rules, proper position sizing protects your psychological state. A trader risking 5% per trade will blow their account on a 4-trade losing streak. A trader risking 1% can withstand 20 consecutive losses and still have 82% of their capital.`,
          },
          {
            heading: 'Common Mistakes',
            body: `**Increasing size after a win streak.** This is recency bias. Your edge is statistical and requires a large sample size. A 5-trade win streak does not change your long-term probability.

**Decreasing size after a loss to "play it safe."** If your setup is valid, your size should be consistent. Reducing size after losses means you recover slowly even when your edge is working.

**Forgetting the daily loss limit.** It is easy to focus on the drawdown floor and forget the daily loss limit. The checklist auto-checks this from your account tracker — make sure your account is set up correctly.`,
          },
          {
            heading: 'Quick Summary',
            body: `• Minimum RR: 1:1. Recommended: 1:1.5 or better.\n• Position size based on SL distance and max $ risk per trade.\n• 1–2% risk per trade is standard for funded accounts.\n• Know your drawdown type: trailing EOD, static, or daily loss limit.\n• Consistency rule: no single day > 40% of total profit to date.`,
          },
        ],
      },
    ],
  },
  {
    id: 'p2',
    part: 2,
    title: 'The TradeEdge Method',
    subtitle: 'The complete strategy',
    color: 'text-accent',
    bg: 'bg-accent/10 border-accent/20',
    dot: 'bg-accent',
    lessons: [
      {
        id: 'p2-l1',
        title: 'Daily Bias',
        readTime: '7 min',
        sections: [
          {
            heading: 'Explanation',
            body: `Daily bias is the single most important preparation step in the TradeEdge Method. Before every session, you determine whether you are looking for long (buy) trades or short (sell) trades — or whether conditions are unclear and you should not trade at all.

**What daily bias means:**
Your bias is your directional conviction for the trading day, derived from the 1D timeframe market structure. It is not a prediction — it is an alignment. You align yourself with the dominant order flow.

**How to set it on the 1D timeframe:**
1. Open a 1D chart of NQ or ES
2. Identify the most recent swing high and swing low
3. Determine whether structure is in HH/HL (bullish) or LH/LL (bearish) formation
4. Look at where the nearest liquidity pools are:
   - If bullish: BSL (above recent highs) is the likely target → look for longs
   - If bearish: SSL (below recent lows) is the likely target → look for shorts
5. Note the premium/discount position of current price relative to the recent range
6. Set bias: Bullish, Bearish, or Neutral (unclear)

**Bullish bias days:**
- 1D structure is in uptrend (HH/HL)
- Price is currently at or near a discount (below 50% of recent range)
- A BSL pool (previous high, equal highs) sits above price as a logical target
- You are looking for long entries only during killzones

**Bearish bias days:**
- 1D structure is in downtrend (LH/LL)
- Price is currently at or near a premium (above 50% of recent range)
- An SSL pool (previous low, equal lows) sits below price as a logical target
- You are looking for short entries only during killzones

**When bias changes during a session — SMT:**
Your bias is set pre-session but can update intraday. If price makes a new session high but the correlated index (NQ vs ES) does NOT confirm the new high, SMT divergence has occurred. This is a potential bias shift signal. Review the daily structure — if the new high creates a Lower High, bias may be shifting to bearish.

**What to do when bias is unclear:**
Write "Neutral" in your daily bias checklist field. Do not force a direction. Wait for the next day when structure becomes clearer. Trading with unclear bias is gambling, not strategy.`,
          },
          {
            heading: 'Why It Matters',
            body: `Every checklist item ties back to bias. "Both confirmations align with daily bias" is a MUST check. If your confirmation signals are pointing in the opposite direction to your daily bias, you do not have a valid setup — regardless of how clean the IFVG looks.

Bias gives you a filter. On a bullish bias day, you ignore every short signal, no matter how tempting. This alone eliminates the majority of low-quality trades most developing traders take.`,
          },
          {
            heading: 'Common Mistakes',
            body: `**Setting bias on a 15-minute chart.** The 1D chart establishes macro structure. Lower timeframe structure is context for entry, not for bias.

**Ignoring a Neutral bias signal and trading anyway.** "I think it might go up, so I'll go long." This is the exact thinking the checklist is designed to prevent.

**Not updating bias after an SMT divergence signal.** If SMT fires at a key level midway through a session and changes the structure, continuing with the original bias is trading against the updated flow.`,
          },
          {
            heading: 'Quick Summary',
            body: `• Set daily bias on the 1D timeframe before every session.\n• Bullish = HH/HL structure + price at discount + BSL above.\n• Bearish = LH/LL structure + price at premium + SSL below.\n• Neutral = unclear structure → no trade today.\n• Bias can update intraday if SMT divergence signals a structure shift.\n• All confirmations must align with your daily bias.`,
          },
        ],
      },
      {
        id: 'p2-l2',
        title: 'Buy Side & Sell Side Liquidity',
        readTime: '6 min',
        sections: [
          {
            heading: 'Explanation',
            body: `Liquidity is not just a concept — it is your trade target. In the TradeEdge Method, your Take Profit is always set at a liquidity pool. This section explains exactly how to identify and use BSL and SSL in your daily setups.

**Identifying Buy Side Liquidity (BSL):**
BSL rests above price. Look for:
- Previous day's high (most reliable)
- Previous week's high
- Equal highs (two or more highs at the same price level)
- Swing highs from the current session that formed an obvious cluster
- Round number levels (NQ: multiples of 500 or 1000)

On a bullish bias day, your TP target is the nearest BSL above the entry zone.

**Identifying Sell Side Liquidity (SSL):**
SSL rests below price. Look for:
- Previous day's low
- Previous week's low
- Equal lows
- Session lows from earlier in the day
- Round number supports (NQ: multiples of 500 or 1000)

On a bearish bias day, your TP target is the nearest SSL below the entry zone.

**Previous day highs and lows as key liquidity:**
These are the most consistent liquidity targets because:
1. Every participant in the market can see them
2. Retail traders place stops just beyond them
3. The market is programmed (algorithmically) to sweep these levels to fill institutional orders

**Equal highs and lows:**
When you see two or three equal highs, every retail trader has placed their stop just above that level (thinking "if it breaks this resistance, I'm wrong"). This creates a dense cluster of stop orders. Price is drawn to this like a magnet.

**How liquidity becomes your target:**
The trade structure is: Enter near an IFVG in a discount (for longs) or premium (for shorts) → Target the opposing liquidity pool. The liquidity pool is not the entry — it is the destination.`,
          },
          {
            heading: 'Why It Matters',
            body: `Setting your TP at a liquidity pool rather than a random level based on RR mathematics gives your trades a natural endpoint. Price is drawn to liquidity because that is where orders exist. Your TP is not arbitrary — it is where the market wants to go.

This is what makes 1:2 and 1:3 RR achievable. You are not guessing a target; you are identifying where the market is programmed to deliver.`,
          },
          {
            heading: 'Common Mistakes',
            body: `**Taking profit before the liquidity pool.** This is the most common expensive mistake. Price sweeps SSL at 08:47, you panic out at 08:44 when it slows down, and it hits the level at 08:48. You left 60% of the trade on the table.

**Missing equal highs/lows on the chart.** These need to be drawn before the session. If you don't mark them pre-killzone, you will miss them in real-time when the session is moving fast.

**Targeting the wrong timeframe liquidity.** A 1-minute equal high is not the same as a daily high. Match your liquidity target to your trade's timeframe and the bias set on the 1D.`,
          },
          {
            heading: 'Quick Summary',
            body: `• BSL: above price — previous day high, equal highs, session highs.\n• SSL: below price — previous day low, equal lows, session lows.\n• Your TP is always set at the opposing liquidity pool.\n• Mark all liquidity levels before the killzone opens.\n• Equal highs/lows are high-probability targets — mark them carefully.`,
          },
        ],
      },
      {
        id: 'p2-l3',
        title: 'Killzone Windows',
        readTime: '5 min',
        sections: [
          {
            heading: 'Explanation',
            body: `The killzone is not just a time window — it is a filter. The TradeEdge Method only permits trades taken during active killzone windows. Outside these windows, your job is to watch, mark levels, and wait.

**London Killzone: 02:00–05:00 EST (07:00–10:00 GMT)**

London characteristics:
- European institutional traders are active
- Overnight Asian range is typically swept during this window
- Price makes a decisive move toward the session's daily target
- Often creates the day's cleanest IFVG setups on the 1M/2M charts
- Best setups: 02:00–03:30 EST (first 90 minutes)

**NY Killzone: 08:30–11:00 EST (13:30–16:00 GMT)**

NY characteristics:
- US institutional traders + overlap with European close
- Highest absolute volume of the day
- 09:30 NYSE open creates spike-and-reverse patterns
- Economic data releases often occur at 08:30 EST
- Best setups: 08:30–10:00 EST (first 90 minutes)

**By timezone for reference:**
| Killzone | EST | GMT | CST | PST |
|---|---|---|---|---|
| London | 02:00–05:00 | 07:00–10:00 | 01:00–04:00 | 23:00–02:00 |
| New York | 08:30–11:00 | 13:30–16:00 | 07:30–10:00 | 05:30–08:00 |

**Why these windows only:**
Institutional volume is concentrated into these windows. The algorithms that create displacement and FVGs operate primarily during these periods. Outside killzones, the market is either resting (overnight) or losing volume (midday). The setups look similar but fail because there is no institutional backing.

**What to do outside killzones:**
- Mark session highs and lows for the next killzone
- Review the checklist for the next session
- Log your trade if you took one in the previous killzone
- Read the learning section
- Step away from the charts entirely`,
          },
          {
            heading: 'Why It Matters',
            body: `The killzone constraint is one of the most powerful rules in the TradeEdge Method. Traders who remove it — "just this once, the setup looks great at 1pm" — consistently report more losses and more emotional trading in the non-killzone hours.

The reason: outside killzones, your brain pattern-matches to valid setups it has seen before, but the context (volume, institutional participation) is absent. The setup fires but fails. You take a loss. You try again. You take another loss. You are now chasing in a dead market.`,
          },
          {
            heading: 'Common Mistakes',
            body: `**"The setup looks identical to a killzone setup."** It always does. That is the point. Volume is invisible to the eye — you cannot see it on a price chart without a volume indicator. Trust the time filter.

**Trading the opening hour as NY killzone when news hits at 08:30.** If a high-impact news event (NFP, CPI, FOMC) hits at 08:30, the initial 5–10 minute spike is manufactured volatility. Wait for it to settle and for the real move to begin. Or skip entirely and wait for NY's second leg (09:30+ post-NYSE open).

**Not accounting for timezone when travelling or during daylight saving time changes.** Set your TradingView killzone indicator to your local timezone and double-check it at the start of each week.`,
          },
          {
            heading: 'Quick Summary',
            body: `• London: 02:00–05:00 EST (best: first 90 min)\n• NY: 08:30–11:00 EST (best: first 90 min)\n• Only take trades during these windows — no exceptions.\n• Outside killzones: mark levels, review, rest.\n• Beware major news at 08:30 EST — consider waiting for the 09:30 open.\n• Verify your timezone conversion at the start of each week.`,
          },
        ],
      },
      {
        id: 'p2-l4',
        title: 'Fair Value Gap (FVG)',
        readTime: '7 min',
        sections: [
          {
            heading: 'Explanation',
            body: `A Fair Value Gap (FVG) is a three-candle pattern that identifies an area where price moved so quickly that no two-sided trading occurred. It is an inefficiency — a gap in the market that the algorithm is programmed to revisit.

**The three-candle pattern:**
1. Candle 1: any candle
2. Candle 2: a strong displacement candle (large body)
3. Candle 3: any candle

The FVG is the gap between the high of Candle 1 and the low of Candle 3 (for bullish FVGs) or the low of Candle 1 and the high of Candle 3 (for bearish FVGs).

- **Bullish FVG:** Gap between Candle 1's high and Candle 3's low. Price displaced upward through this zone. The FVG sits below the displacement.
- **Bearish FVG:** Gap between Candle 1's low and Candle 3's high. Price displaced downward through this zone. The FVG sits above the displacement.

**Valid vs invalid FVG:**
- Valid: Created during a displacement move (large-body candles, high volume)
- Valid: The gap is clean — Candle 3's wick does not completely fill the gap
- Invalid: Created during low-volume, choppy price action
- Invalid: Candle 3's body completely closes through the gap (this inverts it — see IFVG lesson)
- Invalid: The FVG is from a previous session that has already been tested multiple times

**FVG as a target (draw on liquidity):**
Before a sweep of BSL or SSL, price often retraces to fill an FVG it created during the initial displacement. This retracement to the FVG, before continuing to the liquidity target, is a classic TradeEdge setup entry zone.

**FVG as a confirmation:**
When you need a second confirmation alongside SMT or a liquidity sweep, an FVG aligning with your trade direction can serve as Confirmation 2. This means an FVG from a higher timeframe (15M or 1H) acts as a zone of interest that supports your trade thesis.`,
          },
          {
            heading: 'Why It Matters',
            body: `FVGs are the foundation of the IFVG entry. Every IFVG was once an FVG. Understanding how an FVG is created, validated, and then inverted is essential before the IFVG lesson makes sense.

FVGs also serve as confirmation signals in your checklist. If you need a second confirmation and an FVG from the current session aligns with your directional bias, that is valid Confirmation 2 = "FVG Alignment."`,
          },
          {
            heading: 'Common Mistakes',
            body: `**Drawing FVGs on low-volume candles.** An FVG is only meaningful if it was created by institutional displacement. If the three candles are small and the volume bar is thin, the FVG is weak and unreliable.

**Trading every FVG as an entry.** FVGs are zones of interest, not automatic entries. The TradeEdge entry trigger is specifically the IFVG — an FVG that has been inverted by a subsequent displacement.

**Not distinguishing timeframe context.** A 1-minute FVG inside a valid 15-minute FVG is a more powerful setup than a standalone 1-minute FVG.`,
          },
          {
            heading: 'Quick Summary',
            body: `• FVG = three-candle pattern; gap between C1 and C3.\n• Bullish FVG: gap below displacement. Bearish FVG: gap above displacement.\n• Valid FVG: created by displacement with volume.\n• FVG as target: price often fills FVG before continuing.\n• FVG as confirmation: higher-timeframe FVG alignment = Confirmation 2.\n• IFVG = inverted FVG = your primary entry trigger (next lesson).`,
          },
        ],
      },
      {
        id: 'p2-l5',
        title: 'Inversion Fair Value Gap (IFVG)',
        readTime: '8 min',
        sections: [
          {
            heading: 'Explanation',
            body: `The Inversion Fair Value Gap (IFVG) is the primary entry trigger in the TradeEdge Method. It is the most specific, highest-conviction signal in the strategy, and it requires all other conditions to be met before it is acted upon.

**What makes an FVG invert:**
When price displaces through a previously-created FVG — closing BODY through the gap — the FVG becomes an IFVG. The area that was previously support (in a bullish FVG) becomes resistance, and vice versa.

For a bullish IFVG:
1. Price initially creates a bullish FVG (displacement upward)
2. Price later pulls back and a strong candle BODY closes below the bottom of the FVG
3. The FVG is now "inverted" — it has flipped from support to resistance
4. A subsequent downward displacement that creates this inversion, then price reversing back up to "retest" the IFVG from below, is your entry zone

For a bearish IFVG:
1. Price initially creates a bearish FVG (displacement downward)
2. Price later rallies and a strong candle BODY closes above the top of the FVG
3. The FVG is inverted — flipped from resistance to support
4. Price pulling back down to retest the IFVG from above is your entry zone

**The clean candle BODY close rule — the most important rule in the strategy:**
A candle's WICK entering an FVG does not constitute an inversion. A candle's BODY must fully close through the FVG level. This is non-negotiable.

Why: A wick represents price probing a level. A body close represents price accepting value at that level. Institutional order flow leaves evidence through body closes, not through wicks that immediately pull back.

**Why wicks don't count:**
If only the wick of a candle enters the FVG zone and the body closes outside it, the market is not accepting value there. It is being rejected. An IFVG formed by a wick close will fail far more often than one formed by a body close. This single rule eliminates most of the low-quality signals beginners take.

**IFVG as your primary entry trigger:**
When price returns to an IFVG (from the appropriate side, consistent with your bias and confirmations), that is your entry zone. You enter as price enters the IFVG, with your SL placed as described in the Stop Loss lesson.

**Timeframes for IFVG:**
The checklist specifies 1min or 2min timeframe. These micro-timeframe IFVGs catch the precise displacement that signals institutional order flow entering during the killzone. 5-minute and 15-minute IFVGs also exist but are typically used for context, not entry.`,
          },
          {
            heading: 'Why It Matters',
            body: `The IFVG is what makes TradeEdge entries precise. Instead of "buy when price pulls back to support," you have a specific, measurable, repeatable condition: a candle body must close through an FVG to create an IFVG, and price must return to that IFVG zone during a killzone, with two confirmations aligned with bias.

This specificity is your edge. Vague entries lead to vague results. The IFVG gives you a defined entry zone that either shows up or doesn't.`,
          },
          {
            heading: 'Common Mistakes',
            body: `**Accepting wick closes as body closes.** Stated again because it is the most common error. If you are unsure whether the body closed through the FVG, it didn't. Only act when it is clear.

**Entering before price returns to the IFVG.** After the inversion, wait for price to pull back to the IFVG zone. Don't anticipate — let the market come to you.

**Using IFVG from outside the current killzone.** An IFVG from last week's session is old news. The market has moved on. Look for IFVGs created within the current session's displacement moves.

**Ignoring the timeframe specified.** The TradeEdge Method uses 1min/2min IFVGs for entries. Higher timeframe IFVGs provide context but your precise entry comes from the micro-timeframe.`,
          },
          {
            heading: 'Quick Summary',
            body: `• IFVG = an FVG that has been inverted by a body close through it.\n• Clean candle BODY close rule: body must close through the FVG. Wicks don't count.\n• Entry: when price returns to the IFVG zone from the appropriate side.\n• Use 1min or 2min charts for IFVG identification.\n• IFVG must align with daily bias + 2 confirmations to be a valid trade.\n• IFVG from the current session only — old IFVGs have diminishing reliability.`,
          },
        ],
      },
      {
        id: 'p2-l5b',
        title: 'Liquidity Fair Value Gap (LFVG)',
        readTime: '6 min',
        sections: [
          {
            heading: 'Explanation',
            body: `A Liquidity Fair Value Gap (LFVG) is one of the highest-conviction entry zones in the TradeEdge Method. It forms when a liquidity sweep and a Fair Value Gap occur at the exact same price level — creating a dual-confluence zone that institutional traders actively defend.

**How an LFVG forms:**
1. Price sweeps a BSL or SSL level (takes out stop orders above a high or below a low)
2. The sweeping candle is large and displaces rapidly — leaving a Fair Value Gap in its wake
3. The gap sits directly at or just beyond the liquidity level that was swept
4. This means the zone has two reasons to hold on a retest: the swept liquidity AND the imbalance

**Bullish LFVG (for longs):**
- Price drops below a swing low (SSL sweep)
- The sweeping candle leaves a bullish FVG at the sweep level
- Price then reverses aggressively upward
- On a retracement back to the FVG, you are retesting both the swept SSL and the FVG simultaneously
- Entry: as price enters the FVG zone from above on the retracement

**Bearish LFVG (for shorts):**
- Price pushes above a swing high (BSL sweep)
- The sweeping candle leaves a bearish FVG at the sweep level
- Price reverses aggressively downward
- On a retracement back to the FVG, you are retesting both the swept BSL and the FVG simultaneously
- Entry: as price enters the FVG zone from below on the retracement

**Why the LFVG is stronger than a standalone FVG:**
A regular FVG is an imbalance — price wants to fill it. An LFVG has that same imbalance PLUS a liquidity event at the same location. The stop orders that were triggered by the sweep have now provided exit liquidity for institutional sellers (bearish) or buyers (bullish). The LFVG level is where institutions transacted — making it a magnet for price on any retracement.

**LFVG vs IFVG:**
- IFVG: An FVG that has been fully inverted (a candle body closed through it) — used as the primary entry trigger
- LFVG: An FVG formed AT a liquidity sweep — used as both an entry zone AND a confirmation of the sweep's significance
- An LFVG can become an IFVG if price subsequently closes a body back through it`,
          },
          {
            heading: 'Why It Matters',
            body: `The LFVG is one of the cleanest setups in the TradeEdge system because it resolves the "is this sweep real?" question. When price sweeps liquidity AND leaves an FVG at the sweep point, you have structural evidence — not just price reaching a level, but price creating an imbalance there.

This is what separates random sweeps (which happen constantly) from meaningful ones. A sweep with no FVG may be noise. A sweep that creates an LFVG has institutional fingerprints on it.`,
          },
          {
            heading: 'Common Mistakes',
            body: `**Confusing an LFVG with any FVG near a swing level.** The FVG must be created BY the sweep candle — not a pre-existing FVG that happens to be near a swing. Timing is everything.

**Entering before the retracement.** After the LFVG forms, wait for price to pull back to the gap zone. Do not chase the move away from the LFVG.

**Using the LFVG without confirming the body-close rule.** The same rule applies as with all FVGs — if only a wick enters the LFVG on the retracement (rather than a body close), it is a weaker entry. Wait for body confirmation where possible.

**Not counting the liquidity sweep as a confirmation.** If an LFVG is your entry zone, the sweep that created it is Confirmation 1 (Liquidity Sweep). You still need Confirmation 2.`,
          },
          {
            heading: 'Quick Summary',
            body: `• LFVG = FVG created at the exact point of a liquidity sweep.\n• Stronger than a standalone FVG because it has two confluences: swept liquidity + imbalance.\n• Bullish LFVG: SSL sweep → FVG left at low → retest from above = entry.\n• Bearish LFVG: BSL sweep → FVG left at high → retest from below = entry.\n• The sweep itself counts as Confirmation 1 — still need a second confirmation.\n• The LFVG can become an IFVG if price body-closes back through the gap.`,
          },
        ],
      },
      {
        id: 'p2-l6',
        title: 'SMT Divergence',
        readTime: '7 min',
        sections: [
          {
            heading: 'Explanation',
            body: `SMT (Smart Money Tool) Divergence is one of the three valid confirmations in the TradeEdge Method. It is based on the correlated relationship between NQ (Nasdaq futures) and ES (S&P 500 futures).

**What SMT divergence is:**
NQ and ES are highly correlated indices. Under normal conditions, if NQ makes a new high, ES also makes a new high. If NQ makes a new low, ES also makes a new low.

SMT divergence occurs when one index confirms a new extreme (high or low) but the other does not.

**Bearish SMT (looking for shorts):**
- NQ makes a new session high
- ES does NOT make a new session high (it makes a lower high)
- This divergence signals that the new high in NQ is not supported by the broader market
- It is a sign of internal weakness — institutions may be distributing at this level

**Bullish SMT (looking for longs):**
- NQ makes a new session low
- ES does NOT make a new session low (it makes a higher low)
- The new low in NQ is not confirmed by ES
- Signs of internal strength — institutions may be accumulating at this level

**The NQ vs ES relationship:**
NQ is typically the more volatile index and leads moves. ES follows. When ES diverges from NQ at key liquidity levels (session highs/lows, equal highs/lows), it signals that the move in NQ is a liquidity sweep — not a genuine breakout.

**SMT at session highs/lows as confirmation:**
The most powerful SMT signals occur at session highs (for bearish divergence) and session lows (for bullish divergence). This is where BSL and SSL rests. When price sweeps that liquidity and SMT fires simultaneously, you have a liquidity sweep + SMT = two confirmations right there.

**When SMT signals a bias change:**
If SMT fires at a key level that also creates a new Lower High on the daily chart, this can signal a bias shift from bullish to bearish. Update your daily bias on the checklist and look for shorts in the next killzone.`,
          },
          {
            heading: 'Why It Matters',
            body: `SMT is one of the cleanest institutional signals in the strategy. When NQ sweeps a high and ES fails to confirm, you are watching a liquidity raid in real time. The institutions used NQ's move to trigger all the BSL stop orders, and now they will reverse the market.

Combined with an IFVG entry and a second confirmation, SMT divergence at a liquidity level gives you extremely high-probability setups.`,
          },
          {
            heading: 'Common Mistakes',
            body: `**Looking at SMT on the wrong timeframe.** SMT divergence is most reliable on the 1-minute chart during a killzone. Higher timeframe SMT (1H, 4H) is also valid but is more relevant for swing trade context.

**Calling SMT on a trivial price difference.** If NQ makes a high at 19,482 and ES makes a high at 5,842.5 (a trivially small difference from the previous high), this is not meaningful SMT. The divergence should be clear — one makes a new extreme, the other clearly does not.

**Using SMT as the only reason for a trade.** SMT is a confirmation, not a standalone entry signal. You still need an IFVG entry trigger and a second confirmation.`,
          },
          {
            heading: 'Quick Summary',
            body: `• SMT = NQ makes new extreme, ES does NOT (or vice versa).\n• Bearish SMT: NQ new high, ES lower high → short signal.\n• Bullish SMT: NQ new low, ES higher low → long signal.\n• Most powerful at session highs/lows (BSL/SSL zones).\n• SMT at a key level = one of your two required confirmations.\n• Can signal an intraday bias change if it creates a new LH or HL on the daily.`,
          },
        ],
      },
      {
        id: 'p2-l7',
        title: 'Premium & Discount Zones',
        readTime: '5 min',
        sections: [
          {
            heading: 'Explanation',
            body: `Premium and discount zones are price ranges defined by the 50% midpoint of a swing range. This concept filters out low-probability trades where you would be buying too high or selling too low.

**What premium and discount mean:**
Define the most recent significant swing range: from the most recent swing low to the most recent swing high (for the current session or day).

- The 50% level (equilibrium) divides the range
- **Discount:** Below the 50% level. Price is "on sale."
- **Premium:** Above the 50% level. Price is "expensive."

**The rule:**
- On a bullish bias day: only look for long entries when price is in the discount zone (below 50%)
- On a bearish bias day: only look for short entries when price is in the premium zone (above 50%)

**How to identify the 50% level:**
1. Identify your reference range (e.g., yesterday's high and low, or the current day's established range)
2. Add: (high + low) / 2 = equilibrium
3. Draw a horizontal line at this level
4. If price is below this line on a bullish day → valid entry zone
5. If price is above this line on a bearish day → valid entry zone

**How this filters bad trades:**
Buying in premium means you are paying top price for a long position. The market must continue to deliver higher without any pullback for you to profit. This is a low-probability scenario.

Buying in discount means price has already pulled back from its recent extreme. Institutions accumulate in discount and distribute in premium. By buying in discount, you are entering alongside smart money accumulation — not chasing a high.`,
          },
          {
            heading: 'Why It Matters',
            body: `The premium/discount filter eliminates one of the most common retail trading mistakes: entering after a large move has already occurred. By requiring that entries happen in discount (for longs) or premium (for shorts), you force yourself to enter on the pullback — the point of value — rather than the extension.

This is the difference between buying the dip and chasing the rip.`,
          },
          {
            heading: 'Common Mistakes',
            body: `**Using the wrong reference range.** The premium/discount zone is relative to a specific range. Be explicit about which high and low you are using. The checklist asks you to set premium/discount zones before the session — use the previous day's high and low as your default reference.

**Entering in equilibrium.** If price is exactly at the 50% midpoint, neither buy nor sell. The zone is not clearly premium or discount. Wait for price to commit to one side.

**Ignoring premium/discount during fast-moving markets.** In a strong trending session, price may not pull back to discount before continuing. If the IFVG and confirmations are valid but price is near equilibrium rather than deep discount, consider reducing size (B setup territory).`,
          },
          {
            heading: 'Quick Summary',
            body: `• Premium = above 50% of range. Discount = below 50% of range.\n• Bullish day: only enter longs in discount zone.\n• Bearish day: only enter shorts in premium zone.\n• Reference range: typically previous day's high and low.\n• Don't buy premium or sell discount — you're joining the wrong side.\n• Mark premium/discount levels in the pre-killzone checklist.`,
          },
        ],
      },
      {
        id: 'p2-l8',
        title: 'The 2 Confirmation Rule',
        readTime: '6 min',
        sections: [
          {
            heading: 'Explanation',
            body: `The 2 Confirmation Rule is the most important risk-management rule in the TradeEdge strategy. It states that you must have exactly two independent confirmation signals before entering a trade, in addition to the IFVG entry trigger.

**Why 2 confirmations are required:**
One confirmation signal can be a coincidence. Two independent confirmation signals significantly increase the probability that institutional order flow is backing the trade. This rule filters out approximately 60–70% of marginal setups that look good in isolation but lack institutional support.

**The three valid confirmations:**
1. **Liquidity Sweep** — Price swept a BSL or SSL level (previous session high/low, equal highs/lows) in the opposite direction before reversing
2. **SMT Divergence** — NQ and ES diverged at a key level (NQ made a new extreme, ES did not confirm)
3. **FVG Alignment** — A Fair Value Gap from a higher timeframe (15M or 1H) aligns with your entry zone and directional bias

**Valid confirmation combinations:**
All combinations of the above three are valid as long as the two confirmations are independent:
- Liquidity Sweep + SMT Divergence ✓
- Liquidity Sweep + FVG Alignment ✓
- SMT Divergence + FVG Alignment ✓

You cannot use the IFVG itself as a confirmation — it is the entry trigger, not a confirmation.

**What happens with only 1 confirmation — skip the trade:**
The checklist will not produce an A+ or B Setup verdict without both Confirmation 1 and Confirmation 2 filled. If you only see one confirmation, the checklist correctly produces "DO NOT TRADE." This is not a failure — it is the strategy working as designed.

**How aggressive markets reduce confirmations — still skip:**
In very fast-moving markets, sometimes only one confirmation fires before price moves too far for entry. The temptation is to say "well, I have the IFVG and one confirmation, that's good enough." It is not. The sample of data that built this strategy includes only two-confirmation trades. Taking one-confirmation trades is a different strategy with different (and unknown) statistics.`,
          },
          {
            heading: 'Why It Matters',
            body: `Every rule violation in your journal where you took a trade with only one confirmation will consistently show lower win rates and worse average RR than your two-confirmation trades. This is provable with your own data after 50+ trades.

The 2-confirmation rule is the quality filter that keeps your win rate high enough to survive drawdown periods and maintain funded account rules.`,
          },
          {
            heading: 'Common Mistakes',
            body: `**Counting the same signal twice.** SMT and the liquidity sweep that triggered it are the same event — not two separate confirmations. If NQ sweeps BSL and ES diverges (SMT), that is one confirmation: Liquidity Sweep (with SMT as the mechanism). Look for a second independent signal.

**Counting a higher timeframe FVG that is from a different context.** An FVG from three sessions ago that happens to be near your entry is weak confirmation. Fresh FVGs from the current or previous session carry more weight.

**Lowering the standard because the setup "feels right."** Feelings are not confirmations. If the checklist says DO NOT TRADE, the answer is no trade.`,
          },
          {
            heading: 'Quick Summary',
            body: `• Required: 2 confirmations + IFVG entry trigger + bias alignment.\n• Three valid confirmations: Liquidity Sweep, SMT Divergence, FVG Alignment.\n• All combinations of the three are valid.\n• 1 confirmation = DO NOT TRADE.\n• IFVG is the entry trigger, not a confirmation.\n• This rule is non-negotiable — your statistics depend on it.`,
          },
        ],
      },
      {
        id: 'p2-l9',
        title: 'Stop Loss Placement',
        readTime: '6 min',
        sections: [
          {
            heading: 'Explanation',
            body: `Stop loss placement in the TradeEdge Method is not guesswork — it is structural. Your SL is placed at a level that, if reached, definitively invalidates your trade thesis.

**Aggressive SL: Directly under/above the IFVG**
- For longs: SL placed 1–2 ticks below the bottom of the IFVG
- For shorts: SL placed 1–2 ticks above the top of the IFVG
- Logic: If price closes a candle body below the IFVG (for a long), the inversion has been invalidated. The thesis is wrong.
- Benefit: Tighter SL = better RR (same TP, smaller risk)
- Risk: Higher chance of being stopped out on a wick before the move continues

**Safe SL: Under/above the liquidity that was swept**
- For longs: SL placed below the SSL that was swept before the reversal
- For shorts: SL placed above the BSL that was swept before the reversal
- Logic: If price continues below the sweep point, the "liquidity sweep and reversal" thesis has failed. The market is not reversing — it is continuing.
- Benefit: Less likely to be stopped on a wick; more room for price to move
- Risk: Wider SL = lower RR for the same TP

**When to use each:**
Use **Aggressive SL** when:
- The IFVG is clean and well-defined
- The displacement was strong (large body candles)
- You want maximum RR
- You are in a strong killzone early in the session

Use **Safe SL** when:
- The sweep was dramatic (large liquidity pool taken)
- You want more conviction that the trade is truly invalidated before exiting
- Approaching the consistency rule limit (one loss needs to be decisive)
- RR still exceeds 1:1 with the wider stop

**Why the SL must be placed before entry:**
The SL defines your risk. Without it, your position has undefined risk. On a funded account, this is especially dangerous — a gap or spike against you without a SL can trigger the drawdown limit in seconds.

The TradeEdge checklist requires SL placement to be confirmed BEFORE entry. "SL placement decided" is a Phase 3 check. If you haven't decided your SL, you are not ready to enter.

**What invalidates your stop logic:**
If your SL was placed using one logic (e.g., aggressive under IFVG) and price sweeps the IFVG but closes back above it, you might be stopped before the move returns. This is not a flaw — it is the market telling you the IFVG was weaker than you assessed. Log it, review the setup quality, and move on.`,
          },
          {
            heading: 'Why It Matters',
            body: `SL placement directly determines your RR. The same TP with a wider SL produces lower RR. The TradeEdge Method's entry precision (IFVG trigger) exists precisely to allow tight stops and therefore high RR.

Do not widen your SL after entry. "Giving it more room" is the first step toward moving your SL entirely and holding a losing trade that should have been closed.`,
          },
          {
            heading: 'Common Mistakes',
            body: `**Moving the SL after entry.** This is stated in the baseline psychology questions for a reason. Never, under any circumstances, move your SL further from your entry after the trade is live. The original SL placement was based on logic; moving it is emotional.

**Placing the SL at a round number "because it looks clean."** Your SL should be at a structural level — below the IFVG or below the sweep low — not at 19,500 because it's a round number.

**Not entering the SL into your trading platform immediately.** The moment you enter a trade, the SL must be in the platform as a live order. Not "I'll enter it in a second." Now.`,
          },
          {
            heading: 'Quick Summary',
            body: `• Aggressive SL: 1–2 ticks beyond the IFVG. Tighter, higher RR.\n• Safe SL: beyond the liquidity that was swept. Wider, more forgiving.\n• Decide SL type BEFORE entry — it's a Phase 3 checklist item.\n• Enter SL into the platform the moment you enter the trade.\n• Never move SL further from entry after the trade is live.\n• SL at a structural level, not a round number.`,
          },
        ],
      },
      {
        id: 'p2-l10',
        title: 'Take Profit & Session Targets',
        readTime: '6 min',
        sections: [
          {
            heading: 'Explanation',
            body: `Take profit placement in the TradeEdge Method uses structural liquidity targets — not arbitrary RR multiples. Your TP is where the market wants to go, not where you want to exit.

**Session highs and lows as primary TP:**
The most consistent TP targets are the liquidity pools established at session boundaries:
- Previous day's high (PDH) — BSL for long trades on bullish days
- Previous day's low (PDL) — SSL for short trades on bearish days
- Current session high/low established in the first killzone

Always check: is there clean BSL (for longs) or SSL (for shorts) beyond your entry that price is likely to reach?

**Previous day highs/lows as targets:**
PDH and PDL are the most reliable daily targets because:
- Every market participant can see them
- Retail stop-loss orders cluster just beyond them
- They are hit by price in the majority of trending sessions

Mark PDH and PDL on your chart before every session. Set your TP just below PDH (for longs) or just above PDL (for shorts) — you want to exit before the exact level, as price may reverse after taking the liquidity.

**Round numbers on NQ ($500 increments):**
NQ tends to react at round numbers because retail traders place orders at clean levels:
- 19,000 / 19,500 / 20,000 / 20,500 etc.
- These act as secondary targets when the primary liquidity is further away
- On a low-volatility day, the nearest round number may be your TP if PDH is too far

**Partial profits strategy:**
Consider taking 50% of your position off at the nearest liquidity target and letting the remainder run to the next target:
- Entry: 1 NQ contract (or 10 MNQ)
- TP1: Nearest session high (take 5 MNQ)
- TP2: Previous day high (let 5 MNQ run with SL moved to breakeven)
This locks in a guaranteed profit while maintaining exposure for the full target.

**Trailing your stop through structure:**
After TP1 is hit, move your SL to breakeven on the remaining position. Then trail it below each new Higher Low (for longs) as price continues. Exit the remainder at TP2 or if the trailing SL is hit.

**What to do at all-time highs:**
When NQ is making all-time highs, there is no clear BSL target above (no previous structure). In this scenario:
- Use round numbers as your TP (next $500 increment)
- Use measured moves (previous swing range projected forward)
- Consider taking the full position at TP1 (nearest clean target)
- Do not guess at arbitrary levels — if there is no clear target, take what is available.`,
          },
          {
            heading: 'Why It Matters',
            body: `A mathematically sound RR means nothing if your TP is placed at a level price is unlikely to reach. Placing TP at a liquidity pool — where price is structurally drawn — increases the probability that price will deliver to your exit.

Many traders take profit early because they doubt the TP will be reached. They exit at 1:0.8 when the TP was at 1:2. Over 100 trades, this dramatically reduces profitability even with a high win rate.`,
          },
          {
            heading: 'Common Mistakes',
            body: `**Exiting too early when price slows near TP.** Price will often stall before reaching a liquidity target. This is normal. The stall is price building energy before sweeping the liquidity. Hold the trade to TP unless the SL is hit.

**Setting TP at the exact PDH rather than just below it.** If your TP is at exactly the PDH and price sweeps it by 2 ticks and reverses, you missed the fill. Set TP 2–5 ticks before the exact liquidity level.

**No partial profits plan.** Decide before entry whether you are taking partials. "I'll decide when I see how price moves" is not a plan — it is emotional decision-making during the trade.`,
          },
          {
            heading: 'Quick Summary',
            body: `• Primary TP: previous session high (for longs) or low (for shorts).\n• Use PDH and PDL as your default daily targets.\n• NQ round numbers ($500 increments) as secondary targets.\n• Set TP 2–5 ticks before the exact liquidity level.\n• Partial profits: 50% at TP1, trail remainder to TP2 with SL at BE.\n• At all-time highs: use round numbers or measured moves.\n• Hold to TP — price stalling near the target is normal.`,
          },
        ],
      },
    ],
  },
  {
    id: 'p3',
    part: 3,
    title: 'The Full Process',
    subtitle: 'Pre killzone to post trade',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10 border-purple-400/20',
    dot: 'bg-purple-400',
    lessons: [
      {
        id: 'p3-l1',
        title: 'Pre-Session Routine',
        readTime: '4 min',
        sections: [
          {
            heading: 'The Step-by-Step Routine',
            body: `Complete this routine at least 30 minutes before your chosen killzone opens.

**Step 1 — Psychology check-in (5 min)**
Open TradeEdge and complete your daily psychology check-in. If the result is NO-GO, stop here. Do not proceed to setup the charts. Close the app and do something else.

**Step 2 — Daily structure analysis (5 min)**
Open a 1D chart of NQ and ES. Identify the current market structure. Are we in HH/HL or LH/LL? Set your daily bias: Bullish, Bearish, or Neutral.

**Step 3 — Mark key levels (10 min)**
On a 15M or 1H chart, mark:
- Previous day's high and low
- Previous week's high and low (if it's Monday or near weekly extremes)
- Equal highs and equal lows visible on the chart
- Premium/discount zone midpoint

**Step 4 — Check the economic calendar (2 min)**
Open Forex Factory. Look for red-folder events in the next 3 hours. If a high-impact event falls within 30 minutes of your killzone, note it. Consider waiting until after the release to trade.

**Step 5 — Select your killzone (1 min)**
Decide: London or NY? Or both if you trade both sessions. Note this on your checklist.

**Step 6 — Set your TradingView alerts (2 min)**
Set price alerts 5–10 points away from your key levels so you can step away from the screen without missing a move.

**Step 7 — Complete the pre-killzone checklist (2 min)**
Open TradeEdge checklist. Complete Phase 1. If any MUST item is unchecked, go back and complete it. Do not advance to Phase 2 until Phase 1 is green.`,
          },
          { heading: 'Why It Matters', body: `The pre-session routine is what separates a professional from a retail trader. A professional prepares before the market moves. A retail trader reacts to the market as it moves. Preparation removes the emotion from entry decisions — when the IFVG fires, you already know your bias, your target, and your key levels. You execute mechanically.` },
          { heading: 'Quick Summary', body: `• 30 minutes before killzone: start the routine.\n• Psychology check-in first — if NO-GO, stop here.\n• Set bias on 1D, mark PDH/PDL, equal highs/lows, premium/discount.\n• Calendar check: any red events in the next 3 hours?\n• Complete Phase 1 checklist before sitting down to watch the killzone.` },
        ],
      },
      {
        id: 'p3-l2',
        title: 'During the Killzone',
        readTime: '4 min',
        sections: [
          {
            heading: 'What to Watch For',
            body: `When the killzone opens, your preparation is complete. Your job now is to observe and execute — not to think. Every decision has already been made.

**Watch 1 — The initial sweep:**
During the first 15–20 minutes of the killzone, watch for price to move toward a liquidity pool (BSL or SSL) you marked pre-session. This sweep is often the catalyst for the whole trade. If price sweeps your marked liquidity and SMT divergence fires, that is Confirmation 1.

**Watch 2 — The displacement:**
After the sweep, watch for a strong displacement move in the opposite direction. This displacement will create an FVG. If a subsequent candle body closes back through that FVG, you have an IFVG.

**Watch 3 — Confirmations:**
While watching for the IFVG, simultaneously check your confirmation count:
- Did price sweep a clear liquidity level? (Confirmation: Liquidity Sweep)
- Did NQ and ES diverge at the sweep point? (Confirmation: SMT)
- Does a higher-timeframe FVG align with the direction? (Confirmation: FVG Alignment)

If you have 2 of the 3, complete Phase 2 of the checklist.

**Watch 4 — Phase 3 before entry:**
Before entering, complete Phase 3: SL decided, TP set, contract size within limits. Only then execute.

**During the trade:**
- Hands off. Do not watch the 1-minute chart tick by tick.
- Check every 5–10 minutes.
- Only action required: moving SL to breakeven after TP1 hit (if taking partials).`,
          },
          { heading: 'Quick Summary', body: `• Watch for the liquidity sweep first (15–20 min into killzone).\n• Displacement after the sweep creates the FVG → watch for body close inversion.\n• Count confirmations as they fire.\n• Complete Phase 2 checklist when you see the IFVG + 2 confirmations.\n• Complete Phase 3 before entering. Then execute.\n• During the trade: hands off. Check every 5–10 min.` },
        ],
      },
      {
        id: 'p3-l3',
        title: 'Trade Management',
        readTime: '4 min',
        sections: [
          {
            heading: 'BE, Partials, and Trailing',
            body: `**Breakeven (BE):**
Move your SL to breakeven (your entry price) when:
- Price has moved 50% of the way to TP, OR
- TP1 has been hit (if taking partials)

Never move to breakeven before price has demonstrated intent. Moving too early is a common mistake that leads to being stopped out breakeven on trades that would have hit TP.

**Partial profits:**
Recommended structure for most trades:
- 50% off at TP1 (nearest liquidity target)
- Move SL to breakeven on remaining 50%
- Let remainder run to TP2

This guarantees a profitable trade while keeping exposure for the full target. The psychological benefit is significant — you are locked into a green trade and can manage the remainder without fear.

**Trailing your stop:**
For the remainder (post-TP1):
- Trail SL below each confirmed Higher Low (for longs)
- A confirmed HL means a candle has closed above the potential HL level
- Do not trail the SL below wicks — only below confirmed candle bodies
- Exit the remainder at TP2 or when the trailing SL is hit`,
          },
          { heading: 'Quick Summary', body: `• Move SL to BE at 50% of the way to TP or after TP1.\n• Partials: 50% at TP1, remainder to TP2 with BE stop.\n• Trail SL below confirmed Higher Lows (body closes, not wicks).\n• Never exit before TP based on "feeling" — use structural signals only.` },
        ],
      },
      {
        id: 'p3-l4',
        title: 'Post-Trade Review',
        readTime: '3 min',
        sections: [
          {
            heading: 'How to Use the TradeEdge Journal',
            body: `Log every trade immediately after the killzone closes — while the details are fresh.

**In TradeEdge, complete:**
1. All trade fields (entry, SL, TP, exit, result)
2. Screenshot of the chart at entry and exit
3. "What went well" — be specific. "Entry timing was clean" is better than "good trade."
4. "What to improve" — even on winning trades. Was the SL wider than it needed to be? Did you hesitate?
5. Rule violations — be honest. If you moved the SL, log it. If you took the trade without 2 confirmations, log it.

**The post-session psychology reflection:**
After logging the trade, complete the psychology reflection:
- Did you follow your rules?
- Did you revenge trade or overtrade?
- Overall discipline grade

**Why screenshot matters:**
The screenshot captures a moment you cannot replay. In 3 months, looking at the chart from memory is impossible. The screenshot allows you to review the exact setup, see if the IFVG was clean, and assess whether your checklist assessment was correct.`,
          },
          { heading: 'Quick Summary', body: `• Log trades immediately after the killzone.\n• Screenshot is mandatory — captures the exact setup.\n• Be specific in "what went well" and "what to improve."\n• Log rule violations honestly — your data is only useful if it's accurate.\n• Complete the psychology reflection every session.` },
        ],
      },
      {
        id: 'p3-l5',
        title: 'Weekly Review Process',
        readTime: '3 min',
        sections: [
          {
            heading: 'How to Conduct Your Weekly Review',
            body: `Every Sunday (or after your last session of the week), complete the weekly review in TradeEdge.

**Step 1 — Review auto-populated stats:**
TradeEdge pulls your week's data automatically: total trades, win rate, average RR, total P&L, psychology score, rule violations.

**Step 2 — Find your best and worst trade:**
Open the journal and identify:
- Best trade: highest RR, cleanest execution
- Worst decision: any rule violation, or the trade with the worst RR

**Step 3 — Written review:**
Answer these questions honestly:
- What confirmation combination worked best this week?
- Were there sessions where the psychology score predicted poor results?
- Did the 2-confirmation rule hold up — any single-confirmation trades you regret?
- Is there a timeframe or session that performed better?

**Step 4 — Set next week's goal:**
One specific, actionable goal. Not "trade better" but "wait for both confirmations on every trade, even if the first one fires perfectly."

**Step 5 — Grade the week:**
A: 80%+ rule adherence, positive expectancy, no violations
B: 70–79% adherence, minor violations noted and understood
C: 60–69% adherence, recurring mistakes
D: Below 60%, significant violations or drawdown`,
          },
          { heading: 'Quick Summary', body: `• Weekly review: every Sunday after your last session.\n• Review auto-stats, find best and worst trade.\n• Written answers to specific performance questions.\n• Set one specific goal for next week.\n• Grade the week: A/B/C/D based on rule adherence.` },
        ],
      },
    ],
  },
  {
    id: 'p4',
    part: 4,
    title: 'Prop Firm Trading',
    subtitle: 'Navigating funded account rules',
    color: 'text-warning',
    bg: 'bg-warning/10 border-warning/20',
    dot: 'bg-warning',
    lessons: [
      {
        id: 'p4-l1',
        title: 'How Funded Accounts Work',
        readTime: '5 min',
        sections: [
          {
            heading: 'Explanation',
            body: `Prop firm accounts give you access to capital you don't own. In exchange, you split profits with the firm (typically 80–90% to the trader) and must comply with strict drawdown rules.

**The evaluation phase:**
Most prop firms require you to pass an evaluation (or "challenge") before receiving a funded account:
- Hit a profit target (e.g., 8% of account size) within a set number of days
- Stay within the drawdown rules at all times
- Some firms have a two-phase challenge (Phase 1 + Phase 2)
- Instant funding firms (like Tradeify) skip the challenge — you start funded immediately

**The funded phase:**
Once funded, you trade with the firm's capital:
- Keep 80–90% of profits
- Request payouts on schedule (daily, weekly, monthly depending on firm)
- Continue to respect all drawdown rules — violation ends the account immediately
- Some firms reset the trailing drawdown after each payout

**Common account types and sizes:**
- $25,000 (typical micro/mini account)
- $50,000 (most common starting point)
- $100,000 (requires more risk capital to evaluate)
- Some firms offer $150,000, $200,000, $250,000 accounts for more experienced traders

**The economics of prop trading:**
On a $50,000 account with 80% profit split:
- Profit target: $3,000 (6%)
- Your take: $2,400
- Evaluation cost: typically $100–200 (one-time)
- Monthly expectation (conservative): $1,500–3,000 at 1–2 trades/week`,
          },
          { heading: 'Quick Summary', body: `• Evaluation → funded → payouts.\n• You keep 80–90% of profits; firm keeps 10–20%.\n• Drawdown violation = account closed immediately.\n• Common account sizes: $25k, $50k, $100k.\n• Instant-funded firms (Tradeify) skip the challenge phase.` },
        ],
      },
      {
        id: 'p4-l2',
        title: 'Trailing Drawdown Explained',
        readTime: '5 min',
        sections: [
          {
            heading: 'Explanation',
            body: `Trailing drawdown is the most commonly misunderstood rule in prop firm trading. Getting this wrong costs traders their funded accounts.

**How trailing EOD (End of Day) drawdown works:**
Your drawdown floor rises with your highest end-of-day account balance — never intraday.

Example with a $50,000 account and $2,000 trailing drawdown:
- Day 1 start: Balance $50,000 → Floor: $48,000
- Day 1: You make $500 intraday, end day at $50,500 → Floor moves to $48,500
- Day 2: You make $800, end day at $51,300 → Floor moves to $49,300
- Day 3: You lose $1,000 intraday → Balance drops to $50,300 (still above floor $49,300 ✓)
- Day 3: You end day at $50,300 → Floor stays at $49,300 (floor does not go down with balance)

The floor only moves UP — never down. Once your floor is at $49,300, it stays there even if your balance drops. You only have $1,000 of drawdown left from that point.

**Static drawdown:**
A fixed amount from your starting balance. If you start at $50,000 with a $2,500 static drawdown, your floor is always $47,500. It never moves up or down. This is simpler but leaves you more room because the floor doesn't "chase" your profits.

**Daily loss limit:**
A cap on how much you can lose in a single calendar day. Common at Tradeify and Apex. Example: $1,000 daily loss limit on a $50,000 account means if you lose $1,000 in one day, trading stops for that day (account may pause, depending on firm rules).

**The TradeEdge account tracker monitors this for you.** The checklist auto-checks "Daily profit target not already hit" and "Consistency rule not violated" using your account data.`,
          },
          { heading: 'Quick Summary', body: `• Trailing EOD: floor rises with your highest EOD balance. Never intraday.\n• Static: fixed floor from starting balance. Simpler.\n• Daily loss limit: hard cap per calendar day.\n• Know your firm's exact drawdown type before trading.\n• The TradeEdge account tracker tracks your floor automatically.` },
        ],
      },
      {
        id: 'p4-l3',
        title: 'Consistency Rules Explained',
        readTime: '4 min',
        sections: [
          {
            heading: 'The 40% Consistency Rule',
            body: `The consistency rule exists at prop firms to prevent "lottery day" trading — where a trader has one big lucky day that hits the profit target, then gets paid out before the firm can assess their actual skill level.

**The rule:**
No single day's profit should exceed 40% of your total profit to date.

Example:
- Total profit so far: $1,000
- Maximum profit on any single day: $400 (40% of $1,000)
- If your best day is $500 but total is only $800, you have violated the rule ($500 > 40% of $800)

**Why this matters in practice:**
When trading NQ or ES with a legitimate edge, your daily returns will naturally be inconsistent. Some days you take 2–3 trades and make $800. Other days you make $200 or nothing. The consistency rule ensures the $800 day is not 40%+ of your cumulative profit.

**The TradeEdge daily profit cap recommendation:**
TradeEdge suggests targeting a maximum of 20% of your profit target as a daily cap. For a $3,000 profit target: maximum $600/day. This is conservative enough to avoid consistency rule violations regardless of how your profits are distributed.

**The consistency rule calendar in TradeEdge:**
The accounts page shows a calendar where each trading day is coloured by what percentage of total profit that day represents. Days approaching 40% turn amber. Days above 40% turn red. This allows you to see and manage the rule in real time.`,
          },
          { heading: 'Quick Summary', body: `• 40% rule: no day > 40% of total profit to date.\n• TradeEdge daily cap suggestion: 20% of profit target per day.\n• Monitor the consistency calendar on the accounts page.\n• Amber = approaching 40%. Red = violation.\n• Consistent $200–400 days beat one $1,500 day for passing evaluations.` },
        ],
      },
      {
        id: 'p4-l4',
        title: 'Position Sizing for Funded Accounts',
        readTime: '4 min',
        sections: [
          {
            heading: 'Explanation',
            body: `Position sizing on a funded account requires balancing two constraints: (1) generating meaningful profit, and (2) not risking enough to violate drawdown or daily loss limits.

**The formula:**
Risk per trade ($) = Daily loss limit × 0.5 (or 1–2% of account size)

Use whichever number is smaller.

For a $50,000 account with a $1,000 daily loss limit:
- 1% of account = $500
- 50% of daily loss limit = $500
- Risk per trade = $500

**Converting $ risk to contracts:**
NQ futures (MNQ = micro NQ):
- 1 point = $2 per MNQ contract
- 1 point = $20 per NQ (full) contract

If SL is 20 points and risk = $500:
- MNQ: $500 / (20 × $2) = 12.5 → 12 MNQ contracts
- NQ: $500 / (20 × $20) = 1.25 → 1 NQ contract

ES futures (MES = micro ES):
- 1 point = $5 per MES contract
- 1 point = $50 per ES (full) contract

If SL is 10 points and risk = $500:
- MES: $500 / (10 × $5) = 10 MES contracts
- ES: $500 / (10 × $50) = 1 ES contract

**Scaling up as the account grows:**
As your balance grows, your risk per trade should stay proportional. If you start at $50,000 and grow to $52,000, you can adjust upward slightly. But do not increase size aggressively — the trailing drawdown floor is also higher.`,
          },
          { heading: 'Quick Summary', body: `• Risk per trade: 1–2% of account OR 50% of daily loss limit, whichever is smaller.\n• MNQ: 1 point = $2. NQ: 1 point = $20.\n• MES: 1 point = $5. ES: 1 point = $50.\n• Calculate contracts from SL distance and $ risk.\n• Scale up proportionally as account grows — trailing floor rises too.` },
        ],
      },
      {
        id: 'p4-l5',
        title: 'Common Mistakes That Blow Accounts',
        readTime: '4 min',
        sections: [
          {
            heading: 'The Most Common Account Killers',
            body: `After thousands of funded accounts, the patterns are consistent. These are the mistakes that end funded accounts most frequently:

**1. Trading without checking the daily loss limit balance**
Traders take a $600 loss, then take another trade — not realising their daily limit was $800. A second smaller loss ends the day in violation. The TradeEdge checklist auto-checks this, but only if your account data is kept current.

**2. Increasing position size after a win streak**
Three consecutive wins creates confidence. You increase size on trade 4. It's a loss. The bigger loss wipes out gains from the streak and damages the drawdown buffer simultaneously.

**3. News trading without awareness**
FOMC, NFP, or CPI releases create $200–400 point spikes in NQ in seconds. If you are in a position with a proper SL, you will be fine. If you are in without a SL, or with an undersized SL, you can lose more in 10 seconds than in the previous week of trading.

**4. Revenge trading after hitting the daily loss limit**
Hitting the daily loss limit hurts. The immediate urge is to "make it back." The psychology check-in system and the checklist are specifically designed to prevent this. If you have hit your daily loss limit, the checklist should produce a DO NOT TRADE verdict automatically.

**5. Not accounting for the trailing drawdown after a big day**
A $2,000 profit day is exciting. But if your trailing drawdown was $2,500 and your floor moved up to $52,000, you now only have $2,000 of drawdown buffer (at your current $54,000 balance). A bad week can now breach the floor faster than before your big day.`,
          },
          { heading: 'Quick Summary', body: `• Check daily loss limit BEFORE every trade — it's in the checklist.\n• Never increase size after a win streak.\n• Avoid live trades during major news releases.\n• Hitting daily limit → stop trading → no exceptions.\n• After big profit days: recalculate your trailing drawdown floor immediately.` },
        ],
      },
      {
        id: 'p4-l6',
        title: 'How to Pass an Evaluation',
        readTime: '5 min',
        sections: [
          {
            heading: 'The Evaluation Mindset',
            body: `Passing a prop firm evaluation is not about maximising profit — it is about demonstrating consistency and discipline. The firm wants to see that you follow rules under real market conditions.

**The approach that works:**
1. Trade at 50–75% of your normal size during the evaluation
2. Target 0.5–1% of the account size per day (e.g., $500–1,000 on a $50k account)
3. Do not try to hit the profit target in 5 days — spread it over 15–20 days
4. Take only A+ and B setups — no "maybe" trades
5. Never violate the daily loss limit, even once

**The maths of consistent passing:**
- $50,000 account, 8% profit target = $4,000 needed
- 20 trading days to hit target
- Daily target: $200 average
- At 1 trade per day with 1:2 RR and 50% win rate: $200 average daily return

This is achievable with 1 trade per day. You do not need 5 trades per session.

**What gets people failed:**
- Taking trades outside the strategy to "speed things up"
- Overtrading on a good day, then having a bad day that wipes the gains
- One large violation (news trade, no SL) that hits the drawdown limit
- Psychological pressure causing poor execution in the final days

**The two-phase challenge:**
Phase 1 typically has a larger profit target (8–10%) and Phase 2 has a smaller one (4–5%). Use Phase 1 to build the habit, then execute the same in Phase 2. The rules are identical — your routine should be identical.`,
          },
          { heading: 'Quick Summary', body: `• Trade 50–75% normal size during evaluation.\n• Target $200–500/day — don't rush the target.\n• 20 days to hit target is conservative and reliable.\n• Only A+ and B setups.\n• One SL violation can end the evaluation — use the checklist every session.` },
        ],
      },
      {
        id: 'p4-l7',
        title: 'Scaling Multiple Accounts',
        readTime: '4 min',
        sections: [
          {
            heading: 'Building a Multi-Account Operation',
            body: `Once you have passed one evaluation and have a funded account running profitably for 30+ days, you can consider scaling to multiple accounts.

**When you are ready to scale:**
- 30+ days of profitable trading on your first funded account
- Win rate above 50% with average RR > 1:1.5
- Zero drawdown violations in 30 days
- Consistent rule adherence (80%+ on TradeEdge weekly reviews)

**The scaling approach:**
1. Open a second account at the same size as your first
2. Trade both accounts identically — same setups, same position size per account
3. As each account becomes profitable, request payouts and scale to larger sizes
4. Eventually: 2× $50k = $100k effective capital, 3× $50k = $150k

**The risk of over-scaling:**
Running 5+ accounts simultaneously creates psychological complexity. A bad day across all accounts amplifies the emotional impact. Start with 2 accounts, run them for 60 days, then add a third only if your psychology check-in scores remain stable.

**TradeEdge multi-account support:**
Add each account separately in the Accounts section. The analytics dashboard can be filtered by account so you can track each account's performance independently. The daily checklist applies to all accounts — your psychology and setup quality is the same regardless of which account you are trading.`,
          },
          { heading: 'Quick Summary', body: `• Scale after 30+ profitable days, 50%+ win rate, zero violations.\n• Start with 2 accounts, then 3 — not 5 at once.\n• Trade all accounts identically — same setups, same relative size.\n• Add each account to TradeEdge and track separately.\n• Monitor psychology scores across multiple accounts — complexity adds stress.` },
        ],
      },
    ],
  },
  {
    id: 'p5',
    part: 5,
    title: 'Resources',
    subtitle: 'Tools, platforms, and further learning',
    color: 'text-secondary',
    bg: 'bg-surface2 border-border',
    dot: 'bg-secondary',
    lessons: [
      {
        id: 'p5-l1',
        title: 'Recommended TradingView Indicators',
        readTime: '3 min',
        sections: [
          {
            heading: 'Essential Indicators for the TradeEdge Method',
            body: `These three indicators cover everything you need on TradingView. All are available for free.

**1. Killzone Indicator**
Search TradingView public scripts for "ICT Killzones" or "Killzone Sessions." Look for one that shades the London (02:00–05:00 EST) and NY (08:30–11:00 EST) windows in distinct colours. Set the colours to match your preference — many traders use blue for London and green for NY.

Configuration: Set your local timezone in the indicator settings. Verify the shaded windows appear at the correct local times before each week.

**2. Session Highs and Lows Indicator**
Search for "Session High Low" or "Previous Day High Low." This indicator automatically draws horizontal lines at the previous session's high and low — your primary liquidity targets.

Look for one that includes: Previous Day High/Low, Previous Week High/Low, and ideally Current Session High/Low (updates intraday).

**3. Premium/Discount Zone Indicator**
Search for "Premium Discount Zones" or "Equilibrium." This draws the 50% midpoint of a defined range, shading above as premium and below as discount.

Configure it to reference the previous day's range as the default. Some indicators allow you to manually set the high and low reference — useful on volatile days where the previous day's range was unusually wide or narrow.

**Additional recommended indicators:**
- Fair Value Gap indicator (auto-identifies FVGs on your chart)
- Volume profile (for confirming high-volume zones)
- Economic calendar overlay (shows news events directly on the chart)`,
          },
          { heading: 'Quick Summary', body: `• Killzone indicator: shades London (02–05 EST) and NY (08:30–11 EST).\n• Session High/Low: draws PDH, PDL, and current session extremes.\n• Premium/Discount: shades 50% midpoint of previous day's range.\n• Verify timezone settings at the start of each week.\n• All three are available free on TradingView public scripts.` },
        ],
      },
      {
        id: 'p5-l2',
        title: 'Recommended Prop Firms',
        readTime: '4 min',
        sections: [
          {
            heading: 'Honest Breakdown of Key Firms',
            body: `**Tradeify (Recommended for TradeEdge traders)**
- Account sizes: $25k, $50k, $100k, $150k
- Drawdown: Trailing EOD
- Daily loss limit: Yes (typically $1,000–2,000 depending on size)
- Consistency rule: 40% (no single day > 40% of total profit)
- Payout: Daily, after hitting profit target
- Challenge: Instant-funded option available (no evaluation needed)
- Pros: Fast payouts, transparent rules, NQ and ES available
- Cons: Trailing drawdown moves with profits (be vigilant near the ceiling)
- Best for: Traders who want to start trading immediately without an evaluation

**Apex Trader Funding**
- Account sizes: $25k to $300k
- Drawdown: Static (does not trail) — more forgiving
- Daily loss limit: Yes
- Consistency rule: None on most plans
- Payout: Monthly, every 14 days on active plans
- Challenge: Required (one-phase)
- Pros: No consistency rule, static drawdown gives more room
- Cons: Slower payouts, maximum position size rules
- Best for: Traders who want the safety of a static drawdown floor

**Topstep**
- Account sizes: $50k, $100k, $150k
- Drawdown: Trailing EOD
- Daily loss limit: Yes
- Consistency rule: No formal rule, but payout structure encourages consistency
- Payout: Weekly, via Stripe
- Challenge: Two-phase evaluation
- Pros: Reputable and established, strong trader community
- Cons: Two-phase evaluation (more time to get funded), US-only banking
- Best for: Traders who want a well-established firm with a track record

**Note:** Prop firm rules change frequently. Always verify current rules on the firm's website before funding an account.`,
          },
          { heading: 'Quick Summary', body: `• Tradeify: instant-funded option, trailing EOD, daily payouts.\n• Apex: static drawdown (more room), no consistency rule, monthly payouts.\n• Topstep: established firm, two-phase evaluation, weekly payouts.\n• Verify all rules before depositing — they change regularly.\n• Best starting point: $50k account at Tradeify for instant access.` },
        ],
      },
      {
        id: 'p5-l3',
        title: 'Economic Calendar',
        readTime: '3 min',
        sections: [
          {
            heading: 'Using the Economic Calendar',
            body: `**How to use Forex Factory:**
Go to forexfactory.com/calendar. Filter for "USD" currency and "High" impact events only. The calendar shows upcoming news events with their expected impact (low, medium, high — shown as green, orange, red folders).

**What news to avoid:**
Always avoid trading during or within 15 minutes of:
- Non-Farm Payrolls (NFP) — first Friday of each month at 08:30 EST
- CPI (Consumer Price Index) — monthly at 08:30 EST
- FOMC Interest Rate Decision — 8 meetings per year at 14:00 EST
- FOMC Meeting Minutes — 3 weeks after each meeting
- GDP releases — quarterly at 08:30 EST
- Initial Jobless Claims — weekly Thursdays at 08:30 EST (watch this one — can move NQ significantly)

**High-impact events to know:**
The 08:30 EST news cycle hits exactly as the NY killzone opens. On weeks with major data, the first 5–10 minutes of the NY killzone will be news-driven and unpredictable. Wait for the dust to settle — typically by 08:45–09:00 EST — before looking for IFVG setups.

**The TradeEdge calendar rule:**
Check the calendar as part of your pre-killzone checklist (Item 6: "Economic calendar checked"). If a red event falls within 30 minutes of your killzone start, note it and decide: either skip the killzone entirely, trade after the event settles, or reduce size significantly.`,
          },
          { heading: 'Quick Summary', body: `• Use Forex Factory — filter USD + High Impact only.\n• Avoid: NFP, CPI, FOMC decisions, GDP, major jobless claims.\n• 08:30 EST releases coincide with NY killzone open — wait for dust to settle.\n• Check calendar every session — it's in the pre-killzone checklist.\n• When in doubt about a news event: skip the session.` },
        ],
      },
      {
        id: 'p5-l4',
        title: 'Backtesting Guide',
        readTime: '5 min',
        sections: [
          {
            heading: 'How to Backtest the TradeEdge Method',
            body: `Backtesting builds the statistical confidence you need to execute the strategy with discipline in live conditions. A trader who has seen 100 historical TradeEdge setups is far less likely to deviate from the rules when a live trade is not going their way.

**The tools:**
- TradingView: Use the bar replay feature (the "play" button in the top toolbar) to step through historical charts candle by candle
- Tradovate: Replay feature on the platform you will use for live trading
- A spreadsheet or TradeEdge journal to log each backtest trade

**What to track in your backtest:**
For every setup, log in TradeEdge as a normal trade:
- Date and time
- Session (London or NY)
- Market structure on 1D (bias)
- Did an IFVG form on 1min/2min during the killzone?
- What were the 2 confirmations?
- Entry, SL (aggressive or safe), TP
- Would the trade have hit TP or SL first?
- RR achieved (if TP hit) or RR lost (if SL hit)

**Minimum sample size before going live:**
100 setups minimum. This gives you:
- Statistical confidence in your win rate (within ±10%)
- Visibility of your confirmation combination performance
- Understanding of which sessions perform better for you
- Psychological familiarity with losing streaks (you will see 4–5 in a row in 100 trades)

**How to conduct a productive backtest session:**
1. Set TradingView to replay from 6 months ago
2. Mark your key levels (PDH, PDL, premium/discount) before the killzone
3. Step through the killzone candle by candle
4. When you see a valid setup, pause and log it before advancing
5. Do not cheat — if you would have missed the entry in real time, log it as missed`,
          },
          { heading: 'Quick Summary', body: `• Use TradingView bar replay to backtest on real historical data.\n• Log every backtest setup in TradeEdge exactly like a live trade.\n• Minimum 100 setups before going live.\n• Track by session, confirmation combo, and bias.\n• Don't cheat — if you'd have missed it live, mark it missed.` },
        ],
      },
      {
        id: 'p5-l5',
        title: 'Demo Trading Guide',
        readTime: '4 min',
        sections: [
          {
            heading: 'How to Practice Properly',
            body: `Demo trading is the bridge between backtesting and live funded trading. Done correctly, it builds real-time execution habits. Done incorrectly, it builds bad habits you then carry into live trading.

**How to use Tradovate demo:**
1. Create a free account at tradovate.com
2. Set your demo account balance to match your intended funded account size (e.g., $50,000)
3. Set your position size to the same as you would use live (do not use 100 contracts because it's "only demo")
4. Trade only during killzones — exactly as you would live
5. Complete the TradeEdge checklist for every demo session

**What to track on demo:**
Log every demo trade in TradeEdge. The tag it as a demo account in your account settings. This keeps your demo data separate from live data but still allows you to review setups and track psychology.

**When you are ready for live trading:**
Specific criteria, not feelings:
- 50+ demo trades logged in TradeEdge
- Win rate above 45%
- Average RR above 1:1.5 on completed trades
- Zero checklist violations in the last 15 trades
- Psychology check-in scores averaging above 7 for the past 2 weeks
- You have not moved a SL once in the last 20 trades

**The common demo trap:**
Traders trade demo for 2 weeks, have a few good days, and go straight to live. They have not internalised the rules yet — they just got lucky. The criteria above ensure you have a statistically meaningful sample AND the psychological habits are forming correctly.

"I feel ready" is not criteria. Numbers are criteria.`,
          },
          { heading: 'Quick Summary', body: `• Set demo account = intended funded size. Trade at live position sizes.\n• Log ALL demo trades in TradeEdge: same process as live.\n• Ready criteria: 50+ trades, 45%+ win rate, 1:1.5+ avg RR, zero recent violations.\n• "I feel ready" is not criteria — use the numbers.\n• Complete the checklist on every demo session — it builds the habit.` },
        ],
      },
    ],
  },
  {
    id: 'p6',
    part: 6,
    title: 'Tools',
    subtitle: 'Calculators and live resources',
    color: 'text-accent',
    bg: 'bg-accent/10 border-accent/20',
    dot: 'bg-accent',
    lessons: [
      {
        id: 'p6-l1',
        title: 'NQ / ES Risk Calculator',
        readTime: '1 min',
        sections: [
          {
            heading: 'How to use',
            body: `Enter your account size, risk percentage, and stop loss distance in points. The calculator instantly shows how many contracts you can trade across MNQ, NQ, MES, and ES — so you never have to do the maths in the middle of a live session.

**Point values (per contract):**
- MNQ (Micro Nasdaq): 1 point = $2
- NQ (Nasdaq full): 1 point = $20
- MES (Micro S&P): 1 point = $5
- ES (S&P full): 1 point = $50

**Recommendation:** Start each session by entering your current account balance and your planned stop distance. Lock in your contract count before the killzone opens — don't recalculate under pressure.`,
          },
        ],
      },
      {
        id: 'p6-l2',
        title: 'TradingView Killzone Indicator',
        readTime: '2 min',
        sections: [
          {
            heading: 'About this indicator',
            body: `The ICT Killzones & Pivots indicator by TFO is the recommended chart tool for the TradeEdge Method. It overlays the London and NY killzone windows directly on your chart and draws key pivot levels automatically.

**Why this specific indicator:**
- Free to use — no subscription required
- Accurate killzone shading for London (02:00–05:00 EST) and NY (08:30–11:00 EST)
- Draws previous day/week/month highs and lows (your primary liquidity targets)
- Session open lines help you spot the midnight open and Asian range boundaries
- Actively maintained with regular updates

Add it to your chart once and it handles the sessions, pivots, and open levels automatically — reducing the manual level-marking work before each session.`,
          },
        ],
      },
      {
        id: 'p6-l3',
        title: 'Live Session Clock',
        readTime: '1 min',
        sections: [
          {
            heading: 'How to use',
            body: `The session clock shows the current time in EST and tells you exactly where you are relative to the London and NY killzones. If a killzone is active it shows a live indicator. If you are in off-hours it counts down to the next killzone opening.

**Use this to:**
- Quickly check if you are inside a valid killzone before taking any trade
- Plan your pre-session routine around the countdown timer
- Avoid the common mistake of trading in dead hours when the clock shows you are off-session

The clock updates every second and accounts for daylight saving time automatically.`,
          },
        ],
      },
    ],
  },
]

// ─── Component ───────────────────────────────────────────────────────────────

function SectionBlock({ section }) {
  const lines = section.body.split('\n').filter(Boolean)
  return (
    <div className="mb-6">
      <h4 className="text-xs font-semibold uppercase tracking-widest text-secondary mb-3 flex items-center gap-2">
        {section.heading === 'Why It Matters' && <Lightbulb className="w-3.5 h-3.5 text-warning" />}
        {section.heading === 'Common Mistakes' && <AlertTriangle className="w-3.5 h-3.5 text-danger" />}
        {section.heading === 'Quick Summary' && <Target className="w-3.5 h-3.5 text-accent" />}
        {section.heading}
      </h4>
      <div className="space-y-2">
        {lines.map((line, i) => {
          if (line.startsWith('**') && line.endsWith('**')) {
            return <p key={i} className="font-semibold text-primary text-sm">{line.slice(2, -2)}</p>
          }
          if (line.startsWith('• ')) {
            return <p key={i} className="text-sm text-primary/90 leading-relaxed pl-3 border-l-2 border-border">{line.slice(2)}</p>
          }
          if (line.startsWith('- ')) {
            return <p key={i} className="text-sm text-secondary leading-relaxed pl-3">— {line.slice(2)}</p>
          }
          // Bold inline text
          const parts = line.split(/(\*\*[^*]+\*\*)/)
          return (
            <p key={i} className="text-sm text-primary/90 leading-relaxed">
              {parts.map((part, j) =>
                part.startsWith('**') && part.endsWith('**')
                  ? <strong key={j} className="font-semibold text-primary">{part.slice(2, -2)}</strong>
                  : part
              )}
            </p>
          )
        })}
      </div>
    </div>
  )
}

function LessonView({ lesson, onBack }) {
  const [openSections, setOpenSections] = useState(new Set([0]))
  const toggle = (i) => setOpenSections(prev => {
    const next = new Set(prev)
    next.has(i) ? next.delete(i) : next.add(i)
    return next
  })

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-secondary hover:text-primary transition-colors mb-6">
        <ChevronRight className="w-4 h-4 rotate-180" /> Back to lessons
      </button>

      <div className="flex items-center gap-3 mb-2">
        <BookOpen className="w-5 h-5 text-accent" />
        <h2 className="text-xl font-bold text-primary">{lesson.title}</h2>
      </div>
      <div className="flex items-center gap-2 mb-8">
        <Clock className="w-3.5 h-3.5 text-secondary" />
        <span className="text-xs text-secondary">{lesson.readTime} read</span>
      </div>

      {LESSON_DIAGRAMS[lesson.id] && (() => {
        const Diagram = LESSON_DIAGRAMS[lesson.id]
        return <Diagram />
      })()}
      {LESSON_TOOLS[lesson.id] && (() => {
        const Tool = LESSON_TOOLS[lesson.id]
        return <Tool />
      })()}

      <div className="space-y-3">
        {lesson.sections.map((section, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => toggle(i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface2/50 transition-colors"
            >
              <span className={cn('text-sm font-semibold', openSections.has(i) ? 'text-primary' : 'text-secondary')}>
                {section.heading}
              </span>
              {openSections.has(i)
                ? <ChevronUp className="w-4 h-4 text-secondary shrink-0" />
                : <ChevronDown className="w-4 h-4 text-secondary shrink-0" />
              }
            </button>
            {openSections.has(i) && (
              <div className="px-5 pb-5 border-t border-border/60 pt-4">
                <SectionBlock section={section} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function PartSection({ part, selectedLesson, onSelectLesson }) {
  const [expanded, setExpanded] = useState(true)
  const completedCount = 0

  return (
    <div className="mb-6">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between py-2 text-left group"
      >
        <div className="flex items-center gap-2.5">
          <div className={cn('w-2 h-2 rounded-full', part.dot)} />
          <span className={cn('text-xs font-bold uppercase tracking-wider', part.color)}>
            Part {part.part}
          </span>
          <span className="text-xs text-secondary">{part.title}</span>
        </div>
        {expanded
          ? <ChevronUp className="w-3.5 h-3.5 text-secondary group-hover:text-primary transition-colors" />
          : <ChevronDown className="w-3.5 h-3.5 text-secondary group-hover:text-primary transition-colors" />
        }
      </button>
      {expanded && (
        <div className="ml-4 border-l border-border pl-3 mt-1 space-y-0.5">
          {part.lessons.map(lesson => (
            <button
              key={lesson.id}
              onClick={() => onSelectLesson(lesson)}
              className={cn(
                'w-full text-left px-2 py-2 rounded-lg text-sm transition-all flex items-center gap-2 group',
                selectedLesson?.id === lesson.id
                  ? 'bg-accent/10 text-accent'
                  : 'text-secondary hover:text-primary hover:bg-surface2'
              )}
            >
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-border group-hover:text-secondary transition-colors" />
              <span className="truncate">{lesson.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function LearnPage() {
  const { user } = useAuth()
  const isPro = user?.tier === 'PRO'
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const totalLessons = CURRICULUM.reduce((s, p) => s + p.lessons.length, 0)

  if (!isPro) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-accent" />
            The TradeEdge Method
          </h1>
          <p className="text-sm text-secondary mt-0.5">{totalLessons} lessons across 6 parts — from foundations to tools</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-10 text-center">
          <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-5 h-5 text-accent" />
          </div>
          <h2 className="text-lg font-bold text-primary mb-2">The Learning Centre is a Pro feature</h2>
          <p className="text-sm text-secondary max-w-md mx-auto mb-6">
            Upgrade to TradeEdge Pro to unlock the full {totalLessons} lesson curriculum covering market structure, killzones, the two confirmation rule, and the complete trading process.
          </p>
          <Link to="/settings">
            <Button size="lg">
              <Zap className="w-4 h-4" />
              Upgrade to Pro
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-accent" />
            The TradeEdge Method
          </h1>
          <p className="text-sm text-secondary mt-0.5">{totalLessons} lessons across 6 parts — from foundations to tools</p>
        </div>
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className="lg:hidden p-2 rounded-lg text-secondary hover:text-primary hover:bg-surface2 transition-colors"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className={cn(
          'w-64 shrink-0 lg:block',
          sidebarOpen ? 'block fixed inset-y-0 left-0 z-50 bg-background w-72 p-6 overflow-y-auto shadow-2xl' : 'hidden'
        )}>
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-secondary">Curriculum</p>
              {sidebarOpen && (
                <button onClick={() => setSidebarOpen(false)} className="text-secondary hover:text-primary lg:hidden">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {CURRICULUM.map(part => (
              <PartSection
                key={part.id}
                part={part}
                selectedLesson={selectedLesson}
                onSelectLesson={(l) => { setSelectedLesson(l); setSidebarOpen(false) }}
              />
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {selectedLesson ? (
            <div className="bg-surface border border-border rounded-xl p-6">
              <LessonView lesson={selectedLesson} onBack={() => setSelectedLesson(null)} />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Intro banner */}
              <div className="bg-accent/10 border border-accent/20 rounded-xl p-5">
                <h2 className="font-bold text-primary mb-1">Welcome to the TradeEdge Learning Hub</h2>
                <p className="text-sm text-secondary leading-relaxed">
                  This is the complete TradeEdge Method — from market foundations to funded account mastery. Start with Part 1 if you're new, or jump directly to a topic using the curriculum on the left.
                </p>
              </div>

              {/* Parts grid */}
              {CURRICULUM.map(part => (
                <div key={part.id} className={cn('border rounded-xl p-5', part.bg)}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold', part.color, 'bg-background/40')}>
                      {part.part}
                    </div>
                    <div>
                      <h3 className={cn('font-bold', part.color)}>{part.title}</h3>
                      <p className="text-xs text-secondary">{part.subtitle}</p>
                    </div>
                    <span className="ml-auto text-xs text-secondary">{part.lessons.length} lessons</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {part.lessons.map(lesson => (
                      <button
                        key={lesson.id}
                        onClick={() => setSelectedLesson(lesson)}
                        className="flex items-center gap-2.5 p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-all text-left group"
                      >
                        <BookOpen className="w-4 h-4 text-secondary group-hover:text-accent transition-colors shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-primary group-hover:text-accent transition-colors truncate">{lesson.title}</p>
                          <p className="text-xs text-secondary">{lesson.readTime} read</p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-secondary ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
