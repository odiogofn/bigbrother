import { supabase } from "./supabase.js";
let palpiteiroId;

document.getElementById("login").addEventListener("click", async ()=>{
    const nome = document.getElementById("nome").value;
    const dt = document.getElementById("data-nascimento").value;
    if(!nome || !dt){ alert("Informe nome e data de nascimento"); return; }

    const { data, error } = await supabase.from("palpiteiros")
        .select("*")
        .eq("nome", nome)
        .eq("data_nascimento", dt)
        .single();
    if(error){ alert("Usuário não encontrado"); return; }

    palpiteiroId = data.id;
    document.getElementById("login-form").style.display = "none";
    document.getElementById("painel-palpite").style.display = "block";

    carregarParticipantes();
    carregarHistorico();
});

async function carregarParticipantes(){
    const { data, error } = await supabase.from("participantes").select("*").eq("ativo", true);
    if(error) return console.error(error);
    const opcoes = ["lider","anjo","imune","emparedado","batevolta","eliminado","bonus","capitao"];
    opcoes.forEach(op=>{
        const select = document.getElementById(op);
        select.innerHTML = "<option value=''>Selecione</option>";
        data.forEach(p=>{
            const option = document.createElement("option");
            option.value = p.id;
            option.text = p.nome;
            select.appendChild(option);
        });
    });
}

document.getElementById("form-palpite").addEventListener("submit", async e=>{
    e.preventDefault();
    const semana = 1; // pode ser dinâmico
    const opcoes = ["lider","anjo","imune","emparedado","batevolta","eliminado","bonus","capitao"];
    let palpite = {palpiteiro_id: palpiteiroId, semana};
    for(let op of opcoes){
        palpite[op] = document.getElementById(op).value;
    }

    // verifica se já existe palpite
    const { data: exist } = await supabase.from("palpites")
        .select("*").eq("palpiteiro_id", palpiteiroId).eq("semana", semana);
    if(exist.length >= 3){ alert("Limite de palpites alcançados"); return; }

    await supabase.from("palpites").insert(palpite);
    alert("Palpite enviado!");
    carregarHistorico();
});

async function carregarHistorico(){
    const { data, error } = await supabase.from("palpites")
        .select("*, lider:lider(*), anjo:anjo(*), imune:imune(*)")
        .eq("palpiteiro_id", palpiteiroId);
    if(error) return console.error(error);
    const div = document.getElementById("historico-palpite");
    if(!data.length){ div.innerHTML="<p>Nenhum palpite enviado.</p>"; return; }
    let html="<ul>";
    data.forEach(p=>{
        html += `<li>Semana ${p.semana}: Lider=${p.lider?.nome}, Anjo=${p.anjo?.nome}, Imune=${p.imune?.nome}</li>`;
    });
    html += "</ul>";
    div.innerHTML = html;
}

document.getElementById("logout").addEventListener("click", ()=>{
    document.getElementById("login-form").style.display="block";
    document.getElementById("painel-palpite").style.display="none";
});
