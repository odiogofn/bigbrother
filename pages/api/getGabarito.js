import supabaseAdmin from '../../lib/supabaseAdmin'

export default async function handler(req, res) {
  const { data, error } = await supabaseAdmin
    .from('gabaritos')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) return res.status(500).json({ error })
  return res.status(200).json(data)
}
