import { useEffect, useState } from 'react'

const questions = [
  { key: 'lider_id', label: 'Quem vai ser o líder?' },
  { key: 'anjo_id', label: 'Quem vai ser o anjo?' },
  { key: 'imunizado_id', label: 'Quem vai ser o imunizado?' },
  { key: 'emparedado_id', label: 'Quem vai ser o emparedado?' },
  { key: 'batevolta_id', label: 'Quem volta no bate e volta?' },
  { key: 'eliminado_id', label: 'Quem vai ser eliminado?' },
  { key: 'capitao_id', label: 'Quem será o capitão?' }
]

export default function Palpitar() {
  const [brothers, setBrothers] = useState([])
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [status, setStatus] = useState('')

  useEffect(() => {
    fetch('/api/brothers').then(r => r.json()).then(setBrothers)
  }, [])

  function choose(value) {
    const key = questions[idx].key
    setAnswers(prev => ({ ...prev, [key]: Number(value) }))
  }

  function next() {
    setIdx(i => Math.min(questions.length - 1, i + 1))
  }
  function prev() {
    setIdx(i => Math.max(0, i - 1))
  }

  async function save() {
    setStatus('Salvando...')
    const res = await fetch('/api/addPalpite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ week_id: 1, ...answers }) // aqui assumimos week_id=1 (ajuste conforme seu fluxo)
    })
    const j = await res.json()
    if (res.ok) setStatus('Palpite salvo!')
    else setStatus('Erro: ' + (j.error?.message || JSON.stringify(j)))
  }

  if (!brothers) return null

  const q = questions[idx]
  return (
    <div style={{ padding: 20 }}>
      <h2>{q.label}</h2>

      <div>
        {brothers.map(b => (
          <div key={b.id}>
            <label>
              <input
                type="radio"
                name="opt"
                value={b.id}
                checked={answers[q.key] === b.id}
                onChange={() => choose(b.id)}
              />
              {' '}{b.name}
            </label>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={prev} disabled={idx === 0}>Voltar</button>
        <button onClick={next} style={{ marginLeft: 8 }}>Próxima</button>
        <button onClick={save} style={{ marginLeft: 8 }}>Salvar Palpite</button>
      </div>

      <p>{status}</p>
    </div>
  )
}
