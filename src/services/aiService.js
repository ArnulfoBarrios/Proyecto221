// Función para analizar la complejidad del paciente
function analyzeComplexity(input) {
  const text = input.toLowerCase()

  // Palabras clave de alta complejidad
  const highComplexityKeywords = [
    'urgente', 'emergencia', 'crítico', 'grave', 'severa', 'intenso',
    'dolor intenso', 'dificultad respiratoria', 'desmayo', 'convulsión',
    'hemorragia', 'trauma', 'fractura', 'infarto', 'accidente',
    'coma', 'shock', 'fiebre alta', 'infección grave', 'cáncer',
    'diabetes descontrolada', 'hipertensión severa', 'ictus', 'embolismo'
  ]

  // Palabras clave de complejidad media
  const mediumComplexityKeywords = [
    'dolor moderado', 'fiebre', 'náuseas', 'vómitos', 'diarrea',
    'tos persistente', 'dolor de cabeza', 'mareos', 'fatiga',
    'infección', 'herida', 'quemadura', 'alergia', 'asma',
    'hipertensión', 'diabetes', 'artritis', 'depresión', 'ansiedad'
  ]

  // Contar palabras clave de alta complejidad
  const highCount = highComplexityKeywords.filter(keyword =>
    text.includes(keyword)
  ).length

  // Contar palabras clave de complejidad media
  const mediumCount = mediumComplexityKeywords.filter(keyword =>
    text.includes(keyword)
  ).length

  // Análisis adicional basado en longitud y patrones
  const wordCount = text.split(' ').length
  const hasMultipleSymptoms = (text.match(/[,;]/g) || []).length > 2
  const hasChronicConditions = text.includes('crónico') || text.includes('crónica')
  const hasMultipleMedications = text.includes('medicamentos') || text.includes('tratamiento')

  // Lógica de determinación de complejidad
  if (highCount >= 2 || (highCount >= 1 && (hasMultipleSymptoms || hasChronicConditions))) {
    return {
      level: 'alto',
      score: Math.min(100, 70 + (highCount * 10) + (wordCount > 50 ? 10 : 0)),
      description: 'Requiere atención médica inmediata o especializada'
    }
  } else if (highCount >= 1 || mediumCount >= 2 || (mediumCount >= 1 && hasMultipleSymptoms)) {
    return {
      level: 'medio',
      score: Math.min(100, 40 + (mediumCount * 8) + (wordCount > 30 ? 5 : 0)),
      description: 'Requiere evaluación médica en las próximas 24-48 horas'
    }
  } else {
    return {
      level: 'bajo',
      score: Math.min(100, 20 + (mediumCount * 5) + (wordCount > 20 ? 3 : 0)),
      description: 'Puede ser manejado con atención primaria o autocuidado'
    }
  }
}

export async function generateMedicalReport(input) {
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ input })
    })

    if (!res.ok) {
      throw new Error(`AI API returned ${res.status}`)
    }

    const data = await res.json()
    if (!data?.result) {
      throw new Error("AI API did not return a result")
    }

    // Analizar complejidad del paciente
    const complexity = analyzeComplexity(input)

    return {
      report: data.result,
      complexity: complexity
    }
  } catch (error) {
    console.warn("AI service fallback due to error:", error)

    // Análisis médico inteligente como fallback
    const complexity = analyzeComplexity(input)
    const medicalAnalysis = generateMedicalAnalysis(input, complexity)

    return {
      report: medicalAnalysis,
      complexity: complexity
    }
  }
}

// Función para generar análisis médico inteligente
function generateMedicalAnalysis(input, complexity) {
  const text = input.toLowerCase()

  // Identificar síntomas principales
  const symptoms = []
  if (text.includes('dolor') || text.includes('pain')) symptoms.push('dolor')
  if (text.includes('fiebre') || text.includes('fever') || text.includes('temperatura')) symptoms.push('fiebre')
  if (text.includes('tos') || text.includes('cough')) symptoms.push('tos')
  if (text.includes('náusea') || text.includes('nausea') || text.includes('vómito')) symptoms.push('náuseas/vómitos')
  if (text.includes('cansancio') || text.includes('fatiga') || text.includes('debilidad')) symptoms.push('fatiga')
  if (text.includes('dificultad respiratoria') || text.includes('falta de aire')) symptoms.push('dificultad respiratoria')
  if (text.includes('dolor de cabeza') || text.includes('cefalea')) symptoms.push('cefalea')
  if (text.includes('mareo') || text.includes('vertigo')) symptoms.push('mareos')

  // Identificar duración
  let duration = 'aguda'
  if (text.includes('semanas') || text.includes('meses') || text.includes('años') || text.includes('crónico')) {
    duration = 'crónica'
  }

  // Generar recomendaciones basadas en complejidad
  let recommendations = ''
  let diagnosis = ''

  switch (complexity.level) {
    case 'alto':
      diagnosis = 'Condición que requiere evaluación médica inmediata'
      recommendations = `• Evaluación médica urgente en servicio de emergencias
• Monitoreo continuo de signos vitales
• Posible hospitalización según evolución
• Estudios diagnósticos prioritarios (laboratorio, imagenología)
• Tratamiento sintomático mientras se completa evaluación`
      break

    case 'medio':
      diagnosis = 'Condición que requiere atención médica en las próximas 24-48 horas'
      recommendations = `• Consulta médica programada en las próximas 24-48 horas
• Evaluación clínica completa
• Estudios diagnósticos según sospecha clínica
• Tratamiento sintomático inicial
• Seguimiento cercano de evolución`
      break

    case 'bajo':
      diagnosis = 'Condición que puede ser manejada en atención primaria'
      recommendations = `• Consulta médica en horario regular
• Medidas de soporte sintomático
• Educación sobre signos de alarma
• Seguimiento ambulatorio
• Prevención de complicaciones`
      break
  }

  // Construir el reporte médico
  const report = `**EVALUACIÓN MÉDICA**

**Síntomas referidos:** ${input}

**Análisis clínico:**
• Síntomas identificados: ${symptoms.length > 0 ? symptoms.join(', ') : 'No especificados claramente'}
• Patrón temporal: ${duration}
• Nivel de complejidad: ${complexity.level.toUpperCase()} (Puntuación: ${complexity.score}/100)

**Impresión diagnóstica preliminar:**
${diagnosis}

**Recomendaciones terapéuticas:**
${recommendations}

**Notas importantes:**
• Esta evaluación es preliminar y requiere confirmación médica
• Se recomienda evaluación presencial para diagnóstico definitivo
• Ante empeoramiento de síntomas, acudir inmediatamente a urgencias
• Mantener registro de evolución de síntomas

*Reporte generado por sistema de asistencia médica - ${new Date().toLocaleDateString()}*`

  return report
}
