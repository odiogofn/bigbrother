import { supabase } from "./supabase.js";

let palpiteiroId = null;

// Login
document.getElementById("login-btn").addEventListener("click", async ()=>{
    const nome = document.getElementById("nome").value;
    const senha = document.getElementById("senha").value;

    const { data, error } = await supabase.from("palpiteiros")
        .select("*")
        .eq("nome", nome)
        .eq("senha", senha)
        .single();
    
    if(error || !data){ alert("Nome ou senha incorretos!"); return; }

    palpiteiroId = data.id;
    document.getElementById("login-palpiteiro").style.display="none";
    document.getElementById("painel-palpite").style.display="block";
    carregarParticipantes();
    carregarHistorico();
});

// Carregar participantes para dropdowns
async function carregarParticipantes(){
    const { data, error } = await supabase.from("participantes").select("*");
    if(error) return console.error(error);

    const campos = ["lider","anjo","imune","emparedado","batevolta","eliminado","capitao","bonus"];
    campos.forEach(campo=>{
        const sel = document.getElementById(campo);
        sel.innerHTML = "<option value=''>--Selecione--</option>";
        data.forEach(p=>{
            const opt = document.createElement("option");
            opt.value = p.id;
            opt.textContent = p.nome;
            sel.appendChild(opt);
        });
    });
}

// Enviar palpite
document.getElementById("enviar-palpite").addEventListener("click", async ()=>{
    const semana = parseInt(document.getElementById("semana").value);
    if(!semana) return alert("Informe a semana");

    const { data: existentes } = await supabase.from("palpites")
        .select("*")
        .eq("palpiteiro_id", palpiteiroId)
        .eq("semana", semana);

    if(existentes.length >= 3){ alert("Limite de palpites alcançado"); return; }

    const palpite = {
        palpiteiro_id: palpiteiroId,
        semana,
        lider: document.getElementById("lider").value,
        anjo: document.getElementById("anjo").value,
        imune: document.getElementById("imune").value,
        emparedado: document.getElementById("emparedado").value,
        batevolta: document.getElementById("batevolta").value,
        eliminado: document.getElementById("eliminado").value,
        capitao: document.getElementById("capitao").value,
        bonus: document.getElementById("bonus").value
    };

    await supabase.from("palpites").insert([palpite]);
    alert("Palpite enviado!");
    carregarHistorico();
});

// Histórico de palpites
async function carregarHistorico(){
    const { data, error } = await supabase.from("palpites")
        .select("*")
        .eq("palpiteiro_id", palpiteiroId)
        .order("semana",{ascending:true});
    if(error) return console.error(error);

    const div = document.getElementById("historico-palpite");
    if(!data.length){ div.innerHTML = "<p>Nenhum palpite enviado.</p>"; return; }

    let html = "<ul>";
    data.forEach(p=>{
        html += `<li>Semana ${p.semana}: Líder ${p.lider}, Anjo ${p.anjo}, Imune ${p.imune}, Emparedado ${p.emparedado}, Batevolta ${p.batevolta}, Eliminado ${p.eliminado}, Capitão ${p.capitao}, Bonus ${p.bonus}</li>`;
    });
    html += "</ul>";
    div.innerHTML = html;
}

// Logout
document.getElementById("logout").addEventListener("click", ()=>{
    document.getElementById("painel-palpite").style.display="none";
    document.getElementById("login-palpiteiro").style.display="block";
});
