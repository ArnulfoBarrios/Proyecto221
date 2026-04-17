import { useState } from "react"
import { supabase } from "../services/supabaseClient"
import { generateMedicalReport } from "../services/aiService"
import { useAuth } from "../context/AuthContext"
import useRole from "../hooks/useRole"

export default function CreateReport() {
  const [patientName, setPatientName] = useState("")
  const [patientId, setPatientId] = useState("")
  const [patientPhone, setPatientPhone] = useState("")
  const [patientEmail, setPatientEmail] = useState("")
  const [patientPhoto, setPatientPhoto] = useState("")
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [complexity, setComplexity] = useState(null)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const role = useRole()

  // Solo doctores pueden crear informes
  if (role !== "doctor" && role !== "admin") {
    return (
      <div className="page-card">
        <div className="page-card__content">
          <div className="section-header">
            <div>
              <h2 className="section-header__title">Acceso denegado</h2>
              <p className="section-header__subtitle">Solo los doctores pueden crear informes médicos.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleGenerate = async () => {
    if (!input.trim() || !patientName.trim() || !patientEmail.trim()) {
      alert("Por favor completa el nombre, correo y descripción del paciente.")
      return
    }

    setLoading(true)
    try {
      const result = await generateMedicalReport(input)
      const reportText = result.report || result
      const complexityData = result.complexity || null

      setOutput(reportText)
      setComplexity(complexityData)

      await supabase.from("reports").insert([{
        user_id: user.id,
        patient_name: patientName,
        patient_id_number: patientId,
        patient_phone: patientPhone,
        patient_email: patientEmail,
        patient_photo_url: patientPhoto,
        input_text: input,
        ai_output: reportText,
        complexity_level: complexityData?.level || null,
        complexity_score: complexityData?.score || null
      }])

      setPatientName("")
      setPatientId("")
      setPatientPhone("")
      setPatientEmail("")
      setPatientPhoto("")
      setInput("")
      alert("Reporte guardado correctamente.")
    } catch (error) {
      alert("Error creando el reporte: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const getComplexityColor = (level) => {
    switch (level) {
      case 'alto': return '#d32f2f'
      case 'medio': return '#f9a825'
      case 'bajo': return '#2e7d32'
      default: return '#6c757d'
    }
  }

  const getComplexityIcon = (level) => {
    switch (level) {
      case 'alto': return '🚨'
      case 'medio': return '⚠️'
      case 'bajo': return 'ℹ️'
      default: return '📋'
    }
  }

  return (
    <div className="page-card">
      <div className="page-card__content">
        <div className="section-header">
          <div>
            <h2 className="section-header__title">Nuevo Reporte</h2>
            <p className="section-header__subtitle">Agrega los datos del paciente y describe los síntomas para generar un informe médico con análisis de complejidad.</p>
          </div>
          <img src="/hospital-hero.svg" alt="Hospital illustration" className="hero-image" />
        </div>

        <div className="page-grid" style={{ gap: '1rem' }}>
          <div className="card-block" style={{ padding: '1.5rem' }}>
            <h3>Datos del paciente</h3>
            <div className="form-control">
              <label className="form-label">Nombre completo</label>
              <input
                type="text"
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                placeholder="Ej. María García"
                className="form-input"
              />
            </div>
            <div className="form-control">
              <label className="form-label">Cédula / DNI</label>
              <input
                type="text"
                value={patientId}
                onChange={e => setPatientId(e.target.value)}
                placeholder="Ej. 12345678"
                className="form-input"
              />
            </div>
            <div className="form-control">
              <label className="form-label">Teléfono</label>
              <input
                type="tel"
                value={patientPhone}
                onChange={e => setPatientPhone(e.target.value)}
                placeholder="Ej. +34 600 123 456"
                className="form-input"
              />
            </div>
            <div className="form-control">
              <label className="form-label">Correo del paciente</label>
              <input
                type="email"
                value={patientEmail}
                onChange={e => setPatientEmail(e.target.value)}
                placeholder="paciente@ejemplo.com"
                className="form-input"
              />
            </div>
            <div className="form-control">
              <label className="form-label">Foto del paciente (URL)</label>
              <input
                type="url"
                value={patientPhoto}
                onChange={e => setPatientPhoto(e.target.value)}
                placeholder="https://..."
                className="form-input"
              />
            </div>
          </div>

          <div className="card-block" style={{ padding: '1.5rem' }}>
            <h3>Descripción clínica</h3>
            <div className="form-control">
              <label className="form-label">Síntomas y detalles</label>
              <textarea
                onChange={e => setInput(e.target.value)}
                value={input}
                placeholder="Ej. Paciente de 45 años con dolor de cabeza persistente, fiebre alta y dificultad para respirar..."
                className="form-input"
                rows={8}
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button onClick={handleGenerate} disabled={loading} className="button-primary">
            {loading ? "Generando..." : "Guardar reporte"}
          </button>
        </div>

        {complexity && (
          <div className="card-block" style={{
            marginTop: '1.5rem',
            border: `2px solid ${getComplexityColor(complexity.level)}`,
            backgroundColor: `${getComplexityColor(complexity.level)}15`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>{getComplexityIcon(complexity.level)}</span>
              <h3 style={{ margin: 0, color: getComplexityColor(complexity.level) }}>
                Nivel: {complexity.level.toUpperCase()}
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <div>
                <strong>Puntuación:</strong> {complexity.score}/100
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${complexity.score}%`, backgroundColor: `${getComplexityColor(complexity.level)}` }} />
              </div>
            </div>
            <p style={{ margin: 0, fontStyle: 'italic' }}>{complexity.description}</p>
          </div>
        )}

        {output && (
          <div className="card-block" style={{ marginTop: '1.5rem' }}>
            <h3>Reporte generado</h3>
            <p style={{ whiteSpace: "pre-wrap", marginTop: '1rem' }}>{output}</p>
          </div>
        )}
      </div>
    </div>
  )
}
