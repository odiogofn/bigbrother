// ranking.js (module)
import { supabase } from './supabase.js'; // <- importa o cliente supabase

const tabela = document.getElementById("tabela-ranking");
const selectSemana = document.getElementById("semana-select");
const btnFiltrar = document.getElementById("btn-filtrar");

const categorias = ["lider","anjo","imune","emparedado","batevolta","eliminado","capitao","bonus"];

async function carregarSemanas() {
  const { data: gabaritos, error } = await supabase.from("gabarito").select("semana").order("semana", { ascending: true });
  if (error) {
    console.error("Erro ao carregar semanas:", error.message);
    return;
  }
  selectSemana.innerHTML = "";
  if (!gabaritos || gabaritos.length === 0) {
    const opt = document.createElement("option"); opt.value = ""; opt.textContent = "Nenhuma semana";
    selectSemana.appendChild(opt);
    return;
  }
  gabaritos.forEach(g => {
    const opt = document.createElement("option");
    opt.value = String(g.semana);
    opt.textContent = `Semana ${g.semana}`;
    selectSemana.appendChild(opt);
  });
  selectSemana.value = String(gabaritos[gabaritos.length - 1].semana);
}

async function carregarRanking(limiteSemana = null) {
  // busca dados
  const [{ data: palpites, error: errPalpites }, 
         { data: gabaritos, error: errGabarito },
         { data: pontuacoes, error: errPontuacao },
         { data: palpiteiros, error: errPalpiteiros }] = await Promise.all([
    supabase.from("palpites").select("*"),
    supabase.from("gabarito").select("*"),
    supabase.from("pontuacao").select("*"),
    supabase.from("palpiteiros").select("*")
  ]);

  if (errPalpites) return alert("Erro ao carregar palpites: " + errPalpites.message);
  if (errGabarito) return alert("Erro ao carregar gabarito: " + errGabarito.message);
  if (errPontuacao) return alert("Erro ao carregar pontuação: " + errPontuacao.message);
  if (errPalpiteiros) return alert("Erro ao carregar palpiteiros: " + errPalpiteiros.message);

  // normaliza pontuação (evento -> número)
  const pontosConfig = {};
  (pontuacoes || []).forEach(p => {
    pontosConfig[String(p.evento).toLowerCase()] = Number(p.pontos || 0);
  });

  // ranking acumulado
  const ranking = {};

  (palpites || []).forEach(p => {
    const semanaPalpite = Number(p.semana);
    if (limiteSemana && semanaPalpite > limiteSemana) return;

    const palpiteiro = (palpiteiros || []).find(pp => String(pp.id) === String(p.palpiteiro_id));
    if (!palpiteiro) return;

    const gab = (gabaritos || []).find(g => Number(g.semana) === semanaPalpite);
    if (!gab) return;

    let total = 0;
    categorias.forEach(cat => {
      const pontos = Number(pontosConfig[cat] || 0);
      const palpiteVal = p[cat];
      const corretoVal = gab[cat];
      // comparar como strings (IDs)
      if (palpiteVal != null && corretoVal != null && String(palpiteVal) === String(corretoVal)) {
        total += pontos;
      }
    });

    if (!ranking[palpiteiro.id]) ranking[palpiteiro.id] = { nome: palpiteiro.nome, pontos: 0 };
    ranking[palpiteiro.id].pontos += total;
  });

  // render
  const tbody = tabela.querySelector("tbody");
  tbody.innerHTML = "";
  Object.values(ranking)
    .sort((a,b) => b.pontos - a.pontos)
    .forEach((r, i) => {
      const tr = document.createElement("tr");
      if (i === 0) tr.classList.add("top1");
      else if (i === 1) tr.classList.add("top2");
      else if (i === 2) tr.classList.add("top3");
      tr.innerHTML = `<td>${i+1}º</td><td>${r.nome}</td><td>${r.pontos}</td>`;
      tbody.appendChild(tr);
  });
}

btnFiltrar.addEventListener("click", () => {
  const val = Number(selectSemana.value) || null;
  carregarRanking(val);
});

document.addEventListener("DOMContentLoaded", async () => {
  await carregarSemanas();
  const lim = Number(selectSemana.value) || null;
  await carregarRanking(lim);
});
