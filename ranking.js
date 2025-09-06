import { supabase } from "./supabase.js";

let palpiteirosMap = {};
let participantesMap = {};

async function carregarMapas(){
    const { data: pData } = await supabase.from("palpiteiros").select("*");
    pData.forEach(p => palpiteirosMap[p.id] = p.nome);

    const { data: partData } = await supabase.from("participantes").select("*");
    partData.forEach(p => participantesMap[p.id] = p.nome);

    // Popular filtro de palpiteiros
    const filtroSelect = document.getElementById("filtro-palpiteiro");
    pData.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = p.nome;
        filtroSelect.appendChild(opt);
    });
}

async function carregarRanking(){
    let semanaFiltro = parseInt(document.getElementById("filtro-semana").value);
    let palpiteiroFiltro = document.getElementById("filtro-palpiteiro").value;
    let acumulativo = document.getElementById("filtro-acumulativo").checked;

    let query = supabase.from("palpites").select("*").order("semana",{ascending:true});
    if(semanaFiltro) query = acumulativo ? query.lte("semana", semanaFiltro) : query.eq("semana", semanaFiltro);
    if(palpiteiroFiltro) query = query.eq("palpiteiro_id", palpiteiroFiltro);

    const { data: palpites } = await query;
    const { data: gabaritos } = await supabase.from("gabaritos").select("*");

    // Calcular pontuação simples: 1 ponto por acerto em cada categoria
    let pontuacoes = {};
    palpites.forEach(p=>{
        let gabs = gabaritos.filter(g=>g.semana===p.semana);
        if(!gabs.length) return;
        let g = gabs[0];
        let pontos = 0;
        ["lider","anjo","imune","emparedado","batevolta","eliminado","capitao","bonus"].forEach(c=>{
            if(p[c] && p[c] === g[c]) pontos++;
        });
        pontuacoes[p.palpiteiro_id] = (pontuacoes[p.palpiteiro_id]||0) + pontos;
    });

    // Exibir ranking
    const listaDiv = document.getElementById("ranking-lista");
    listaDiv.innerHTML = "";
    Object.entries(pontuacoes).sort((a,b)=>b[1]-a[1]).forEach(([id, pts])=>{
        const div = document.createElement("div");
        div.textContent = `${palpiteirosMap[id] || '-'}: ${pts} pontos`;
        listaDiv.appendChild(div);
    });

    // Gráfico
    const ctx = document.getElementById("grafico-ranking").getContext("2d");
    const labels = Object.keys(pontuacoes).map(id=>palpiteirosMap[id]||'-');
    const data = Object.values(pontuacoes);
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Pontuação',
                data,
                backgroundColor: 'rgba(75, 192, 192, 0.5)'
            }]
        }
    });
}

document.getElementById("filtrar").addEventListener("click", carregarRanking);

// Inicialização
carregarMapas().then(carregarRanking);
