import { useAuth } from "../context/AuthContext"
import useRole from "../hooks/useRole"

export default function HomePage() {
  const { user } = useAuth()
  const role = useRole()

  const getInstructions = () => {
    if (role === "doctor" || role === "admin") {
      return {
        title: "Panel de Control Médico",
        description: "Bienvenido al sistema de gestión médica PatientVoice. Como profesional de la salud, tienes acceso completo a las herramientas de diagnóstico y seguimiento de pacientes.",
        features: [
          {
            title: "📋 Crear Reportes Médicos",
            description: "Accede a 'Nuevo Reporte' para crear evaluaciones médicas completas. Ingresa los datos del paciente y describe los síntomas para obtener un análisis automático con IA médica avanzada."
          },
          {
            title: "👥 Gestionar Pacientes",
            description: "En tu dashboard principal, visualiza el historial clínico completo de todos tus pacientes asignados. Busca por nombre, email o teléfono para encontrar rápidamente la información necesaria."
          },
          {
            title: "📊 Análisis de Complejidad",
            description: "Cada reporte incluye un análisis automático de complejidad (bajo, medio, alto) que te ayuda a priorizar casos y determinar el nivel de atención requerido."
          },
          {
            title: "✏️ Editar y Actualizar",
            description: "Mantén los registros actualizados editando información de pacientes y resultados de evaluaciones según evolucione el caso clínico."
          },
          {
            title: "🗂️ Historial Completo",
            description: "Accede al historial cronológico de cada paciente para un seguimiento longitudinal efectivo y toma de decisiones informadas."
          }
        ]
      }
    } else {
      return {
        title: "Portal del Paciente",
        description: "Bienvenido a PatientVoice, tu plataforma personal de salud. Aquí puedes acceder a todos tus registros médicos y comunicarte con tu equipo de atención médica.",
        features: [
          {
            title: "📋 Mis Reportes Médicos",
            description: "Visualiza todos los informes médicos que tus doctores han creado para ti. Cada reporte incluye evaluaciones detalladas y recomendaciones de tratamiento."
          },
          {
            title: "📊 Seguimiento de Salud",
            description: "Mantén un registro completo de tu historial médico, incluyendo evaluaciones de complejidad y planes de tratamiento personalizados."
          },
          {
            title: "👨‍⚕️ Comunicación con Doctores",
            description: "Tus informes médicos son creados y gestionados por profesionales calificados que tienen acceso completo a tu información de salud."
          },
          {
            title: "🔒 Privacidad y Seguridad",
            description: "Toda tu información médica está protegida con los más altos estándares de seguridad. Solo tú y tu equipo médico autorizado pueden acceder a tus datos."
          },
          {
            title: "📱 Acceso 24/7",
            description: "Accede a tu información médica en cualquier momento desde cualquier dispositivo, asegurando continuidad en tu atención médica."
          }
        ]
      }
    }
  }

  const instructions = getInstructions()

  return (
    <div className="page-card">
      <div className="page-card__content">
        <div className="section-header">
          <div>
            <h2 className="section-header__title">{instructions.title}</h2>
            <p className="section-header__subtitle">{instructions.description}</p>
          </div>
          <img src="/hospital-hero.svg" alt="PatientVoice illustration" className="hero-image" />
        </div>

        <div className="home-instructions">
          <div className="instructions-intro">
            <h3>🚀 Cómo usar PatientVoice</h3>
            <p>
              PatientVoice es una plataforma integral de gestión médica que conecta pacientes y profesionales
              de la salud en un entorno seguro y eficiente. A continuación encontrarás una guía completa
              de las funcionalidades disponibles según tu rol.
            </p>
          </div>

          <div className="instructions-grid">
            {instructions.features.map((feature, index) => (
              <div key={index} className="instruction-card">
                <h4>{feature.title}</h4>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="instructions-footer">
            <div className="card-block">
              <h4>💡 Consejos de Uso</h4>
              <ul>
                <li><strong>Actualización regular:</strong> Mantén tu información personal actualizada para una mejor atención médica.</li>
                <li><strong>Comunicación abierta:</strong> Comparte detalles completos sobre tus síntomas para obtener evaluaciones más precisas.</li>
                <li><strong>Privacidad:</strong> Toda la información está protegida y solo es accesible por personal médico autorizado.</li>
                <li><strong>Soporte técnico:</strong> Si experimentas dificultades, contacta al administrador del sistema.</li>
              </ul>
            </div>

            <div className="card-block">
              <h4>📞 Contacto y Soporte</h4>
              <p>
                Para asistencia técnica o consultas sobre el uso de la plataforma,
                contacta al equipo de soporte técnico de PatientVoice.
              </p>
              <p>
                <strong>Recuerda:</strong> Esta plataforma es una herramienta complementaria
                a la atención médica presencial. En casos de emergencia, busca atención médica inmediata.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}