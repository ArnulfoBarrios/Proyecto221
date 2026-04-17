import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../services/supabaseClient"

export default function Register() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("patient")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const register = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role }
      }
    })
    setLoading(false)

    if (error) {
      alert(error.message)
    } else {
      alert("Correo de verificación enviado. Revisa tu bandeja de entrada.")
      navigate("/login")
    }
  }

  return (
    <div className="page-card form-card">
      <div className="page-card__content">
        <div className="section-header">
          <h2 className="section-header__title">Crea tu cuenta</h2>
          <p className="section-header__subtitle">Regístrate como paciente o doctor para acceder a un panel personalizado.</p>
        </div>

        <form className="form-actions" onSubmit={(e) => { e.preventDefault(); register(); }}>
          <div className="form-control">
            <label className="form-label">Tipo de cuenta</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="form-input"
            >
              <option value="patient">Paciente</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          <div className="form-control">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@ejemplo.com"
              className="form-input"
              required
            />
          </div>

          <div className="form-control">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="********"
              className="form-input"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="button-primary">
            {loading ? "Registrando..." : "Crear cuenta"}
          </button>
        </form>
      </div>
    </div>
  )
}
