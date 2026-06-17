/* ===================================================================
   CHÁ DE CASA NOVA - LÓGICA (JavaScript puro, sem backend)
   ===================================================================
   Os DADOS (nome, WhatsApp, Pix e lista de presentes) ficam no arquivo
   "dados.js", que é carregado ANTES deste no index.html.
   Para adicionar/editar itens, use o painel "admin.html" ou edite o
   arquivo "dados.js". Aqui embaixo fica só a lógica do site.
   =================================================================== */

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

// ------------------- LER DADOS DA NUVEM (Firebase) -------------------
// Busca os dados mais recentes salvos pelo painel. Se a nuvem estiver
// indisponível (ou ainda sem nada salvo), usa os dados do dados.js.
async function carregarDaNuvem() {
  try {
    const doc = await DOC_DADOS.get();
    if (doc.exists) {
      const d = doc.data();
      if (d.nome || d.whatsapp || d.chavePix) {
        CONFIG = {
          nome: d.nome || CONFIG.nome,
          whatsapp: d.whatsapp || CONFIG.whatsapp,
          chavePix: d.chavePix || CONFIG.chavePix,
        };
      }
      // Usa a lista da nuvem mesmo que esteja vazia (vazio = você apagou tudo).
      if (Array.isArray(d.presentes)) {
        PRESENTES = d.presentes;
      }
    }
  } catch (e) {
    console.warn("Não consegui ler da nuvem; usando dados locais.", e);
  }
}

// ------------------- INICIALIZAÇÃO -------------------
document.addEventListener("DOMContentLoaded", async () => {
  await carregarDaNuvem();
  renderizarResumo();
  renderizarFiltros();
  renderizarPresentes();
  configurarPix();
});
