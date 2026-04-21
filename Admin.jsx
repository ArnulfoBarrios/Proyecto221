import { useEffect, useState } from "react"
import { supabase } from "../services/supabaseClient"

export default function Admin() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterLevel, setFilterLevel] = useState("all")

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false })
    setReports(data || [])
    setLoading(false)
  }

  const deleteReport = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este reporte?")) return

    const { data, error } = await supabase.from("reports").delete().eq("id", id)
    if (error) {
      console.error("Delete report error:", error)
      alert("Error al eliminar: " + error.message)
      return
    }

    if (!data || data.length === 0) {
      alert("No se pudo eliminar el reporte. Verifica los permisos o la conexión.")
      return
    }

    fetchAll()
  }

  const getComplexityColor = (level) => {
    switch (level) {
      case 'alto': return '#d32f2f'
      case 'medio': return '#f9a825'
      case 'bajo': return '#2e7d32'
      default: return '#6c757d'
    }
  }

  const getComplexityLabel = (level) => {
    switch (level) {
      case 'alto': return 'Alta'
      case 'medio': return 'Media'
      case 'bajo': return 'Baja'
      default: return 'Sin clasificar'
    }
  }

  const filteredReports = reports.filter(r => {
    if (filterLevel === "all") return true
    if (filterLevel === "null") return !r.complexity_level
    return r.complexity_level === filterLevel
  })

  const getStats = () => {
    const total = reports.length
    const high = reports.filter(r => r.complexity_level === 'alto').length
    const medium = reports.filter(r => r.complexity_level === 'medio').length
    const low = reports.filter(r => r.complexity_level === 'bajo').length
    const unknown = total - high - medium - low

    return { total, high, medium, low, unknown }
  }

  const stats = getStats()

  if (loading) return <div className="page-card page-card__content"><p>Cargando...</p></div>

  return (
    <div className="page-card">
      <div className="page-card__content">
        <div className="section-header">
          <div>
            <h2 className="section-header__title">Panel Admin</h2>
            <p className="section-header__subtitle">Gestión global de reportes médicos con datos completos del paciente.</p>
          </div>
          <img src="/hospital-hero.svg" alt="Admin medical illustration" className="hero-image small" />
        </div>

        <div className="card-block" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div><strong>Total reportes:</strong> {stats.total}</div>
            <div style={{ color: '#d32f2f' }}><strong>Alta:</strong> {stats.high}</div>
            <div style={{ color: '#f9a825' }}><strong>Media:</strong> {stats.medium}</div>
            <div style={{ color: '#2e7d32' }}><strong>Baja:</strong> {stats.low}</div>
            <div style={{ color: '#6c757d' }}><strong>Sin clasificar:</strong> {stats.unknown}</div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <label><strong>Filtrar por complejidad:</strong></label>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              style={{ padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #d9e7d3', background: '#f4f9f4' }}
            >
              <option value="all">Todos</option>
              <option value="alto">Alta</option>
              <option value="medio">Media</option>
              <option value="bajo">Baja</option>
              <option value="null">Sin clasificar</option>
            </select>
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <div className="card-block">
            <p>No hay reportes con el filtro seleccionado.</p>
          </div>
        ) : (
          <div className="page-grid">
            {filteredReports.map(r => (
              <div key={r.id} className="report-card">
                <div className="report-card__title">{r.patient_name ? `Paciente: ${r.patient_name}` : "Reporte clínico"}</div>
                <p><strong>Email:</strong> {r.patient_email || 'N/A'}</p>
                <p><strong>Teléfono:</strong> {r.patient_phone || 'N/A'}</p>
                <p><strong>Cédula:</strong> {r.patient_id_number || 'N/A'}</p>
                <div style={{
                  marginTop: '0.8rem',
                  padding: '0.8rem',
                  borderRadius: '14px',
                  background: '#f4f9f4',
                  border: `1px solid rgba(46,125,50,0.15)`
                }}>
                  <strong>Complejidad:</strong> <span style={{ color: getComplexityColor(r.complexity_level) }}>{getComplexityLabel(r.complexity_level)}</span>
                </div>
                <div className="report-card__meta" style={{ marginTop: '1rem' }}>
                  <span className="status-pill">Creado: {new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <h4>Reporte AI</h4>
                  <p>{r.ai_output}</p>
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <button type="button" className="button-secondary" onClick={() => deleteReport(r.id)}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
