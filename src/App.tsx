import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import AuthGuard from './components/AuthGuard'
import AdminGuard from './components/AdminGuard'
import PageLoader from './components/PageLoader'

/* ── Public pages (eagerly loaded — small, needed immediately) ── */
import LandingPage from './pages/LandingPage'

/* ── Auth pages ── */
const LoginPage = lazy(() => import('./pages/LoginPage'))
const SignupPage = lazy(() => import('./pages/SignupPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const InvitationPage = lazy(() => import('./pages/InvitationPage'))

/* ── Protected app pages ── */
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const CalendarPage = lazy(() => import('./pages/CalendarPage'))
const ProgramsPage = lazy(() => import('./pages/ProgramsPage'))
const ProgramWizardPage = lazy(() => import('./pages/ProgramWizard'))
const WorkoutProgramBuilderPage = lazy(() => import('./pages/WorkoutProgramBuilderPage'))
const ProgramCardPage = lazy(() => import('./pages/ProgramCardPage'))
const ExerciseLibraryPage = lazy(() => import('./pages/ExerciseLibraryPage'))
const SmartProgramFinderPage = lazy(() => import('./pages/SmartProgramFinderPage'))
const ProgramMatcherPage = lazy(() => import('./pages/ProgramMatcherPage'))
const OneRMCalculatorPage = lazy(() => import('./pages/OneRMCalculatorPage'))
const WorkoutSessionPage = lazy(() => import('./pages/WorkoutSessionPage'))
const WorkoutHistoryPage = lazy(() => import('./pages/WorkoutHistoryPage'))
const ExerciseDetailPage = lazy(() => import('./pages/ExerciseDetailPage'))
const ProgressTrackingPage = lazy(() => import('./pages/ProgressTrackingPage'))
const BioPrintWizardPage = lazy(() => import('./pages/BioPrintWizardPage'))
const ClientProfilePage = lazy(() => import('./pages/ClientProfilePage'))
const ClientDirectory = lazy(() => import('./pages/ClientDirectory'))
const NutritionPage = lazy(() => import('./pages/NutritionPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const PhotosPage = lazy(() => import('./pages/PhotosPage'))
const PlannedFeaturesPage = lazy(() => import('./pages/PlannedFeaturesPage'))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'))
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'))
const ProgramLibraryPage = lazy(() => import('./pages/ProgramLibraryPage'))

/* ── Admin pages ── */
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'))

/** Wrapper for protected routes: AuthGuard → Layout → Suspense */
function Protected({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          {children}
        </Suspense>
      </Layout>
    </AuthGuard>
  )
}

/** Wrapper for admin routes: AuthGuard → AdminGuard → Layout → Suspense */
function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AdminGuard>
        <Layout>
          <Suspense fallback={<PageLoader />}>
            {children}
          </Suspense>
        </Layout>
      </AdminGuard>
    </AuthGuard>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Suspense fallback={<PageLoader />}><LoginPage /></Suspense>} />
      <Route path="/signup" element={<Suspense fallback={<PageLoader />}><SignupPage /></Suspense>} />
      <Route path="/forgot-password" element={<Suspense fallback={<PageLoader />}><ForgotPasswordPage /></Suspense>} />
      <Route path="/invitation/:token" element={<Suspense fallback={<PageLoader />}><InvitationPage /></Suspense>} />

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
