const tabela = document.getElementById("tabela-ranking");
const selectSemana = document.getElementById("semana-select");
const btnFiltrar = document.getElementById("btn-filtrar");

// ======================
// Carregar Ranking
// ======================
async function carregarRanking(limiteSemana = null) {
  // Pega todos palpites
  const { data: palpites, error: errPalpites } = await supabase.from("palpites").select("*");
  if (errPalpites) return alert("Erro ao carregar palpites: " + errPalpites.message);

  // Pega gabarito
  const { data: gabaritos, error: errGabarito } = await supabase.from("gabarito").select("*");
  if (errGabarito) return alert("Erro ao carregar gabarito: " + errGabarito.message);

  // Pega pontuação
  const { data: pontuacoes, error: errPontuacao } = await supabase.from("pontuacao").select("*");
  if (errPontuacao) return alert("Erro ao carregar pontuação: " + errPontuacao.message);

  // Pega palpiteiros
  const { data: palpiteiros } = await supabase.from("palpiteiros").select("*");

  // Normaliza pontuação
  const pontosConfig = {};
  pontuacoes.forEach(p => {
    pontosConfig[p.evento.toLowerCase()] = Number(p.pontos || 0);
  });

  // Ranking acumulado
  const ranking = {};

  palpites.forEach(p => {
    // Se tiver filtro de semana
    if (limiteSemana && p.semana > limiteSemana) return;

    const palpiteiro = palpiteiros.find(pp => pp.id === p.palpiteiro_id);
    if (!palpiteiro) return;

    const gab = gabaritos.find(g => g.semana === p.semana);
    if (!gab) return;

    let total = 0;

    // Para cada categoria pontuável
    ["lider","anjo","imune","emparedado","batevolta","eliminado","capitao","bonus"].forEach(categoria => {
      const pontos = Number(pontosConfig[categoria] || 0);
      const palpite = p[categoria];
      const correto = gab[categoria];

      if (palpite && correto && palpite === correto) {
        total += pontos;
      }
    });

    if (!ranking[palpiteiro.id]) {
      ranking[palpiteiro.id] = { nome: palpiteiro.nome, pontos: 0 };
    }
    ranking[palpiteiro.id].pontos += total;
  });

  // Monta tabela
  tabela.innerHTML = "";

  const thead = document.createElement("thead");
  thead.innerHTML = "<tr><th>Palpiteiro</th><th>Pontos</th></tr>";
  tabela.appendChild(thead);

  const tbody = document.createElement("tbody");
  Object.values(ranking)
    .sort((a,b) => b.pontos - a.pontos)
    .forEach(r => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${r.nome}</td><td>${r.pontos}</td>`;
      tbody.appendChild(tr);
    });
  tabela.appendChild(tbody);
}

// ======================
// Popular Select de Semanas
// ======================
async function carregarSemanas() {
  const { data: gabaritos, error } = await supabase.from("gabarito").select("semana").order("semana", { ascending: true });
  if (error) return console.error("Erro ao carregar semanas:", error.message);

  selectSemana.innerHTML = "";
  gabaritos.forEach(g => {
    const opt = document.createElement("option");
    opt.value = g.semana;
    opt.textContent = g.semana;
    selectSemana.appendChild(opt);
  });

  // Seleciona a última semana por padrão
  if (gabaritos.length > 0) {
    selectSemana.value = gabaritos[gabaritos.length - 1].semana;
  }
}

// ======================
// Eventos
// ======================
btnFiltrar.addEventListener("click", () => {
  const limiteSemana = Number(selectSemana.value);
  carregarRanking(limiteSemana);
});

// ======================
// Inicialização
// ======================
(async function init() {
  await carregarSemanas();
  await carregarRanking(); // Ranking geral ao abrir
})();
