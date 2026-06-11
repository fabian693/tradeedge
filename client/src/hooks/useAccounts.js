import { useQuery, useMutation } from '@tanstack/react-query'
import { queryClient } from '../lib/queryClient'
import api from '../lib/axios'

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const { data } = await api.get('/accounts')
      return data?.accounts ?? data ?? []
    },
  })
}

export function useAccount(id) {
  return useQuery({
    queryKey: ['accounts', id],
    queryFn: async () => {
      const { data } = await api.get(`/accounts/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateAccount() {
  return useMutation({
    mutationFn: (payload) => api.post('/accounts', payload).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounts'] }),
  })
}

export function useUpdateAccount() {
  return useMutation({
    mutationFn: ({ id, ...payload }) =>
      api.patch(`/accounts/${id}`, payload).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounts'] }),
  })
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: (id) => api.delete(`/accounts/${id}`).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounts'] }),
  })
}
