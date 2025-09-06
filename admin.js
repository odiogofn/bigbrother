// admin.js
import { supabase } from './supabase.js';

// ==========================
// LOGIN
// ==========================
const loginContainer = document.getElementById('login-container');
const painelAdmin = document.getElementById('painel-admin');
const btnLogin = document.getElementById('btn-login');
const btnLogout = document.getElementById('btn-logout');

btnLogin.addEventListener('click', async () => {
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;

    if(usuario === 'admin' && senha === '12345') {
        loginContainer.style.display = 'none';
        painelAdmin.style.display = 'block';
        carregarParticipantes();
        carregarPalpiteiros();
        carregarGabarito();
        carregarPontuacao();
        carregarPalpitesEnviados();
        carregarConfiguracao();
    } else {
        alert('Usuário ou senha inválidos');
    }
});

btnLogout.addEventListener('click', () => {
    painelAdmin.style.display = 'none';
    loginContainer.style.display = 'block';
});

// ==========================
// ABAS
// ==========================
function mostrarAba(id) {
    const abas = document.querySelectorAll('.aba-conteudo');
    abas.forEach(a => a.style.display = 'none');
    document.getElementById(id).style.display = 'block';
}

// ==========================
// PARTICIPANTES
// ==========================
const btnAddParticipante = document.getElementById('btn-add-participante');
btnAddParticipante.addEventListener('click', async () => {
    const nome = document.getElementById('nome-participante').value;
    if(!nome) return alert('Preencha o nome');
    const { error } = await supabase.from('participantes').insert([{ nome }]);
    if(error) return alert('Erro ao adicionar participante: ' + error.message);
    document.getElementById('nome-participante').value = '';
    carregarParticipantes();
});

async function carregarParticipantes() {
    const { data, error } = await supabase.from('participantes').select('*');
    if(error) return alert(error.message);
    const tabela = document.getElementById('tabela-participantes');
    tabela.innerHTML = `<tr><th>ID</th><th>Nome</th><th>Ações</th></tr>`;
    data.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${p.id}</td>
            <td>${p.nome}</td>
            <td>
                <button onclick="editarParticipante(${p.id}, '${p.nome}')">Editar</button>
                <button onclick="removerParticipante(${p.id})">Excluir</button>
            </td>
        `;
        tabela.appendChild(tr);
    });
}

window.editarParticipante = async (id, nomeAtual) => {
    const novoNome = prompt('Novo nome:', nomeAtual);
    if(!novoNome) return;
    const { error } = await supabase.from('participantes').update({ nome: novoNome }).eq('id', id);
    if(error) return alert(error.message);
    carregarParticipantes();
};

window.removerParticipante = async (id) => {
    if(!confirm('Confirma exclusão?')) return;
    const { error } = await supabase.from('participantes').delete().eq('id', id);
    if(error) return alert(error.message);
    carregarParticipantes();
};

// ==========================
// PALPITEIROS
// ==========================
const btnAddPalpiteiro = document.getElementById('btn-add-palpiteiro');
btnAddPalpiteiro.addEventListener('click', async () => {
    const nome = document.getElementById('nome-palpiteiro').value;
    const dt = document.getElementById('dt-nascimento-palpiteiro').value;
    if(!nome || !dt) return alert('Preencha todos os campos');
    const { error } = await supabase.from('palpiteiros').insert([{ nome, dt_nascimento: dt }]);
    if(error) return alert(error.message);
    document.getElementById('nome-palpiteiro').value = '';
    document.getElementById('dt-nascimento-palpiteiro').value = '';
    carregarPalpiteiros();
});

async function carregarPalpiteiros() {
    const { data, error } = await supabase.from('palpiteiros').select('*');
    if(error) return alert(error.message);
    const tabela = document.getElementById('tabela-palpiteiros');
    tabela.innerHTML = `<tr><th>ID</th><th>Nome</th><th>Data Nascimento</th><th>Ações</th></tr>`;
    data.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${p.id}</td>
            <td>${p.nome}</td>
            <td>${p.dt_nascimento}</td>
            <td>
                <button onclick="editarPalpiteiro(${p.id}, '${p.nome}', '${p.dt_nascimento}')">Editar</button>
                <button onclick="removerPalpiteiro(${p.id})">Excluir</button>
            </td>
        `;
        tabela.appendChild(tr);
    });
}

window.editarPalpiteiro = async (id, nomeAtual, dtAtual) => {
    const novoNome = prompt('Novo nome:', nomeAtual);
    const novaData = prompt('Nova data nascimento:', dtAtual);
    if(!novoNome || !novaData) return;
    const { error } = await supabase.from('palpiteiros').update({ nome: novoNome, dt_nascimento: novaData }).eq('id', id);
    if(error) return alert(error.message);
    carregarPalpiteiros();
};

