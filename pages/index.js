import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ padding: 20 }}>
      <h1>Meu Jogo — Home</h1>
      <ul>
        <li><Link href="/palpitar">Área do Palpiteiro</Link></li>
        <li><Link href="/admin">Área do Admin</Link></li>
      </ul>
    </main>
  )
}
