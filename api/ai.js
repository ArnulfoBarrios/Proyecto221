export default async function handler(req, res) {
  const { input } = req.body

  const result = `
Paciente refiere: ${input}.
Se recomienda evaluación médica.
  `

  res.status(200).json({ result })
}
