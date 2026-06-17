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

// ------------------- GERADOR DO CÓDIGO PIX (Copia e Cola / QR) -------------------
// Monta o "Pix Copia e Cola" no padrão oficial do Banco Central (BR Code/EMV).
// Assim o QR já vem com a sua chave e o valor preenchidos.
function emv(id, valor) {
  const tam = String(valor.length).padStart(2, "0");
  return id + tam + valor;
}

// Remove acentos/símbolos e limita tamanho (exigência do padrão Pix)
function limpaTexto(s, max) {
  return (s || "")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .toUpperCase().trim().slice(0, max);
}

// Cálculo do dígito verificador (CRC16-CCITT) exigido no final do código
function crc16(str) {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
      crc &= 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

// Gera o texto completo do Pix Copia e Cola
function gerarPixCopiaECola(valor) {
  const conta = emv("00", "br.gov.bcb.pix") + emv("01", CONFIG.chavePix);
  let payload =
    emv("00", "01") +
    emv("26", conta) +
    emv("52", "0000") +
    emv("53", "986") +
    (valor ? emv("54", Number(valor).toFixed(2)) : "") +
    emv("58", "BR") +
    emv("59", limpaTexto(CONFIG.nome, 25) || "RECEBEDOR") +
    emv("60", limpaTexto(CONFIG.cidade, 15) || "CIDADE") +
    emv("62", emv("05", "***")) +
    "6304";
  return payload + crc16(payload);
}

// ------------------- JANELA (MODAL) DE CONTRIBUIÇÃO -------------------
function abrirModalPix(valor, nomePresente) {
  const modal = document.getElementById("modalPix");
  const codigo = gerarPixCopiaECola(valor);

  // Título e valor
  document.getElementById("modalTitulo").textContent =
    `Contribuir com ${formatarReal(Number(valor))}`;
  document.getElementById("modalItem").textContent = nomePresente;

  // Gera o QR Code a partir do código Pix
  const qrDiv = document.getElementById("pixQr");
  qrDiv.innerHTML = "";
  new QRCode(qrDiv, { text: codigo, width: 210, height: 210, correctLevel: QRCode.CorrectLevel.M });

  // Texto do copia e cola
  document.getElementById("pixCopiaCola").value = codigo;

  // Botão de copiar o código
  const btnCopiar = document.getElementById("btnCopiarPixCodigo");
  btnCopiar.textContent = "📋 Copiar código Pix";
  btnCopiar.onclick = async () => {
    try { await navigator.clipboard.writeText(codigo); }
    catch (e) {
      const ta = document.getElementById("pixCopiaCola");
      ta.select(); document.execCommand("copy");
    }
    btnCopiar.textContent = "✓ Copiado!";
    setTimeout(() => { btnCopiar.textContent = "📋 Copiar código Pix"; }, 2000);
  };

  // Botão de avisar no WhatsApp
  document.getElementById("btnModalWhats").onclick =
    () => abrirWhatsApp(valor, nomePresente);

  // Botão de cartão (só aparece se houver link configurado)
  const btnCartao = document.getElementById("btnModalCartao");
  if (CONFIG.linkCartao) {
    btnCartao.style.display = "block";
    btnCartao.onclick = () => window.open(CONFIG.linkCartao, "_blank");
  } else {
    btnCartao.style.display = "none";
  }

  modal.style.display = "flex";
}

function fecharModalPix() {
  document.getElementById("modalPix").style.display = "none";
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
        btn.addEventListener("click", () => abrirModalPix(valor, presente.nome));
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
        abrirModalPix(valor, presente.nome);
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
          cidade: d.cidade || CONFIG.cidade,
          linkCartao: d.linkCartao !== undefined ? d.linkCartao : CONFIG.linkCartao,
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
