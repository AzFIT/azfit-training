import { useAuthStore } from '../../stores/authStore'
import { useAppDataStore } from '../../stores/useAppDataStore'
import MyNutritionTab from './MyNutritionTab'

export default function ClientPortalNutritionPage() {
  const { user } = useAuthStore()
  const clients = useAppDataStore((s) => s.clients)

  const clientId = Object.values(clients).find(
    (c) => c.email === user?.email
  )?.id ?? Object.keys(clients)[0] ?? 'demo-client'

  return <MyNutritionTab clientId={clientId} />
}
