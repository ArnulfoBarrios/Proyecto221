import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { supabase } from "../services/supabaseClient"
import useRole from "../hooks/useRole"

export default function Navbar() {
  const { user, loading } = useAuth()
  const role = useRole()

  const logout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <nav className="app-navbar">
      <div className="app-navbar__inner">
        <div className="brand brand-with-logo">
          <img src="/hospital-logo.svg" alt="Hospital logo" className="brand-logo" />
          <Link to="/home">PatientVoice</Link>
        </div>
        <div className="nav-links">
          <Link className="button-secondary nav-start-button" to="/home">🏠 Inicio</Link>
          {loading ? (
            <span className="nav-link">Loading...</span>
          ) : user ? (
            <>
              {role === "doctor" || role === "admin" ? (
                <>
                  <Link className="nav-link" to="/dashboard">Dashboard</Link>
                  <Link className="nav-link" to="/create">Nuevo Reporte</Link>
                  {role === "admin" && (
                    <Link className="nav-link" to="/admin">Admin</Link>
                  )}
                </>
              ) : (
                <Link className="nav-link" to="/dashboard">Mis reportes médicos</Link>
              )}
              <span className="nav-user">{user.email} {role !== 'user' && `(${role})`}</span>
              <button className="button-secondary" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="nav-link" to="/login">Login</Link>
              <Link className="nav-link" to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
