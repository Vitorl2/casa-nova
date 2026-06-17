/* ===================================================================
   DADOS DO SITE — este é o ÚNICO arquivo que você precisa editar.
   ===================================================================
   DICA: a forma mais FÁCIL de editar é abrir a página "admin.html"
   (o painel), preencher o formulário e copiar o resultado pra cá.
   Mas você também pode editar na mão aqui se quiser.
   =================================================================== */

// OBS: estes dados são apenas o PONTO DE PARTIDA. Quando você salva pelo
// painel (admin.html), os dados passam a vir da NUVEM (Firebase) e estes
// aqui viram só um "plano B" caso a nuvem esteja indisponível.

// ------------------- SUAS INFORMAÇÕES -------------------
let CONFIG = {
  nome: "Vitor",                              // seu nome (mensagem do WhatsApp)
  whatsapp: "5585985896163",                  // DDI(55) + DDD + número, só dígitos
  chavePix: "vitorsiqueira834@gmail.com",     // sua chave Pix
};

// ------------------- LISTA DE PRESENTES -------------------
// Cada item: { nome, categoria, valorTotal, valorArrecadado, link }
// categoria deve ser uma destas: Cozinha, Lavanderia, Quarto, Sala, Banheiro, Outros
// link é opcional (deixe "" se não tiver)
let PRESENTES = [
  { nome: "Air Fryer",        categoria: "Cozinha",    valorTotal: 300, valorArrecadado: 0, link: "" },
  { nome: "Micro-ondas",      categoria: "Cozinha",    valorTotal: 500, valorArrecadado: 0, link: "" },
  { nome: "Liquidificador",   categoria: "Cozinha",    valorTotal: 150, valorArrecadado: 0, link: "" },
  { nome: "Jogo de Panelas",  categoria: "Cozinha",    valorTotal: 250, valorArrecadado: 0, link: "" },
  { nome: "Sanduicheira",     categoria: "Cozinha",    valorTotal: 120, valorArrecadado: 0, link: "" },
  { nome: "Ferro de Passar",  categoria: "Lavanderia", valorTotal: 120, valorArrecadado: 0, link: "" },
  { nome: "Varal de Chão",    categoria: "Lavanderia", valorTotal: 90,  valorArrecadado: 0, link: "" },
  { nome: "Jogo de Cama",     categoria: "Quarto",     valorTotal: 150, valorArrecadado: 0, link: "" },
  { nome: "Travesseiros",     categoria: "Quarto",     valorTotal: 100, valorArrecadado: 0, link: "" },
  { nome: "Kit Toalhas",      categoria: "Banheiro",   valorTotal: 120, valorArrecadado: 0, link: "" },
];

// ------------------- CONFIGURAÇÕES FIXAS (não precisa mexer) -------------------
const CATEGORIAS = ["Todos", "Cozinha", "Lavanderia", "Quarto", "Sala", "Banheiro", "Outros"];
const COTAS = [20, 30, 50, 100];   // valores dos botões de cota (R$)
