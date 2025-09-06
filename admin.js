import { supabase } from './supabase.js';

const USUARIO_ADMIN = 'admin';
const SENHA_ADMIN = '12345';

const loginContainer = document.getElementById('login-container');
const painelAdmin = document.getElementById('painel-admin');

// ==========================
// LOGIN / LOGOUT
// ==========================
document.getElementById('btn-login').addEventListener('click', async () => {
    const usuario = document.getElementById('usuario').value.trim();
    const senha = document.getElementById('senha').value.trim();
    if (usuario === USUARIO_ADMIN && senha === SENHA_ADMIN) {
        loginContainer.style.display = 'none';
        painelAdmin.style.display = 'block';
        await carregarTodosDados();
    } else {
        alert('Usuário ou senha incorretos');
    }
});

document.getElementById('btn-logout').addEventListener('click', () => {
    painelAdmin.style.display = 'none';
    loginContainer.style.display = 'block';
});

// ==========================
// ABAS
// ==========================
function mostrarAba(id) {
    document.querySelectorAll('.aba-conteudo').forEach(a => a.style.display = 'none');
    document.getElementById(id).style.display = 'block';
}

document.querySelectorAll('#abas button').forEach(btn => {
    btn.addEventListener('click', () => mostrarAba(btn.dataset.aba));
});

// ==========================
// PARTICIPANTES
// ==========================
const tabelaParticipantes = document.getElementById('tabela-participantes');

document.getElementById('btn-add-participante').addEventListener('click', async () => {
    const nome = document.getElementById('nome-participante').value.trim();
    if (!nome) return alert('Informe o nome');
    const { error } = await supabase.from('participantes').insert([{ nome }]);
    if (error) return alert(error.message);
    document.getElementById('nome-participante').value = '';
    await carregarParticipantes();
});

async function carregarParticipantes() {
    const { data, error } = await supabase.from('participantes').select('*');
    if (error) return alert(error.message);

    tabelaParticipantes.innerHTML = '<tr><th>ID</th><th>Nome</th><th>Ações</th></tr>';
    data.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${p.id}</td>
            <td>${p.nome}</td>
            <td>
                <button onclick="editarParticipante('${p.id}')">Editar</button>
                <button onclick="removerParticipante('${p.id}')">Remover</button>
            </td>
        `;
        tabelaParticipantes.appendChild(tr);
    });
}

window.editarParticipante = async (id) => {
    const novoNome = prompt('Novo nome:');
    if (!novoNome) return;
    const { error } = await supabase.from('participantes').update({ nome: novoNome }).eq('id', id);
    if (error) return alert(error.message);
    await carregarParticipantes();
};

window.removerParticipante = async (id) => {
    if (!confirm('Confirma remover?')) return;
    const { error } = await supabase.from('participantes').delete().eq('id', id);
    if (error) return alert(error.message);
    await carregarParticipantes();
};

// ==========================
// PALPITEIROS
// ==========================
const tabelaPalpiteiros = document.getElementById('tabela-palpiteiros');

document.getElementById('btn-add-palpiteiro').addEventListener('click', async () => {
    const nome = document.getElementById('nome-palpiteiro').value.trim();
    const dt = document.getElementById('dt-nascimento-palpiteiro').value.trim();
    if (!nome || !dt) return alert('Preencha todos os campos');
    const { error } = await supabase.from('palpiteiros').insert([{ nome, dt_nascimento: dt }]);
    if (error) return alert(error.message);
    document.getElementById('nome-palpiteiro').value = '';
    document.getElementById('dt-nascimento-palpiteiro').value = '';
    await carregarPalpiteiros();
});

async function carregarPalpiteiros() {
    const { data, error } = await supabase.from('palpiteiros').select('*');
    if (error) return alert(error.message);

    tabelaPalpiteiros.innerHTML = '<tr><th>ID</th><th>Nome</th><th>Data Nascimento</th><th>Ações</th></tr>';
    data.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${p.id}</td>
            <td>${p.nome}</td>
            <td>${p.dt_nascimento}</td>
            <td>
                <button onclick="editarPalpiteiro('${p.id}')">
