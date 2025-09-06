// palpiteiro.js
document.addEventListener("DOMContentLoaded", async () => {
  carregarParticipantes();
  carregarHistorico();
});

async function enviarPalpite() {
  const semana = document.getElementById("semanaPalpite").value;
  const lider = document.getElementById("palpiteLider").value;
  const anjo = document.getElementById("palpiteAnjo").value;
  const imune = document.getElementById("palpiteImune").value;
  const emparedado = document.getElementById("palpiteEmparedado").value;
  const batevolta = document.getElementById("palpiteBatevolta").value;
  const eliminado = document.getElementById("palpiteEliminado").value;
  const capitao = document.getElementById("palpiteCapitao").value;
  const bonus = document.getElementById("palpiteBonus").value;

  const { error } = await supabase.from("palpites").insert([{
    semana, lider, anjo, imune, emparedado, batevolta, eliminado, capitao, bonus
  }]);

  if (error) {
    alert("Erro ao enviar palpite: " + error.message);
  } else {
    alert("Palpite enviado!");
    carregarHistorico();
  }
}

async function carregarParticipantes() {
  const { data, error } = await supabase.from("participantes").select("*");
  if (error) return console.error(error);

  const selects = [
    "palpiteLider","palpiteAnjo","palpiteImune","palpiteEmparedado",
    "palpiteBatevolta","palpiteEliminado","palpiteCapitao","palpiteBonus"
  ];

  selects.forEach(id => {
    const select = document.getElementById(id);
    select.innerHTML = `<option value="">Selecione</option>`;
    data.forEach(p => {
      select.innerHTML += `<option value="${p.id}">${p.nome}</option>`;
    });
  });
}

async function carregarHistorico() {
  const { data, error } = await supabase.from("palpites").select("*, participantes!palpites_lider_fkey(nome)");
  if (error) return console.error(error);

  const lista = document.getElementById("historicoPalpites");
  lista.innerHTML = "";

  data.forEach(p => {
    const li = document.createElement("li");
    li.innerHTML = `
      Semana ${p.semana} - Líder: ${p.lider || "-"} / Anjo: ${p.anjo || "-"} ...
      <button onclick="excluirPalpite(${p.id})">Excluir</button>
    `;
    lista.appendChild(li);
  });
}

async function excluirPalpite(id) {
  const { error } = await supabase.from("palpites").delete().eq("id", id);
  if (error) {
    alert("Erro ao excluir: " + error.message);
  } else {
    alert("Palpite removido!");
    carregarHistorico();
  }
}
