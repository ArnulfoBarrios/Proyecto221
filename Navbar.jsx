import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { supabase } from "../services/supabaseClient"
import useRole from "../hooks/useRole"
import { useTheme } from "../context/ThemeContext"

function ThemeIcon({ theme }) {
  return theme === "dark" ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 15.79A8.5 8.5 0 0 1 8.21 4a8.5 8.5 0 1 0 11.79 11.79Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function Navbar() {
  const { user, loading } = useAuth()
  const role = useRole()
  const { theme, toggleTheme } = useTheme()

  const logout = async () => {
    await supabase.auth.signOut()
  }

  const isClinicalRole = role === "doctor" || role === "admin"
  const homeTarget = user ? "/home" : "/"

  return (
    <nav className="app-navbar">
      <div className="app-navbar__inner">
        <div className="brand brand-with-logo">
          <img src="/hospital-logo.svg" alt="Logo de PatientVoice" className="brand-logo" />
          <div className="brand-copy">
            <Link to={homeTarget} className="brand-link">PatientVoice</Link>
            <span className="brand-caption">Clinical reporting platform</span>
          </div>
        </div>

        <div className="nav-links">
          <Link className="nav-link" to={homeTarget}>Inicio</Link>

          <button onClick={toggleTheme} className="button-secondary" title="Cambiar tema" type="button">
            <ThemeIcon theme={theme} />
            {theme === "dark" ? "Modo oscuro" : "Modo claro"}
          </button>

          {loading ? (
            <span className="nav-link">Cargando...</span>
          ) : user ? (
            <>
              <Link className="nav-link" to="/dashboard">
                {isClinicalRole ? "Dashboard" : "Mis reportes"}
              </Link>

              {isClinicalRole && (
                <Link className="nav-link" to="/create">Nuevo reporte</Link>
              )}

              {role === "admin" && (
                <Link className="nav-link" to="/admin">Admin</Link>
              )}

              <span className="nav-user">
                <span className="nav-user__dot" aria-hidden="true" />
                {user.email}
              </span>

              <button className="button-ghost" onClick={logout} type="button">
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link className="nav-link" to="/login">Ingresar</Link>
              <Link className="button-primary" to="/register">Crear cuenta</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
