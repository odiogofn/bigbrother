import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/router";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [tipo, setTipo] = useState("palpiteiro");
  const router = useRouter();

  async function handleCadastro() {
    const { data, error } = await supabase
      .from("usuarios")
      .insert([{ nome, login, senha, tipo }]);

    if (error) {
      alert("Erro ao cadastrar: " + error.message);
    } else {
      alert("Usuário cadastrado com sucesso!");
      router.push("/login");
    }
  }

  return (
    <div>
      <h1>Cadastro</h1>
      <input placeholder="Nome" onChange={(e) => setNome(e.target.value)} />
      <input placeholder="Login" onChange={(e) => setLogin(e.target.value)} />
      <input
        type="password"
        placeholder="Senha"
        onChange={(e) => setSenha(e.target.value)}
      />
      <select onChange={(e) => setTipo(e.target.value)}>
        <option value="palpiteiro">Palpiteiro</option>
        <option value="admin">Admin</option>
      </select>
      <button onClick={handleCadastro}>Cadastrar</button>
    </div>
  );
}
