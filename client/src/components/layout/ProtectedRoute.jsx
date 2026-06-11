import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useBaseline } from '../../hooks/usePsychology'
import { FullPageLoader } from '../shared/LoadingSpinner'

export function ProtectedRoute() {
  const { user, isLoading, isAuthenticated } = useAuth()

  if (isLoading) return <FullPageLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return <BaselineGuard />
}

function BaselineGuard() {
  const { data: baseline, isLoading } = useBaseline()

  if (isLoading) return <FullPageLoader />

  if (!baseline) {
    return <Navigate to="/psychology/baseline" replace />
  }

  return <Outlet />
}
