import { supabase } from './supabase.js';

const USUARIO_ADMIN = 'admin';
const SENHA_ADMIN = '12345';
const categorias = ["Lider","Anjo","Imune","Emparedado","Batevolta","Eliminado","Capitao","Bonus"];

// LOGIN / LOGOUT
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

// ABAS
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
                <button onclick="editarPalpiteiro('${p.id}')">Editar</button>
                <button onclick="removerPalpiteiro('${p.id}')">Remover</button>
            </td>
        `;
        tabelaPalpiteiros.appendChild(tr);
    });
}

window.editarPalpiteiro = async (id) => {
    const novoNome = prompt('Novo nome:');
    const novaDt = prompt('Nova Data de Nascimento:');
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
// PONTUAÇÃO
// ==========================
const tabelaPontuacao = document.getElementById('pontuacao-body');

async function carregarPontuacao() {
    const { data, error } = await supabase.from('pontuacao').select('*');
    if (error) return alert(error.message);
    tabelaPontuacao.innerHTML = '';
    categorias.forEach(cat => {
        const p = data.find(d => d.evento === cat);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${cat}</td>
            <td><input type="number" value="${p ? p.pontos : 0}" data-evento="${cat}"></td>
        `;
        tabelaPontuacao.appendChild(tr);
    });
}

document.getElementById('btn-salvar-pontuacao').addEventListener('click', async () => {
    const inputs = tabelaPontuacao.querySelectorAll('input');
    for (let input of inputs) {
        const evento = input.dataset.evento;
        const pontos = Number(input.value);
        const { error } = await supabase.from('pontuacao').upsert({ evento, pontos }, { onConflict: 'evento' });
        if (error) alert('Erro ao salvar ' + evento + ': ' + error.message);
    }
    alert('Pontuação salva!');
});

// ==========================
// CONFIGURAÇÃO
// ==========================
const statusEnvio = document.getElementById('status-envio');

async function carregarConfiguracao() {
    const { data, error } = await supabase.from('configuracao').select('*').limit(1);
    if (error) return alert(error.message);
    const config = data[0];
    if (config) {
        statusEnvio.dataset.permitido = config.permitir_envio;
        statusEnvio.textContent = 'Envio de Palpites: ' + (config.permitir_envio ? 'Liberado' : 'Fechado');
    }
}

document.getElementById('btn-alternar-envio').addEventListener('click', async () => {
    const permitido = statusEnvio.dataset.permitido === 'true' ? false : true;
    const { error } = await supabase.from('configuracao').upsert({ id:1, permitir_envio: permitido }, { onConflict:'id' });
    if (error) return alert(error.message);
    statusEnvio.dataset.permitido = permitido;
    statusEnvio.textContent = 'Envio de Palpites: ' + (permitido ? 'Liberado' : 'Fechado');
});

// ==========================
// GABARITO
// ==========================
const tabelaGabarito = document.getElementById('tabela-gabarito');

async function carregarGabarito() {
    const { data: semanas, error } = await supabase.from('gabarito').select('*').order('semana');
    if (error) return alert(error.message);

    const { data: participantes, error: errPart } = await supabase.from('participantes').select('*');
    if (errPart) return alert(errPart.message);

    tabelaGabarito.innerHTML = '';
    const thead = document.createElement('thead');
    thead.innerHTML = `<tr>
        <th>Semana</th>
        ${categorias.map(c => `<th>${c}</th>`).join('')}
        <th>Ações</th>
    </tr>`;
    tabelaGabarito.appendChild(thead);

    const tbody = document.createElement('tbody');
    semanas.forEach(sem => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${sem.semana}</td>` +
            categorias.map(c => {
                const sel = `<select data-evento="${c}" data-semana="${sem.semana}">
                    ${participantes.map(p => `<option value="${p.id}" ${sem[c.toLowerCase()]===p.id?'selected':''}>${p.nome}</option>`).join('')}
                </select>`;
                return `<td>${sel}</td>`;
            }).join('') +
            `<td><button onclick="salvarGabarito(${sem.semana})">Salvar</button></td>`;
        tbody.appendChild(tr);
    });
    tabelaGabarito.appendChild(tbody);
}

window.salvarGabarito = async (semana) => {
    const selects = tabelaGabarito.querySelectorAll(`select[data-semana='${semana}']`);
    const obj = { semana };
    selects.forEach(s => {
        const evento = s.dataset.evento.toLowerCase();
        obj[evento] = s.value;
    });
    const { error } = await supabase.from('gabarito').upsert(obj, { onConflict: 'semana' });
    if (error) return alert(error.message);
    alert('Gabarito salvo!');
};

// ==========================
// PALPITES ENVIADOS
// ==========================
const tabelaPalpitesEnviados = document.getElementById('tabela-palpites-enviados');

async function carregarPalpitesEnviados() {
    const { data, error } = await supabase.from('palpites').select(`
        semana, palpiteiro_id, lider, anjo, imune, emparedado, batevolta, eliminado, capitao, bonus
    `);
    if (error) return alert(error.message);

    const { data: palpiteiros } = await supabase.from('palpiteiros').select('*');

    tabelaPalpitesEnviados.innerHTML = '';
    const thead = document.createElement('thead');
    thead.innerHTML = `<tr>
        <th>Semana</th><th>Palpiteiro</th>${categorias.map(c=>`<th>${c}</th>`).join('')}
    </tr>`;
    tabelaPalpitesEnviados.appendChild(thead);

    const tbody = document.createElement('tbody');
    data.forEach(p => {
        const pal = palpiteiros.find(pp => pp.id === p.palpiteiro_id);
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${p.semana}</td><td>${pal?pal.nome:'-'}</td>` +
            categorias.map(c => `<td>${p[c.toLowerCase()]||''}</td>`).join('');
        tbody.appendChild(tr);
    });
    tabelaPalpitesEnviados.appendChild(tbody);
}

// ==========================
// CARREGAR TODOS DADOS
// ==========================
async function carregarTodosDados() {
    await carregarParticipantes();
    await carregarPalpiteiros();
    await carregarPontuacao();
    await carregarConfiguracao();
    await carregarGabarito();
    await carregarPalpitesEnviados();
}
