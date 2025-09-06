import { supabase } from "./supabase.js";

const USUARIO = "admin";
const SENHA = "12345";

const loginDiv = document.getElementById("admin-login");
const painelDiv = document.getElementById("admin-container");

document.getElementById("login-admin").addEventListener("click", () => {
    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;
    if(usuario === USUARIO && senha === SENHA){
        loginDiv.style.display = "none";
        painelDiv.style.display = "block";
        carregarTudo();
    } else {
        alert("Usuário ou senha inválidos!");
    }
});

document.getElementById("logout").addEventListener("click", () => {
    painelDiv.style.display = "none";
    loginDiv.style.display = "block";
});

async function carregarTudo(){
    await carregarParticipantes();
    await carregarPalpiteiros();
    await carregarGabaritos();
}

// --- Participantes ---
async function carregarParticipantes(){
    const { data, error } = await supabase.from("participantes").select("*");
    if(error) return console.error(error);
    const div = document.getElementById("lista-participantes");
    div.innerHTML = data.length ? data.map(p=>`
        <div>${p.nome} 
        <button onclick="editar('participantes','${p.id}','${p.nome}')">Editar</button>
        <button onclick="remover('participantes','${p.id}')">Excluir</button>
        </div>`).join("") : "<p>Nenhum participante</p>";
}

// --- Palpiteiros ---
async function carregarPalpiteiros(){
    const { data, error } = await supabase.from("palpiteiros").select("*");
    if(error) return console.error(error);
    const div = document.getElementById("lista-palpiteiros");
    div.innerHTML = data.length ? data.map(p=>`
        <div>${p.nome} 
        <button onclick="editar('palpiteiros','${p.id}','${p.nome}','${p.senha}')">Editar</button>
        <button onclick="remover('palpiteiros','${p.id}')">Excluir</button>
        </div>`).join("") : "<p>Nenhum palpiteiro</p>";
}

// --- Gabaritos ---
async function carregarGabaritos(){
    const { data, error } = await supabase.from("gabaritos").select("*");
    if(error) return console.error(error);
    const div = document.getElementById("lista-gabaritos");
    div.innerHTML = data.length ? data.map(g=>`
        <div>Semana ${g.semana} 
        <button onclick="editar('gabaritos','${g.id}','${g.semana}')">Editar</button>
        <button onclick="remover('gabaritos','${g.id}')">Excluir</button>
        </div>`).join("") : "<p>Nenhum gabarito</p>";
}

// --- Funções gerais ---
window.remover = async (tabela,id)=>{
    const { error } = await supabase.from(tabela).delete().eq("id", id);
    if(error) return console.error(error);
    carregarTudo();
}

window.editar = async (tabela,id,nome,senha)=>{
    if(tabela==="participantes"){
        const novoNome = prompt("Novo nome:", nome);
        if(!novoNome) return;
        await supabase.from("participantes").update({nome:novoNome}).eq("id",id);
    } else if(tabela==="palpiteiros"){
        const novoNome = prompt("Nome:", nome);
        const novaSenha = prompt("Senha:", senha);
        if(!novoNome || !novaSenha) return;
        await supabase.from("palpiteiros").update({nome:novoNome,senha:novaSenha}).eq("id",id);
    } else if(tabela==="gabaritos"){
        const novaSemana = parseInt(prompt("Semana:", nome));
        if(!novaSemana) return;
        await supabase.from("gabaritos").update({semana:novaSemana}).eq("id",id);
    }
    carregarTudo();
}

// --- Adicionar ---
document.getElementById("add-participante").addEventListener("click", async ()=>{
    const nome = prompt("Nome do participante:");
    if(!nome) return;
    await supabase.from("participantes").insert({nome});
    carregarParticipantes();
});
document.getElementById("add-palpiteiro").addEventListener("click", async ()=>{
    const nome = prompt("Nome do palpiteiro:");
    const senha = prompt("Senha:");
    if(!nome || !senha) return;
    await supabase.from("palpiteiros").insert({nome,senha});
    carregarPalpiteiros();
});
document.getElementById("add-gabarito").addEventListener("click", async ()=>{
    const semana = parseInt(prompt("Semana:"));
    if(!semana) return;
    await supabase.from("gabaritos").insert({semana});
    carregarGabaritos();
});
