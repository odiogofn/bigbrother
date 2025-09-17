import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";

export default function Admin() {
  const [user, setUser] = useState(null);
  const [brothers, setBrothers] = useState([]);
  const [novoBrother, setNovoBrother] = useState("");
  const [palpiteLiberado, setPalpiteLiberado] = useState(false);
  const [palpites, setPalpites] = useState([]);
  const [pontos, setPontos] = useState({
    lider: 10,
    anjo: 8,
    imunizado: 6,
    emparedado: 5,
    batevolta: 7,
    eliminado: 12,
    capitao: 2
  });

  const router = useRouter();

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario || usuario.tipo !== "admin") {
      router.push("/login");
    } else {
      setUser(usuario);
      carregarBrothers();
      carregarConfig();
      carregarPalpites();
    }
  }, []);

  async function carregarBrothers() {
    const { data } = await supabase.from("brothers").select("*");
    setBrothers(data || []);
  }

  async function carregarConfig() {
    const { data } = await supabase.from("configuracao").select("*").single();
    if (data) {
      setPalpiteLiberado(data.palpite_liberado);
      if (data.pontos) setPontos(data.pontos);
    }
  }

  async function carregarPalpites() {
    const { data } = await supabase.from("palpites").select("*, usuarios(nome)");
    setPalpites(data || []);
  }

  async function adicionarBrother() {
    if (!novoBrother) return;
    await supabase.from("brothers").insert([{ nome: novoBrother }]);
    setNovoBrother("");
    carregarBrothers();
  }

  async function togglePalpite() {
    const novoValor = !palpiteLiberado;
    setPalpiteLiberado(novoValor);
    await supabase.from("configuracao").upsert({
      id: 1,
      palpite_liberado: novoValor,
      pontos
    });
  }

  async function salvarPontos() {
    await supabase.from("configuracao").upsert({
      id: 1,
      palpite_liberado: palpiteLiberado,
      pontos
    });
    alert("Pontuações salvas!");
  }

  if (!user) return <p>Carregando...</p>;

  return (
    <div>
      <h1>Área do Admin 👑</h1>
      <h2>Bem-vindo, {user.nome}</h2>

      <section>
        <h3>Brothers cadastrados</h3>
        <ul>{brothers.map((b) => <li key={b.id}>{b.nome}</li>)}</ul>
        <input
          value={novoBrother}
          onChange={(e) => setNovoBrother(e.target.value)}
          placeholder="Novo brother"
        />
        <button onClick={adicionarBrother}>Adicionar</button>
      </section>

      <section style={{ marginTop: "20px" }}>
        <h3>Configuração</h3>
        <label>
          Palpite Liberado:
          <input type="checkbox" checked={palpiteLiberado} onChange={togglePalpite} />
        </label>
      </section>

      <section style={{ marginTop: "20px" }}>
        <h3>Pontuações</h3>
        {Object.keys(pontos).map((key) => (
          <div key={key}>
            <label>
              {key}:{" "}
              <input
                type="number"
                value={pontos[key]}
                onChange={(e) =>
                  setPontos({ ...pontos, [key]: Number(e.target.value) })
                }
              />
            </label>
          </div>
        ))}
        <button onClick={salvarPontos}>Salvar Pontuações</button>
      </section>

      <section style={{ marginTop: "20px" }}>
        <h3>Palpites Recebidos</h3>
        {palpites.length === 0 ? (
          <p>Nenhum palpite ainda.</p>
        ) : (
          <ul>
            {palpites.map((p) => (
              <li key={p.id}>
                <strong>{p.usuarios?.nome}:</strong> Líder: {p.lider}, Anjo: {p.anjo}, Eliminado: {p.eliminado}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
