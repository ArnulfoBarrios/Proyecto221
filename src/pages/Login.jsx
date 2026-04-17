import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../services/supabaseClient"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const login = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) {
        setError(signInError.message)
        console.error("Login error:", signInError)
      } else {
        navigate("/")
      }
    } catch (err) {
      setError(err.message)
      console.error("Login exception:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="home-page">
      <div className="home-layout">
        <div className="home-hero-card">
          <div className="home-hero-image-wrapper">
            <img
              src="/hospital-hero.svg"
              alt="Doctor atendiendo paciente"
              className="home-hero-image"
            />
          </div>
          <div className="home-description">
            <h2>Bienvenido a PatientVoice</h2>
            <p>
              PatientVoice es la plataforma de salud que conecta pacientes y médicos
              en un mismo lugar. Aquí puedes revisar tu historial médico, reportes
              de síntomas y recibir evaluaciones clínicas en tiempo real.
            </p>
            <p>
              Si eres paciente, tus informes aparecerán automáticamente cuando un médico
              los asigne a tu correo. Si eres doctor, podrás crear y administrar reportes
              con un análisis médico detallado.
            </p>
          </div>
        </div>

        <div className="home-login-card page-card form-card">
          <div className="page-card__content">
            <div className="section-header">
              <div>
                <h2 className="section-header__title">Inicia sesión</h2>
                <p className="section-header__subtitle">
                  Ingresa como doctor o paciente para acceder a tu historial clínico y reportes asignados.
                </p>
              </div>
            </div>

            {error && <div className="alert-box">{error}</div>}

            <form onSubmit={login} className="form-actions">
              <div className="form-control">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@ejemplo.com"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-control">
                <label className="form-label">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  required
                  className="form-input"
                />
              </div>

              <button type="submit" disabled={loading} className="button-primary">
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </form>

            <p className="home-login-note">
              ¿No tienes cuenta? <a href="/register">Regístrate aquí</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
