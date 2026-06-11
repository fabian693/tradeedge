import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import api from '../../lib/axios'
import { Input } from '../../components/shared/Input'
import { Button } from '../../components/shared/Button'
import { LogoIcon } from '../../components/shared/Logo'

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
})

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  async function onSubmit(values) {
    try {
      await api.post('/auth/forgot-password', { email: values.email })
      setSentEmail(values.email)
      setSent(true)
    } catch (err) {
      // Always show success to avoid email enumeration
      setSentEmail(values.email)
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/4 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-6">
            <LogoIcon className="w-10 h-10" />
            <span className="text-xl font-bold tracking-tight text-primary">TradeEdge</span>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 shadow-2xl">
          {sent ? (
            <div className="text-center py-2">
              <div className="w-12 h-12 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-accent" />
              </div>
              <h2 className="text-lg font-semibold text-primary mb-2">Check your email</h2>
              <p className="text-sm text-secondary mb-1">
                If an account exists for{' '}
                <span className="text-primary font-medium">{sentEmail}</span>
              </p>
              <p className="text-sm text-secondary mb-6">
                we&apos;ve sent password reset instructions.
              </p>
              <p className="text-xs text-secondary">
                Didn&apos;t receive it? Check spam or{' '}
                <button
                  onClick={() => setSent(false)}
                  className="text-accent hover:underline"
                >
                  try again
                </button>
                .
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-primary mb-1">Reset your password</h2>
              <p className="text-sm text-secondary mb-5">
                Enter your email and we&apos;ll send you a reset link.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  leftIcon={<Mail className="w-4 h-4" />}
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Button
                  type="submit"
                  className="w-full"
                  loading={isSubmitting}
                >
                  Send reset link
                </Button>
              </form>
            </>
          )}
        </div>

        <div className="text-center mt-5">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-secondary hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
