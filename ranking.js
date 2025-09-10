let rankingData = [];
let chart = null;

const tabelaRanking = document.getElementById('tabela-ranking').querySelector('tbody');
const filtroSemana = document.getElementById('filtro-semana');
const filtroPalpiteiro = document.getElementById('filtro-palpiteiro');
const acumulativoCheck = document.getElementById('acumulativo');
const btnAtualizar = document.getElementById('btn-atualizar');

async function carregarPalpiteiros() {
    const { data, error } = await supabase.from('palpiteiros').select('*');
    if (error) return alert(error.message);

    filtroPalpiteiro.innerHTML = '<option value="">Todos</option>';
    data.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.nome;
        filtroPalpiteiro.appendChild(opt);
    });
}

async function carregarRanking() {
    const { data, error } = await supabase.from('ranking_semana').select(`
        palpiteiro, semana, pontos
    `);
    if (error) return alert(error.message);

    rankingData = data;

    // Preencher filtro de semanas
    const semanas = [...new Set(data.map(d => d.semana))].sort((a,b)=>a-b);
    filtroSemana.innerHTML = '';
    semanas.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = `Semana ${s}`;
        filtroSemana.appendChild(opt);
    });

    atualizarTabela();
}

function atualizarTabela() {
    const semanaSelecionada = filtroSemana.value ? parseInt(filtroSemana.value) : null;
    const palpiteiroSelecionado = filtroPalpiteiro.value;
    const acumulativo = acumulativoCheck.checked;

    const tbody = tabelaRanking;
    tbody.innerHTML = '';

    let dadosFiltrados = rankingData;

    if (palpiteiroSelecionado) {
        dadosFiltrados = dadosFiltrados.filter(d => d.palpiteiro === palpiteiroSelecionado);
    }

    if (semanaSelecionada) {
        if (acumulativo) {
            dadosFiltrados = dadosFiltrados.filter(d => d.semana <= semanaSelecionada);
        } else {
            dadosFiltrados = dadosFiltrados.filter(d => d.semana === semanaSelecionada);
        }
    }

    // Soma pontos por palpiteiro
    const resumo = {};
    dadosFiltrados.forEach(d => {
        if (!resumo[d.palpiteiro]) resumo[d.palpiteiro] = 0;
        resumo[d.palpiteiro] += d.pontos;
    });

    // Puxar nomes dos palpiteiros
    const palpiteiroMap = {};
    supabase.from('palpiteiros').select('*').then(({data})=>{
        if(data) data.forEach(p => palpiteiroMap[p.id] = p.nome);

        Object.keys(resumo).forEach(pid => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${palpiteiroMap[pid]||pid}</td>
                            <td>${semanaSelecionada || '-'}</td>
                            <td>${resumo[pid]}</td>`;
            tbody.appendChild(tr);
        });

        atualizarGrafico(resumo);
    });
}

function atualizarGrafico(resumo) {
    const labels = Object.keys(resumo).map(pid => pid);
    const data = Object.values(resumo);

    if(chart) chart.destroy();

    chart = new Chart(document.getElementById('grafico-ranking'), {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Pontos',
                data,
                backgroundColor: 'rgba(54, 162, 235, 0.7)'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            }
        }
    });
}

btnAtualizar.addEventListener('click', atualizarTabela);

carregarPalpiteiros().then(() => carregarRanking());