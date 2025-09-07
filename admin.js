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

document.getElementById("form-palpiteiro").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("palpiteiro-nome").value;
  const senha = document.getElementById("palpiteiro-senha").value;

  const { error } = await supabase.from("palpiteiros").insert([{ nome, senha }]);

  if (error) {
    alert("Erro ao salvar palpiteiro: " + error.message);
  } else {
    alert("Palpiteiro salvo com sucesso!");
    carregarPalpiteiros();
    e.target.reset();
  }
});

async function carregarPalpiteiros() {
  const { data, error } = await supabase.from("palpiteiros").select("*");

  if (error) {
    console.error("Erro ao carregar palpiteiros:", error);
    return;
  }

  const tbody = document.getElementById("lista-palpiteiros");
  tbody.innerHTML = "";

  data.forEach((p) => {
    const row = `<tr>
      <td>${p.nome}</td>
      <td>${p.senha}</td>
    </tr>`;
    tbody.innerHTML += row;
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

        // Checa se já existe
        const { data: existente } = await supabase.from('pontuacao').select('*').eq('evento', evento).single();
        if (existente) {
            const { error } = await supabase.from('pontuacao').update({ pontos }).eq('evento', evento);
            if (error) alert('Erro ao salvar ' + evento + ': ' + error.message);
        } else {
            const { error } = await supabase.from('pontuacao').insert({ evento, pontos });
            if (error) alert('Erro ao salvar ' + evento + ': ' + error.message);
        }
    }
    alert('Pontuação salva!');
});

// ==========================
// CONFIGURAÇÃO
// ==========================
const statusEnvio = document.getElementById('status-envio');

// 🔹 Carregar status atual da configuração
async function carregarConfiguracao() {
    const { data, error } = await supabase
        .from('configuracao')
        .select('id, permitir_envio')
        .eq('id', 1)
        .single();

    if (error) {
        console.error("Erro ao buscar configuração:", error.message);
        statusEnvio.dataset.permitido = false;
        statusEnvio.textContent = 'Envio de Palpites: Fechado';
        return;
    }

    statusEnvio.dataset.permitido = data.permitir_envio;
    statusEnvio.textContent =
        'Envio de Palpites: ' + (data.permitir_envio ? 'Liberado' : 'Fechado');
}

// 🔹 Botão alternar status
document.getElementById('btn-alternar-envio').addEventListener('click', async () => {
    const permitido = statusEnvio.dataset.permitido === 'true' ? false : true;

    const { error } = await supabase
        .from('configuracao')
        .upsert(
            [{ id: 1, permitir_envio: permitido }],
            { onConflict: ["id"] }
        );

    if (error) {
        alert("Erro ao salvar configuração: " + error.message);
        return;
    }

    statusEnvio.dataset.permitido = permitido;
    statusEnvio.textContent =
        'Envio de Palpites: ' + (permitido ? 'Liberado' : 'Fechado');
});

// ==========================
// GABARITO
// ==========================

const tabelaGabarito = document.getElementById('tabela-gabarito');

async function carregarGabarito() {
    // Busca semanas já cadastradas
    const { data: semanas, error } = await supabase.from('gabarito').select('*').order('semana');
    if (error) return alert(error.message);

    // Busca participantes
    const { data: participantes, error: errPart } = await supabase.from('participantes').select('*');
    if (errPart) return alert(errPart.message);

    // Se não houver semana, cria a semana 1
    if (semanas.length === 0) {
        await supabase.from('gabarito').insert([{ semana: 1 }]);
        return carregarGabarito();
    }

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
                    <option value="">--Selecione--</option>
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
    alert('Gabarito da semana ' + semana + ' salvo!');
};

// ==========================
// PALPITES ENVIADOS
// ==========================
const tabelaPalpitesEnviados = document.getElementById('tabela-palpites-enviados');

async function carregarPalpitesEnviados() {
    // Pega todos os palpites
    const { data: palpites, error } = await supabase.from('palpites').select(`
        semana, palpiteiro_id, lider, anjo, imune, emparedado, batevolta, eliminado, capitao, bonus
    `);
    if (error) return alert(error.message);

    // Pega todos os palpiteiros
    const { data: palpiteiros } = await supabase.from('palpiteiros').select('*');
    if (!palpiteiros) return alert("Erro ao carregar palpiteiros");

    // Pega todos os participantes (para substituir os IDs pelo nome)
    const { data: participantes } = await supabase.from('participantes').select('*');
    if (!participantes) return alert("Erro ao carregar participantes");

    tabelaPalpitesEnviados.innerHTML = '';

    const thead = document.createElement('thead');
    thead.innerHTML = `<tr>
        <th>Semana</th><th>Palpiteiro</th>${categorias.map(c => `<th>${c}</th>`).join('')}
    </tr>`;
    tabelaPalpitesEnviados.appendChild(thead);

    const tbody = document.createElement('tbody');
    palpites.forEach(p => {
        const pal = palpiteiros.find(pp => pp.id === p.palpiteiro_id);
        const tr = document.createElement('tr');

        // Para cada categoria, substitui o ID pelo nome do participante
        const colunas = categorias.map(c => {
            const participanteId = p[c.toLowerCase()];
            const participante = participantes.find(part => part.id === participanteId);
            return `<td>${participante ? participante.nome : ''}</td>`;
        }).join('');

        tr.innerHTML = `<td>${p.semana}</td><td>${pal ? pal.nome : '-'}</td>${colunas}`;
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