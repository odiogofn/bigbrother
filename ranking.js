import { supabase } from "./supabase.js";

async function carregarRanking() {
    const semanaSelecionada = parseInt(document.getElementById("filtro-semana").value) || 1;
    const palpiteiroId = document.getElementById("filtro-palpiteiro").value;
    const acumulativo = document.getElementById("acumulativo").checked;

    // Monta query
    let query = supabase.from("palpites").select("palpiteiro_id, pontos, palpiteiro:palpiteiros(nome)");

    if (palpiteiroId) {
        query = query.eq("palpiteiro_id", palpiteiroId);
    }

    if (acumulativo) {
        query = query.lte("semana", semanaSelecionada); // todas as semanas até a selecionada
    } else {
        query = query.eq("semana", semanaSelecionada); // apenas a semana selecionada
    }

    const { data, error } = await query;
    if (error) return console.error(error);

    // Agrupa pontos por palpiteiro
    const rankingMap = {};
    data.forEach(p => {
        const nome = p.palpiteiro?.nome || "Desconhecido";
        rankingMap[nome] = (rankingMap[nome] || 0) + (p.pontos || 0);
    });

    const ranking = Object.entries(rankingMap)
        .map(([nome, pontos]) => ({ nome, pontos }))
        .sort((a, b) => b.pontos - a.pontos);

    renderTabela(ranking);
    renderGrafico(ranking);
}

// Renderiza tabela
function renderTabela(ranking) {
    const tbody = document.querySelector("#tabela-ranking tbody");
    tbody.innerHTML = "";
    ranking.forEach(r => {
        tbody.innerHTML += `<tr><td>${r.nome}</td><td>${r.pontos}</td></tr>`;
    });
}

// Renderiza gráfico
function renderGrafico(ranking) {
    const ctx = document.getElementById("grafico-ranking").getContext("2d");
    if (window.rankingChart) window.rankingChart.destroy(); // destrói gráfico anterior
    window.rankingChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ranking.map(r => r.nome),
            datasets: [{
                label: "Pontos",
                data: ranking.map(r => r.pontos),
                backgroundColor: "rgba(0,123,255,0.5)"
            }]
        }
    });
}

// Preenche dropdown de palpiteiros
async function carregarPalpiteirosDropdown() {
    const { data, error } = await supabase.from("palpiteiros").select("*");
    if (error) return console.error(error);

    const select = document.getElementById("filtro-palpiteiro");
    select.innerHTML = "<option value=''>Todos</option>";
    data.forEach(p => {
        const option = document.createElement("option");
        option.value = p.id;
        option.text = p.nome;
        select.appendChild(option);
    });
}

// Eventos de filtro
document.getElementById("aplicar-filtro").addEventListener("click", carregarRanking);

window.onload = async () => {
    await carregarPalpiteirosDropdown();
    carregarRanking();
};
