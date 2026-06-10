import { useAuthStore } from '../../stores/authStore'
import { useAppDataStore } from '../../stores/useAppDataStore'
import TodayWorkoutTab from './TodayWorkoutTab'

/**
 * ClientPortalPage — Main entry point for the client portal.
 * Shows the Today tab by default with today's workout or rest day.
 */
export default function ClientPortalPage() {
  const { user } = useAuthStore()
  const clients = useAppDataStore((s) => s.clients)

  // For demo: find a client that matches the logged-in user's email, or use first client
  const clientId = Object.values(clients).find(
    (c) => c.email === user?.email
  )?.id ?? Object.keys(clients)[0] ?? 'demo-client'

  return <TodayWorkoutTab clientId={clientId} />
}
