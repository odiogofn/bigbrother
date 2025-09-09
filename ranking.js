async function carregarRanking() {
  // 1. Buscar tudo
  const { data: palpites } = await supabase.from("palpites").select("*");
  const { data: gabaritos } = await supabase.from("gabarito").select("*");
  const { data: pontosEventos } = await supabase.from("pontuacao").select("*");
  const { data: palpiteiros } = await supabase.from("palpiteiros").select("id, nome");

  // 2. Criar acumulador
  let ranking = palpiteiros.map(p => ({ id: p.id, nome: p.nome, pontos: 0 }));

  // 3. Para cada palpite, comparar com gabarito da mesma semana
  palpites.forEach(p => {
    const gabarito = gabaritos.find(g => g.semana === p.semana);
    if (!gabarito) return;

    pontosEventos.forEach(ev => {
      const campo = ev.evento.toLowerCase(); // exemplo: 'lider', 'anjo'...
      if (p[campo] && gabarito[campo] && p[campo] === gabarito[campo]) {
        let jogador = ranking.find(r => r.id === p.palpiteiro_id);
        if (jogador) jogador.pontos += ev.pontos;
      }
    });
  });

  // 4. Ordenar por pontos
  ranking.sort((a, b) => b.pontos - a.pontos);

  console.log("Ranking calculado:", ranking);
}
