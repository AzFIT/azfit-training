import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import AuthGuard from './components/AuthGuard'
import AdminGuard from './components/AdminGuard'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import CalendarPage from './pages/CalendarPage'
import ProgramsPage from './pages/ProgramsPage'
import ProgramWizardPage from './pages/ProgramWizard'
import ClientProfilePage from './pages/ClientProfilePage'
import ClientDirectory from './pages/ClientDirectory'
import NutritionPage from './pages/NutritionPage'
import SettingsPage from './pages/SettingsPage'
import PhotosPage from './pages/PhotosPage'
import PlannedFeaturesPage from './pages/PlannedFeaturesPage'
import WorkoutProgramBuilderPage from './pages/WorkoutProgramBuilderPage'
import ProgramCardPage from './pages/ProgramCardPage'
import ExerciseLibraryPage from './pages/ExerciseLibraryPage'
import SmartProgramFinderPage from './pages/SmartProgramFinderPage'
import ProgramMatcherPage from './pages/ProgramMatcherPage'
import OneRMCalculatorPage from './pages/OneRMCalculatorPage'
import WorkoutSessionPage from './pages/WorkoutSessionPage'
import WorkoutHistoryPage from './pages/WorkoutHistoryPage'
import ExerciseDetailPage from './pages/ExerciseDetailPage'
import ProgressTrackingPage from './pages/ProgressTrackingPage'
import BioPrintWizardPage from './pages/BioPrintWizardPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import InvitationPage from './pages/InvitationPage'
import NotificationsPage from './pages/NotificationsPage'
import SubscriptionPage from './pages/SubscriptionPage'
import ProgramLibraryPage from './pages/ProgramLibraryPage'
import AdminDashboardPage from './pages/AdminDashboardPage'

/** Wrapper for protected routes: AuthGuard → Layout */
function Protected({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <Layout>{children}</Layout>
    </AuthGuard>
  )
}

/** Wrapper for admin routes: AuthGuard → AdminGuard → Layout */
function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AdminGuard>
        <Layout>{children}</Layout>
      </AdminGuard>
    </AuthGuard>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/invitation/:token" element={<InvitationPage />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
      <Route path="/calendar" element={<Protected><CalendarPage /></Protected>} />
      <Route path="/programs" element={<Protected><ProgramsPage /></Protected>} />
      <Route path="/programs/new" element={<Protected><ProgramWizardPage /></Protected>} />
      <Route path="/program-builder" element={<Protected><WorkoutProgramBuilderPage /></Protected>} />
      <Route path="/program-builder/card/:programId" element={<Protected><ProgramCardPage /></Protected>} />
      <Route path="/exercise-library" element={<Protected><ExerciseLibraryPage /></Protected>} />
      <Route path="/smart-finder" element={<Protected><SmartProgramFinderPage /></Protected>} />
      <Route path="/program-matcher" element={<Protected><ProgramMatcherPage /></Protected>} />
      <Route path="/tools/1rm-calculator" element={<Protected><OneRMCalculatorPage /></Protected>} />
      <Route path="/clients/:clientId/workout/:programId" element={<Protected><WorkoutSessionPage /></Protected>} />
      <Route path="/clients/:clientId/workouts" element={<Protected><WorkoutHistoryPage /></Protected>} />
      <Route path="/clients/:clientId/exercises/:exerciseId" element={<Protected><ExerciseDetailPage /></Protected>} />
      <Route path="/clients/:clientId/progress" element={<Protected><ProgressTrackingPage /></Protected>} />
      <Route path="/clients/:id/bioprint" element={<Protected><BioPrintWizardPage /></Protected>} />
      <Route path="/clients/:id" element={<Protected><ClientProfilePage /></Protected>} />
      <Route path="/clients" element={<Protected><ClientDirectory /></Protected>} />
      <Route path="/nutrition" element={<Protected><NutritionPage /></Protected>} />
      <Route path="/settings" element={<Protected><SettingsPage /></Protected>} />
      <Route path="/photos" element={<Protected><PhotosPage /></Protected>} />
      <Route path="/roadmap" element={<Protected><PlannedFeaturesPage /></Protected>} />
      <Route path="/notifications" element={<Protected><NotificationsPage /></Protected>} />
      <Route path="/subscription" element={<Protected><SubscriptionPage /></Protected>} />
      <Route path="/programs/library" element={<Protected><ProgramLibraryPage /></Protected>} />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
    </Routes>
  )
}
