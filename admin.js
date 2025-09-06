// ==========================
// LOGIN ADMIN
// ==========================
document.getElementById("btn-login").addEventListener("click", async () => {
    const usuario = document.getElementById("usuario").value.trim();
    const senha = document.getElementById("senha").value.trim();

    if (!usuario || !senha) return alert("Informe usuário e senha");

    try {
        const { data, error } = await supabase
            .from('admin')
            .select('*')
            .eq('usuario', usuario)
            .eq('senha', senha);

        if (error) throw error;
        if (!data || data.length === 0) return alert("Usuário ou senha inválidos");

        // Login OK
        document.getElementById("login-container").style.display = "none";
        document.getElementById("painel-admin").style.display = "block";

        // Carrega todas as abas
        carregarParticipantes();
        carregarPalpiteiros();
        carregarGabarito();
        carregarPontuacao();
        carregarPalpitesEnviados();
        carregarEnvioPalpite();
    } catch (err) {
        console.error(err.message);
        alert("Erro ao fazer login");
    }
});

document.getElementById("btn-logout").addEventListener("click", () => {
    document.getElementById("login-container").style.display = "block";
    document.getElementById("painel-admin").style.display = "none";
});

// ==========================
// ABAS
// ==========================
function mostrarAba(id) {
    document.querySelectorAll('.aba-conteudo').forEach(div => div.style.display = 'none');
    document.getElementById(id).style.display = 'block';
}

// ==========================
// PARTICIPANTES
// ==========================
async function carregarParticipantes() {
    const tabela = document.getElementById("tabela-participantes");
    tabela.innerHTML = `<tr><th>ID</th><th>Nome</th><th>Ações</th></tr>`;
    try {
        const { data, error } = await supabase.from('participantes').select('*');
        if (error) throw error;

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
    } catch (err) { console.error(err.message); }
}

document.getElementById("btn-add-participante").addEventListener("click", async () => {
    const nome = document.getElementById("nome-participante").value.trim();
    if (!nome) return alert("Informe o nome");
    try {
        await supabase.from('participantes').insert({ nome });
        document.getElementById("nome-participante").value = "";
        carregarParticipantes();
    } catch (err) { console.error(err.message); }
});

async function alterarParticipante(id) {
    const nome = document.getElementById(`participante-${id}`).value.trim();
    try {
        await supabase.from('participantes').update({ nome }).eq('id', id);
        carregarParticipantes();
    } catch (err) { console.error(err.message); }
}

async function excluirParticipante(id) {
    try {
        await supabase.from('participantes').delete().eq('id', id);
        carregarParticipantes();
    } catch (err) {
        alert("Erro ao excluir. Verifique se o participante não está vinculado a palpites ou gabarito.");
        console.error(err.message);
    }
}

// ==========================
// PALPITEIROS
// ==========================
async function carregarPalpiteiros() {
    const tabela = document.getElementById("tabela-palpiteiros");
    tabela.innerHTML = `<tr><th>ID</th><th>Nome</th><th>Data Nascimento</th><th>Ações</th></tr>`;
    try {
        const { data, error } = await supabase.from('palpiteiros').select('*');
        if (error) throw error;

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
    } catch (err) { console.error(err.message); }
}

document.getElementById("btn-add-palpiteiro").addEventListener("click", async () => {
    const nome = document.getElementById("nome-palpiteiro").value.trim();
    const dt = document.getElementById("dt-nascimento-palpiteiro").value.trim();
    if (!nome || !dt) return alert("Informe os campos");
    try {
        await supabase.from('palpiteiros').insert({ nome, dt_nascimento: dt });
        document.getElementById("nome-palpiteiro").value = "";
        document.getElementById("dt-nascimento-palpiteiro").value = "";
        carregarPalpiteiros();
    } catch (err) { console.error(err.message); }
});

async function alterarPalpiteiro(id) {
    const nome = document.getElementById(`palpiteiro-${id}`).value.trim();
    const dt = document.getElementById(`dt-${id}`).value.trim();
    try {
        await supabase.from('palpiteiros').update({ nome, dt_nascimento: dt }).eq('id', id);
        carregarPalpiteiros();
    } catch (err) { console.error(err.message); }
}

