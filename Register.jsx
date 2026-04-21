import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../services/supabaseClient"

export default function Register() {
  const [fullName, setFullName] = useState("")
  const [cedula, setCedula] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("patient")
  const [loading, setLoading] = useState(false)
  const [cedulaError, setCedulaError] = useState("")
  const navigate = useNavigate()

  const register = async () => {
    // Validaciones básicas
    if (!fullName.trim()) {
      alert("Por favor ingresa tu nombre completo.")
      return
    }

    if (!cedula.trim()) {
      alert("Por favor ingresa tu número de cédula.")
      return
    }

    if (!email.trim()) {
      alert("Por favor ingresa tu email.")
      return
    }

    if (!password.trim()) {
      alert("Por favor ingresa tu contraseña.")
      return
    }

    setLoading(true)
    setCedulaError("")

    try {
      // Validar que la cédula no exista en la tabla profiles
      const { data: existingCedula, error: checkError } = await supabase
        .from("profiles")
        .select("cedula")
        .eq("cedula", cedula.trim())

      if (checkError) {
        console.error("Error checking cedula:", checkError)
        alert("Error al validar la cédula. Intenta de nuevo.")
        setLoading(false)
        return
      }

      if (existingCedula && existingCedula.length > 0) {
        setCedulaError("Esta cédula ya está registrada en el sistema.")
        setLoading(false)
        return
      }

      // Proceder con el registro
      // El trigger en la base de datos creará el perfil automáticamente
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            full_name: fullName.trim(),
            cedula: cedula.trim()
          }
        }
      })

      if (signUpError) {
        alert("Error en el registro: " + signUpError.message)
        setLoading(false)
        return
      }

      alert("Correo de verificación enviado. Revisa tu bandeja de entrada.")
      navigate("/login")
    } catch (error) {
      console.error("Register error:", error)
      alert("Error en el registro: " + error.message)
    } finally {
      setLoading(false)
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
            <label className="form-label">Nombre completo</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Ej. Juan García López"
              className="form-input"
              required
            />
          </div>

          <div className="form-control">
            <label className="form-label">Cédula / DNI</label>
            <input
              type="text"
              value={cedula}
              onChange={e => {
                setCedula(e.target.value)
                setCedulaError("")
              }}
              placeholder="Ej. 1234567890"
              className="form-input"
              required
            />
            {cedulaError && (
              <p style={{ color: '#d32f2f', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                {cedulaError}
              </p>
            )}
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
