import { useEffect, useState } from 'react'

export default function Admin() {
  const [name, setName] = useState('')
  const [brothers, setBrothers] = useState([])

  useEffect(() => {
    fetch('/api/brothers').then(r => r.json()).then(setBrothers)
  }, [])

  async function addBrother() {
    const res = await fetch('/api/brothers', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ name })
    })
    const j = await res.json()
    if (res.ok) {
      setBrothers(prev => [j, ...prev])
      setName('')
    } else {
      alert('Erro: ' + JSON.stringify(j))
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin</h1>
      <div>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nome do brother"/>
        <button onClick={addBrother}>Adicionar</button>
      </div>
      <h3>Brothers</h3>
      <ul>
        {brothers.map(b => <li key={b.id}>{b.name}</li>)}
      </ul>
    </div>
  )
}
