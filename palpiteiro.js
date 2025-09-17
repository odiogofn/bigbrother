import { supabase } from './supabase.js';

const CAMPOS = ['lider','anjo','imune','emparedado','batevolta','eliminado','capitao','bonus'];

// ELEMENTOS
const loginArea = document.getElementById('login-area');
const panel = document.getElementById('palpiteiro-panel');
const loginBtn = document.getElementById('palpiteiro-login-btn');
const logoutBtn = document.getElementById('palpiteiro-logout-btn');
const palpiteSemana = document.getElementById('palpite-semana');
const palpiteSendBtn = document.getElementById('palpite-send-btn');
const palpiteList = document.getElementById('palpite-list');
const statusDiv = document.getElementById('palpite-status');

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
    statusDiv.textContent = 'Erro ao verificar liberação do palpite';
    palpiteSendBtn.disabled = true;
    return;
  }

  if (data && data.permitir_envio) {
    statusDiv.textContent = 'Hora do Palpite: Aberto';
    palpiteSendBtn.disabled = false;
  } else {
    statusDiv.textContent = 'Hora do Palpite: Fechado';
    palpiteSendBtn.disabled = true;
  }
}

// ======================= CARREGAR PARTICIPANTES NOS SELECTS =======================
async function carregarParticipantes() {
  const { data: participantes, error } = await supabase
    .from('participantes')
    .select('id,nome');

  if (error) {
    console.error('Erro ao carregar participantes:', error);
    return;
  }

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

// ======================= ENVIAR PALPITE =======================
palpiteSendBtn.addEventListener('click', async () => {
  if (!palpiteiroId) return alert('Você precisa logar primeiro');

  const semana = parseInt(palpiteSemana.value);
  if (!semana) return alert('Informe a semana');

  // Cria objeto completo com todos os campos obrigatórios
  let dados = {
    palpiteiro_id: palpiteiroId,
    semana,
    criado_em: new Date().toISOString()
  };

  // Preenche todos os campos do palpite com os selects, evitando undefined
  for (let campo of CAMPOS) {
    const select = document.getElementById(`palpite-${campo}`);
    if (!select || !select.value) {
      alert(`Campo ${campo.toUpperCase()} está vazio`);
      return;
    }
    dados[campo] = select.value;
  }

  try {
    // Inserção segura, listando explicitamente as colunas para evitar conflitos
    const { data, error } = await supabase
      .from('palpites')
      .insert([dados])
      .select('id,palpiteiro_id,semana,' + CAMPOS.join(',') + ',criado_em');

    if (error) {
      console.error('Erro ao enviar palpite:', error);
      alert('Erro ao enviar palpite: ' + error.message);
    } else {
      alert('Palpite enviado com sucesso!');
      console.log('Palpite inserido:', data);
      carregarHistorico(); // atualiza histórico após envio
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
    .select('id,palpiteiro_id,semana,' + CAMPOS.join(',') + ',criado_em')
    .eq('palpiteiro_id', palpiteiroId)
    .order('semana', { ascending: true });

  if (error) {
    console.error('Erro ao carregar histórico:', error);
    palpiteList.innerHTML = '<li>Erro ao carregar histórico</li>';
    return;
  }

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
