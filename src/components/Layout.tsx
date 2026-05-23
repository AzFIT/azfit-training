/**
 * Layout - App layout wrapper
 * Conditionally renders Navbar/Footer for public pages, AppSidebar for dashboard pages.
 * Includes AI Chat bubble on all pages when enabled.
 */
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUIStore } from '@/stores/useUIStore';
import Navbar from './Navbar';
import Footer from './Footer';
import AppSidebar from './AppSidebar';
import PortalNavbar from './PortalNavbar';
import MultiClientBar from './MultiClientBar';
import AIChat from './ai-chat/AIChat';

const publicRoutes = ['/', '/login', '/signup', '/onboarding', '/forgot-password', '/brand-story', '/subscribe', '/invitation'];

function isPublicRoute(path: string): boolean {
  return publicRoutes.some((r) => path === r || path.startsWith(r + '/'));
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const { display } = useUIStore();
  const publicPage = isPublicRoute(location.pathname);
  const showDashboard = isAuthenticated && !publicPage;

  return (
    <div className={showDashboard ? 'flex min-h-[100dvh] bg-gray-50 dark:bg-[#0A0A0A]' : 'min-h-[100dvh] bg-transparent'}>
      {/* Public Navbar */}
      {publicPage && <Navbar />}

      {/* Dashboard Sidebar */}
      {showDashboard && <AppSidebar />}

      <div className={`flex-1 flex flex-col min-h-[100dvh] ${publicPage ? '' : ''}`}>
        {/* Dashboard Top Bar */}
        {showDashboard && <PortalNavbar />}

        {/* Main Content */}
        <main className={`flex-1 ${publicPage ? '' : ''}`}>
          <div key={location.pathname} className="animate-[fadeIn_0.3s_ease-out]">
            {children}
          </div>
        </main>

        {/* Public Footer */}
        {publicPage && <Footer />}

        {/* Multi-Client Tab Bar */}
        {showDashboard && <MultiClientBar />}
      </div>

      {/* AI Chat Bubble — appears on all pages when enabled */}
      {display?.showAIChatBubble !== false && <AIChat />}
    </div>
  );
}
