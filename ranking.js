// ==========================
// RANKING
// ==========================

const tabelaRanking = document.querySelector("#tabelaRanking tbody");
const filtroSemana = document.getElementById("filtroSemana");
const filtroPalpiteiro = document.getElementById("filtroPalpiteiro");

// Carrega o ranking inicial
async function carregarRanking() {
  try {
    // Busca ranking com join em palpiteiros
    const { data, error } = await supabase
      .from("ranking_semana")
      .select("semana, pontos, palpiteiros:palpiteiro (nome, id)")
      .order("semana", { ascending: true })
      .order("pontos", { ascending: false });

    if (error) throw error;

    // popula filtros dinamicamente
    popularFiltros(data);

    // renderiza tabela com filtro aplicado
    renderizarTabela(data);
  } catch (err) {
    console.error("Erro ao carregar ranking:", err.message);
    tabelaRanking.innerHTML = `<tr><td colspan="3">Erro ao carregar ranking</td></tr>`;
  }
}

// Renderiza a tabela aplicando filtros
function renderizarTabela(data) {
  tabelaRanking.innerHTML = "";

  const semanaSelecionada = filtroSemana.value;
  const palpiteiroSelecionado = filtroPalpiteiro.value;

  let filtrados = data;
  if (semanaSelecionada) {
    filtrados = filtrados.filter(r => r.semana == semanaSelecionada);
  }
  if (palpiteiroSelecionado) {
    filtrados = filtrados.filter(r => r.palpiteiros?.id === palpiteiroSelecionado);
  }

  if (filtrados.length === 0) {
    tabelaRanking.innerHTML = `<tr><td colspan="3">Nenhum registro encontrado</td></tr>`;
    return;
  }

  filtrados.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.semana}</td>
      <td>${r.palpiteiros?.nome || "—"}</td>
      <td>${r.pontos}</td>
    `;
    tabelaRanking.appendChild(tr);
  });
}

// Popula selects de filtro
function popularFiltros(data) {
  // limpa
  filtroSemana.innerHTML = `<option value="">Todas</option>`;
  filtroPalpiteiro.innerHTML = `<option value="">Todos</option>`;

  // semanas únicas
  [...new Set(data.map(r => r.semana))].forEach(sem => {
    const opt = document.createElement("option");
    opt.value = sem;
    opt.textContent = `Semana ${sem}`;
    filtroSemana.appendChild(opt);
  });

  // palpiteiros únicos
  const nomes = {};
  data.forEach(r => {
    if (r.palpiteiros) {
      nomes[r.palpiteiros.id] = r.palpiteiros.nome;
    }
  });
  Object.entries(nomes).forEach(([id, nome]) => {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = nome;
    filtroPalpiteiro.appendChild(opt);
  });
}

// Eventos nos filtros
filtroSemana.addEventListener("change", carregarRanking);
filtroPalpiteiro.addEventListener("change", carregarRanking);

// Carrega ao abrir
carregarRanking();
