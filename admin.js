import { supabase } from "./supabase.js";

document.addEventListener("DOMContentLoaded", () => {
  // Troca de abas
  const tabs = document.querySelectorAll(".tab");
  const contents = document.querySelectorAll(".tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      contents.forEach((c) => (c.style.display = "none"));

      tab.classList.add("active");
      document.getElementById(tab.dataset.tab).style.display = "block";
    });
  });

  // ============================
  // Participantes
  // ============================
  async function carregarParticipantes() {
    const { data, error } = await supabase.from("participantes").select("*");
    if (error) {
      console.error("Erro ao carregar participantes:", error);
      return;
    }
    const lista = document.getElementById("lista-participantes");
    lista.innerHTML = "";
    data.forEach((p) => {
      const li = document.createElement("li");
      li.textContent = p.nome;
      const btnDel = document.createElement("button");
      btnDel.textContent = "Excluir";
      btnDel.onclick = () => excluirParticipante(p.id);
      li.appendChild(btnDel);
      lista.appendChild(li);
    });
  }

  async function adicionarParticipante() {
    const nome = document.getElementById("nome-participante").value;
    if (!nome) return alert("Digite um nome!");
    const { error } = await supabase.from("participantes").insert([{ nome }]);
    if (error) {
      alert("Erro ao adicionar participante");
      console.error(error);
    }
    document.getElementById("nome-participante").value = "";
    carregarParticipantes();
  }

  async function excluirParticipante(id) {
    const { error } = await supabase.from("participantes").delete().eq("id", id);
    if (error) {
      alert("Erro ao excluir participante. Verifique se não há palpites relacionados.");
      console.error(error);
    }
    carregarParticipantes();
  }

  document.getElementById("btn-add-participante").onclick = adicionarParticipante;
  carregarParticipantes();

  // ============================
  // Palpiteiros
  // ============================
  async function carregarPalpiteiros() {
    const { data, error } = await supabase.from("palpiteiros").select("*");
    if (error) {
      console.error("Erro ao carregar palpiteiros:", error);
      return;
    }
    const lista = document.getElementById("lista-palpiteiros");
    lista.innerHTML = "";
    data.forEach((p) => {
      const li = document.createElement("li");
      li.textContent = `${p.nome} (${p.senha})`;
      const btnDel = document.createElement("button");
      btnDel.textContent = "Excluir";
      btnDel.onclick = () => excluirPalpiteiro(p.id);
      li.appendChild(btnDel);
      lista.appendChild(li);
    });
  }

  async function adicionarPalpiteiro() {
    const nome = document.getElementById("nome-palpiteiro").value;
    const senha = document.getElementById("senha-palpiteiro").value;
    if (!nome || !senha) return alert("Preencha todos os campos!");
    const { error } = await supabase.from("palpiteiros").insert([{ nome, senha }]);
    if (error) {
      alert("Erro ao adicionar palpiteiro");
      console.error(error);
    }
    document.getElementById("nome-palpiteiro").value = "";
    document.getElementById("senha-palpiteiro").value = "";
    carregarPalpiteiros();
  }

  async function excluirPalpiteiro(id) {
    const { error } = await supabase.from("palpiteiros").delete().eq("id", id);
    if (error) {
      alert("Erro ao excluir palpiteiro.");
      console.error(error);
    }
    carregarPalpiteiros();
  }

  document.getElementById("btn-add-palpiteiro").onclick = adicionarPalpiteiro;
  carregarPalpiteiros();

  // ============================
  // Gabarito
  // ============================
  async function carregarGabarito() {
    const { data, error } = await supabase.from("gabarito").select("*");
    if (error) {
      console.error("Erro ao carregar gabarito:", error);
      return;
    }
    const lista = document.getElementById("lista-gabarito");
    lista.innerHTML = "";
    data.forEach((g) => {
      const li = document.createElement("li");
      li.textContent = `Semana ${g.semana}`;
      lista.appendChild(li);
    });
  }

  async function adicionarGabarito() {
    const semana = document.getElementById("semana-gabarito").value;
    if (!semana) return alert("Informe a semana!");
    const { error } = await supabase.from("gabarito").insert([{ semana }]);
    if (error) {
      alert("Erro ao adicionar gabarito");
      console.error(error);
    }
    document.getElementById("semana-gabarito").value = "";
    carregarGabarito();
  }

  document.getElementById("btn-add-gabarito").onclick = adicionarGabarito;
  carregarGabarito();

  // ============================
  // Palpites Enviados
  // ============================
  async function carregarPalpites() {
    const { data, error } = await supabase
      .from("palpites")
      .select("*, palpiteiros(nome)");
    if (error) {
      console.error("Erro ao carregar palpites:", error);
      return;
    }
    const lista = document.getElementById("lista-palpites");
    lista.innerHTML = "";
    data.forEach((p) => {
      const li = document.createElement("li");
      li.textContent = `Semana ${p.semana} - ${p.palpiteiros.nome}`;
      lista.appendChild(li);
    });
  }
  carregarPalpites();

  // ============================
  // Pontuação
  // ============================
  async function carregarPontuacao() {
    const { data, error } = await supabase.from("pontuacao").select("*");
    if (error) {
      console.error("Erro ao carregar pontuação:", error);
      return;
    }
    const lista = document.getElementById("lista-pontuacao");
    lista.innerHTML = "";
    data.forEach((p) => {
      const li = document.createElement("li");
      li.textContent = `${p.evento}: ${p.pontos} pontos`;
      lista.appendChild(li);
    });
  }

  async function adicionarPontuacao() {
    const evento = document.getElementById("evento-pontuacao").value;
    const pontos = parseInt(document.getElementById("pontos-pontuacao").value);
    if (!evento || isNaN(pontos)) return alert("Preencha os campos!");
    const { error } = await supabase.from("pontuacao").insert([{ evento, pontos }]);
    if (error) {
      alert("Erro ao adicionar pontuação");
      console.error(error);
    }
    document.getElementById("evento-pontuacao").value = "";
    document.getElementById("pontos-pontuacao").value = "";
    carregarPontuacao();
  }

  document.getElementById("btn-add-pontuacao").onclick = adicionarPontuacao;
  carregarPontuacao();

  // ============================
  // Configuração (liberar envio de palpites)
  // ============================
  async function carregarConfiguracao() {
    const { data, error } = await supabase.from("configuracao").select("*").limit(1);
    if (error) {
      console.error("Erro ao carregar configuração:", error);
      return;
    }
    if (data.length > 0) {
      document.getElementById("permitir-envio").checked = data[0].permitir_envio;
      document.getElementById("config-id").value = data[0].id;
    }
  }

  async function salvarConfiguracao() {
    const permitir_envio = document.getElementById("permitir-envio").checked;
    const id = document.getElementById("config-id").value;

    if (id) {
      await supabase.from("configuracao").update({ permitir_envio }).eq("id", id);
    } else {
      await supabase.from("configuracao").insert([{ permitir_envio }]);
    }
    alert("Configuração salva!");
  }

  document.getElementById("btn-salvar-config").onclick = salvarConfiguracao;
  carregarConfiguracao();
});
