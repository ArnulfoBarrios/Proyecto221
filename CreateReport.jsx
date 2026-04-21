import { useState } from "react"
import { supabase } from "../services/supabaseClient"
import { generateMedicalReport } from "../services/aiService"
import { useAuth } from "../context/AuthContext"
import useRole from "../hooks/useRole"

function ReportIcon({ type }) {
  const icons = {
    file: <path d="M14 2H7a2 2 0 0 0-2 2v16l4-2 3 2 3-2 4 2V8l-5-6Z M14 2v6h5" />,
    patient: <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />,
    pulse: <path d="M3 12h4l2-5 4 10 2-5h6" />,
    shield: <path d="M12 2 5 5v6c0 5 3.4 9.74 7 11 3.6-1.26 7-6 7-11V5l-7-3Z" />
  }

  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {icons[type]}
      </g>
    </svg>
  )
}

function getComplexityTone(level) {
  switch (level) {
    case "alto":
      return "alto"
    case "medio":
      return "medio"
    case "bajo":
      return "bajo"
    default:
      return "neutral"
  }
}

export default function CreateReport() {
  const [patientName, setPatientName] = useState("")
  const [patientId, setPatientId] = useState("")
  const [patientCedula, setPatientCedula] = useState("")
  const [patientPhone, setPatientPhone] = useState("")
  const [patientEmail, setPatientEmail] = useState("")
  const [patientPhoto, setPatientPhoto] = useState("")
  const [patientPhotoPreview, setPatientPhotoPreview] = useState("")
  const [photoInputType, setPhotoInputType] = useState("url")
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [complexity, setComplexity] = useState(null)
  const [loading, setLoading] = useState(false)
  const [cedulaError, setCedulaError] = useState("")
  const { user } = useAuth()
  const role = useRole()

  if (role !== "doctor" && role !== "admin") {
    return (
      <div className="page-card">
        <div className="page-card__content">
          <div className="empty-state">
            <div className="icon-badge"><ReportIcon type="shield" /></div>
            <h2 className="empty-state__title">Acceso restringido</h2>
            <p>Solo doctores y administradores pueden generar reportes médicos.</p>
          </div>
        </div>
      </div>
    )
  }

  const handlePhotoFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validTypes = ["image/jpeg", "image/png"]
    if (!validTypes.includes(file.type)) {
      alert("Selecciona una imagen en formato JPG o PNG.")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen no debe superar 5 MB.")
      return
    }

    const reader = new FileReader()
    reader.onload = (loadEvent) => {
      setPatientPhotoPreview(loadEvent.target?.result || "")
    }
    reader.readAsDataURL(file)
    setPatientPhoto(file)
  }

  const uploadPatientPhoto = async (file) => {
    if (!file || typeof file === "string") {
      return file
    }

    try {
      const extension = file.type === "image/jpeg" ? "jpg" : "png"
      const fileName = `patient-photos/${user.id}-${Date.now()}.${extension}`
      const { error } = await supabase.storage.from("patient-images").upload(fileName, file)

      if (error) {
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.readAsDataURL(file)
        })
      }

      const { data: publicUrl } = supabase.storage.from("patient-images").getPublicUrl(fileName)
      return publicUrl.publicUrl
    } catch (error) {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.readAsDataURL(file)
      })
    }
  }

  const handleGenerate = async () => {
    if (!input.trim() || !patientName.trim() || !patientCedula.trim()) {
      alert("Completa nombre, cédula y descripción clínica para continuar.")
      return
    }

    setLoading(true)
    setCedulaError("")

    try {
      const { data: patientProfile, error: profileError } = await supabase
        .from("profiles")
        .select("cedula, full_name, email, role")
        .eq("cedula", patientCedula.trim())
        .maybeSingle()

      if (profileError) {
        setCedulaError("Error al validar la cédula. Intenta nuevamente.")
        setLoading(false)
        return
      }

      if (!patientProfile) {
        setCedulaError("No existe un paciente registrado con esta cédula.")
        setLoading(false)
        return
      }

      if (patientProfile.role !== "patient") {
        setCedulaError("La cédula ingresada no pertenece a un paciente.")
        setLoading(false)
        return
      }

      const result = await generateMedicalReport(input)
      const reportText = result.report || result
      const complexityData = result.complexity || null
      const photoUrl = await uploadPatientPhoto(patientPhoto)

      setOutput(reportText)
      setComplexity(complexityData)
      setPatientEmail(patientProfile.email || "")

      await supabase.from("reports").insert([
        {
          user_id: user.id,
          patient_name: patientName,
          patient_id_number: patientId,
          patient_cedula: patientCedula.trim(),
          patient_phone: patientPhone,
          patient_email: patientProfile.email,
          patient_photo_url: photoUrl,
          input_text: input,
          ai_output: reportText,
          complexity_level: complexityData?.level || null,
          complexity_score: complexityData?.score || null
        }
      ])

      setPatientName("")
      setPatientId("")
      setPatientCedula("")
      setPatientPhone("")
      setPatientEmail("")
      setPatientPhoto("")
      setPatientPhotoPreview("")
      setInput("")
      alert("Reporte guardado correctamente.")
    } catch (error) {
      alert(`Error creando el reporte: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-card">
      <div className="page-card__content">
        <div className="section-header">
          <div>
            <span className="section-header__eyebrow">
              <ReportIcon type="file" />
              Generación asistida por IA
            </span>
            <h1 className="section-header__title">Nuevo reporte médico</h1>
            <p className="section-header__subtitle">
              Una experiencia más clara para registrar datos del paciente, documentar síntomas y generar un informe clínico con identidad visual confiable.
            </p>
          </div>

          <img src="/hospital-hero.svg" alt="Generación de reporte médico" className="hero-image" />
        </div>

        <div className="dashboard-hero__panel" style={{ marginBottom: "1.5rem" }}>
          <div className="hero-summary">
            <article className="metric-card">
              <div className="metric-card__label">
                <ReportIcon type="patient" />
                Registro paciente
              </div>
              <div className="metric-card__value" style={{ fontSize: "1.5rem" }}>Validado</div>
              <p className="metric-card__hint">La cédula se contrasta con perfiles reales del sistema.</p>
            </article>

            <article className="metric-card">
              <div className="metric-card__label">
                <ReportIcon type="pulse" />
                Descripción clínica
              </div>
              <div className="metric-card__value" style={{ fontSize: "1.5rem" }}>Estructurada</div>
              <p className="metric-card__hint">Inputs amplios y legibles para capturar contexto médico.</p>
            </article>

            <article className="metric-card">
              <div className="metric-card__label">
                <ReportIcon type="shield" />
                Experiencia segura
              </div>
              <div className="metric-card__value" style={{ fontSize: "1.5rem" }}>Confiable</div>
              <p className="metric-card__hint">Contraste alto, estados claros y foco accesible.</p>
            </article>
          </div>

          <aside className="accent-panel">
            <h2 className="accent-panel__title">Buenas prácticas del reporte</h2>
            <p className="accent-panel__copy">
              Describe síntomas, contexto y evolución con precisión. Un mejor input clínico genera una salida más útil para revisión médica.
            </p>
            <div className="accent-panel__list">
              <div className="accent-panel__item">
                <div className="icon-badge"><ReportIcon type="pulse" /></div>
                <div>
                  <strong>Lenguaje claro</strong>
                  <p className="table-muted">Evita ambigüedades y documenta duración, intensidad y antecedentes.</p>
                </div>
              </div>
              <div className="accent-panel__item">
                <div className="icon-badge"><ReportIcon type="shield" /></div>
                <div>
                  <strong>Datos identificables</strong>
                  <p className="table-muted">Verifica cédula y contacto antes de guardar para mantener trazabilidad.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div className="form-layout">
          <section className="form-section">
            <div className="form-section__header">
              <div>
                <h2 className="section-title">Datos del paciente</h2>
                <p className="section-copy">Formulario clínico con campos accesibles, agrupados y consistentes.</p>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-control">
                <label className="form-label">Nombre completo</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(event) => setPatientName(event.target.value)}
                  placeholder="Ej. María García"
                  className="form-input"
                />
              </div>

              <div className="form-control">
                <label className="form-label">Cédula del paciente registrado</label>
                <input
                  type="text"
                  value={patientCedula}
                  onChange={(event) => {
                    setPatientCedula(event.target.value)
                    setCedulaError("")
                  }}
                  placeholder="Ej. 1234567890"
                  className="form-input"
                />
                {cedulaError ? (
                  <p className="form-error">{cedulaError}</p>
                ) : (
                  <p className="form-help">Debe existir en el sistema para poder asociar el reporte.</p>
                )}
              </div>

              <div className="form-control">
                <label className="form-label">Documento adicional</label>
                <input
                  type="text"
                  value={patientId}
                  onChange={(event) => setPatientId(event.target.value)}
                  placeholder="Autocompletado desde el perfil"
                  className="form-input"
                  disabled
                />
                <p className="form-help">Campo reservado para una segunda identificación si aplica.</p>
              </div>

              <div className="form-control">
                <label className="form-label">Teléfono</label>
                <input
                  type="tel"
                  value={patientPhone}
                  onChange={(event) => setPatientPhone(event.target.value)}
                  placeholder="Ej. +57 300 123 4567"
                  className="form-input"
                />
              </div>

              <div className="form-control">
                <label className="form-label">Correo asociado</label>
                <input
                  type="email"
                  value={patientEmail}
                  onChange={(event) => setPatientEmail(event.target.value)}
                  placeholder="Se completa al validar la cédula"
                  className="form-input"
                  disabled
                />
                <p className="form-help">Solo lectura para reforzar la vinculación del paciente correcto.</p>
              </div>

              <div className="form-control">
                <label className="form-label">Origen de la foto</label>
                <div className="field-inline">
                  <label className="field-choice">
                    <input
                      type="radio"
                      name="photoType"
                      value="url"
                      checked={photoInputType === "url"}
                      onChange={() => {
                        setPhotoInputType("url")
                        setPatientPhotoPreview("")
                      }}
                    />
                    URL
                  </label>
                  <label className="field-choice">
                    <input
                      type="radio"
                      name="photoType"
                      value="file"
                      checked={photoInputType === "file"}
                      onChange={() => {
                        setPhotoInputType("file")
                        setPatientPhoto("")
                      }}
                    />
                    Archivo JPG/PNG
                  </label>
                </div>
              </div>
            </div>

            <div className="form-grid form-grid--single" style={{ marginTop: "1rem" }}>
              <div className="form-control">
                <label className="form-label">Foto del paciente</label>
                {photoInputType === "url" ? (
                  <input
                    type="url"
                    value={typeof patientPhoto === "string" ? patientPhoto : ""}
                    onChange={(event) => setPatientPhoto(event.target.value)}
                    placeholder="https://..."
                    className="form-input"
                  />
                ) : (
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handlePhotoFileChange}
                    className="form-input"
                  />
                )}

                {patientPhotoPreview && (
                  <div className="photo-preview">
                    <img src={patientPhotoPreview} alt="Vista previa del paciente" />
                    <p className="form-help">Vista previa cargada correctamente.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="form-section">
            <div className="form-section__header">
              <div>
                <h2 className="section-title">Descripción clínica</h2>
                <p className="section-copy">Escribe síntomas, antecedentes y observaciones de forma estructurada.</p>
              </div>
            </div>

            <div className="form-control">
              <label className="form-label">Síntomas y hallazgos</label>
              <textarea
                onChange={(event) => setInput(event.target.value)}
                value={input}
                placeholder="Ej. Paciente de 45 años con cefalea persistente, fiebre de 39°C y dificultad respiratoria progresiva durante las últimas 24 horas..."
                className="form-input"
                rows={11}
              />
              <p className="form-help">
                Incluye evolución, duración, intensidad, signos vitales y contexto clínico relevante.
              </p>
            </div>

            <div className="form-actions form-actions--stack">
              <button onClick={handleGenerate} disabled={loading} className="button-primary" type="button">
                {loading ? "Generando reporte..." : "Guardar y generar reporte"}
              </button>
              <button
                onClick={() => {
                  setPatientName("")
                  setPatientId("")
                  setPatientCedula("")
                  setPatientPhone("")
                  setPatientEmail("")
                  setPatientPhoto("")
                  setPatientPhotoPreview("")
                  setInput("")
                  setOutput("")
                  setComplexity(null)
                  setCedulaError("")
                }}
                className="button-ghost"
                type="button"
              >
                Limpiar formulario
              </button>
            </div>
          </section>
        </div>

        {complexity && (
          <section className="surface-card" style={{ marginTop: "1.5rem" }}>
            <div className="report-card__header">
              <div>
                <h2 className="section-title">Análisis de complejidad</h2>
                <p className="section-copy">Evaluación visual rápida para priorización del caso.</p>
              </div>
              <span className="complexity-pill" data-level={getComplexityTone(complexity.level)}>
                Nivel {complexity.level}
              </span>
            </div>

            <div className="summary-grid">
              <article className="summary-card">
                <div className="summary-card__label">Puntuación</div>
                <div className="summary-card__value">{complexity.score}/100</div>
                <div className="progress-track" style={{ marginTop: "0.9rem" }}>
                  <div className="progress-fill" style={{ width: `${complexity.score}%` }} />
                </div>
              </article>

              <article className="summary-card">
                <div className="summary-card__label">Descripción</div>
                <p className="summary-card__text" style={{ marginTop: "0.75rem" }}>
                  {complexity.description}
                </p>
              </article>
            </div>
          </section>
        )}

        {output && (
          <section className="surface-card" style={{ marginTop: "1.5rem" }}>
            <div className="report-card__header">
              <div>
                <h2 className="section-title">Reporte generado</h2>
                <p className="section-copy">Salida presentada con mejor contraste y lectura clínica continua.</p>
              </div>
            </div>

            <div className="clinical-block">
              <div className="clinical-block__label">Informe clínico</div>
              <div className="clinical-block__value">{output}</div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
