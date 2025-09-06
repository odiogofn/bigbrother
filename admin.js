import { supabase } from "./supabase.js";

const ADMIN_USER = "admin";
const ADMIN_PASS = "12345";

// LOGIN
document.getElementById("login-btn").addEventListener("click", ()=>{
    const usuario = document.getElementById("admin-usuario").value;
    const senha = document.getElementById("admin-senha").value;
    if(usuario===ADMIN_USER && senha===ADMIN_PASS){
        document.getElementById("login-admin").style.display="none";
        document.getElementById("painel-admin").style.display="block";
        carregarTudo();
    } else alert("Usuário ou senha incorretos");
});

// LOGOUT
document.getElementById("logout").addEventListener("click", ()=>{
    document.getElementById("painel-admin").style.display="none";
    document.getElementById("login-admin").style.display="block";
});

// CARREGAR TODOS OS DADOS
async function carregarTudo(){
    await carregarParticipantes();
    await carregarPalpiteiros();
    await carregarParticipantesGabarito();
    await carregarGabaritos();
}

// ============================
// PARTICIPANTES
// ============================
document.getElementById("add-participante").addEventListener("click", async ()=>{
    const nome = document.getElementById("nome-participante").value.trim();
    if(!nome) return alert("Informe o nome");
    await supabase.from("participantes").insert([{nome}]);
    document.getElementById("nome-participante").value="";
    carregarParticipantes();
});

async function carregarParticipantes(){
    const { data, error } = await supabase.from("participantes").select("*");
    if(error) return console.error(error);

    const div = document.getElementById("lista-participantes");
    div.innerHTML="";
    data.forEach(p=>{
        const item = document.createElement("div");
        item.textContent = p.nome;
        const btnDel = document.createElement("button");
        btnDel.textContent="Excluir";
        btnDel.onclick=()=>remover("participantes",p.id);
        item.appendChild(btnDel);
        div.appendChild(item);
    });
}

// ============================
// PALPITEIROS
// ============================
document.getElementById("add-palpiteiro").addEventListener("click", async ()=>{
    const nome = document.getElementById("nome-palpiteiro").value.trim();
    const senha = document.getElementById("senha-palpiteiro").value.trim();
    if(!nome || !senha) return alert("Informe nome e senha");
    await supabase.from("palpiteiros").insert([{nome,senha}]);
    document.getElementById("nome-palpiteiro").value="";
    document.getElementById("senha-palpiteiro").value="";
    carregarPalpiteiros();
});

async function carregarPalpiteiros(){
    const { data, error } = await supabase.from("palpiteiros").select("*");
    if(error) return console.error(error);

    const div = document.getElementById("lista-palpiteiros");
    div.innerHTML="";
    data.forEach(p=>{
        const item = document.createElement("div");
        item.textContent = p.nome;
        const btnDel = document.createElement("button");
        btnDel.textContent="Excluir";
        btnDel.onclick=()=>remover("palpiteiros",p.id);
        item.appendChild(btnDel);
        div.appendChild(item);
    });
}

// ============================
// REMOVER
// ============================
window.remover = async (tabela,id)=>{
    const { error } = await supabase.from(tabela).delete().eq("id",id);
    if(error){ console.error(error); alert("Erro ao remover: "+error.message); return; }
    carregarTudo();
}

// ============================
// GABARITOS
// ============================
async function carregarParticipantesGabarito(){
    const { data, error } = await supabase.from("participantes").select("*");
    if(error) return console.error(error);

    const campos = ["lider-g","anjo-g","imune-g","emparedado-g","batevolta-g","eliminado-g","capitao-g","bonus-g"];
    campos.forEach(campo=>{
        const sel = document.getElementById(campo);
        sel.innerHTML="<option value=''>--Selecione--</option>";
        data.forEach(p=>{
            const opt=document.createElement("option");
            opt.value=p.id;
            opt.textContent=p.nome;
            sel.appendChild(opt);
        });
    });
}

document.getElementById("salvar-gabarito").addEventListener("click", async ()=>{
    const semana = parseInt(document.getElementById("semana-gabarito").value);
    if(!semana) return alert("Informe a semana");

    const gabarito = {
        semana,
        lider: document.getElementById("lider-g").value,
        anjo: document.getElementById("anjo-g").value,
        imune: document.getElementById("imune-g").value,
        emparedado: document.getElementById("emparedado-g").value,
        batevolta: document.getElementById("batevolta-g").value,
        eliminado: document.getElementById("eliminado-g").value,
        capitao: document.getElementById("capitao-g").value,
        bonus: document.getElementById("bonus-g").value
    };

    const { data: existe } = await supabase.from("gabaritos").select("*").eq("semana",semana).single();
    if(existe){
        await supabase.from("gabaritos").update(gabarito).eq("id",existe.id);
        alert("Gabarito atualizado!");
    } else {
        await supabase.from("gabaritos").insert([gabarito]);
        alert("Gabarito salvo!");
    }

    carregarGabaritos();
});

async function carregarGabaritos(){
    const { data, error } = await supabase.from("gabaritos").select("*").order("semana",{ascending:true});
    if(error) return console.error(error);

    const div = document.getElementById("lista-gabaritos");
    if(!data.length){ div.innerHTML="<p>Nenhum gabarito cadastrado</p>"; return; }

    div.innerHTML="";
    data.forEach(g=>{
        const item=document.createElement("div");
        item.textContent=`Semana ${g.semana}`;
        const btnDel=document.createElement("button");
        btnDel.textContent="Excluir";
        btnDel.onclick=()=>remover("gabaritos",g.id);
        item.appendChild(btnDel);
        div.appendChild(item);
    });
}
