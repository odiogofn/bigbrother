import { supabase } from './supabase.js';

const USUARIO_ADMIN = 'admin';
const SENHA_ADMIN = '12345';

// ==========================
// LOGIN
// ==========================
const loginContainer = document.getElementById('login-container');
const painelAdmin = document.getElementById('painel-admin');

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
    const abas = document.querySelectorAll('.aba-conteudo');
    abas.forEach(a => a.style.display = 'none');
    document.getElementById(id).style.display = 'block';
}

document.querySelectorAll('#abas button').forEach(btn => {
    btn.addEventListener('click', () => {
        mostrarAba(btn.dataset.aba);
    });
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
    if (error) return alert('Erro ao remover: ' + error.message);
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
                <button onclick="editarPalpiteiro('${p.id}')">Editar</button>
                <button onclick="removerPalpiteiro('${p.id}')">Remover</button>
            </td>
        `;
        tabelaPalpiteiros.appendChild(tr);
    });
}

window.editarPalpiteiro = async (id) => {
    const novoNome = prompt('Novo nome:');
    const novaDt = prompt('Nova data de nascimento:');
    if (!novoNome || !novaDt) return;
    const { error } = await supabase.from('palpiteiros').update({ nome: novoNome, dt_nascimento: novaDt }).eq('id', id);
    if (error) return alert(error.message);
    await carregarPalpiteiros();
};

window.removerPalpiteiro = async (id) => {
    if (!confirm('Confirma remover?')) return;
    const { error } = await supabase.from('palpiteiros').delete().eq('id', id);
    if (error) return alert(error.message);
    await carregarPalpiteiros();
};

// ==========================
// GABARITO
// ==========================
const tabelaGabarito = document.getElementById('tabela-gabarito');

async function carregarGabarito() {
    const { data, error } = await supabase.from('gabarito').select('*');
    if (error) return alert(error.message);

    tabelaGabarito.innerHTML = `
        <tr>
            <th>Semana</th><th>Lider</th><th>Anjo</th><th>Imune</th>
            <th>Emparedado</th><th>BateVolta</th><th>Eliminado</th><th>Capitão</th><th>Bonus</th><th>Ações</th>
        </tr>
    `;
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
            <td>
                <button onclick="editarGabarito('${g.id}')">Editar</button>
                <button onclick="removerGabarito('${g.id}')">Remover</button>
            </td>
        `;
        tabelaGabarito.appendChild(tr);
    });
}

// ==========================
// PONTUAÇÃO (AJUSTADA)
// ==========================
const tabelaPontuacao = document.getElementById('pontuacao-body');
document.getElementById('btn-salvar-pontuacao').addEventListener('click', async () => {
    const linhas = tabelaPontuacao.querySelectorAll('tr[data-id]');
    for (let tr of linhas) {
        const id = tr.dataset.id;
        const pontos = tr.querySelector('input').value;
        const { error } = await supabase.from('pontuacao').update({ pontos }).eq('id', id);
        if (error) alert('Erro ao salvar: ' + error.message);
    }
    alert('Pontuação salva!');
});

async function carregarPontuacao() {
    const { data, error } = await supabase.from('pontuacao').select('*');
    if (error) return alert(error.message);

    tabelaPontuacao.innerHTML = '<tr><th>Evento</th><th>Pontos</th></tr>';
    data.forEach(p => {
        const tr = document.createElement('tr');
        tr.dataset.id = p.id;
        tr.innerHTML = `<td>${p.evento}</td><td><input type="number" value="${p.pontos}" min="0"></td>`;
        tabelaPontuacao.appendChild(tr);
    });
}

// ==========================
// CONFIGURAÇÃO (AJUSTADA)
// ==========================
const statusEnvio = document.getElementById('status-envio');

document.getElementById('btn-alternar-envio').addEventListener('click', async () => {
    const permitido = statusEnvio.dataset.permitido === 'true' ? false : true;
    const { error } = await supabase.from('configuracao').upsert({ id: 1, permitir_envio: permitido });
    if (error) return alert('Erro ao atualizar status: ' + error.message);
    statusEnvio.dataset.permitido = permitido;
    statusEnvio.textContent = permitido ? 'Envio de Palpites: Liberado' : 'Envio de Palpites: Fechado';
});

async function carregarConfiguracao() {
    const { data, error } = await supabase.from('configuracao').select('*').eq('id', 1).single();
    if (error) return alert(error.message);
    if (data) {
        statusEnvio.dataset.permitido = data.permitir_envio;
        statusEnvio.textContent = data.permitir_envio ? 'Envio de Palpites: Liberado' : 'Envio de Palpites: Fechado';
    }
}

// ==========================
// PALPITES ENVIADOS
// ==========================
const tabelaPalpitesEnviados = document.getElementById('tabela-palpites-enviados');

async function carregarPalpitesEnviados() {
    const { data, error } = await supabase.from('palpites').select('*');
    if (error) return alert(error.message);

    tabelaPalpitesEnviados.innerHTML = `
        <tr>
            <th>Semana</th><th>Palpiteiro</th><th>Lider</th><th>Anjo</th><th>Imune</th>
            <th>Emparedado</th><th>BateVolta</th><th>Eliminado</th><th>Capitão</th><th>Bonus</th>
        </tr>
    `;
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
        tabelaPalpitesEnviados.appendChild(tr);
    });
}

// ==========================
// CARREGAR TODOS AO INICIAR
// ==========================
async function carregarTodosDados() {
    await carregarParticipantes();
    await carregarPalpiteiros();
    await carregarGabarito();
    await carregarPontuacao();
    await carregarConfiguracao();
    await carregarPalpitesEnviados();
}
