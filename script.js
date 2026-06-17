/* ===================================================================
   CHÁ DE CASA NOVA - LÓGICA (JavaScript puro, sem backend)
   ===================================================================
   COMO PERSONALIZAR (mexa só nesta seção CONFIG e na lista PRESENTES):
   1. CONFIG.nome        -> seu nome (aparece na mensagem do WhatsApp)
   2. CONFIG.whatsapp    -> seu número com DDI + DDD, só números
   3. CONFIG.chavePix    -> sua chave Pix
   4. PRESENTES          -> lista de presentes (nome, categoria, valores)
   5. valorArrecadado    -> quanto já foi arrecadado em cada item
   =================================================================== */

// ------------------- CONFIGURAÇÃO (TROQUE AQUI) -------------------
const CONFIG = {
  // (1) TROQUE: seu nome, usado na mensagem pronta do WhatsApp
  nome: "Vitor",

  // (2) TROQUE: número do WhatsApp -> DDI(55) + DDD + número, só dígitos
  //     Exemplo: 55 11 99999-9999  ->  "5511999999999"
  whatsapp: "5585985896163",

  // (3) TROQUE: sua chave Pix (e-mail, telefone, CPF ou chave aleatória)
  chavePix: "vitorsiqueira834@gmail.com",
};

// ------------------- LISTA DE PRESENTES (TROQUE AQUI) -------------------
// (4 e 5) Edite livremente: adicione/remova itens e ajuste os valores.
//   nome           -> nome do item
//   categoria      -> uma de: Cozinha, Lavanderia, Quarto, Sala, Banheiro, Outros
//   valorTotal     -> valor estimado total do item (R$). MUDE AQUI o preço!
//   valorArrecadado-> quanto já foi arrecadado até agora (R$)
//   link           -> (OPCIONAL) link da loja/produto. Cole o endereço entre
//                     as aspas. Deixe "" (vazio) se não quiser mostrar link.
const PRESENTES = [
  { nome: "Air Fryer",        categoria: "Cozinha",    valorTotal: 300, valorArrecadado: 0, link: "https://www.exemplo.com.br/air-fryer" },
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

// Categorias usadas nos filtros (a ordem aqui é a ordem dos botões)
const CATEGORIAS = ["Todos", "Cozinha", "Lavanderia", "Quarto", "Sala", "Banheiro", "Outros"];

// Valores fixos dos botões de cota (R$)
const COTAS = [20, 30, 50, 100];

// ===================================================================
//  DAQUI PARA BAIXO: lógica do site. Em geral não precisa mexer.
// ===================================================================

// Categoria selecionada no momento (filtro ativo)
let filtroAtual = "Todos";

// Formata número como moeda em Reais: 80 -> "R$ 80,00"
function formatarReal(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Calcula informações derivadas de um presente
function calcular(presente) {
  // Garante que o arrecadado nunca passe do total
  const arrecadado = Math.min(presente.valorArrecadado, presente.valorTotal);
  const restante = Math.max(presente.valorTotal - arrecadado, 0);
  const porcentagem = presente.valorTotal > 0
    ? Math.round((arrecadado / presente.valorTotal) * 100)
    : 0;
  const completo = restante <= 0;
  const status = completo ? "completo" : (arrecadado > 0 ? "parcial" : "aberto");
  return { arrecadado, restante, porcentagem, completo, status };
}

// Monta o link do WhatsApp com a mensagem pronta
function linkWhatsApp(valor, nomePresente) {
  const mensagem = `Oi, ${CONFIG.nome}! Quero ajudar com R$ ${valor} para o presente: ${nomePresente}.`;
  return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(mensagem)}`;
}

// Abre o WhatsApp em nova aba
function abrirWhatsApp(valor, nomePresente) {
  window.open(linkWhatsApp(valor, nomePresente), "_blank");
}

// ------------------- RENDERIZAÇÃO DOS FILTROS -------------------
function renderizarFiltros() {
  const nav = document.getElementById("filtros");
  nav.innerHTML = "";

  CATEGORIAS.forEach((cat) => {
    const btn = document.createElement("button");
    btn.textContent = cat;
    if (cat === filtroAtual) btn.classList.add("ativo");
    btn.addEventListener("click", () => {
      filtroAtual = cat;
      renderizarFiltros();
      renderizarPresentes();
    });
    nav.appendChild(btn);
  });
}

// ------------------- RENDERIZAÇÃO DO RESUMO GERAL -------------------
function renderizarResumo() {
  const totalGeral = PRESENTES.reduce((s, p) => s + p.valorTotal, 0);
  const arrecadadoGeral = PRESENTES.reduce(
    (s, p) => s + Math.min(p.valorArrecadado, p.valorTotal), 0
  );
  const pct = totalGeral > 0 ? Math.round((arrecadadoGeral / totalGeral) * 100) : 0;

  const resumo = document.getElementById("resumo");
  resumo.innerHTML = `
    <div>
      Já arrecadamos <strong>${formatarReal(arrecadadoGeral)}</strong>
      de ${formatarReal(totalGeral)} <strong>(${pct}%)</strong>
    </div>
    <div class="barra">
      <div class="barra-preenchida" style="width:${pct}%"></div>
    </div>
  `;
}

// ------------------- RENDERIZAÇÃO DOS CARDS -------------------
function renderizarPresentes() {
  const lista = document.getElementById("listaPresentes");
  lista.innerHTML = "";

  // Aplica o filtro de categoria
  const visiveis = PRESENTES.filter(
    (p) => filtroAtual === "Todos" || p.categoria === filtroAtual
  );

  if (visiveis.length === 0) {
    lista.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--cor-texto-suave)">
      Nenhum presente nesta categoria.</p>`;
    return;
  }

  visiveis.forEach((presente) => {
    const info = calcular(presente);

    // Texto do selo de status
    const textoSelo =
      info.status === "completo" ? "Completo" :
      info.status === "parcial"  ? "Parcial"  : "Aberto";

    const card = document.createElement("article");
    card.className = "card" + (info.completo ? " completo" : "");

    card.innerHTML = `
      <div class="card-topo">
        <div>
          <div class="card-nome">${presente.nome}</div>
          <span class="card-categoria">${presente.categoria}</span>
        </div>
        <span class="selo ${info.status}">${textoSelo}</span>
      </div>

      <div class="valores">
        <span>Meta: <strong>${formatarReal(presente.valorTotal)}</strong></span>
      </div>
      <div class="valores">
        <span class="arrecadado">Arrecadado: ${formatarReal(info.arrecadado)}</span>
        <span class="restante">Falta: ${formatarReal(info.restante)}</span>
      </div>

      ${presente.link ? `
        <a class="link-produto" href="${presente.link}" target="_blank" rel="noopener">
          🔗 Ver produto
        </a>
      ` : ``}

      <div class="barra">
        <div class="barra-preenchida" style="width:${info.porcentagem}%"></div>
      </div>
      <div class="porcentagem">${info.porcentagem}% arrecadado</div>

      ${info.completo ? `
        <div class="mensagem-completo">
          Esse item já foi concluído. Obrigado! 💛
        </div>
      ` : `
        <div class="cotas"></div>
      `}
    `;

    // Se não estiver completo, cria os botões de cota
    if (!info.completo) {
      const divCotas = card.querySelector(".cotas");

      // Botões de valor fixo
      COTAS.forEach((valor) => {
        const btn = document.createElement("button");
        btn.textContent = `R$ ${valor}`;
        btn.addEventListener("click", () => abrirWhatsApp(valor, presente.nome));
        divCotas.appendChild(btn);
      });

      // Botão "Outro valor"
      const btnOutro = document.createElement("button");
      btnOutro.className = "outro";
      btnOutro.textContent = "Outro valor";
      btnOutro.addEventListener("click", () => {
        const entrada = prompt(`Com quanto você quer ajudar no item "${presente.nome}"? (somente números, em reais)`);
        if (entrada === null) return; // usuário cancelou

        // Aceita vírgula ou ponto e remove o que não for número
        const valor = parseFloat(entrada.replace(",", ".").replace(/[^0-9.]/g, ""));
        if (!valor || valor <= 0) {
          alert("Por favor, digite um valor válido.");
          return;
        }
        abrirWhatsApp(valor, presente.nome);
      });
      divCotas.appendChild(btnOutro);
    }

    lista.appendChild(card);
  });
}

// ------------------- COPIAR CHAVE PIX -------------------
function configurarPix() {
  const campoChave = document.getElementById("chavePix");
  campoChave.textContent = CONFIG.chavePix;

  const btn = document.getElementById("btnCopiarPix");
  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(CONFIG.chavePix);
    } catch (e) {
      // Fallback para navegadores antigos / contexto sem clipboard API
      const sel = document.createElement("textarea");
      sel.value = CONFIG.chavePix;
      document.body.appendChild(sel);
      sel.select();
      document.execCommand("copy");
      document.body.removeChild(sel);
    }
    // Feedback visual
    const textoOriginal = btn.textContent;
    btn.textContent = "Chave copiada! ✓";
    btn.classList.add("copiado");
    setTimeout(() => {
      btn.textContent = textoOriginal;
      btn.classList.remove("copiado");
    }, 2000);
  });
}

// ------------------- INICIALIZAÇÃO -------------------
document.addEventListener("DOMContentLoaded", () => {
  renderizarResumo();
  renderizarFiltros();
  renderizarPresentes();
  configurarPix();
});
