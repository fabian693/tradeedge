import { useQuery, useMutation } from '@tanstack/react-query'
import { queryClient } from '../lib/queryClient'
import api from '../lib/axios'

export function useTodayCheckin() {
  return useQuery({
    queryKey: ['psychology', 'checkin', 'today'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/psychology/checkins/today')
        return data?.checkin ?? data ?? null
      } catch {
        return null
      }
    },
  })
}

export function useBaseline() {
  return useQuery({
    queryKey: ['psychology', 'baseline'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/psychology/baseline')
        return data?.baseline ?? data ?? null
      } catch {
        return null
      }
    },
  })
}

export function useCheckinHistory(limit = 30) {
  return useQuery({
    queryKey: ['psychology', 'checkins', limit],
    queryFn: async () => {
      const { data } = await api.get(`/psychology/checkins?limit=${limit}`)
      return data?.checkins ?? data ?? []
    },
  })
}

export function useSubmitCheckin() {
  return useMutation({
    mutationFn: (payload) =>
      api.post('/psychology/checkins', payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['psychology', 'checkin', 'today'] })
      queryClient.invalidateQueries({ queryKey: ['psychology', 'checkins'] })
    },
  })
}

export function useSubmitBaseline() {
  return useMutation({
    mutationFn: (payload) =>
      api.post('/psychology/baseline', payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['psychology', 'baseline'] })
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    },
  })
}

export function useSubmitReflection() {
  return useMutation({
    mutationFn: (payload) =>
      api.post('/psychology/reflections', payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['psychology', 'reflections'] })
    },
  })
}

export function useReflections(limit = 20) {
  return useQuery({
    queryKey: ['psychology', 'reflections', limit],
    queryFn: async () => {
      const { data } = await api.get(`/psychology/reflections?limit=${limit}`)
      return data?.reflections ?? data ?? []
    },
  })
}
