import supabaseAdmin from '../../lib/supabaseAdmin'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin.from('brothers').select('*').order('id')
    if (error) return res.status(500).json({ error })
    return res.status(200).json(data)
  }

  if (req.method === 'POST') {
    const { name } = req.body
    if (!name) return res.status(400).json({ error: 'name required' })
    const { data, error } = await supabaseAdmin.from('brothers').insert({ name }).select().single()
    if (error) return res.status(500).json({ error })
    return res.status(201).json(data)
  }

  res.setHeader('Allow', ['GET','POST'])
  res.status(405).end('Method Not Allowed')
}
