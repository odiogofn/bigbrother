async function carregarRanking() {
  const { data: palpites, error } = await supabase.from("palpites").select("*");
  if (error) {
    console.error("Erro ao buscar palpites:", error.message);
    return;
  }

  const { data: palpiteiros, error: errPalpiteiros } = await supabase.from("palpiteiros").select("*");
  if (errPalpiteiros) {
    console.error("Erro ao buscar palpiteiros:", errPalpiteiros.message);
    return;
  }

  // Cria mapa de pontos por palpiteiro
  const pontosMap = {};
  palpiteiros.forEach(p => pontosMap[p.id] = { nome: p.nome, pontos: 0 });

  palpites.forEach(p => {
    if (!pontosMap[p.palpiteiro_id]) return;
    let pontos = 0;

    // Exemplo de pontuação (ajuste se usar tabela pontuacao no futuro)
    if (p.lider) pontos += 10;
    if (p.anjo) pontos += 8;
    if (p.imune) pontos += 5;
    if (p.eliminado) pontos += 15;
    if (p.capitao) pontos += 12;
    if (p.bonus) pontos += Number(p.bonus) || 0;

    pontosMap[p.palpiteiro_id].pontos += pontos;
  });

  // Ordena ranking
  const ranking = Object.values(pontosMap).sort((a, b) => b.pontos - a.pontos);

  // Renderiza tabela
  const tbody = document.querySelector("#tabela-ranking tbody");
  tbody.innerHTML = "";
  ranking.forEach((r, i) => {
    const tr = document.createElement("tr");

    if (i === 0) tr.classList.add("top1");
    else if (i === 1) tr.classList.add("top2");
    else if (i === 2) tr.classList.add("top3");

    tr.innerHTML = `
      <td>${i + 1}º</td>
      <td>${r.nome}</td>
      <td>${r.pontos}</td>
    `;
    tbody.appendChild(tr);
  });
}

carregarRanking();
