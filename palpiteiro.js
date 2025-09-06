import { supabase } from "./supabase.js";

let PARTICIPANTES_MAP = {};
let PALPITEIRO_ID = null;
let PERMITIR_ENVIO = false;

// ---------- LOGIN ----------
document.getElementById("palpiteiro-login-btn").addEventListener("click", async () => {
  const nome = document.getElementById("palpiteiro-nome-login").value.trim();
  const senha = document.getElementById("palpiteiro-senha-login").value.trim();
  if (!nome || !senha) return alert("Preencha nome e senha");

  const { data: user, error } = await supabase
    .from("palpiteiros")
    .select("*")
    .eq("nome", nome)
    .eq("senha", senha)
    .single();

  if (error || !user) return alert("Nome ou senha incorretos.");
  PALPITEIRO_ID = user.id;

  document.getElementById("login-area").style.display = "none";
  document.getElementById("palpiteiro-panel").style.display = "block";

  await carregarParticipantes();
  await carregarConfiguracao();
  await carregarHistorico();
});

// ---------- LOGOUT ----------
document.getElementById("palpiteiro-logout-btn").addEventListener("click", () => {
  PALPITEIRO_ID = null;
  document.getElementById("palpiteiro-panel").style.display = "none";
  document.getElementById("login-area").style.display = "block";
});

// ---------- CARREGAR PARTICIPANTES (para dropdowns) ----------
async function carregarParticipantes() {
  const { data, error } = await supabase.from("participantes").select("*").order("nome");
  if (error) { console.error(error); return; }
  PARTICIPANTES_MAP = {};
  (data || []).forEach(p => PARTICIPANTES_MAP[p.id] = p.nome);

  ["lider","anjo","imune","emparedado","batevolta","eliminado","capitao","bonus"].forEach(f => {
    const sel = document.getElementById("palpite-" + f);
    if (!sel) return;
    sel.innerHTML = `<option value="">--Nenhum--</option>`;
    Object.entries(PARTICIPANTES_MAP).forEach(([id, nome]) => {
      const opt = document.createElement("option");
      opt.value = id;
      opt.textContent = nome;
      sel.appendChild(opt);
    });
  });
}

// ---------- CARREGAR CONFIGURAÇÃO ----------
async function carregarConfiguracao() {
  const { data, error } = await supabase.from("configuracao").select("*").limit(1);
  if (error || !data || data.length === 0) {
    PERMITIR_ENVIO = false;
    return;
  }
  PERMITIR_ENVIO = !!data[0].permitir_envio;
}

// ---------- ENVIAR PALPITE ----------
document.getElementById("palpite-send-btn").addEventListener("click", async () => {
  if (!PERMITIR_ENVIO) return alert("Envio de palpites fechado pelo admin.");
  const semana = parseInt(document.getElementById("palpite-semana").value);
  if (!semana) return alert("Informe a semana");

  const payload = {
    palpiteiro_id: PALPITEIRO_ID,
    semana,
    lider: document.getElementById("palpite-lider").value || null,
    anjo: document.getElementById("palpite-anjo").value || null,
    imune: document.getElementById("palpite-imune").value || null,
    emparedado: document.getElementById("palpite-emparedado").value || null,
    batevolta: document.getElementById("palpite-batevolta").value || null,
    eliminado: document.getElementById("palpite-eliminado").value || null,
    capitao: document.getElementById("palpite-capitao").value || null,
    bonus: document.getElementById("palpite-bonus").value || null
  };

  // verifica se já existe palpite da mesma semana
  const { data: exist } = await supabase
    .from("palpites")
    .select("*")
    .eq("palpiteiro_id", PALPITEIRO_ID)
    .eq("semana", semana)
    .single();

  if (exist) {
    const { error } = await supabase.from("palpites").update(payload).eq("id", exist.id);
    if (error) return alert("Erro ao atualizar palpite: " + error.message);
    alert("Palpite atualizado!");
  } else {
    const { error } = await supabase.from("palpites").insert([payload]);
    if (error) return alert("Erro ao enviar palpite: " + error.message);
    alert("Palpite enviado!");
  }
  await carregarHistorico();
});

// ---------- HISTÓRICO ----------
async function carregarHistorico() {
  if (!PALPITEIRO_ID) return;
  const { data, error } = await supabase.from("palpites").select("*").eq("palpiteiro_id", PALPITEIRO_ID).order("semana");
  const ul = document.getElementById("palpite-list");
  if (error) { ul.innerHTML = "Erro ao carregar histórico"; console.error(error); return; }
  ul.innerHTML = "";
  (data || []).forEach(p => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>Semana ${p.semana}</strong> — L:${PARTICIPANTES_MAP[p.lider]||'-'} 
      A:${PARTICIPANTES_MAP[p.anjo]||'-'} I:${PARTICIPANTES_MAP[p.imune]||'-'}
      Emp:${PARTICIPANTES_MAP[p.emparedado]||'-'} BV:${PARTICIPANTES_MAP[p.batevolta]||'-'}
      Elim:${PARTICIPANTES_MAP[p.eliminado]||'-'} Cap:${PARTICIPANTES_MAP[p.capitao]||'-'}
      Bonus:${PARTICIPANTES_MAP[p.bonus]||'-'}`;

    const btnDel = document.createElement("button");
    btnDel.textContent = "Excluir";
    btnDel.onclick = async () => {
      if (!confirm("Excluir este palpite?")) return;
      const { error } = await supabase.from("palpites").delete().eq("id", p.id);
      if (error) return alert("Erro ao excluir: " + error.message);
      await carregarHistorico();
    };

    li.appendChild(btnDel);
    ul.appendChild(li);
  });
}
