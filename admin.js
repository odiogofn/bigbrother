// admin.js
import { supabase } from "./supabase.js";

const ADMIN_USER = "admin";
const ADMIN_PASS = "12345";

let participantesMap = {}; // id -> nome
let palpiteirosMap = {};  // id -> nome

// ---------- UTIL (mostrar aba) ----------
function hideAllTabs() {
  document.querySelectorAll(".tab").forEach(t => t.style.display = "none");
}
function showTab(id) {
  hideAllTabs();
  const el = document.getElementById(id);
  if (el) el.style.display = "block";
}

// ---------- LOGIN / LOGOUT ----------
document.getElementById("admin-login-btn").addEventListener("click", async () => {
  const u = document.getElementById("admin-username").value.trim();
  const p = document.getElementById("admin-password").value.trim();
  if (u === ADMIN_USER && p === ADMIN_PASS) {
    document.getElementById("login-area").style.display = "none";
    document.getElementById("admin-panel").style.display = "block";

    // primeiro carregamento (após login)
    await loadMaps();            // popula participantesMap e palpiteirosMap
    bindTabButtons();           // registra listeners de abas
    await carregarTodasAbas();  // carrega listas e popula dropdowns
    showTab("tab-participantes");
  } else {
    alert("Usuário ou senha incorretos.");
  }
});

document.getElementById("admin-logout-btn").addEventListener("click", () => {
  document.getElementById("admin-panel").style.display = "none";
  document.getElementById("login-area").style.display = "block";
});

// ---------- Abas ----------
function bindTabButtons() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.onclick = () => {
      const target = btn.dataset.target;
      showTab(target);
    };
  });
}

// ---------- CARREGAR MAPS (participantes/palpiteiros) ----------
async function loadMaps() {
  // participantes
  const { data: parts, error: ep } = await supabase.from("participantes").select("*").order("nome");
  if (ep) { console.error("Erro carregar participantes:", ep); parts = []; }
  participantesMap = {};
  (parts || []).forEach(p => participantesMap[p.id] = p.nome);

  // palpiteiros
  const { data: pals, error: e2 } = await supabase.from("palpiteiros").select("*").order("nome");
  if (e2) { console.error("Erro carregar palpiteiros:", e2); pals = []; }
  palpiteirosMap = {};
  (pals || []).forEach(p => palpiteirosMap[p.id] = p.nome);

  // após carregar maps, atualizar dropdowns de gabarito
  populateGabaritoDropdowns();
}

// ---------- PARTICIPANTES CRUD ----------
document.getElementById("participante-add-btn").addEventListener("click", async () => {
  const nome = document.getElementById("participante-nome").value.trim();
  if (!nome) return alert("Informe o nome do participante");
  const { error } = await supabase.from("participantes").insert([{ nome }]);
  if (error) return alert("Erro ao inserir participante: " + error.message);
  document.getElementById("participante-nome").value = "";
  await loadMaps();
  await carregarParticipantesList();
});

async function carregarParticipantesList() {
  const { data, error } = await supabase.from("participantes").select("*").order("nome");
  const ul = document.getElementById("participante-list");
  if (error) { ul.innerHTML = "Erro ao carregar participantes"; console.error(error); return; }
  ul.innerHTML = "";
  data.forEach(p => {
    const li = document.createElement("li");
    li.textContent = p.nome + " ";
    const btnEdit = document.createElement("button");
    btnEdit.textContent = "Editar";
    btnEdit.onclick = async () => {
      const novo = prompt("Novo nome:", p.nome);
      if (!novo) return;
      await supabase.from("participantes").update({ nome: novo }).eq("id", p.id);
      await loadMaps();
      await carregarParticipantesList();
    };
    const btnDel = document.createElement("button");
    btnDel.textContent = "Excluir";
    btnDel.onclick = async () => {
      // checar referências em palpites (cliente-side para evitar problemas de cast)
      const { data: allPalpites } = await supabase.from("palpites").select("*");
      const usado = (allPalpites || []).some(pp =>
        pp.lider === p.id || pp.anjo === p.id || pp.imune === p.id ||
        pp.emparedado === p.id || pp.batevolta === p.id || pp.eliminado === p.id ||
        pp.capitao === p.id || pp.bonus === p.id
      );
      if (usado) return alert("Não é possível excluir este participante — já usado em palpites.");
      if (!confirm("Confirma exclusão do participante?")) return;
      const { error } = await supabase.from("participantes").delete().eq("id", p.id);
      if (error) return alert("Erro ao excluir: " + error.message);
      await loadMaps();
      await carregarParticipantesList();
    };
    li.appendChild(btnEdit);
    li.appendChild(btnDel);
    ul.appendChild(li);
  });
}

