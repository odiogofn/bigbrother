import { supabase } from "./supabase.js";
import Chart from 'https://cdn.jsdelivr.net/npm/chart.js/+esm';

document.getElementById("filtrar").addEventListener("click", filtrarRanking);

async function filtrarRanking(){
    const semana = parseInt(document.getElementById("semana").value);
    const filtro = document.getElementById("palpiteiro-filtro").value.toLowerCase();
    const acumulativo = document.getElementById("acumulativo").checked;

    let { data: palpites } = await supabase.from("palpites").select("*");
    
    if(semana){
        if(acumulativo){
            palpites = palpites.filter(p => p.semana <= semana);
        } else {
            palpites = palpites.filter(p => p.semana === semana);
        }
    }

    if(filtro){
        const { data: palpiteiros } = await supabase.from("palpiteiros").select("*");
        const ids = palpiteiros.filter(p => p.nome.toLowerCase().includes(filtro)).map(p=>p.id);
        palpites = palpites.filter(p => ids.includes(p.palpiteiro_id));
    }

    mostrarRanking(palpites);
    desenharGrafico(palpites);
}

function mostrarRanking(palpites){
    const div = document.getElementById("ranking-lista");
    if(!palpites.length){ div.innerHTML="<p>Nenhum dado</p>"; return; }

    let html = "<ul>";
    palpites.forEach(p=>{
        html+=`<li>Semana ${p.semana} - Palpiteiro ${p.palpiteiro_id}: Líder ${p.lider}, Anjo ${p.anjo}, Imune ${p.imune}</li>`;
    });
    html+="</ul>";
    div.innerHTML = html;
}

function desenharGrafico(palpites){
    const ctx = document.getElementById('grafico-ranking').getContext('2d');
    const labels = [...new Set(palpites.map(p=>p.semana))];
    const data = labels.map(s=>palpites.filter(p=>p.semana===s).length);
    
    new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets:[{ label:'Palpites', data, backgroundColor:'rgba(75,192,192,0.5)'}]},
        options:{ responsive:true }
    });
}
