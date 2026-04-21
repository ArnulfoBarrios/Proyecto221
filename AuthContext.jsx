import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "../services/supabaseClient"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
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
            const authUser = data?.user || null
            setUser(authUser)

            // Cargar información del perfil (cédula, nombre completo)
            if (authUser) {
              const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("cedula, full_name, role")
                .eq("id", authUser.id)
                .single()

              if (profileError) {
                console.log("Profile error:", profileError)
              } else {
                setUserProfile(profile)
              }
            }
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
          const authUser = session?.user || null
          setUser(authUser)

          // Cargar información del perfil cuando cambie la sesión
          if (authUser) {
            supabase
              .from("profiles")
              .select("cedula, full_name, role")
              .eq("id", authUser.id)
              .single()
              .then(({ data: profile }) => {
                if (isMounted) {
                  setUserProfile(profile)
                }
              })
          } else {
            setUserProfile(null)
          }
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
    <AuthContext.Provider value={{ user, userProfile, loading, error }}>
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
