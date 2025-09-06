import { supabase } from "./supabase.js";

let palpiteirosMap = {};
let participantesMap = {};

// CARREGAR PALPITEIROS E PARTICIPANTES
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

// CARREGAR RANKING
async function carregarRanking(){
    let semanaFiltro = parseInt(document.getElementById("filtro-semana").value);
    let palpiteiroFiltro = document.getElementById("filtro-palpiteiro").value;
    let acumulativo = document.getElementById("filtro-acumulativo").checked;

    // Busca os palpites
    let query = supabase.from("palpites").select("*").order("semana",{ascending:true});

    if(semanaFiltro){
        if(acumulativo) query = query.lte("semana", semanaFiltro);
        else query = query.eq("semana", semanaFiltro);
    }
    if(palpiteiroFiltro) query = query.eq("palpiteiro_id", palpiteiroFiltro);

    const { data: palpites } = await query;

    // Carregar gabaritos
    const { data: gabaritos } = await supabase.from("gabaritos").select("*");

    // Calcular pontuação
    let ranking = {};
    palpites.forEach(p=>{
        if(!ranking[p.palpiteiro_id]) ranking[p.palpiteiro_id] = 0;

        const g = gabaritos.find(g=>g.semana === p.semana);
        if(!g) return;

        ["lider","anjo","imune","emparedado","batevolta","eliminado","capitao","bonus"].forEach(campo=>{
            if(p[campo] && g[campo] && p[campo] === g[campo]) ranking[p.palpiteiro_id] +=1;
        });
    });

    // Transformar em array e ordenar
    let rankingArray = Object.keys(ranking).map(id=>({nome: palpiteirosMap[id], pontos: ranking[id]}));
    rankingArray.sort((a,b)=>b.pontos - a.pontos);

    // Mostrar ranking
    const div = document.getElementById("ranking-lista");
    div.innerHTML = "<ol>" + rankingArray.map(r=>`<li>${r.nome}: ${r.pontos} pts</li>`).join("") + "</ol>";

    // Preparar gráfico
    const ctx = document.getElementById("grafico-ranking").getContext("2d");
    const labels = Object.values(palpiteirosMap);
    const datasets = [];

    Object.keys(palpiteirosMap).forEach(pid=>{
        const dataSet = [];
        let acumulado = 0;
        const semanas = [...new Set(palpites.map(p=>p.semana))].sort((a,b)=>a-b);

        semanas.forEach(s=>{
            let p = palpites.find(pal=>pal.palpiteiro_id==pid && pal.semana==s);
            let g = gabaritos.find(gab=>gab.semana==s);
            if(p && g){
                let pontosSemana=0;
                ["lider","anjo","imune","emparedado","batevolta","eliminado","capitao","bonus"].forEach(campo=>{
                    if(p[campo] && g[campo] && p[campo] === g[campo]) pontosSemana++;
                });
                acumulado += pontosSemana;
                dataSet.push(acumulativo ? acumulado : pontosSemana);
            } else dataSet.push(0);
        });

        datasets.push({
            label: palpiteirosMap[pid],
            data: dataSet,
            fill: false,
            borderColor: '#' + Math.floor(Math.random()*16777215).toString(16),
            tension:0.1
        });
    });

    new Chart(ctx,{
        type:"line",
        data:{
            labels:[...new Set(palpites.map(p=>p.semana))].sort((a,b)=>a-b),
            datasets
        },
        options:{
            responsive:true,
            plugins:{
                legend:{ position:"top" },
                title:{ display:true, text:"Pontuação por semana" }
            }
        }
    });
}

document.getElementById("filtrar").addEventListener("click", carregarRanking);

// Carregar mapas e ranking inicial
(async ()=>{
    await carregarMapas();
    await carregarRanking();
})();
