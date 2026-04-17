import { useEffect, useMemo, useState } from "react"
import { supabase } from "../services/supabaseClient"
import { useAuth } from "../context/AuthContext"
import useRole from "../hooks/useRole"

export default function Dashboard() {
  const { user } = useAuth()
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
  }, [user, role])

  const fetchData = async () => {
    setLoading(true)
    let query = supabase.from("reports").select("*").order("created_at", { ascending: false })

    if (role === "doctor" || role === "admin") {
      // Doctores y admins ven todos los informes
    } else {
      // Pacientes o usuarios sin rol especial ven los informes asignados a su email
      query = query.eq("patient_email", user.email)
    }

    const { data, error } = await query
    if (error) {
      console.error("Error loading reports:", error)
    } else {
      console.log(`Loaded ${data?.length || 0} reports for role: ${role}, email: ${user.email}`)
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

    const { error } = await supabase
      .from("reports")
      .update(editForm)
      .eq("id", editingReportId)

    if (error) {
      alert("Error actualizando el reporte: " + error.message)
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
    if (!confirm("¿Seguro que deseas eliminar este reporte?")) return

    const { data, error } = await supabase.from("reports").delete().eq("id", id)
    if (error) {
      console.error("Delete report error:", error)
      alert("Error al eliminar el reporte: " + error.message)
      return
    }

    if (!data || data.length === 0) {
      alert("No se pudo eliminar el reporte. Verifica los permisos o la configuración de RLS.")
      return
    }

    fetchData()
  }

  const canManageReport = (report) => {
    if (!report) return false
    if (role === "doctor" || role === "admin") return true
    return false
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

  const patientGroups = useMemo(() => {
    if (role !== "doctor") return []

    const groups = reports.reduce((acc, report) => {
      const key = report.patient_email || report.patient_name || "Sin email"
      if (!acc[key]) {
        acc[key] = {
          email: report.patient_email,
          name: report.patient_name,
          phone: report.patient_phone,
          idNumber: report.patient_id_number,
          photo: report.patient_photo_url,
          reports: []
        }
      }
      acc[key].reports.push(report)
      return acc
    }, {})

    return Object.values(groups)
  }, [reports, role])

  const filteredReports = reports.filter((report) => {
    if (!searchPatient.trim()) return true
    const query = searchPatient.toLowerCase()
    return [report.patient_name, report.patient_email, report.patient_phone]
      .filter(Boolean)
      .some(value => value.toLowerCase().includes(query))
  })

  if (loading) return <div className="page-card page-card__content"><p>Cargando reportes...</p></div>

  return (
    <div className="page-card">
      <div className="page-card__content">
        <div className="section-header">
          <div>
            <h2 className="section-header__title">
              {role === "doctor" || role === "admin" ? "Mis Reportes" : "Mis Reportes Médicos"}
            </h2>
            <p className="section-header__subtitle">
              {role === "doctor" || role === "admin"
                ? "Revisa los informes clínicos y administra los datos del paciente desde una vista clara y accesible."
                : "Revisa tus informes médicos asignados por los doctores."
              }
            </p>
          </div>
          <img src="/hospital-hero.svg" alt="Medical dashboard illustration" className="hero-image" />
        </div>

        {role === "doctor" && (
          <div className="card-block" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
              <div>
                <h3>Historial clínico de pacientes</h3>
                <p>Busca y visualiza los historiales de pacientes asignados.</p>
              </div>
              <input
                type="search"
                value={searchPatient}
                onChange={e => setSearchPatient(e.target.value)}
                placeholder="Buscar por nombre, email o teléfono"
                className="form-input"
                style={{ maxWidth: '320px', marginLeft: 'auto' }}
              />
            </div>
            {patientGroups.length === 0 ? (
              <p style={{ marginTop: '1rem' }}>No hay pacientes registrados aún.</p>
            ) : (
              <div className="page-grid" style={{ marginTop: '1rem' }}>
                {patientGroups.map(group => (
                  <div key={group.email || group.name} className="report-card">
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <img
                        src={group.photo || '/patient-placeholder.svg'}
                        alt={group.name || 'Paciente'}
                        className="patient-avatar"
                      />
                      <div>
                        <div className="report-card__title">{group.name || 'Paciente anónimo'}</div>
                        <p>{group.email || 'Sin email registrado'}</p>
                        <p>{group.phone || 'Sin teléfono registrado'}</p>
                        <p>{group.idNumber ? `Cédula: ${group.idNumber}` : 'Sin cédula registrada'}</p>
                      </div>
                    </div>
                    <p style={{ marginTop: '1rem' }}><strong>Reportes:</strong> {group.reports.length}</p>
                    <small>Último informe: {new Date(group.reports[0]?.created_at).toLocaleDateString()}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {filteredReports.length === 0 ? (
          <div className="card-block">
            <p>
              {role === "doctor" || role === "admin"
                ? "No hay reportes para mostrar con los criterios seleccionados."
                : "Aún no tienes reportes médicos asignados. Los doctores te asignarán reportes cuando realicen evaluaciones."
              }
            </p>
          </div>
        ) : (
          <div className="page-grid">
            {filteredReports.map((report) => (
              <div key={report.id} className="report-card">
                <div className="report-card__title">{report.patient_name ? `Paciente: ${report.patient_name}` : "Reporte clínico"}</div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                  <img
                    src={report.patient_photo_url || '/patient-placeholder.svg'}
                    alt={report.patient_name || 'Paciente'}
                    className="patient-avatar"
                  />
                  <div>
                    <p><strong>Email:</strong> {report.patient_email || 'N/A'}</p>
                    <p><strong>Teléfono:</strong> {report.patient_phone || 'N/A'}</p>
                    <p><strong>Cédula:</strong> {report.patient_id_number || 'N/A'}</p>
                  </div>
                </div>

                {report.complexity_level && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                    padding: '0.6rem',
                    borderRadius: '12px',
                    backgroundColor: `${getComplexityColor(report.complexity_level)}15`,
                    border: `1px solid ${getComplexityColor(report.complexity_level)}30`
                  }}>
                    <span style={{ fontSize: '1.2rem' }}>{getComplexityIcon(report.complexity_level)}</span>
                    <div>
                      <div style={{
                        fontWeight: '700',
                        color: getComplexityColor(report.complexity_level),
                        fontSize: '0.95rem'
                      }}>
                        Complejidad: {report.complexity_level.toUpperCase()}
                      </div>
                      {report.complexity_score && (
                        <div style={{ fontSize: '0.85rem', color: '#4d4d4d' }}>
                          Puntuación: {report.complexity_score}/100
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: '1rem' }}>
                  <h4>Detalles del caso</h4>
                  <p>{report.input_text}</p>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <h4>Resultado IA</h4>
                  <p>{report.ai_output}</p>
                </div>

                <div className="report-card__meta">
                  <span className="status-pill">Creado: {new Date(report.created_at).toLocaleDateString()}</span>
                </div>

                {editingReportId === report.id ? (
                  <div className="card-block" style={{ marginTop: '1rem' }}>
                    <h4>Editar reporte</h4>
                    <div className="form-control">
                      <label className="form-label">Nombre del paciente</label>
                      <input
                        type="text"
                        value={editForm.patient_name}
                        onChange={(e) => setEditForm({ ...editForm, patient_name: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-control">
                      <label className="form-label">Cédula</label>
                      <input
                        type="text"
                        value={editForm.patient_id_number}
                        onChange={(e) => setEditForm({ ...editForm, patient_id_number: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-control">
                      <label className="form-label">Teléfono</label>
                      <input
                        type="text"
                        value={editForm.patient_phone}
                        onChange={(e) => setEditForm({ ...editForm, patient_phone: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-control">
                      <label className="form-label">Email del paciente</label>
                      <input
                        type="email"
                        value={editForm.patient_email}
                        onChange={(e) => setEditForm({ ...editForm, patient_email: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-control">
                      <label className="form-label">Foto del paciente (URL)</label>
                      <input
                        type="url"
                        value={editForm.patient_photo_url}
                        onChange={(e) => setEditForm({ ...editForm, patient_photo_url: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-control">
                      <label className="form-label">Descripción</label>
                      <textarea
                        rows={4}
                        value={editForm.input_text}
                        onChange={(e) => setEditForm({ ...editForm, input_text: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-control">
                      <label className="form-label">Reporte IA</label>
                      <textarea
                        rows={4}
                        value={editForm.ai_output}
                        onChange={(e) => setEditForm({ ...editForm, ai_output: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-actions" style={{ flexDirection: 'row', gap: '0.8rem' }}>
                      <button className="button-secondary" onClick={cancelEdit} type="button">Cancelar</button>
                      <button className="button-primary" onClick={saveEdit} type="button">Guardar</button>
                    </div>
                  </div>
                ) : canManageReport(report) ? (
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                    <button className="button-secondary" onClick={() => handleEdit(report)} type="button">Editar</button>
                    <button className="button-secondary" onClick={() => deleteReport(report.id)} type="button">Eliminar</button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
