import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import useRole from "../hooks/useRole"

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  const role = useRole()

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        fontSize: "1.2rem"
      }}>
        Loading...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  return role === "admin" ? children : <Navigate to="/" />
}
