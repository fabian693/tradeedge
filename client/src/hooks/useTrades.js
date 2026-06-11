import { useQuery, useMutation } from '@tanstack/react-query'
import { queryClient } from '../lib/queryClient'
import api from '../lib/axios'

export function useTrades(filters = {}) {
  const params = new URLSearchParams()
  if (filters.accountId) params.set('accountId', filters.accountId)
  if (filters.symbol) params.set('symbol', filters.symbol)
  if (filters.direction) params.set('direction', filters.direction)
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.set('dateTo', filters.dateTo)
  if (filters.page) params.set('page', filters.page)
  if (filters.limit) params.set('limit', filters.limit)

  return useQuery({
    queryKey: ['trades', filters],
    queryFn: async () => {
      const { data } = await api.get(`/trades?${params.toString()}`)
      return data
    },
  })
}

export function useTrade(id) {
  return useQuery({
    queryKey: ['trades', id],
    queryFn: async () => {
      const { data } = await api.get(`/trades/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateTrade() {
  return useMutation({
    mutationFn: (payload) => api.post('/trades', payload).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trades'] }),
  })
}

export function useUpdateTrade() {
  return useMutation({
    mutationFn: ({ id, ...payload }) =>
      api.patch(`/trades/${id}`, payload).then((r) => r.data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['trades'] })
      queryClient.invalidateQueries({ queryKey: ['trades', vars.id] })
    },
  })
}

export function useDeleteTrade() {
  return useMutation({
    mutationFn: (id) => api.delete(`/trades/${id}`).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trades'] }),
  })
}

export function useAnalyzeScreenshot() {
  return useMutation({
    mutationFn: (file) => {
      const formData = new FormData()
      formData.append('screenshot', file)
      return api
        .post('/trades/analyze-screenshot', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((r) => r.data)
    },
  })
}

export function useUploadScreenshot() {
  return useMutation({
    mutationFn: ({ id, file }) => {
      const formData = new FormData()
      formData.append('screenshot', file)
      return api
        .post(`/trades/${id}/screenshot`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((r) => r.data)
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['trades'] })
      queryClient.invalidateQueries({ queryKey: ['trades', vars.id] })
    },
  })
}

export function useImportCsv() {
  return useMutation({
    mutationFn: ({ file, accountId }) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('accountId', accountId)
      return api
        .post('/trades/import-csv', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((r) => r.data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trades'] }),
  })
}

export function useRateTrade() {
  return useMutation({
    mutationFn: ({ id, ...payload }) => api.post(`/trades/${id}/rate`, payload).then((r) => r.data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['trades'] })
      queryClient.invalidateQueries({ queryKey: ['trades', vars.id] })
    },
  })
}
