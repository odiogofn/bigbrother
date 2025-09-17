// Supondo que `supabase` já esteja importado do supabase.js
let palpiteiroId = null;
const CAMPOS = ['lider','anjo','imune','emparedado','batevolta','eliminado','capitao','bonus'];

// ELEMENTOS
const loginArea = document.getElementById('login-area');
const panel = document.getElementById('palpiteiro-panel');
const loginBtn = document.getElementById('palpiteiro-login-btn');
const logoutBtn = document.getElementById('palpiteiro-logout-btn');
const palpiteSemana = document.getElementById('palpite-semana');
const palpiteSendBtn = document.getElementById('palpite-send-btn');
const palpiteList = document.getElementById('palpite-list');

// LOGIN
loginBtn.addEventListener('click', async () => {
  const nome = document.getElementById('palpiteiro-nome-login').value;
  const senha = document.getElementById('palpiteiro-senha-login').value;

  const { data, error } = await supabase
    .from('palpiteiros')
    .select('*')
    .eq('nome', nome)
    .eq('senha', senha)
    .limit(1)
    .single();

  if (error || !data) {
    alert('Usuário ou senha incorretos');
    return;
  }

  palpiteiroId = data.id;
  loginArea.style.display = 'none';
  panel.style.display = 'block';

  verificarLiberacaoPalpite();
  carregarParticipantes();
  carregarHistorico();
});

// LOGOUT
logoutBtn.addEventListener('click', () => {
  palpiteiroId = null;
  panel.style.display = 'none';
  loginArea.style.display = 'block';
});

// VERIFICAR se palpite está liberado
async function verificarLiberacaoPalpite() {
  const { data, error } = await supabase
    .from('configuracao')
    .select('permitir_envio')
    .eq('id', 1)
    .single();

  let statusText = document.createElement('p');
  statusText.id = 'palpite-status';
  statusText.style.fontWeight = 'bold';
  if (data && data.permitir_envio) {
    statusText.textContent = 'Hora do Palpite: Aberto';
    palpiteSendBtn.disabled = false;
  } else {
    statusText.textContent = 'Hora do Palpite: Fechado';
    palpiteSendBtn.disabled = true;
  }

  const envioSection = document.getElementById('palpite-envio');
  envioSection.prepend(statusText);
}

// CARREGAR participantes nos selects
async function carregarParticipantes() {
  const { data: participantes } = await supabase
    .from('participantes')
    .select('id,nome');

  if (!participantes) return;

  CAMPOS.forEach(campo => {
    const select = document.getElementById(`palpite-${campo}`);
    select.innerHTML = '';
    participantes.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.nome;
      select.appendChild(opt);
    });
  });
}

// ENVIAR PALPITE
palpiteSendBtn.addEventListener('click', async () => {
  const semana = parseInt(palpiteSemana.value);
  if (!semana) return alert('Informe a semana');

  let dados = { palpiteiro_id: palpiteiroId, semana, criado_em: new Date().toISOString() };
  CAMPOS.forEach(campo => {
    const select = document.getElementById(`palpite-${campo}`);
    dados[campo] = select.value;
  });

  const { error } = await supabase.from('palpites').insert(dados);

  if (error) alert('Erro ao enviar palpite: ' + error.message);
  else {
    alert('Palpite enviado com sucesso!');
    carregarHistorico();
  }
});

// CARREGAR histórico de palpites
async function carregarHistorico() {
  if (!palpiteiroId) return;

  const { data: palpites } = await supabase
    .from('palpites')
    .select('*')
    .eq('palpiteiro_id', palpiteiroId)
    .order('semana', { ascending: true });

  palpiteList.innerHTML = '';
  if (palpites && palpites.length > 0) {
    palpites.forEach(p => {
      const li = document.createElement('li');
      li.textContent = `Semana ${p.semana}: ${CAMPOS.map(c => `${c.toUpperCase()}: ${p[c]}`).join(' | ')}`;
      palpiteList.appendChild(li);
    });
  } else {
    palpiteList.innerHTML = '<li>Nenhum palpite feito ainda.</li>';
  }
}
