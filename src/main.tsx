import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './index.css'
import App from './App.tsx'
import { queryClient } from './lib/queryClient'
import { useAuthStore, initAuthListener } from './stores/authStore'
import ErrorBoundary from './components/ErrorBoundary'

// Initialize auth state on app load
useAuthStore.getState().loadSession()

// Start global auth state listener
initAuthListener()

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <App />
      </HashRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </ErrorBoundary>,
)
