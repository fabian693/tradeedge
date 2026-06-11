import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Brain, CheckCircle } from 'lucide-react'
import { useSubmitBaseline } from '../../hooks/usePsychology'
import { Button } from '../../components/shared/Button'

const QUESTIONS = [
  "When I lose a trade, I typically feel the urge to immediately place another trade to recover the loss.",
  "I can clearly define my edge and explain why I take each trade.",
  "I have previously blown a trading account due to emotional decisions.",
  "I find it easy to walk away from the charts after hitting my daily profit target.",
  "I often second-guess my entries even when all my criteria are met.",
  "I have taken trades outside my defined strategy because the market 'looked good.'",
  "I can accept a loss without it affecting my mood for the rest of the day.",
  "I feel more pressure to perform when I know I need money from trading.",
  "I have a clear pre-session routine I follow consistently before trading.",
  "I tend to move my stop loss further away to avoid being stopped out.",
  "When I have a losing streak, I increase my position size to recover faster.",
  "I review my trades after every session regardless of the outcome.",
  "I trade when I am tired, stressed, or emotionally compromised.",
  "I can clearly identify when market conditions do not match my setup criteria and choose not to trade.",
  "I have previously purchased trading courses or signals that did not improve my results.",
  "I feel confident in my ability to follow my rules consistently under pressure.",
  "I track my performance data and make decisions based on evidence not feelings.",
  "I have a defined maximum daily loss that I respect without exception.",
  "I compare myself negatively to other traders on social media.",
  "I believe my trading results are primarily determined by my psychology and discipline rather than the strategy itself.",
]

const NEGATIVE_INDICES = new Set([0, 2, 4, 5, 7, 9, 10, 12, 14, 18])

const SCALE_LABELS = ['Strongly\nDisagree', 'Disagree', 'Neutral', 'Agree', 'Strongly\nAgree']

function getProfile(score) {
  if (score >= 80) return 'DISCIPLINED'
  if (score >= 60) return 'DEVELOPING'
  if (score >= 40) return 'EMOTIONAL'
  return 'HIGH_RISK'
}

const PROFILE_CONFIG = {
  DISCIPLINED: {
    color: 'text-accent',
    bg: 'bg-accent/10 border-accent/30',
    label: 'Disciplined Trader',
    message:
      'You demonstrate strong psychological discipline. Your systematic approach and emotional control are your biggest edge. Focus on refining your execution.',
  },
  DEVELOPING: {
    color: 'text-warning',
    bg: 'bg-warning/10 border-warning/30',
    label: 'Developing Trader',
    message:
      'You have a solid foundation with clear areas to develop. Work on consistency in your routine and managing reactive emotions around losses.',
  },
  EMOTIONAL: {
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/30',
    label: 'Emotional Trader',
    message:
      'Emotional responses are currently impacting your trading. Prioritise your daily check-in and never trade on a NO-GO day. The psychology system will be crucial for you.',
  },
  HIGH_RISK: {
    color: 'text-danger',
    bg: 'bg-danger/10 border-danger/30',
    label: 'High Risk Trader',
    message:
      'Your current psychological patterns carry significant risk. Commit fully to the daily check-in system, consider a demo period, and review Part 4 of the TradeEdge Method.',
  },
}

