import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import Layout from '@/components/Layout';
import PageLoader from '@/components/PageLoader';

/* Public Pages — eagerly loaded (first visit) */
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';

/* Dashboard Pages — lazy loaded (code split) */
const SignupPage = lazy(() => import('@/pages/SignupPage'));
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const BrandStoryPage = lazy(() => import('@/pages/BrandStoryPage'));
const SubscriptionPage = lazy(() => import('@/pages/SubscriptionPage'));
const InvitationPage = lazy(() => import('@/pages/InvitationPage'));
const TrainerDashboard = lazy(() => import('@/pages/stubs/TrainerDashboard'));
const ClientDirectory = lazy(() => import('@/pages/stubs/ClientDirectory'));
const ClientProfile = lazy(() => import('@/pages/stubs/ClientProfile'));
const CalendarPage = lazy(() => import('@/pages/stubs/CalendarPage'));
const AssessmentForms = lazy(() => import('@/pages/stubs/AssessmentForms'));
const NotificationsPage = lazy(() => import('@/pages/stubs/NotificationsPage'));
const ProgramsPage = lazy(() => import('@/pages/ProgramsPage'));
const NutritionPage = lazy(() => import('@/pages/NutritionPage'));
const ProgramWizardPage = lazy(() => import('@/pages/ProgramWizardPage'));
const ProgramLibraryPage = lazy(() => import('@/pages/ProgramLibraryPage'));
const ExerciseLibraryPage = lazy(() => import('@/pages/ExerciseLibraryPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));

const publicRoutes = ['/', '/login', '/signup', '/onboarding', '/forgot-password', '/brand-story', '/subscribe', '/invitation'];

function isPublicRoute(path: string): boolean {
  return publicRoutes.some((r) => path === r || path.startsWith(r + '/'));
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const path = window.location.hash.replace('#', '') || '/';

  if (!isAuthenticated && !isPublicRoute(path)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Layout>
      <AuthGuard>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes — Landing + Login eagerly loaded for fast first paint */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Public routes — lazy loaded */}
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/brand-story" element={<BrandStoryPage />} />
            <Route path="/subscribe" element={<SubscriptionPage />} />
            <Route path="/invitation/:token" element={<InvitationPage />} />

            {/* Dashboard routes — lazy loaded */}
            <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
            <Route path="/trainer/clients" element={<ClientDirectory />} />
            <Route path="/trainer/client/:id" element={<ClientProfile />} />
            <Route path="/trainer/calendar" element={<CalendarPage />} />
            <Route path="/trainer/assessments" element={<AssessmentForms />} />
            <Route path="/trainer/programs" element={<ProgramsPage />} />
            <Route path="/trainer/nutrition" element={<NutritionPage />} />
            <Route path="/exercises" element={<ExerciseLibraryPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />

            {/* Settings */}
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/trainer/settings" element={<SettingsPage />} />

            {/* Program Design Wizard routes */}
            <Route path="/programs/design" element={<ProgramWizardPage />} />
            <Route path="/programs/library" element={<ProgramLibraryPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthGuard>
    </Layout>
  );
}