// ---------- PALPITEIROS CRUD ----------
document.getElementById("palpiteiro-add-btn").addEventListener("click", async () => {
  const nome = document.getElementById("palpiteiro-nome").value.trim();
  const senha = document.getElementById("palpiteiro-senha").value.trim();
  if (!nome || !senha) return alert("Preencha nome e senha");
  const { error } = await supabase.from("palpiteiros").insert([{ nome, senha }]);
  if (error) return alert("Erro ao inserir palpiteiro: " + error.message);
  document.getElementById("palpiteiro-nome").value = "";
  document.getElementById("palpiteiro-senha").value = "";
  await loadMaps();
  await carregarPalpiteirosList();
});

async function carregarPalpiteirosList() {
  const { data, error } = await supabase.from("palpiteiros").select("*").order("nome");
  const ul = document.getElementById("palpiteiro-list");
  if (error) { ul.innerHTML = "Erro ao carregar palpiteiros"; console.error(error); return; }
  ul.innerHTML = "";
  data.forEach(p => {
    const li = document.createElement("li");
    li.textContent = `${p.nome} `;
    const btnEdit = document.createElement("button");
    btnEdit.textContent = "Editar";
    btnEdit.onclick = async () => {
      const novoNome = prompt("Novo nome:", p.nome);
      const novaSenha = prompt("Nova senha:", p.senha);
      if (!novoNome || novaSenha === null) return;
      await supabase.from("palpiteiros").update({ nome: novoNome, senha: novaSenha }).eq("id", p.id);
      await loadMaps();
      await carregarPalpiteirosList();
    };
    const btnDel = document.createElement("button");
    btnDel.textContent = "Excluir";
    btnDel.onclick = async () => {
      // checar se palpiteiro já enviou palpites
      const { data: userPalpites } = await supabase.from("palpites").select("*").eq("palpiteiro_id", p.id).limit(1);
      if (userPalpites && userPalpites.length > 0) return alert("Não é possível excluir: palpiteiro já enviou palpites.");
      if (!confirm("Excluir palpiteiro?")) return;
      const { error } = await supabase.from("palpiteiros").delete().eq("id", p.id);
      if (error) return alert("Erro ao excluir: " + error.message);
      await loadMaps();
      await carregarPalpiteirosList();
    };
    li.appendChild(btnEdit);
    li.appendChild(btnDel);
    ul.appendChild(li);
  });
}

// ---------- GABARITO (com dropdowns dos participantes) ----------
function populateGabaritoDropdowns() {
  const campos = [
    "gabarito-lider","gabarito-anjo","gabarito-imune","gabarito-emparedado",
    "gabarito-batevolta","gabarito-eliminado","gabarito-capitao","gabarito-bonus"
  ];
  campos.forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = `<option value="">--Nenhum--</option>`;
    Object.entries(participantesMap).forEach(([idp, nome]) => {
      const opt = document.createElement("option");
      opt.value = idp;
      opt.textContent = nome;
      sel.appendChild(opt);
    });
  });
}

document.getElementById("gabarito-save-btn").addEventListener("click", async () => {
  const semana = parseInt(document.getElementById("gabarito-semana").value);
  if (!semana) return alert("Informe a semana");

  const payload = {
    semana,
    lider: document.getElementById("gabarito-lider").value || null,
    anjo: document.getElementById("gabarito-anjo").value || null,
    imune: document.getElementById("gabarito-imune").value || null,
    emparedado: document.getElementById("gabarito-emparedado").value || null,
    batevolta: document.getElementById("gabarito-batevolta").value || null,
    eliminado: document.getElementById("gabarito-eliminado").value || null,
    capitao: document.getElementById("gabarito-capitao").value || null,
    bonus: document.getElementById("gabarito-bonus").value || null
  };

  // existe? atualizar; senão inserir
  const { data: exist } = await supabase.from("gabarito").select("*").eq("semana", semana).single();
  if (exist) {
    const { error } = await supabase.from("gabarito").update(payload).eq("id", exist.id);
    if (error) return alert("Erro ao atualizar gabarito: " + error.message);
    alert("Gabarito atualizado.");
  } else {
    const { error } = await supabase.from("gabarito").insert([payload]);
    if (error) return alert("Erro ao inserir gabarito: " + error.message);
    alert("Gabarito inserido.");
  }
  await carregarGabaritosList();
});