async function excluirPalpiteiro(id) {
    try {
        await supabase.from('palpiteiros').delete().eq('id', id);
        carregarPalpiteiros();
    } catch (err) {
        alert("Erro ao excluir. Verifique se o palpiteiro já enviou palpites.");
        console.error(err.message);
    }
}

// ==========================
// GABARITO
// ==========================
async function carregarGabarito() {
    const tbody = document.getElementById("tabela-gabarito");
    tbody.innerHTML = "";
    const semanas = await supabase.from('gabarito').select('*').order('semana');
    const participantes = await supabase.from('participantes').select('*');

    semanas.data.forEach(sem => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${sem.semana}</td>` +
            ['lider','anjo','imune','emparedado','batevolta','eliminado','capitao','bonus']
            .map(evento => {
                const value = sem[evento] || '';
                const options = participantes.data.map(p => `<option value="${p.id}" ${p.id===value?'selected':''}>${p.nome}</option>`).join('');
                return `<td><select id="${evento}-${sem.id}"><option value="">-</option>${options}</select></td>`;
            }).join('') +
            `<td><button onclick="salvarGabarito(${sem.id})">Salvar</button></td>`;
        tbody.appendChild(tr);
    });
}

async function salvarGabarito(id) {
    const campos = ['lider','anjo','imune','emparedado','batevolta','eliminado','capitao','bonus'];
    const updateData = {};
    campos.forEach(c => updateData[c] = document.getElementById(`${c}-${id}`).value || null);

    try {
        await supabase.from('gabarito').update(updateData).eq('id', id);
        alert("Gabarito atualizado!");
        carregarGabarito();
    } catch(err) { console.error(err.message); }
}

// ==========================
// PONTUAÇÃO
// ==========================
async function carregarPontuacao() {
    const tbody = document.getElementById("pontuacao-body");
    tbody.innerHTML = "";
    const eventos = ['lider','anjo','imune','emparedado','batevolta','eliminado','capitao','bonus'];
    try {
        const { data } = await supabase.from('pontuacao').select('*');
        eventos.forEach(e => {
            const valor = data.find(p => p.evento===e)?.pontos || 0;
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${e}</td><td><input type="number" id="pontos-${e}" value="${valor}" min="0"></td>`;
            tbody.appendChild(tr);
        });
    } catch(err){ console.error(err.message); }
}

document.getElementById("salvar-pontuacao").addEventListener("click", async () => {
    const eventos = ['lider','anjo','imune','emparedado','batevolta','eliminado','capitao','bonus'];
    try {
        for (let e of eventos){
            const pontos = parseInt(document.getElementById(`pontos-${e}`).value) || 0;
            await supabase.from('pontuacao').upsert({evento: e, pontos}, {onConflict:'evento'});
        }
        alert("Pontuações salvas!");
    } catch(err){ console.error(err.message); }
});

// ==========================
// PALPITES ENVIADOS
// ==========================
async function carregarPalpitesEnviados() {
    const tbody = document.getElementById("tabela-palpites-enviados");
    tbody.innerHTML = "";
    try {
        const { data } = await supabase.from('palpites').select(`*, palpiteiro:palpiteiro_id(*)`);
        data.forEach(p => {
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${p.semana}</td>
                            <td>${p.palpiteiro.nome}</td>
                            <td>${p.lider || ''}</td>
                            <td>${p.anjo || ''}</td>
                            <td>${p.imune || ''}</td>
                            <td>${p.emparedado || ''}</td>
                            <td>${p.batevolta || ''}</td>
                            <td>${p.eliminado || ''}</td>
                            <td>${p.capitao || ''}</td>
                            <td>${p.bonus || ''}</td>`;
            tbody.appendChild(tr);
        });
    } catch(err){ console.error(err.message); }
}

// ==========================
// CONFIGURAÇÃO ENVIO DE PALPITES
// ==========================
async function carregarEnvioPalpite() {
    try {
        const { data } = await supabase.from('configuracao').select('*').limit(1).single();
        document.getElementById("permitir-envio").checked = data?.permitir_envio || false;
    } catch(err){ console.error(err.message); }
}

document.getElementById("btn-salvar-config").addEventListener("click", async () => {
    const permitir = document.getElementById("permitir-envio").checked;
    try {
        await supabase.from('configuracao').upsert({id:1, permitir_envio: permitir}, {onConflict:'id'});
        alert("Configuração salva!");
    } catch(err){ console.error(err.message); }
});
