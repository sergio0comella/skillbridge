import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { LandingPage } from './pages/LandingPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { DiscoverPage } from './pages/DiscoverPage'
import { SessionDetailPage } from './pages/SessionDetailPage'
import { BookingPage } from './pages/BookingPage'
import { LearnerDashboard } from './pages/LearnerDashboard'
import { TeacherDashboard } from './pages/TeacherDashboard'
import { TemplatesPage } from './pages/TemplatesPage'
import { ProfilePage } from './pages/ProfilePage'
import { DashboardPage } from './pages/DashboardPage'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/session/:id" element={<SessionDetailPage />} />
            <Route path="/book/:id" element={<BookingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/learner" element={<LearnerDashboard />} />
            <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/guide/:id" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}