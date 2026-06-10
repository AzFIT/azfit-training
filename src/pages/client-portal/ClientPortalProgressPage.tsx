import { useAuthStore } from '../../stores/authStore'
import { useAppDataStore } from '../../stores/useAppDataStore'
import MyProgressTab from './MyProgressTab'

export default function ClientPortalProgressPage() {
  const { user } = useAuthStore()
  const clients = useAppDataStore((s) => s.clients)

  const clientId = Object.values(clients).find(
    (c) => c.email === user?.email
  )?.id ?? Object.keys(clients)[0] ?? 'demo-client'

  return <MyProgressTab clientId={clientId} />
}