document.getElementById("gabarito-load-btn").addEventListener("click", async () => {
  const semana = parseInt(document.getElementById("gabarito-semana").value);
  if (!semana) return alert("Informe a semana para carregar");
  const { data, error } = await supabase.from("gabarito").select("*").eq("semana", semana).single();
  if (error || !data) return alert("Gabarito da semana não encontrado.");
  // preenche selects
  const fields = ["lider","anjo","imune","emparedado","batevolta","eliminado","capitao","bonus"];
  fields.forEach(f => {
    const sel = document.getElementById("gabarito-" + f);
    if (sel) sel.value = data[f] || "";
  });
});

document.getElementById("gabarito-clear-btn").addEventListener("click", () => {
  document.getElementById("gabarito-semana").value = "";
  ["lider","anjo","imune","emparedado","batevolta","eliminado","capitao","bonus"].forEach(f => {
    const sel = document.getElementById("gabarito-" + f);
    if (sel) sel.value = "";
  });
});

async function carregarGabaritosList() {
  const { data, error } = await supabase.from("gabarito").select("*").order("semana");
  const ul = document.getElementById("gabarito-list");
  if (error) { ul.innerHTML = "Erro ao carregar gabaritos"; console.error(error); return; }
  ul.innerHTML = "";
  (data || []).forEach(g => {
    const li = document.createElement("li");
    const weekText = `Semana ${g.semana} — L:${participantesMap[g.lider]||'-'} A:${participantesMap[g.anjo]||'-'} I:${participantesMap[g.imune]||'-'}`;
    li.textContent = weekText + " ";
    const btnDel = document.createElement("button");
    btnDel.textContent = "Excluir";
    btnDel.onclick = async () => {
      if (!confirm("Excluir gabarito da semana " + g.semana + "?")) return;
      const { error } = await supabase.from("gabarito").delete().eq("id", g.id);
      if (error) return alert("Erro ao excluir: " + error.message);
      await carregarGabaritosList();
    };
    li.appendChild(btnDel);
    ul.appendChild(li);
  });
}

// ---------- PALPITES ENVIADOS (lista com nomes legíveis) ----------
document.getElementById("palpites-refresh-btn").addEventListener("click", carregarPalpitesList);
document.getElementById("palpites-filter-btn").addEventListener("click", carregarPalpitesList);

async function carregarPalpitesList() {
  // buscar palpites
  const { data: palpites, error } = await supabase.from("palpites").select("*").order("semana");
  const ul = document.getElementById("palpites-list");
  if (error) { ul.innerHTML = "Erro ao carregar palpites"; console.error(error); return; }
  const semanaFiltro = parseInt(document.getElementById("palpites-filtro-semana").value) || null;
  ul.innerHTML = "";
  (palpites || []).forEach(p => {
    if (semanaFiltro && p.semana !== semanaFiltro) return;
    const li = document.createElement("li");
    li.innerHTML = `<strong>Semana ${p.semana}</strong> — Palpiteiro: ${palpiteirosMap[p.palpiteiro_id]||p.palpiteiro_id}
      | L:${participantesMap[p.lider]||'-'} A:${participantesMap[p.anjo]||'-'} I:${participantesMap[p.imune]||'-'}
      | Emp:${participantesMap[p.emparedado]||'-'} BV:${participantesMap[p.batevolta]||'-'} Elim:${participantesMap[p.eliminado]||'-'}
      | Cap:${participantesMap[p.capitao]||'-'} Bonus:${participantesMap[p.bonus]||'-'}
      `;
    const btnDel = document.createElement("button");
    btnDel.textContent = "Excluir palpite";
    btnDel.onclick = async () => {
      if (!confirm("Excluir este palpite?")) return;
      const { error } = await supabase.from("palpites").delete().eq("id", p.id);
      if (error) return alert("Erro ao excluir: " + error.message);
      await carregarPalpitesList();
    };
    li.appendChild(btnDel);
    ul.appendChild(li);
  });
}

