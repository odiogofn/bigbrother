async function carregarRanking() {
    // Pega os dados da tabela ranking_semana
    const { data, error } = await supabase
        .from('ranking_semana')
        .select('semana, palpiteiro, pontos')
        .order('semana', { ascending: true });

    if (error) return alert(error.message);
    rankingData = data;

    // 🔹 Pega as semanas que existem no gabarito
    const { data: semanasGabarito, error: erroG } = await supabase
        .from('gabarito')
        .select('semana')
        .order('semana', { ascending: true });

    if (erroG) return alert(erroG.message);

    const semanas = [...new Set(semanasGabarito.map(g => g.semana))];
    selectSemana.innerHTML = semanas.map(s => `<option value="${s}">${s}</option>`).join('');

    // 🔹 Palpiteiros
    const { data: palpiteiros } = await supabase.from('palpiteiros').select('id, nome');
    if (palpiteiros) {
        selectPalpiteiro.innerHTML = '<option value="">Todos</option>' +
            palpiteiros.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
    }

    atualizarTabela();
    atualizarGrafico();
}