export default function BaselinePage() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState(Array(20).fill(null))
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const submitBaseline = useSubmitBaseline()

  const answered = answers.filter((a) => a !== null).length
  const progress = (current / QUESTIONS.length) * 100

  async function selectAnswer(value) {
    const newAnswers = [...answers]
    newAnswers[current] = value
    setAnswers(newAnswers)

    if (current < QUESTIONS.length - 1) {
      setTimeout(() => setCurrent((c) => c + 1), 180)
    } else {
      // Last question — compute and submit
      setSubmitting(true)
      const scores = newAnswers.map((raw, i) => {
        if (raw == null) return 3
        return NEGATIVE_INDICES.has(i) ? 6 - raw : raw
      })
      const total = scores.reduce((s, v) => s + v, 0)
      const normalised = Math.round((total / (20 * 5)) * 100)
      const profile = getProfile(normalised)
      try {
        await submitBaseline.mutateAsync({ scores: newAnswers })
      } catch {
        // Show results regardless of API status
      }
      setSubmitting(false)
      setResult({ profile, score: normalised })
    }
  }

  if (submitting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Brain className="w-12 h-12 text-accent mx-auto mb-4 animate-pulse" />
          <p className="text-primary font-semibold">Calculating your profile…</p>
        </div>
      </div>
    )
  }

  if (result) {
    const cfg = PROFILE_CONFIG[result.profile]
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-primary mb-2">Assessment Complete</h1>
            <p className="text-secondary">Here is your psychological trading profile</p>
          </div>
          <div className={`border rounded-2xl p-8 mb-6 ${cfg.bg}`}>
            <div className="text-center mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Profile Type</p>
              <h2 className={`text-3xl font-bold mb-1 ${cfg.color}`}>{cfg.label}</h2>
              <div className="flex items-end justify-center gap-2 mt-4">
                <span className={`text-6xl font-mono font-bold ${cfg.color}`}>{result.score}</span>
                <span className="text-secondary text-lg mb-1">/100</span>
              </div>
            </div>
            <div className="w-full bg-background/40 rounded-full h-3 mb-6">
              <div
                className={`h-3 rounded-full transition-all duration-1000 ${
                  result.profile === 'DISCIPLINED'
                    ? 'bg-accent'
                    : result.profile === 'DEVELOPING'
                    ? 'bg-warning'
                    : result.profile === 'EMOTIONAL'
                    ? 'bg-orange-400'
                    : 'bg-danger'
                }`}
                style={{ width: `${result.score}%` }}
              />
            </div>
            <p className="text-sm text-primary/90 leading-relaxed text-center">{cfg.message}</p>
          </div>
          <Button className="w-full" size="lg" onClick={() => navigate('/dashboard', { replace: true })}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-accent/4 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
              <Brain className="w-5 h-5 text-accent" />
            </div>
            <span className="text-xl font-bold text-primary">Psychology Baseline</span>
          </div>
          <p className="text-sm text-secondary">
            Question {current + 1} of {QUESTIONS.length}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-surface2 rounded-full h-1.5 mb-8">
          <div
            className="h-1.5 rounded-full bg-accent transition-all duration-400"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8 shadow-2xl">
          {/* Question number pill */}
          <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-surface2 text-xs font-mono text-secondary mb-5">
            Q{current + 1}
          </div>

          <p className="text-base font-medium text-primary leading-relaxed mb-8 min-h-[4.5rem]">
            {QUESTIONS[current]}
          </p>

          {/* Scale buttons */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((val) => (
              <button
                key={val}
                onClick={() => selectAnswer(val)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-150 cursor-pointer ${
                  answers[current] === val
                    ? 'border-accent bg-accent/15 text-accent shadow-lg shadow-accent/10'
                    : 'border-border bg-surface2 text-secondary hover:border-accent/50 hover:text-primary hover:bg-surface2/80'
                }`}
              >
                <span className="text-2xl font-bold font-mono leading-none">{val}</span>
                <span className="text-[9px] leading-tight text-center whitespace-pre-line hidden sm:block">
                  {SCALE_LABELS[val - 1]}
                </span>
              </button>
            ))}
          </div>

          <div className="flex justify-between">
            <span className="text-xs text-secondary">Strongly Disagree</span>
            <span className="text-xs text-secondary">Strongly Agree</span>
          </div>

          {current > 0 && (
            <button
              onClick={() => setCurrent((c) => c - 1)}
              className="mt-5 text-xs text-secondary hover:text-primary transition-colors underline underline-offset-2"
            >
              Back to previous question
            </button>
          )}
        </div>

        {/* Answered count */}
        <p className="text-center text-xs text-secondary mt-4">{answered} of 20 answered</p>
      </div>
    </div>
  )
}
