import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { FullPageLoader } from './components/shared/LoadingSpinner'
import { useAuth } from './hooks/useAuth'

// Marketing pages
import LandingPage from './pages/marketing/LandingPage'
import FabiansTradesPage from './pages/public/FabiansTradesPage'

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'

// App pages
import DashboardPage from './pages/DashboardPage'
import JournalPage from './pages/journal/JournalPage'
import NewTradePage from './pages/journal/NewTradePage'
import ChecklistPage from './pages/checklist/ChecklistPage'
import PsychologyPage from './pages/psychology/PsychologyPage'
import BaselinePage from './pages/psychology/BaselinePage'
import AnalyticsPage from './pages/analytics/AnalyticsPage'
import WeeklyReviewPage from './pages/review/WeeklyReviewPage'
import CalendarPage from './pages/calendar/CalendarPage'
import AccountsPage from './pages/accounts/AccountsPage'
import LearnPage from './pages/learn/LearnPage'
import SettingsPage from './pages/settings/SettingsPage'

function AuthRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <FullPageLoader />
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

function HomeRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <FullPageLoader />
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <LandingPage />
}

export default function App() {
  return (
    <Routes>
      {/* Public marketing homepage */}
      <Route path="/" element={<HomeRoute />} />

      {/* Public Fabian's Trades feed */}
      <Route path="/fabians-trades" element={<FabiansTradesPage />} />

      {/* Public auth routes */}
      <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
      <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Baseline — auth required but no baseline guard */}
      <Route path="/psychology/baseline" element={<BaselinePage />} />

      {/* Protected app routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="journal" element={<JournalPage />} />
          <Route path="journal/new" element={<NewTradePage />} />
          <Route path="journal/:id" element={<JournalPage />} />
          <Route path="checklist" element={<ChecklistPage />} />
          <Route path="psychology" element={<PsychologyPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="review" element={<WeeklyReviewPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="accounts" element={<AccountsPage />} />
          <Route path="learn" element={<LearnPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
