import { useAuth } from "../context/AuthContext"

export default function useRole() {
  const { user } = useAuth()
  return user?.user_metadata?.role || "user"
}
