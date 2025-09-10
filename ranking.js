let rankingData = [];
const tabelaRanking = document.getElementById('tabela-ranking').querySelector('tbody');
const selectSemana = document.getElementById('select-semana');
const selectPalpiteiro = document.getElementById('select-palpiteiro');
const chkAcumulativo = document.getElementById('chk-acumulativo');
const ctx = document.getElementById('grafico-ranking').getContext('2d');
let chart;

async function carregarRanking() {
    // Pega os dados da tabela ranking_semana
    const { data, error } = await supabase.from('ranking_semana').select('semana, palpiteiro, pontos').order('semana', { ascending: true });
    if (error) return alert(error.message);

    rankingData = data;

    // Preencher seletores
    const semanas = [...new Set(data.map(d => d.semana))];
    selectSemana.innerHTML = semanas.map(s => `<option value="${s}">${s}</option>`).join('');

    const { data: palpiteiros } = await supabase.from('palpiteiros').select('id, nome');
    if (palpiteiros) {
        selectPalpiteiro.innerHTML = '<option value="">Todos</option>' + palpiteiros.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
    }

    atualizarTabela();
    atualizarGrafico();
}

function atualizarTabela() {
    const semanaSelecionada = parseInt(selectSemana.value);
    const palpiteiroSelecionado = selectPalpiteiro.value;
    const acumulativo = chkAcumulativo.checked;

    let dadosFiltrados = rankingData;

    if (acumulativo) {
        dadosFiltrados = dadosFiltrados.filter(d => d.semana <= semanaSelecionada);
    } else {
        dadosFiltrados = dadosFiltrados.filter(d => d.semana === semanaSelecionada);
    }

    if (palpiteiroSelecionado) {
        dadosFiltrados = dadosFiltrados.filter(d => d.palpiteiro === palpiteiroSelecionado);
    }

    // Agrupar por palpiteiro e somar pontos
    const resumo = {};
    dadosFiltrados.forEach(d => {
        if (!resumo[d.palpiteiro]) resumo[d.palpiteiro] = 0;
        resumo[d.palpiteiro] += d.pontos || 0;
    });

    tabelaRanking.innerHTML = '';
    for (const [palpiteiroId, pontos] of Object.entries(resumo)) {
        const nome = selectPalpiteiro.querySelector(`option[value="${palpiteiroId}"]`)?.textContent || palpiteiroId;
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${nome}</td><td>${pontos}</td>`;
        tabelaRanking.appendChild(tr);
    }
}

function atualizarGrafico() {
    const semanaSelecionada = parseInt(selectSemana.value);
    const palpiteiroSelecionado = selectPalpiteiro.value;
    const acumulativo = chkAcumulativo.checked;

    let dadosFiltrados = rankingData;

    if (acumulativo) {
        dadosFiltrados = dadosFiltrados.filter(d => d.semana <= semanaSelecionada);
    } else {
        dadosFiltrados = dadosFiltrados.filter(d => d.semana === semanaSelecionada);
    }

    if (palpiteiroSelecionado) {
        dadosFiltrados = dadosFiltrados.filter(d => d.palpiteiro === palpiteiroSelecionado);
    }

    // Agrupar por semana
    const porSemana = {};
    dadosFiltrados.forEach(d => {
        if (!porSemana[d.semana]) porSemana[d.semana] = 0;
        porSemana[d.semana] += d.pontos || 0;
    });

    const labels = Object.keys(porSemana);
    const pontos = Object.values(porSemana);

    if (chart) chart.destroy();
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Pontos',
                data: pontos,
                borderColor: 'blue',
                backgroundColor: 'rgba(0,0,255,0.2)',
                fill: true
            }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
}

// Eventos
selectSemana.addEventListener('change', () => { atualizarTabela(); atualizarGrafico(); });
selectPalpiteiro.addEventListener('change', () => { atualizarTabela(); atualizarGrafico(); });
chkAcumulativo.addEventListener('change', () => { atualizarTabela(); atualizarGrafico(); });

// Inicial
carregarRanking();
