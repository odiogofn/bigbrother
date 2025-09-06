import { supabase } from './supabase.js';

document.addEventListener("DOMContentLoaded", async () => {
    await carregarPalpiteiros();
    await carregarRankingGeral();

    document.getElementById("filtrarBtn").addEventListener("click", filtrarRanking);
});

let palpiteirosList = [];

async function carregarPalpiteiros() {
    const { data, error } = await supabase.from('palpiteiros').select('*');
    if (error) return console.error(error);
    palpiteirosList = data;

    const select = document.getElementById("palpiteiro");
    data.forEach(p => {
        const option = document.createElement("option");
        option.value = p.id;
        option.textContent = p.nome;
        select.appendChild(option);
    });
}

async function carregarRankingGeral() {
    await calcularRanking(); // Carrega geral ao entrar
}

async function filtrarRanking() {
    const semana = parseInt(document.getElementById("semana").value);
    const palpiteiroId = document.getElementById("palpiteiro").value;
    const acumulativo = document.getElementById("acumulativo").checked;

    await calcularRanking(semana, palpiteiroId, acumulativo);
}

async function calcularRanking(semana = 0, palpiteiroId = '', acumulativo = false) {
    try {
        // Busca pontuação definida na tabela
        const { data: pontuacoes, error: erroPontuacao } = await supabase
            .from('pontuacao')
            .select('*');
        if (erroPontuacao) throw erroPontuacao;

        const pontosEvento = {};
        pontuacoes.forEach(p => pontosEvento[p.evento] = p.pontos);

        // Busca palpites
        let query = supabase.from('palpites').select(`
            palpiteiro_id,
            semana,
            lider,
            anjo,
            imune,
            emparedado,
            batevolta,
            eliminado,
            capitao,
            bonus,
            palpiteiros(nome)
        `);

        if (palpiteiroId) query = query.eq('palpiteiro_id', palpiteiroId);
        if (semana > 0 && !acumulativo) query = query.eq('semana', semana);
        if (semana > 0 && acumulativo) query = query.lte('semana', semana);

        const { data: palpites, error } = await query.order('semana', { ascending: true });
        if (error) throw error;

        const ranking = {};

        palpites.forEach(p => {
            const nome = p.palpiteiros.nome;
            if (!ranking[nome]) ranking[nome] = 0;

            // Aplica pontuação por evento usando a tabela pontuacao
            ranking[nome] += pontosEvento['lider'] * (p.lider ? 1 : 0);
            ranking[nome] += pontosEvento['anjo'] * (p.anjo ? 1 : 0);
            ranking[nome] += pontosEvento['imune'] * (p.imune ? 1 : 0);
            ranking[nome] += pontosEvento['emparedado'] * (p.emparedado ? 1 : 0);
            ranking[nome] += pontosEvento['batevolta'] * (p.batevolta ? 1 : 0);
            ranking[nome] += pontosEvento['eliminado'] * (p.eliminado ? 1 : 0);
            ranking[nome] += pontosEvento['capitao'] * (p.capitao ? 1 : 0);
            ranking[nome] += pontosEvento['bonus'] * (p.bonus ? 1 : 0);
        });

        const rankingArray = Object.entries(ranking)
            .sort((a,b) => b[1] - a[1]);

        mostrarRanking(rankingArray);

    } catch (err) {
        console.error("Erro ao calcular ranking:", err.message);
    }
}

function mostrarRanking(rankingArray) {
    const tbody = document.getElementById("ranking-body");
    tbody.innerHTML = "";
    rankingArray.forEach(([nome, pontos], i) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${i+1}</td><td>${nome}</td><td>${pontos}</td>`;
        tbody.appendChild(tr);
    });
}
