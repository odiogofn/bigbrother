import { supabase } from "./supabase.js";

// Credenciais fixas
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

// --- CRUD Participantes, Palpiteiros e Gabarito ---

async function carregarParticipantes(){
    const { data, error } = await supabase.from("participantes").select("*");
    if(error) return console.error(error);
    renderLista("lista-participantes", data);
}

async function carregarPalpiteiros(){
    const { data, error } = await supabase.from("palpiteiros").select("*");
    if(error) return console.error(error);
    renderLista("lista-palpiteiros", data);
}

async function carregarGabaritos(){
    const { data, error } = await supabase.from("gabaritos").select("*");
    if(error) return console.error(error);
    renderLista("lista-gabaritos", data);
}

function renderLista(divId, lista){
    const div = document.getElementById(divId);
    if(!lista.length){ div.innerHTML = "<p>Nenhum registro.</p>"; return; }
    let html = "<ul>";
    lista.forEach(item=>{
        html += `<li>${item.nome || "Semana "+item.semana} 
            <button onclick="remover('${divId}','${item.id}')">Excluir</button></li>`;
    });
    html += "</ul>";
    div.innerHTML = html;
}

async function remover(divId, id){
    let tabela = divId.includes("participantes") ? "participantes" :
                 divId.includes("palpiteiros") ? "palpiteiros" : "gabaritos";
    const { error } = await supabase.from(tabela).delete().eq("id", id);
    if(error) return console.error(error);
    if(tabela === "participantes") carregarParticipantes();
    if(tabela === "palpiteiros") carregarPalpiteiros();
    if(tabela === "gabaritos") carregarGabaritos();
}

// Adicionar registros
document.getElementById("add-participante").addEventListener("click", async ()=>{
    const nome = prompt("Nome do participante:");
    if(!nome) return;
    await supabase.from("participantes").insert({nome});
    carregarParticipantes();
});

document.getElementById("add-palpiteiro").addEventListener("click", async ()=>{
    const nome = prompt("Nome do palpiteiro:");
    const data_nascimento = prompt("Data de nascimento (YYYY-MM-DD):");
    if(!nome || !data_nascimento) return;
    await supabase.from("palpiteiros").insert({nome, data_nascimento});
    carregarPalpiteiros();
});

document.getElementById("add-gabarito").addEventListener("click", async ()=>{
    const semana = parseInt(prompt("Semana:"));
    if(!semana) return;
    await supabase.from("gabaritos").upsert({semana});
    carregarGabaritos();
});
