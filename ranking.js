import { supabase } from './supabase.js';

let PARTICIPANTES_MAP = {};
let PALPITEIROS_MAP = {};

document.addEventListener("DOMContentLoaded", async () => {
  await carregarPalpiteiros();
  await carregarParticipantes();
  document.getElementById("ranking-btn").addEventListener("click", atualizarRanking);
});

async function carregarPalpiteiros() {
  const { data, error } = await supabase.from("palpiteiros").select("*");
  if (error) return console.error(error);
  PALPITEIROS_MAP = {};
  const sel = document.getElementById("ranking-palpiteiro");
  sel.innerHTML = '<option value="">Todos</option>';
  (data || []).forEach(p => {
    PALPITEIROS_MAP[p.id] = p.nome;
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.nome;
    sel.appendChild(opt);
  });
}

async function carregarParticipantes() {
  const { data, error } = await supabase.from("participantes").select("*");
  if (error) return console.error(error);
  PARTICIPANTES_MAP = {};
  (data || []).forEach(p => PARTICIPANTES_MAP[p.id] = p.nome);
}

async function atualizarRanking() {
  const semanaFiltro = parseInt(document.getElementById("ranking-semana").value);
  const palpiteiroFiltro = document.getElementById("ranking-palpiteiro").value;
  const acumulativo = document.getElementById("ranking-acumulativo").checked;

  let query = supabase.from("palpites").select("*");
  if (palpiteiroFiltro) query = query.eq("palpiteiro_id", palpiteiroFiltro);
  if (semanaFiltro) {
    if (acumulativo) query = query.lte("semana", semanaFiltro); // acumulativo até semana
    else query = query.eq("semana", semanaFiltro);
  }

  const { data: palpites, error } = await query;
  if (error) return console.error(error);

  // buscar pontuação
  const { data: pontosData, error: pontosError } = await supabase.from("pontuacao").select("*");
  if (pontosError) return console.error(pontosError);

  const PONTOS = {};
  (pontosData || []).forEach(p => PONTOS[p.evento] = p.pontos);

  // calcular pontuação
  const ranking = {};
  (palpites || []).forEach(p => {
    if (!ranking[p.palpiteiro_id]) ranking[p.palpiteiro_id] = 0;
    ["lider","anjo","imune","emparedado","batevolta","eliminado","capitao","bonus"].forEach(evt => {
      const participante_id = p[evt];
      if (participante_id != null) ranking[p.palpiteiro_id] += PONTOS[evt.toUpperCase()] || 0;
    });
  });

  // montar tabela
  const tbody = document.querySelector("#ranking-tabela tbody");
  tbody.innerHTML = "";
  Object.entries(ranking)
    .sort((a,b)=>b[1]-a[1])
    .forEach(([pid, pts])=>{
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${PALPITEIROS_MAP[pid]}</td><td>${pts}</td>`;
      tbody.appendChild(tr);
    });

  // montar gráfico
  montarGrafico(ranking);
}

function montarGrafico(ranking) {
  const ctx = document.getElementById("ranking-grafico").getContext("2d");
  const labels = Object.keys(ranking).map(pid => PALPITEIROS_MAP[pid]);
  const data = Object.values(ranking);

  if (window.rankingChart) window.rankingChart.destroy();

  window.rankingChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Pontuação',
        data,
        backgroundColor: 'rgba(54, 162, 235, 0.6)'
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}
