import { useEffect, useMemo, useState } from "react"
import { supabase } from "../services/supabaseClient"
import { useAuth } from "../context/AuthContext"
import useRole from "../hooks/useRole"

function DashboardIcon({ type }) {
  const icons = {
    reports: (
      <path d="M8 7h8M8 12h8M8 17h5M6 3h12a2 2 0 0 1 2 2v14l-4-2-4 2-4-2-4 2V5a2 2 0 0 1 2-2Z" />
    ),
    patients: (
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm10.5 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    ),
    alert: (
      <path d="M12 9v4m0 4h.01M10.29 3.86 1.82 18A2 2 0 0 0 3.53 21h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    ),
    secure: (
      <path d="M12 2 5 5v6c0 5 3.4 9.74 7 11 3.6-1.26 7-6 7-11V5l-7-3Zm0 6v4l3 3" />
    ),
    pulse: (
      <path d="M3 12h4l2-5 4 10 2-5h6" />
    ),
    timeline: (
      <path d="M5 6h14M5 12h14M5 18h14M7 6v12M17 6v12" />
    )
  }

  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {icons[type]}
      </g>
    </svg>
  )
}

function formatDate(value) {
  if (!value) return "Sin fecha"
  return new Date(value).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric"
  })
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

export default function Dashboard() {
  const { user, userProfile } = useAuth()
  const role = useRole()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingReportId, setEditingReportId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [searchPatient, setSearchPatient] = useState("")

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user, role, userProfile])

  const fetchData = async () => {
    setLoading(true)
    let query = supabase.from("reports").select("*").order("created_at", { ascending: false })

    if (role !== "doctor" && role !== "admin") {
      if (userProfile?.cedula) {
        query = query.eq("patient_cedula", userProfile.cedula)
      } else {
        setReports([])
        setLoading(false)
        return
      }
    }

    const { data, error } = await query
    if (error) {
      console.error("Error loading reports:", error)
    }

    setReports(data || [])
    setLoading(false)
  }

  const handleEdit = (report) => {
    setEditingReportId(report.id)
    setEditForm({
      patient_name: report.patient_name || "",
      patient_id_number: report.patient_id_number || "",
      patient_phone: report.patient_phone || "",
      patient_email: report.patient_email || "",
      patient_photo_url: report.patient_photo_url || "",
      input_text: report.input_text || "",
      ai_output: report.ai_output || ""
    })
  }

  const saveEdit = async () => {
    if (!editingReportId) return

    const { error } = await supabase.from("reports").update(editForm).eq("id", editingReportId)
    if (error) {
      alert(`Error actualizando el reporte: ${error.message}`)
      return
    }

    setEditingReportId(null)
    setEditForm({})
    fetchData()
  }

  const cancelEdit = () => {
    setEditingReportId(null)
    setEditForm({})
  }

  const deleteReport = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este reporte?")) return

    const { data, error } = await supabase.from("reports").delete().eq("id", id)
    if (error) {
      alert(`Error al eliminar el reporte: ${error.message}`)
      return
    }

    if (!data || data.length === 0) {
      alert("No se pudo eliminar el reporte. Verifica permisos y configuración.")
      return
    }

    fetchData()
  }

  const canManageReport = role === "doctor" || role === "admin"

  const patientGroups = useMemo(() => {
    if (!canManageReport) return []

    const groups = reports.reduce((acc, report) => {
      const key = report.patient_email || report.patient_cedula || report.patient_name || "sin-id"
      if (!acc[key]) {
        acc[key] = {
          email: report.patient_email,
          name: report.patient_name,
          phone: report.patient_phone,
          idNumber: report.patient_id_number || report.patient_cedula,
          photo: report.patient_photo_url,
          reports: []
        }
      }
      acc[key].reports.push(report)
      return acc
    }, {})

    return Object.values(groups)
  }, [reports, canManageReport])

  const filteredReports = useMemo(() => {
    const query = searchPatient.trim().toLowerCase()
    if (!query) return reports

    return reports.filter((report) =>
      [report.patient_name, report.patient_email, report.patient_phone, report.patient_cedula]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    )
  }, [reports, searchPatient])

  const metrics = useMemo(() => {
    const highComplexity = reports.filter((report) => report.complexity_level === "alto").length
    const averageScore = reports.length
      ? Math.round(
          reports.reduce((acc, report) => acc + (Number(report.complexity_score) || 0), 0) / reports.length
        )
      : 0

    return {
      reports: reports.length,
      patients: patientGroups.length,
      highComplexity,
      averageScore
    }
  }, [reports, patientGroups])

  const latestReports = filteredReports.slice(0, 5)

  if (loading) {
    return (
      <div className="page-card">
        <div className="page-card__content">
          <div className="empty-state">
            <div className="icon-badge"><DashboardIcon type="pulse" /></div>
            <h2 className="empty-state__title">Cargando panel clínico</h2>
            <p>Estamos preparando reportes, métricas y datos del paciente.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-card">
      <div className="page-card__content dashboard-layout">
        <section className="dashboard-hero">
          <div className="section-header">
            <div>
              <span className="section-header__eyebrow">
                <DashboardIcon type="secure" />
                Entorno clínico seguro
              </span>
              <h1 className="section-header__title">
                {canManageReport ? "Centro de reportes médicos" : "Mis reportes médicos"}
              </h1>
              <p className="section-header__subtitle">
                {canManageReport
                  ? "Una vista más clara para priorizar pacientes, revisar diagnósticos asistidos por IA y mantener trazabilidad clínica en un solo lugar."
                  : "Consulta tus reportes, resultados clínicos y evolución registrada por tu equipo médico con una experiencia más legible y confiable."
                }
              </p>
            </div>

            <img src="/hospital-hero.svg" alt="Panel médico PatientVoice" className="hero-image" />
          </div>

          <div className="dashboard-hero__panel">
            <div className="hero-summary">
              <article className="metric-card">
                <div className="metric-card__label">
                  <DashboardIcon type="reports" />
                  Reportes
                </div>
                <div className="metric-card__value">{metrics.reports}</div>
                <p className="metric-card__hint">Expedientes disponibles en este panel</p>
              </article>

              <article className="metric-card">
                <div className="metric-card__label">
                  <DashboardIcon type="patients" />
                  Pacientes
                </div>
                <div className="metric-card__value">{canManageReport ? metrics.patients : 1}</div>
                <p className="metric-card__hint">
                  {canManageReport ? "Pacientes con historial activo" : "Tu perfil clínico asociado"}
                </p>
              </article>

              <article className="metric-card">
                <div className="metric-card__label">
                  <DashboardIcon type="alert" />
                  Alta complejidad
                </div>
                <div className="metric-card__value">{metrics.highComplexity}</div>
                <p className="metric-card__hint">Casos para priorización inmediata</p>
              </article>
            </div>

            <aside className="accent-panel">
              <h2 className="accent-panel__title">Resumen operativo</h2>
              <p className="accent-panel__copy">
                Promedio de complejidad clínica: <strong>{metrics.averageScore}/100</strong>.
                {canManageReport
                  ? " Usa el buscador y la tabla para encontrar rápido a cada paciente."
                  : " Revisa cada tarjeta para entender tu evolución y las conclusiones del reporte."
                }
              </p>

              <div className="accent-panel__list">
                <div className="accent-panel__item">
                  <div className="icon-badge"><DashboardIcon type="timeline" /></div>
                  <div>
                    <strong>Trazabilidad</strong>
                    <p className="table-muted">Historial ordenado por fecha con acceso rápido a los últimos registros.</p>
                  </div>
                </div>

                <div className="accent-panel__item">
                  <div className="icon-badge"><DashboardIcon type="pulse" /></div>
                  <div>
                    <strong>Legibilidad clínica</strong>
                    <p className="table-muted">Jerarquía visual clara para síntomas, salida de IA y nivel de complejidad.</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {canManageReport && (
          <section className="surface-card">
            <div className="form-section__header">
              <div>
                <h2 className="section-title">Vista de pacientes</h2>
                <p className="section-copy">
                  Busca por nombre, cédula, email o teléfono para ubicar historiales rápidamente.
                </p>
              </div>
            </div>

            <div className="search-bar">
              <input
                type="search"
                value={searchPatient}
                onChange={(event) => setSearchPatient(event.target.value)}
                placeholder="Buscar paciente, email, cédula o teléfono"
                className="form-input"
              />
              <div className="status-pill">
                {patientGroups.length} pacientes
              </div>
              <div className="status-pill">
                {filteredReports.length} reportes filtrados
              </div>
            </div>

            <div className="summary-grid" style={{ marginTop: "1rem" }}>
              {patientGroups.length === 0 ? (
                <div className="empty-state">
                  <h3 className="empty-state__title">No hay pacientes registrados</h3>
                  <p>Los historiales aparecerán aquí cuando existan reportes vinculados.</p>
                </div>
              ) : (
                patientGroups.slice(0, 4).map((group) => (
                  <article key={group.email || group.name} className="summary-card">
                    <div className="table-patient">
                      <img
                        src={group.photo || "/patient-placeholder.svg"}
                        alt={group.name || "Paciente"}
                        className="patient-avatar"
                      />
                      <div>
                        <div className="summary-card__label">Paciente</div>
                        <div className="summary-card__value" style={{ fontSize: "1.15rem" }}>
                          {group.name || "Paciente sin nombre"}
                        </div>
                      </div>
                    </div>
                    <p className="summary-card__text">{group.email || "Sin email registrado"}</p>
                    <p className="summary-card__text">{group.phone || "Sin teléfono registrado"}</p>
                    <p className="summary-card__text">ID: {group.idNumber || "Sin identificación"}</p>
                  </article>
                ))
              )}
            </div>
          </section>
        )}

        <section className="table-card">
          <div className="table-card__header">
            <div>
              <h2 className="section-title">Resumen tabular</h2>
              <p className="section-copy">
                Una vista rápida y responsive para revisar estado, paciente y fecha del reporte.
              </p>
            </div>
          </div>

          {latestReports.length === 0 ? (
            <div className="empty-state">
              <h3 className="empty-state__title">No hay reportes para mostrar</h3>
              <p>
                {canManageReport
                  ? "No existen reportes con los filtros actuales."
                  : "Aún no tienes reportes médicos asignados."}
              </p>
            </div>
          ) : (
            <div className="table-scroll">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Paciente</th>
                    <th>Complejidad</th>
                    <th>Fecha</th>
                    <th>Resumen</th>
                  </tr>
                </thead>
                <tbody>
                  {latestReports.map((report) => (
                    <tr key={report.id}>
                      <td>
                        <div className="table-patient">
                          <img
                            src={report.patient_photo_url || "/patient-placeholder.svg"}
                            alt={report.patient_name || "Paciente"}
                            className="patient-avatar"
                          />
                          <div>
                            <strong>{report.patient_name || "Paciente sin nombre"}</strong>
                            <div className="table-muted">{report.patient_email || report.patient_cedula || "Sin dato"}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="complexity-pill" data-level={getComplexityTone(report.complexity_level)}>
                          {report.complexity_level ? `Nivel ${report.complexity_level}` : "Sin clasificar"}
                        </span>
                      </td>
                      <td>{formatDate(report.created_at)}</td>
                      <td className="table-muted">
                        {(report.input_text || "Sin descripción").slice(0, 90)}
                        {(report.input_text || "").length > 90 ? "..." : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="page-grid">
          {filteredReports.length === 0 ? (
            <div className="empty-state">
              <div className="icon-badge"><DashboardIcon type="reports" /></div>
              <h3 className="empty-state__title">No hay reportes con los filtros seleccionados</h3>
              <p>Ajusta tu búsqueda o espera nuevos reportes para continuar.</p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <article key={report.id} className="report-card">
                <div className="report-card__header">
                  <div>
                    <h3 className="report-card__title">{report.patient_name || "Reporte clínico"}</h3>
                    <p className="report-card__subtitle">Registro generado el {formatDate(report.created_at)}</p>
                  </div>
                  <span className="complexity-pill" data-level={getComplexityTone(report.complexity_level)}>
                    {report.complexity_level ? `Complejidad ${report.complexity_level}` : "Sin nivel"}
                  </span>
                </div>

                <div className="report-card__patient">
                  <img
                    src={report.patient_photo_url || "/patient-placeholder.svg"}
                    alt={report.patient_name || "Paciente"}
                    className="patient-avatar patient-avatar--large"
                  />
                  <div>
                    <strong>{report.patient_name || "Paciente sin nombre"}</strong>
                    <p className="table-muted">{report.patient_email || "Sin correo registrado"}</p>
                    <p className="table-muted">{report.patient_phone || "Sin teléfono registrado"}</p>
                  </div>
                </div>

                <div className="report-card__details">
                  <div className="detail-chip">Cédula: {report.patient_id_number || report.patient_cedula || "N/A"}</div>
                  <div className="detail-chip">Puntaje: {report.complexity_score || 0}/100</div>
                  <div className="detail-chip">Creado: {formatDate(report.created_at)}</div>
                </div>

                <div className="clinical-block">
                  <div className="clinical-block__label">Detalles del caso</div>
                  <div className="clinical-block__value">{report.input_text || "Sin descripción clínica."}</div>
                </div>

                <div className="clinical-block">
                  <div className="clinical-block__label">Resultado asistido por IA</div>
                  <div className="clinical-block__value">{report.ai_output || "Sin resultado generado."}</div>
                </div>

                {editingReportId === report.id ? (
                  <div className="surface-card">
                    <div className="form-section__header">
                      <div>
                        <h4 className="section-title">Editar reporte</h4>
                        <p className="section-copy">Actualiza datos del paciente y el contenido clínico.</p>
                      </div>
                    </div>

                    <div className="form-grid">
                      <div className="form-control">
                        <label className="form-label">Nombre del paciente</label>
                        <input
                          type="text"
                          value={editForm.patient_name}
                          onChange={(event) => setEditForm({ ...editForm, patient_name: event.target.value })}
                          className="form-input"
                        />
                      </div>

                      <div className="form-control">
                        <label className="form-label">Cédula</label>
                        <input
                          type="text"
                          value={editForm.patient_id_number}
                          onChange={(event) => setEditForm({ ...editForm, patient_id_number: event.target.value })}
                          className="form-input"
                        />
                      </div>

                      <div className="form-control">
                        <label className="form-label">Teléfono</label>
                        <input
                          type="text"
                          value={editForm.patient_phone}
                          onChange={(event) => setEditForm({ ...editForm, patient_phone: event.target.value })}
                          className="form-input"
                        />
                      </div>

                      <div className="form-control">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          value={editForm.patient_email}
                          onChange={(event) => setEditForm({ ...editForm, patient_email: event.target.value })}
                          className="form-input"
                        />
                      </div>

                      <div className="form-control">
                        <label className="form-label">Foto del paciente (URL)</label>
                        <input
                          type="url"
                          value={editForm.patient_photo_url}
                          onChange={(event) => setEditForm({ ...editForm, patient_photo_url: event.target.value })}
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="form-grid form-grid--single">
                      <div className="form-control">
                        <label className="form-label">Descripción clínica</label>
                        <textarea
                          rows={4}
                          value={editForm.input_text}
                          onChange={(event) => setEditForm({ ...editForm, input_text: event.target.value })}
                          className="form-input"
                        />
                      </div>

                      <div className="form-control">
                        <label className="form-label">Resultado IA</label>
                        <textarea
                          rows={4}
                          value={editForm.ai_output}
                          onChange={(event) => setEditForm({ ...editForm, ai_output: event.target.value })}
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="form-actions">
                      <button className="button-secondary" onClick={cancelEdit} type="button">Cancelar</button>
                      <button className="button-primary" onClick={saveEdit} type="button">Guardar cambios</button>
                    </div>
                  </div>
                ) : canManageReport ? (
                  <div className="form-actions">
                    <button className="button-secondary" onClick={() => handleEdit(report)} type="button">
                      Editar reporte
                    </button>
                    <button className="button-danger" onClick={() => deleteReport(report.id)} type="button">
                      Eliminar
                    </button>
                  </div>
                ) : null}
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  )
}
