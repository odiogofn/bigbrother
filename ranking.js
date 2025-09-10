// ---------- CARREGAR RANKING ----------
async function carregarRanking() {
  try {
    // Busca todos os dados já agregados na tabela auxiliar
    const { data, error } = await supabase
      .from("ranking_semana")
      .select("*");

    if (error) {
      console.error("Erro ao buscar ranking:", error.message);
      return;
    }

    if (!data || data.length === 0) {
      console.warn("Nenhum dado encontrado no ranking");
      return;
    }

    // ---------- Agrupar pontos totais por palpiteiro ----------
    const pontosPorPalpiteiro = {};
    data.forEach(row => {
      if (!pontosPorPalpiteiro[row.palpiteiro]) {
        pontosPorPalpiteiro[row.palpiteiro] = 0;
      }
      pontosPorPalpiteiro[row.palpiteiro] += row.pontos_total;
    });

    // Ordenar ranking
    const ranking = Object.entries(pontosPorPalpiteiro)
      .sort((a, b) => b[1] - a[1]);

    // ---------- Atualizar tabela ----------
    const tbody = document.querySelector("#rankingTable tbody");
    tbody.innerHTML = "";
    ranking.forEach(([palpiteiro, pontos]) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${palpiteiro}</td>
        <td>${pontos}</td>
      `;
      tbody.appendChild(tr);
    });

    // ---------- Popular filtro ----------
    const filtroSelect = document.getElementById("filtroPalpiteiro");
    filtroSelect.innerHTML = `<option value="">Todos</option>`;
    ranking.forEach(([palpiteiro]) => {
      const opt = document.createElement("option");
      opt.value = palpiteiro;
      opt.textContent = palpiteiro;
      filtroSelect.appendChild(opt);
    });

    // ---------- Montar gráfico ----------
    desenharGrafico(data);

  } catch (err) {
    console.error("Erro inesperado:", err);
  }
}

// ---------- DESENHAR GRÁFICO ----------
function desenharGrafico(data) {
  const filtro = document.getElementById("filtroPalpiteiro").value;

  let filtrado = data;
  if (filtro) {
    filtrado = data.filter(row => row.palpiteiro === filtro);
  }

  // Agrupar por semana (cada palpiteiro separado)
  const porPalpiteiro = {};
  filtrado.forEach(row => {
    if (!porPalpiteiro[row.palpiteiro]) {
      porPalpiteiro[row.palpiteiro] = {};
    }
    porPalpiteiro[row.palpiteiro][row.semana] = row.pontos_total;
  });

  const semanas = [...new Set(filtrado.map(r => r.semana))].sort((a, b) => a - b);

  const datasets = Object.entries(porPalpiteiro).map(([palpiteiro, semanasPontos]) => {
    return {
      label: palpiteiro,
      data: semanas.map(s => semanasPontos[s] || 0),
      borderWidth: 2,
      fill: false,
      tension: 0.2
    };
  });

  const ctx = document.getElementById("graficoSemanal").getContext("2d");
  if (window.grafico) {
    window.grafico.destroy();
  }
  window.grafico = new Chart(ctx, {
    type: "line",
    data: {
      labels: semanas.map(s => `Semana ${s}`),
      datasets: datasets
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" }
      }
    }
  });
}

// ---------- EVENTOS ----------
document.getElementById("filtroPalpiteiro").addEventListener("change", async () => {
  const { data } = await supabase.from("ranking_semana").select("*");
  desenharGrafico(data);
});

// ---------- INICIAR ----------
carregarRanking();
