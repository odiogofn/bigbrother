// ==========================
// LOGIN ADMIN
// ==========================
document.getElementById("btn-login").addEventListener("click", async () => {
    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;

    try {
        const { data, error } = await supabase
            .from('admin')
            .select('*')
            .eq('usuario', usuario)
            .eq('senha', senha)
            .single();

        if (error || !data) {
            alert("Usuário ou senha inválidos");
            return;
        }

        document.getElementById("login-container").style.display = "none";
        document.getElementById("painel-admin").style.display = "block";

        carregarParticipantes();
        carregarPalpiteiros();
        carregarGabarito();
        carregarPontuacao();
        carregarPalpitesEnviados();
        carregarEnvioPalpite();

    } catch (err) {
        console.error(err.message);
    }
});

document.getElementById("btn-logout").addEventListener("click", () => {
    document.getElementById("login-container").style.display = "block";
    document.getElementById("painel-admin").style.display = "none";
});

// ==========================
// FUNÇÃO PARA MOSTRAR ABAS
// ==========================
function mostrarAba(id) {
    document.querySelectorAll('.aba-conteudo').forEach(div => div.style.display = 'none');
    document.getElementById(id).style.display = 'block';
}

// ==========================
// ABA PARTICIPANTES
// ==========================
async function carregarParticipantes() {
    try {
        const { data, error } = await supabase.from('participantes').select('*');
        if (error) throw error;

        const tabela = document.getElementById("tabela-participantes");
        tabela.innerHTML = `<tr><th>ID</th><th>Nome</th><th>Ações</th></tr>`;

        data.forEach(p => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${p.id}</td>
                <td><input type="text" value="${p.nome}" id="participante-${p.id}"></td>
                <td>
                    <button onclick="alterarParticipante(${p.id})">Alterar</button>
                    <button onclick="excluirParticipante(${p.id})">Excluir</button>
                </td>
            `;
            tabela.appendChild(tr);
        });
    } catch (err) {
        console.error(err.message);
    }
}

document.getElementById("btn-add-participante").addEventListener("click", async () => {
    const nome = document.getElementById("nome-participante").value;
    if (!nome) return alert("Informe o nome");
    try {
        await supabase.from('participantes').insert({ nome });
        document.getElementById("nome-participante").value = "";
        carregarParticipantes();
    } catch (err) {
        console.error(err.message);
    }
});

async function alterarParticipante(id) {
    const nome = document.getElementById(`participante-${id}`).value;
    try {
        await supabase.from('participantes').update({ nome }).eq('id', id);
        carregarParticipantes();
    } catch (err) {
        console.error(err.message);
    }
}

async function excluirParticipante(id) {
    try {
        await supabase.from('participantes').delete().eq('id', id);
        carregarParticipantes();
    } catch (err) {
        alert("Erro ao excluir. Verifique se o participante não está em palpites ou gabarito.");
        console.error(err.message);
    }
}

// ==========================
// ABA PALPITEIROS
// ==========================
async function carregarPalpiteiros() {
    try {
        const { data, error } = await supabase.from('palpiteiros').select('*');
        if (error) throw error;

        const tabela = document.getElementById("tabela-palpiteiros");
        tabela.innerHTML = `<tr><th>ID</th><th>Nome</th><th>Data de Nascimento</th><th>Ações</th></tr>`;

        data.forEach(p => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${p.id}</td>
                <td><input type="text" value="${p.nome}" id="palpiteiro-${p.id}"></td>
                <td><input type="password" value="${p.dt_nascimento}" id="dt-${p.id}"></td>
                <td>
                    <button onclick="alterarPalpiteiro(${p.id})">Alterar</button>
                    <button onclick="excluirPalpiteiro(${p.id})">Excluir</button>
                </td>
            `;
            tabela.appendChild(tr);
        });
    } catch (err) {
        console.error(err.message);
    }
}

document.getElementById("btn-add-palpiteiro").addEventListener("click", async () => {
    const nome = document.getElementById("nome-palpiteiro").value;
    const dt = document.getElementById("dt-nascimento-palpiteiro").value;
    if (!nome || !dt) return alert("Informe os campos");
    try {
        await supabase.from('palpiteiros').insert({ nome, dt_nascimento: dt });
        document.getElementById("nome-palpiteiro").value = "";
        document.getElementById("dt-nascimento-palpiteiro").value = "";
        carregarPalpiteiros();
    } catch (err) {
        console.error(err.message);
    }
});

async function alterarPalpiteiro(id) {
    const nome = document.getElementById(`palpiteiro-${id}`).value;
    const dt = document.getElementById(`dt-${id}`).value;
    try {
        await supabase.from('palpiteiros').update({ nome, dt_nascimento: dt }).eq('id', id);
        carregarPalpiteiros();
    } catch (err) {
        console.error(err.message);
    }
}

async function excluirPalpiteiro(id) {
    try {
        await supabase.from('palpiteiros').delete().eq('id', id);
        carregarPalpiteiros();
    } catch (err) {
        alert("Erro ao excluir. Verifique se o palpiteiro não enviou palpites.");
        console.error(err.message);
    }
}

// ==========================
// ABA GABARITO
// ==========================
const eventos = ['lider', 'anjo', 'imune', 'emparedado', 'batevolta', 'eliminado', 'capitao', 'bonus'];

async function carregarGabarito() {
    try {
        const { data, error } = await supabase.from('gabarito').select('*');
        if (error) throw error;

        const tabela = document.getElementById("tabela-gabarito");
        tabela.innerHTML = `<tr><th>Semana</th>${eventos.map(e => `<th>${e}</th>`).join('')}</tr>`;

        data.forEach(g => {
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${g.semana}</td>` +
                eventos.map(e => `<td>${g[e]}</td>`).join('');
            tabela.appendChild(tr);
        });

        // Preencher dropdowns de participantes
        const { data: participantes } = await supabase.from('participantes').select('*');
        eventos.forEach(e => {
            const sel = document.getElementById(`${e}-gabarito`);
            sel.innerHTML = participantes.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
        });

    } catch (err) {
        console.error(err.message);
    }
}

document.getElementById("btn-add-gabarito").addEventListener("click", async () => {
    const semana = parseInt(document.getElementById("semana-gabarito").value);
    if (!semana) return alert("Informe a semana");

    const gabaritoObj = { semana };
    eventos.forEach(e => {
        gabaritoObj[e] = parseInt(document.getElementById(`${e}-gabarito`).value);
    });

    try {
        await supabase.from('gabarito').upsert(gabaritoObj, { onConflict: 'semana' });
        carregarGabarito();
    } catch (err) {
        console.error(err.message);
    }
});

// ==========================
// ABA PONTUAÇÃO
// ==========================
async function carregarPontuacao() {
    try {
        const { data, error } = await supabase.from('pontuacao').select('*');
        if (error) throw error;

        const tbody = document.getElementById("pontuacao-body");
        tbody.innerHTML = "";

        eventos.forEach(evento => {
            const pont = data.find(p => p.evento === evento);
            const valor = pont ? pont.pontos : 0;

            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${evento}</td>
                            <td><input type="number" id="pontos-${evento}" value="${valor}" min="0"></td>`;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err.message);
    }
}

document.getElementById("salvar-pontuacao").addEventListener("click", async () => {
    try {
        for (let evento of eventos) {
            const valor = parseInt(document.getElementById(`pontos-${evento}`).value) || 0;
            await supabase.from('pontuacao').upsert({ evento, pontos: valor }, { onConflict: 'evento' });
        }
        alert("Pontuações salvas com sucesso!");
    } catch (err) {
        console.error(err.message);
    }
});

// ==========================
