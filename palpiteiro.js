import { supabase } from './supabase.js';

const EVENTOS = ['lider','anjo','imune','emparedado','batevolta','eliminado','capitao','bonus'];

// ELEMENTOS
const loginArea = document.getElementById('login-area');
const panel = document.getElementById('palpiteiro-panel');
const loginBtn = document.getElementById('palpiteiro-login-btn');
const logoutBtn = document.getElementById('palpiteiro-logout-btn');
const palpiteSemana = document.getElementById('palpite-semana');
const palpiteSendBtn = document.getElementById('palpite-send-btn');
const palpiteList = document.getElementById('palpite-list');

let palpiteiroId = null;

// ======================= LOGIN =======================
loginBtn.addEventListener('click', async () => {
  const nome = document.getElementById('palpiteiro-nome-login').value;
  const senha = document.getElementById('palpiteiro-senha-login').value;

  if (!nome || !senha) return alert('Informe nome e senha');

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

  await verificarLiberacaoPalpite();
  await carregarParticipantes();
  await carregarHistorico();
});

// ======================= LOGOUT =======================
logoutBtn.addEventListener('click', () => {
  palpiteiroId = null;
  panel.style.display = 'none';
  loginArea.style.display = 'block';
  palpiteSemana.value = '';
  palpiteList.innerHTML = '';
});

// ======================= VERIFICAR HORA DO PALPITE =======================
async function verificarLiberacaoPalpite() {
  const { data, error } = await supabase
    .from('configuracao')
    .select('permitir_envio')
    .eq('id', 1)
    .single();

  if (error) {
    console.error('Erro ao verificar configuração:', error);
    palpiteSendBtn.disabled = true;
    return;
  }

  palpiteSendBtn.disabled = !(data && data.permitir_envio);
}

// ======================= CARREGAR PARTICIPANTES NOS SELECTS =======================
async function carregarParticipantes() {
  const { data: participantes, error } = await supabase
    .from('participantes')
    .select('id,nome');

  if (error || !participantes) {
    console.error('Erro ao carregar participantes:', error);
    return;
  }

  EVENTOS.forEach(campo => {
    const select = document.getElementById(`palpite-${campo}`);
    if (!select) return;
    select.innerHTML = '';
    participantes.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.nome;
      select.appendChild(opt);
    });
  });
}

// ======================= ENVIAR PALPITE =======================
palpiteSendBtn.addEventListener('click', async () => {
  if (!palpiteiroId) return alert('Você precisa logar primeiro');

  const semana = parseInt(palpiteSemana.value);
  if (!semana) return alert('Informe a semana');

  // Cria objeto com todos os eventos
  let palpite = {
    palpiteiro_id: palpiteiroId,
    semana,
    criado_em: new Date().toISOString()
  };

  for (let evento of EVENTOS) {
    const select = document.getElementById(`palpite-${evento}`);
    if (!select || !select.value) return alert(`Preencha o campo ${evento.toUpperCase()}`);
    palpite[evento] = select.value;
  }

  try {
    // Insert seguro, sem .select() que causa conflito
    const { error } = await supabase
      .from('palpites')
      .insert([palpite], { returning: 'minimal' }); // retorna apenas status

    if (error) {
      console.error('Erro ao enviar palpite:', error);
      alert('Erro ao enviar palpite: ' + error.message);
    } else {
      alert('Palpite enviado com sucesso!');
      carregarHistorico();
    }
  } catch (err) {
    console.error('Erro inesperado:', err);
    alert('Erro inesperado ao enviar palpite');
  }
});

// ======================= CARREGAR HISTÓRICO =======================
async function carregarHistorico() {
  if (!palpiteiroId) return;

  const { data: palpites, error } = await supabase
    .from('palpites')
    .select(['id','semana','criado_em', ...EVENTOS])
    .eq('palpiteiro_id', palpiteiroId)
    .order('semana', { ascending: true });

  if (error) {
    console.error('Erro ao carregar histórico:', error);
    palpiteList.innerHTML = '<li>Erro ao carregar histórico</li>';
    return;
  }

  palpiteList.innerHTML = '';
  if (!palpites || palpites.length === 0) {
    palpiteList.innerHTML = '<li>Nenhum palpite feito ainda.</li>';
    return;
  }

  palpites.forEach(p => {
    const li = document.createElement('li');
    li.textContent = `Semana ${p.semana}: ` + EVENTOS.map(e => `${e.toUpperCase()}: ${p[e]}`).join(' | ');
    palpiteList.appendChild(li);
  });
}
