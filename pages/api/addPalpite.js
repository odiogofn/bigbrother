import supabaseAdmin from '../../lib/supabaseAdmin'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed')

  const body = req.body
  // validar body (week_id e campos)
  if (!body.week_id) return res.status(400).json({ error: 'week_id required' })

  // Inserir palpite - você deve melhorar com upsert (week_id + user_id) e checagem de palpite aberto
  const { data, error } = await supabaseAdmin.from('palpites').insert([body]).select().single()
  if (error) return res.status(500).json({ error })
  return res.status(201).json(data)
}
