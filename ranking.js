async function carregarRanking() {
  // Busca pontos já processados
  const { data: pontuacoes, error } = await supabase
    .from("pontuacao")
    .select(`
      semana, palpiteiro_id, pontos
    `);

  if (error) {
    console.error("Erro ao carregar pontuações:", error.message);
    return;
  }

  const { data: palpiteiros } = await supabase.from("palpiteiros").select("*");

  // Filtro de participante
  const selectFiltro = document.getElementById("filtroParticipante");
  selectFiltro.innerHTML = `<option value="">Todos</option>`;
  palpiteiros.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.nome;
    selectFiltro.appendChild(opt);
  });

  function renderizarTabela(filtroId = "") {
    const tabela = document.getElementById("tabela-ranking");
    tabela.innerHTML = "";

    const thead = document.createElement("thead");
    thead.innerHTML = "<tr><th>Palpiteiro</th><th>Pontos</th></tr>";
    tabela.appendChild(thead);

    const tbody = document.createElement("tbody");

    let ranking = palpiteiros.map(p => {
      let pontos = pontuacoes
        .filter(pl => pl.palpiteiro_id === p.id)
        .reduce((acc, pl) => acc + (pl.pontos || 0), 0);
      return { id: p.id, nome: p.nome, pontos };
    });

    if (filtroId) {
      ranking = ranking.filter(r => r.id == filtroId);
    }

    ranking.sort((a, b) => b.pontos - a.pontos);

    ranking.forEach(r => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${r.nome}</td><td>${r.pontos}</td>`;
      tbody.appendChild(tr);
    });

    tabela.appendChild(tbody);
  }

  function renderizarGrafico(filtroId = "") {
    const ctx = document.getElementById("graficoRanking").getContext("2d");

    let datasets = [];

    palpiteiros.forEach(p => {
      if (filtroId && p.id != filtroId) return;

      let pontosPorSemana = {};
      pontuacoes
        .filter(pl => pl.palpiteiro_id === p.id)
        .forEach(pl => {
          pontosPorSemana[pl.semana] = (pontosPorSemana[pl.semana] || 0) + (pl.pontos || 0);
        });

      // acumular
      let acumulado = 0;
      let dados = Object.keys(pontosPorSemana).sort((a, b) => a - b).map(s => {
        acumulado += pontosPorSemana[s];
        return { semana: s, pontos: acumulado };
      });

      datasets.push({
        label: p.nome,
        data: dados.map(d => ({ x: d.semana, y: d.pontos })),
        borderWidth: 2,
        fill: false
      });
    });

    if (window.graficoRanking) {
      window.graficoRanking.destroy();
    }

    window.graficoRanking = new Chart(ctx, {
      type: "line",
      data: { datasets },
      options: {
        responsive: true,
        scales: {
          x: { type: "category", title: { display: true, text: "Semana" } },
          y: { beginAtZero: true, title: { display: true, text: "Pontos" } }
        }
      }
    });
  }

  // Inicial
  renderizarTabela();
  renderizarGrafico();

  // Evento de filtro
  selectFiltro.addEventListener("change", e => {
    renderizarTabela(e.target.value);
    renderizarGrafico(e.target.value);
  });
}

carregarRanking();
