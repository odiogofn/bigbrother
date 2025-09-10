// ranking.js (module) — funciona com supabase.js que exporta `supabase`
import { supabase } from './supabase.js';

const categorias = ['lider','anjo','imune','emparedado','batevolta','eliminado','capitao','bonus'];

const selectSemana = document.getElementById('select-semana');
const selectPalpiteiro = document.getElementById('select-palpiteiro');
const chkAcumulativo = document.getElementById('chk-acumulativo');
const btnAtualizar = document.getElementById('btn-atualizar');
const tbody = document.getElementById('ranking-tbody');

let allPalpites = [];
let allGabaritos = [];
let pontosConfig = {}; // eventoLower -> pontos (number)
let palpiteiros = [];

// Busca dados do Supabase
async function carregarDados() {
  try {
    const [resPalpites, resGabarito, resPontuacao, resPalpiteiros] = await Promise.all([
      supabase.from('palpites').select('*'),
      supabase.from('gabarito').select('*').order('semana', { ascending: true }),
      supabase.from('pontuacao').select('*'),
      supabase.from('palpiteiros').select('id, nome')
    ]);

    if (resPalpites.error) throw resPalpites.error;
    if (resGabarito.error) throw resGabarito.error;
    if (resPontuacao.error) throw resPontuacao.error;
    if (resPalpiteiros.error) throw resPalpiteiros.error;

    allPalpites = resPalpites.data || [];
    allGabaritos = resGabarito.data || [];
    palpiteiros = resPalpiteiros.data || [];

    // normaliza pontuação (chave em lower)
    pontosConfig = {};
    (resPontuacao.data || []).forEach(r => {
      if (!r || r.evento == null) return;
      const chave = String(r.evento).trim().toLowerCase();
      pontosConfig[chave] = Number(r.pontos) || 0;
    });

    popularSelects();
    calcularEExibir(); // exibe ao carregar
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
    alert('Erro ao carregar dados do ranking: ' + (err.message || err));
  }
}

// Preenche selects semana e palpiteiro
function popularSelects() {
  // semanas devem vir do gabarito (únicas e ordenadas)
  const semanas = [...new Set(allGabaritos.map(g => Number(g.semana)))].sort((a,b)=>a-b);
  selectSemana.innerHTML = '';
  if (semanas.length === 0) {
    selectSemana.innerHTML = `<option value="">Nenhuma semana</option>`;
  } else {
    selectSemana.innerHTML = semanas.map(s => `<option value="${s}">${s}</option>`).join('');
    // por padrão seleciona a última semana
    selectSemana.value = String(semanas[semanas.length - 1]);
  }

  // palpiteiros
  selectPalpiteiro.innerHTML = `<option value="">Todos</option>` + palpiteiros.map(p => {
    return `<option value="${p.id}">${escapeHtml(p.nome)}</option>`;
  }).join('');
}

// função util para escapar HTML
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// calcular ranking conforme filtros e exibir
function calcularEExibir() {
  const semanaSel = selectSemana.value ? Number(selectSemana.value) : null;
  const palpiteiroSel = selectPalpiteiro.value || null;
  const acumulativo = chkAcumulativo.checked;

  // Agrupador: palpiteiroId -> pontos acumulados (dependendo do filtro)
  const pontosPorPalpiteiro = {};

  // Prepara mapa de gabaritos por semana para acesso rápido
  const mapaGabarito = {};
  allGabaritos.forEach(g => {
    mapaGabarito[Number(g.semana)] = g;
  });

  // Itera palpites
  allPalpites.forEach(p => {
    // pega id do palpiteiro (suporta nomes diferentes de coluna)
    const palpiteiroId = p.palpiteiro_id ?? p.palpiteiro ?? p.palpiteiroId;
    if (!palpiteiroId) return;

    const semana = Number(p.semana);
    if (!semana) return;

    // respeita filtro de semana
    if (semanaSel) {
      if (acumulativo) {
        if (semana > semanaSel) return;
      } else {
        if (semana !== semanaSel) return;
      }
    }

    // respeita filtro de palpiteiro
    if (palpiteiroSel && String(palpiteiroId) !== String(palpiteiroSel)) return;

    const g = mapaGabarito[semana];
    if (!g) return; // se não há gabarito para a semana, nada pontua

    // calcula pontos deste palpite comparando cada categoria com gabarito
    let total = 0;
    for (const cat of categorias) {
      const palValor = p[cat];
      const gabValor = g[cat];
      // só conta se ambos existirem e forem iguais (comparo por string)
      if (palValor != null && gabValor != null && String(palValor) === String(gabValor)) {
        const pontosEvento = pontosConfig[cat] ?? 0;
        total += Number(pontosEvento);
      }
    }

    // soma na conta do palpiteiro
    const key = String(palpiteiroId);
    if (!pontosPorPalpiteiro[key]) pontosPorPalpiteiro[key] = 0;
    pontosPorPalpiteiro[key] += Number(total || 0);
  });

  // transforma em array ordenado para exibir
  const rankingArray = Object.entries(pontosPorPalpiteiro)
    .map(([id, pontos]) => {
      const nome = (palpiteiros.find(x => String(x.id) === String(id)) || {}).nome || id;
      return { id, nome, pontos: Number(pontos) };
    })
    .sort((a,b) => b.pontos - a.pontos);

  renderTabela(rankingArray);
}

// renderiza tabela
function renderTabela(rankingArray) {
  tbody.innerHTML = '';

  if (!rankingArray || rankingArray.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="3">Nenhum resultado para os filtros selecionados.</td>`;
    tbody.appendChild(tr);
    return;
  }

  rankingArray.forEach((r, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${idx+1}º</td><td>${escapeHtml(r.nome)}</td><td>${r.pontos}</td>`;
    tbody.appendChild(tr);
  });
}

// eventos
btnAtualizar.addEventListener('click', calcularEExibir);
selectSemana.addEventListener('change', calcularEExibir);
selectPalpiteiro.addEventListener('change', calcularEExibir);
chkAcumulativo.addEventListener('change', calcularEExibir);

// inicializa
carregarDados();
