// ====== EDITE AQUI ======
var WHATSAPP = "5521999999999"; // país + DDD + número, só dígitos
var SAUDACAO = "Olá! Vim pelo site da Malf Capital e gostaria de um orçamento.";
var SUPABASE_URL = "https://SEU-PROJETO.supabase.co";
var SUPABASE_ANON_KEY = "SUA_CHAVE_ANON_PUBLICA";
var SERVICOS = {
  "Pessoa física": ["Planejamento financeiro pessoal", "Organização de dívidas", "Orientação para decisões importantes", "Outro assunto"],
  "Empresa": ["Gestão financeira", "Estruturação e organização do negócio", "Crédito e capital de giro", "Outro assunto"]
};
// ========================

function link(texto){ return "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(texto); }
function $(id){ return document.getElementById(id); }

$("wa").href = link(SAUDACAO);
$("ano").textContent = new Date().getFullYear();

// Campo de empresa e lista de assuntos mudam conforme o tipo
function atualizarTipo(){
  var tipo = $("tipo").value;
  $("empresa-box").hidden = (tipo !== "Empresa");
  if(tipo !== "Empresa"){ $("empresa").value = ""; $("e-empresa").textContent = ""; }
  $("srv").innerHTML = "";
  SERVICOS[tipo].forEach(function(s){
    var o = document.createElement("option");
    o.textContent = s; $("srv").appendChild(o);
  });
}
$("tipo").addEventListener("change", atualizarTipo);
atualizarTipo();

// Salva o pedido no Supabase (tabela "pedidos")
function salvarPedido(dados){
  return fetch(SUPABASE_URL + "/rest/v1/pedidos", {
    method: "POST",
    keepalive: true,
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": "Bearer " + SUPABASE_ANON_KEY,
      "Prefer": "return=minimal"
    },
    body: JSON.stringify(dados)
  }).then(function(r){ if(!r.ok) throw new Error("Falha ao salvar: " + r.status); });
}

$("f").addEventListener("submit", function(ev){
  ev.preventDefault();
  var tipo = $("tipo").value;
  var empresa = $("empresa").value.trim();
  var nome = $("nome").value.trim();
  var tel = $("tel").value.trim();
  var srv = $("srv").value;
  var msg = $("msg").value.trim();

  var empOk = tipo !== "Empresa" || empresa;
  var telOk = tel.replace(/\D/g, "").length >= 10;
  $("e-empresa").textContent = empOk ? "" : "Informe o nome da empresa.";
  $("e-nome").textContent = nome ? "" : "Informe seu nome.";
  $("e-tel").textContent = telOk ? "" : "Informe um telefone com DDD.";
  if(!empOk || !nome || !telOk) return;

  var texto = "Olá! Meu nome é " + nome +
    (tipo === "Empresa" ? ", da empresa " + empresa + "." : ". Sou pessoa física.") +
    "\nAssunto: " + srv + "\nTelefone: " + tel + (msg ? "\nMensagem: " + msg : "");
  var url = link(texto);
  $("wa").href = url;

  // Abre o WhatsApp na hora (evita bloqueio de pop-up) e salva em paralelo
  window.open(url, "_blank", "noopener");
  salvarPedido({ tipo_cliente: tipo, empresa: empresa || null, nome: nome, telefone: tel, servico: srv, mensagem: msg || null })
    .catch(function(e){ console.error(e); });

  $("ok").classList.add("show");
  $("f").reset();
  atualizarTipo();
});