window.removerPalpiteiro = async (id) => {
    if(!confirm('Confirma exclusão?')) return;
    const { error } = await supabase.from('palpiteiros').delete().eq('id', id);
    if(error) return alert(error.message);
    carregarPalpiteiros();
};

// ==========================
// GABARITO
// ==========================
async function carregarGabarito() {
    const { data, error } = await supabase.from('gabarito').select('*');
    if(error) return alert(error.message);
    const tabela = document.getElementById('tabela-gabarito');
    tabela.innerHTML = `<tr>
        <th>Semana</th><th>Lider</th><th>Anjo</th><th>Imune</th><th>Emparedado</th>
        <th>BateVolta</th><th>Eliminado</th><th>Capitão</th><th>Bonus</th><th>Ações</th>
    </tr>`;
    data.forEach(g => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${g.semana}</td>
            <td>${g.lider}</td>
            <td>${g.anjo}</td>
            <td>${g.imune}</td>
            <td>${g.emparedado}</td>
            <td>${g.batevolta}</td>
            <td>${g.eliminado}</td>
            <td>${g.capitao}</td>
            <td>${g.bonus}</td>
            <td><button onclick="editarGabarito(${g.id})">Editar</button></td>
        `;
        tabela.appendChild(tr);
    });
}

window.editarGabarito = async (id) => {
    const campos = ['lider','anjo','imune','emparedado','batevolta','eliminado','capitao','bonus'];
    const updateData = {};
    for(const c of campos){
        const val = prompt(`Novo valor ${c}:`);
        if(val) updateData[c] = val;
    }
    const { error } = await supabase.from('gabarito').update(updateData).eq('id', id);
    if(error) return alert(error.message);
    carregarGabarito();
};

// ==========================
// PONTUAÇÃO
// ==========================
async function carregarPontuacao() {
    const { data, error } = await supabase.from('pontuacao').select('*');
    if(error) return alert(error.message);
    const tabela = document.getElementById('pontuacao-body');
    tabela.innerHTML = `<tr><th>Evento</th><th>Pontos</th></tr>`;
    data.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<tr>
            <td>${p.evento}</td>
            <td><input type="number" value="${p.pontos}" data-id="${p.id}"></td>
        </tr>`;
        tabela.appendChild(tr);
    });
}

document.getElementById('salvar-pontuacao').addEventListener('click', async () => {
    const inputs = document.querySelectorAll('#pontuacao-body input');
    for(const inp of inputs){
        const id = inp.dataset.id;
        const pontos = parseInt(inp.value);
        const { error } = await supabase.from('pontuacao').update({ pontos }).eq('id', id);
        if(error) return alert(error.message);
    }
    alert('Pontuação salva!');
});

// ==========================
// PALPITES ENVIADOS
// ==========================
async function carregarPalpitesEnviados() {
    const { data, error } = await supabase.from('palpites').select('*');
    if(error) return alert(error.message);
    const tabela = document.getElementById('tabela-palpites-enviados');
    tabela.innerHTML = `<tr>
        <th>Semana</th><th>Palpiteiro</th><th>Lider</th><th>Anjo</th><th>Imune</th><th>Emparedado</th>
        <th>BateVolta</th><th>Eliminado</th><th>Capitão</th><th>Bonus</th>
    </tr>`;
    data.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${p.semana}</td>
            <td>${p.palpiteiro_id}</td>
            <td>${p.lider}</td>
            <td>${p.anjo}</td>
            <td>${p.imune}</td>
            <td>${p.emparedado}</td>
            <td>${p.batevolta}</td>
            <td>${p.eliminado}</td>
            <td>${p.capitao}</td>
            <td>${p.bonus}</td>
        `;
        tabela.appendChild(tr);
    });
}

// ==========================
// CONFIGURAÇÃO ENVIO DE PALPITES
// ==========================
async function carregarConfiguracao() {
    const { data, error } = await supabase.from('configuracao').select('*').limit(1);
    if(error) return alert(error.message);
    const config = data[0];
    document.getElementById('permitir-envio').checked = config?.permitir_envio || false;
}

document.getElementById('btn-salvar-config').addEventListener('click', async () => {
    const valor = document.getElementById('permitir-envio').checked;
    const { error } = await supabase.from('configuracao').upsert([{ permitir_envio: valor }]);
    if(error) return alert('Erro ao salvar configuração: ' + error.message);
    alert('Configuração salva!');
});