// ---------- PONTUAÇÃO ----------
document.getElementById("pontuacao-add-btn").addEventListener("click", async () => {
  const evento = document.getElementById("pontuacao-evento").value.trim();
  const pontos = parseInt(document.getElementById("pontuacao-pontos").value);
  if (!evento || isNaN(pontos)) return alert("Preencha evento e pontos corretamente.");
  const { error } = await supabase.from("pontuacao").insert([{ evento, pontos }]);
  if (error) return alert("Erro ao inserir pontuação: " + error.message);
  document.getElementById("pontuacao-evento").value = "";
  document.getElementById("pontuacao-pontos").value = "";
  await carregarPontuacaoList();
});

async function carregarPontuacaoList() {
  const { data, error } = await supabase.from("pontuacao").select("*");
  const ul = document.getElementById("pontuacao-list");
  if (error) { ul.innerHTML = "Erro ao carregar pontuação"; console.error(error); return; }
  ul.innerHTML = "";
  (data || []).forEach(p => {
    const li = document.createElement("li");
    li.textContent = `${p.evento}: ${p.pontos} `;
    const btnEdit = document.createElement("button");
    btnEdit.textContent = "Editar";
    btnEdit.onclick = async () => {
      const novoEvento = prompt("Evento:", p.evento);
      const novoValor = parseInt(prompt("Pontos:", p.pontos));
      if (!novoEvento || isNaN(novoValor)) return;
      await supabase.from("pontuacao").update({ evento: novoEvento, pontos: novoValor }).eq("id", p.id);
      await carregarPontuacaoList();
    };
    const btnDel = document.createElement("button");
    btnDel.textContent = "Excluir";
    btnDel.onclick = async () => {
      if (!confirm("Excluir pontuação?")) return;
      await supabase.from("pontuacao").delete().eq("id", p.id);
      await carregarPontuacaoList();
    };
    li.appendChild(btnEdit);
    li.appendChild(btnDel);
    ul.appendChild(li);
  });
}

// ---------- CONFIGURAÇÃO (permitir envio de palpites) ----------
document.getElementById("config-save-btn").addEventListener("click", async () => {
  const permitir = !!document.getElementById("config-permitir-envio").checked;
  // tentar atualizar, se não existir, inserir
  const { data: confData } = await supabase.from("configuracao").select("*").limit(1);
  if (confData && confData.length > 0) {
    const id = confData[0].id;
    const { error } = await supabase.from("configuracao").update({ permitir_envio: permitir }).eq("id", id);
    if (error) return alert("Erro ao salvar configuração: " + error.message);
  } else {
    const { error } = await supabase.from("configuracao").insert([{ permitir_envio: permitir }]);
    if (error) return alert("Erro ao salvar configuração: " + error.message);
  }
  await carregarConfiguracao();
  alert("Configuração salva.");
});

async function carregarConfiguracao() {
  const { data, error } = await supabase.from("configuracao").select("*").limit(1);
  if (error) { console.error("Erro config:", error); document.getElementById("config-status").textContent = "erro"; return; }
  if (!data || data.length === 0) {
    document.getElementById("config-permitir-envio").checked = false;
    document.getElementById("config-status").textContent = "Fechado";
    return;
  }
  const cfg = data[0];
  document.getElementById("config-permitir-envio").checked = !!cfg.permitir_envio;
  document.getElementById("config-status").textContent = cfg.permitir_envio ? "Aberto" : "Fechado";
}

// ---------- CARREGAR TUDO (após login) ----------
async function carregarTodasAbas() {
  await carregarParticipantesList();
  await carregarPalpiteirosList();
  await carregarGabaritosList();
  await carregarPalpitesList();
  await carregarPontuacaoList();
  await carregarConfiguracao();
}

// ---------- iniciar quando o arquivo for carregado (não executa nada sem login) ----------
window.addEventListener("load", () => {
  // nenhuma ação para não logados
});
