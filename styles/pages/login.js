import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/router";

export default function Login() {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const router = useRouter();

  async function handleLogin() {
    const { data: user } = await supabase
      .from("usuarios")
      .select("*")
      .eq("login", login)
      .eq("senha", senha)
      .single();

    if (user) {
      localStorage.setItem("usuario", JSON.stringify(user));
      router.push(user.tipo === "admin" ? "/admin" : "/palpitar");
    } else {
      alert("Login inválido");
    }
  }

  return (
    <div>
      <h1>Login</h1>
      <input placeholder="Login" onChange={(e) => setLogin(e.target.value)} />
      <input
        type="password"
        placeholder="Senha"
        onChange={(e) => setSenha(e.target.value)}
      />
      <button onClick={handleLogin}>Entrar</button>
    </div>
  );
}
