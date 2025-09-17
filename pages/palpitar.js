import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";

export default function Palpitar() {
  const [user, setUser] = useState(null);
  const [brothers, setBrothers] = useState([]);
  const [palpite, setPalpite] = useState({
    lider: "", anjo: "", imunizado: "", emparedado: "",
    batevolta: "", eliminado: "", capitao: ""
  });
  const [palpiteLiberado, setPalpiteLiberado] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario || usuario.tipo !== "palpiteiro") router.push("/login");
    else {
      setUser(usuario);
      carregarBrothers();
      carregarConfig();
    }
  }, []);

  async function carregarBrothers() {
    const { data } = await supabase.from("brothers").select("*");
    setBrothers(data || []);
  }

  async function carregarConfig() {
    const { data } = await supabase.from("configuracao").select("*").single();
    if (data) setPalpiteLiberado(data.palpite_liberado);
  }

  async function enviarPalpite() {
    if (!palpiteLiberado) return alert("Palpites não estão liberados.");
    await supabase.from("palpites").insert([{ usuario_id: user.id, semana: 1, ...palpite }]);
    alert("Palpite enviado!");
  }

  if (!user) return <p>Carregando...</p>;

  return (
    <div>
      <h1>Área do Palpiteiro 🎯</h1>
      <h2>Bem-vindo, {user.nome}</h2>
      {!palpiteLiberado && <p>Os palpites ainda não estão liberados.</p>}

      {palpiteLiberado && (
        <div>
          {Object.keys(palpite).map((key) => (
            <div key={key}>
              <label>{key}:</label>
              <select
                value={palpite[key]}
                onChange={(e) => setPalpite({ ...palpite, [key]: e.target.value })}
              >
                <option value="">Selecione</option>
                {brothers.map((b) => <option key={b.id} value={b.nome}>{b.nome}</option>)}
              </select>
            </div>
          ))}
          <button onClick={enviarPalpite}>Enviar Palpite</button>
        </div>
      )}
    </div>
  );
}
