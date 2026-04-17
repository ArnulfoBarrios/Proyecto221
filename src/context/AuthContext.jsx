import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "../services/supabaseClient"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    let timeoutId

    const initAuth = async () => {
      try {
        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (isMounted) {
            console.log("Auth timeout - loading took too long")
            setLoading(false)
          }
        }, 5000)

        const { data, error } = await supabase.auth.getUser()
        
        if (isMounted) {
          clearTimeout(timeoutId)
          if (error) {
            console.log("Auth error:", error.message)
            setError(error.message)
          } else {
            setUser(data?.user || null)
          }
          setLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          clearTimeout(timeoutId)
          console.log("Auth check failed:", err)
          setError(err.message)
          setLoading(false)
        }
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        if (isMounted) {
          setUser(session?.user || null)
        }
      }
    )

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
      if (listener?.subscription) {
        listener.subscription.unsubscribe()
      }
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
