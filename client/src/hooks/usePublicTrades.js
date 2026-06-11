import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios'

export function usePublicTrades() {
  return useQuery({
    queryKey: ['public', 'trades'],
    queryFn: async () => {
      const { data } = await api.get('/public/trades')
      return data
    },
  })
}

export function useLiveTrades(enabled) {
  return useQuery({
    queryKey: ['public', 'trades', 'live'],
    queryFn: async () => {
      const { data } = await api.get('/public/trades/live')
      return data
    },
    enabled: !!enabled,
    refetchInterval: enabled ? 15000 : false,
    retry: false,
  })
}
