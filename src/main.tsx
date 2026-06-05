import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './index.css'
import App from './App.tsx'
import { queryClient } from './lib/queryClient'

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <HashRouter>
      <App />
    </HashRouter>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>,
)
