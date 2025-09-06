import { supabase } from "./supabase.js";

const USUARIO = "admin";
const SENHA = "12345";

// Login Admin
document.getElementById("login-admin").addEventListener("click", () => {
    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;

    if(usuario === USUARIO && senha === SENHA){
        document.getElementById("admin-login").style.display = "none";
        document.getElementById("admin-container").style.display = "block";

        carregarParticipantes();
        carregarPalpiteiros();
        carregarGabaritos();
    } else {
        alert("Usuário ou senha inválidos!");
    }
});

// Logout
document.getElementById("logout").addEventListener("click", () => {
    document.getElementById("admin-container").style.display = "none";
    document.getElementById("admin-login").style.display = "block";
});

// --- CRUD Participantes ---
async function carregarParticipantes(){
    const { data, error } = await supabase.from("participantes").select("*");
    if(error) return console.error(error);

    const div = document.getElementById("lista-participantes");
    if(!data.length){ div.innerHTML = "<p>Nenhum registro.</p>"; return; }

    let html = "<ul>";
    data.forEach(p=>{
        html += `<li>${p.nome} 
            <button onclick="editarParticipante('${p.id}','${p.nome}')">Editar</button>
            <button onclick="remover('participantes','${p.id}')">Excluir</button>
        </li>`;
    });
    html += "</ul>";
    div.innerHTML = html;
}

window.editarParticipante = async (id,nomeAtual)=>{
    const novoNome = prompt("Alterar nome:", nomeAtual);
    if(!novoNome) return;
    await supabase.from("participantes").update({nome:novoNome}).eq("id", id);
    carregarParticipantes();
}

document.getElementById("add-participante").addEventListener("click", async ()=>{
    const nome = prompt("Nome do participante:");
    if(!nome) return;
    await supabase.from("participantes").insert({nome});
    carregarParticipantes();
});

// --- CRUD Palpiteiros ---
async function carregarPalpiteiros(){
    const { data, error } = await supabase.from("palpiteiros").select("*");
    if(error) return console.error(error);

    const div = document.getElementById("lista-palpiteiros");
    if(!data.length){ div.innerHTML = "<p>Nenhum registro.</p>"; return; }

    let html = "<ul>";
    data.forEach(p=>{
        html += `<li>${p.nome} 
            <button onclick="editarPalpiteiro('${p.id}','${p.nome}','${p.senha}')">Editar</button>
            <button onclick="remover('palpiteiros','${p.id}')">Excluir</button>
        </li>`;
    });
    html += "</ul>";
    div.innerHTML = html;
}

window.editarPalpiteiro = async (id,nomeAtual,senhaAtual)=>{
    const novoNome = prompt("Alterar nome:", nomeAtual);
    const novaSenha = prompt("Alterar senha:", senhaAtual);
    if(!novoNome || !novaSenha) return;
    await supabase.from("palpiteiros").update({nome:novoNome, senha:novaSenha}).eq("id", id);
    carregarPalpiteiros();
}

document.getElementById("add-palpiteiro").addEventListener("click", async ()=>{
    const nome = prompt("Nome do palpiteiro:");
    const senha = prompt("Senha:");
    if(!nome || !senha) return;
    await supabase.from("palpiteiros").insert({nome, senha});
    carregarPalpiteiros();
});

// --- CRUD Gabarito ---
async function carregarGabaritos(){
    const { data, error } = await supabase.from("gabaritos").select("*");
    if(error) return console.error(error);

    const div = document.getElementById("lista-gabaritos");
    if(!data.length){ div.innerHTML = "<p>Nenhum registro.</p>"; return; }

    let html = "<ul>";
    data.forEach(g=>{
        html += `<li>Semana ${g.semana} 
            <button onclick="editarGabarito('${g.id}','${g.semana}')">Editar</button>
            <button onclick="remover('gabaritos','${g.id}')">Excluir</button>
        </li>`;
    });
    html += "</ul>";
    div.innerHTML = html;
}

window.editarGabarito = async (id,semanaAtual)=>{
    const novaSemana = prompt("Alterar semana:", semanaAtual);
    if(!novaSemana) return;
    await supabase.from("gabaritos").update({semana:parseInt(novaSemana)}).eq("id", id);
    carregarGabaritos();
}

document.getElementById("add-gabarito").addEventListener("click", async ()=>{
    const semana = prompt("Número da semana:");
    if(!semana) return;
    await supabase.from("gabaritos").insert({semana:parseInt(semana)});
    carregarGabaritos();
});

// --- Remover ---
window.remover = async (tabela,id)=>{
    await supabase.from(tabela).delete().eq("id", id);
    if(tabela==="participantes") carregarParticipantes();
    if(tabela==="palpiteiros") carregarPalpiteiros();
    if(tabela==="gabaritos") carregarGabaritos();
}
