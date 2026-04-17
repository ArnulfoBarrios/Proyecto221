import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../services/supabaseClient"

export default function Home() {
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
      } else {
        navigate("/")
      }
    } catch (err) {
      setError(err.message)
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
              PatientVoice es el espacio digital donde doctores y pacientes se conectan
              en un solo lugar. Aquí puedes gestionar historiales clínicos, reportes
              de síntomas y decisiones médicas con un flujo seguro y transparente.
            </p>
            <p>
              Nuestra plataforma está diseñada para acompañar cada consulta, desde la
              primera valoración hasta el seguimiento contínuo. El doctor puede revisar
              los casos asignados y el paciente puede mantener toda su información médica
              organizada, de forma sencilla y accesible.
            </p>
            <p>
              Con PatientVoice, cada reporte se convierte en un registro estructurado que
              facilita la atención, permite compartir detalles importantes y apoya a los
              profesionales a tomar decisiones más informadas. Tu salud recibe un impulso
              tecnológico pensado para mejorar la comunicación clínica.
            </p>
          </div>
        </div>

        <div className="home-login-card page-card form-card">
          <div className="page-card__content">
            <div className="section-header">
              <div>
                <h2 className="section-header__title">Inicia sesión</h2>
                <p className="section-header__subtitle">
                  Accede con tu correo y contraseña para continuar como doctor o paciente.
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
