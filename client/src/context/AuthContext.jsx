import { createContext, useCallback } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { queryClient } from '../lib/queryClient'
import api from '../lib/axios'

export const AuthContext = createContext(null)

async function fetchMe() {
  const { data } = await api.get('/auth/me')
  return data?.user ?? data
}

export function AuthProvider({ children }) {
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchMe,
    retry: false,
    staleTime: 1000 * 60 * 5,
  })

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    return data
  }, [])

  const loginGoogle = useCallback(() => {
    const apiUrl = import.meta.env.VITE_API_URL || '/api'
    window.location.href = `${apiUrl}/auth/google`
  }, [])

  const logout = useCallback(async () => {
    await api.post('/auth/logout')
    queryClient.clear()
  }, [])

  const register = useCallback(async (formData) => {
    const { data } = await api.post('/auth/register', formData)
    await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    return data
  }, [])

  const value = {
    user: error ? null : user,
    isLoading,
    isAuthenticated: !!user && !error,
    login,
    loginGoogle,
    logout,
    register,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
