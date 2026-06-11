import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios'

function buildParams(accountId, period) {
  const params = new URLSearchParams()
  if (period) params.set('period', period)
  if (accountId) params.set('accountId', accountId)
  return params.toString()
}

export function useAnalyticsSummary(accountId, period = '30d') {
  return useQuery({
    queryKey: ['analytics', 'summary', accountId, period],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/overview?${buildParams(accountId, period)}`)
      return data
    },
  })
}

export function useEquityCurve(accountId, period = '30d') {
  return useQuery({
    queryKey: ['analytics', 'equity', accountId, period],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/equity?${buildParams(accountId, period)}`)
      // Normalise to { date, balance } shape for Recharts
      const raw = data?.equityPoints ?? data?.points ?? (Array.isArray(data) ? data : [])
      return raw.map(p => ({
        date: p.date ? new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : p.date,
        balance: p.balance ?? p.equity ?? 0,
      }))
    },
  })
}

export function useWinRateBySession(accountId) {
  return useQuery({
    queryKey: ['analytics', 'by-session', accountId],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/by-session?${buildParams(accountId)}`)
      return data?.bySession ?? data ?? []
    },
  })
}

export function useWinRateByConfirmation(accountId) {
  return useQuery({
    queryKey: ['analytics', 'by-confirmation', accountId],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/by-confirmation?${buildParams(accountId)}`)
      return data?.byConfirmation ?? data ?? []
    },
  })
}

export function useWinRateByMarket(accountId) {
  return useQuery({
    queryKey: ['analytics', 'by-market', accountId],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/by-market?${buildParams(accountId)}`)
      return data?.byMarket ?? data ?? []
    },
  })
}

export function useWinRateByGrade(accountId) {
  return useQuery({
    queryKey: ['analytics', 'by-grade', accountId],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/by-grade?${buildParams(accountId)}`)
      return data?.byGrade ?? data ?? []
    },
  })
}

export function usePsychologyCorrelation(accountId) {
  return useQuery({
    queryKey: ['analytics', 'psych-correlation', accountId],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/psychology-correlation?${buildParams(accountId)}`)
      return data?.correlation ?? data ?? []
    },
  })
}

export function useWeeklyComparison(accountId) {
  return useQuery({
    queryKey: ['analytics', 'weekly-comparison', accountId],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/weekly-comparison?${buildParams(accountId)}`)
      return data
    },
  })
}

export function useCalendar(accountId, month) {
  return useQuery({
    queryKey: ['analytics', 'calendar', accountId, month],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (accountId) params.set('accountId', accountId)
      if (month) params.set('month', month)
      const { data } = await api.get(`/analytics/calendar?${params.toString()}`)
      return data
    },
  })
}
