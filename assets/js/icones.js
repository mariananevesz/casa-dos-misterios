/* =============================================================
   icones.js — Ícones do jogo em SVG (no lugar de emojis e símbolos)
   Casa dos Mistérios Lógicos

   Emoji e símbolo usados como ícone são lidos em voz alta pelo leitor
   de tela ("robô", "lupa", "troféu", "seta para a esquerda"). Aqui o
   ícone é um desenho SVG com aria-hidden: aparece na tela e nunca é
   lido. Quem dá o nome ao botão é o texto ou o aria-label dele.

   Uso:
     HTML  <span data-ico="seta-esq"></span>      (preenchido ao carregar)
     JS    Icones.svg('check')                     (devolve o texto do SVG)
     JS    Icones.aplicar(raiz)                    (preenche os data-ico novos)
   ============================================================= */

const Icones = (() => {
  /* Traço: herda a cor do texto (currentColor). C = parte preenchida. */
  const C = 'fill="currentColor" stroke="none"';
  const DESENHOS = {
    /* --- setas e ações --- */
    'seta-cima':  '<path d="M12 19V5M5 12l7-7 7 7"/>',
    'seta-baixo': '<path d="M12 5v14M5 12l7 7 7-7"/>',
    'seta-esq':   '<path d="M19 12H5M12 5l-7 7 7 7"/>',
    'seta-dir':   '<path d="M5 12h14M12 5l7 7-7 7"/>',
    'repetir':    '<path d="M4 12a8 8 0 1 0 2.6-5.9M4 4v5h5"/>',
    'desfazer':   '<path d="M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3"/>',
    'play':       `<path d="M7.5 4.8v14.4a.8.8 0 0 0 1.2.7l11.4-7.2a.8.8 0 0 0 0-1.4L8.7 4.1a.8.8 0 0 0-1.2.7z" ${C}/>`,
    'pular':      '<path d="M5 5l9 7-9 7zM18 5v14"/>',
    'check':      '<path d="M4.5 12.5l5 5L19.5 7"/>',
    'x':          '<path d="M6 6l12 12M18 6L6 18"/>',
    'mais':       '<path d="M12 5v14M5 12h14"/>',
    'menos':      '<path d="M5 12h14"/>',
    /* --- botões do jogo --- */
    'engrenagem': '<circle cx="12" cy="12" r="3"/><path d="M12 2.8l1.6 2.6 3-.6.6 3 2.6 1.6-1.4 2.6 1.4 2.6-2.6 1.6-.6 3-3-.6-1.6 2.6-1.6-2.6-3 .6-.6-3-2.6-1.6L5.6 12 4.2 9.4l2.6-1.6.6-3 3 .6z"/>',
    'som':        `<path d="M4 9.5v5h3.4l4.6 4v-13l-4.6 4z" ${C}/><path d="M15.5 9a4.2 4.2 0 0 1 0 6M18.2 6.4a8 8 0 0 1 0 11.2"/>`,
    'som-off':    `<path d="M4 9.5v5h3.4l4.6 4v-13l-4.6 4z" ${C}/><path d="M16 9.5l5 5M21 9.5l-5 5"/>`,
    'lampada':    '<path d="M9 21h6M10 17.5h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2v.6h5v-.6c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
    'cadeado':    '<rect x="5" y="11" width="14" height="10" rx="2.2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    'trofeu':     '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7M10 17h4"/>',
    'livro':      '<path d="M4 5.5c2.5-1 5.5-1 8 .5 2.5-1.5 5.5-1.5 8-.5v13c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5zM12 6v13"/>',
    'estrela':    `<path d="M12 3l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 16.9 6.6 19.8l1.1-6.1L3.2 9.4l6.1-.8z" ${C}/>`,
    'casa':       '<path d="M4 11l8-7 8 7M6 10v10h12V10M10 20v-6h4v6"/>',
    'lupa':       '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/>',
    'peca':       '<path d="M4 7h4.5a2.2 2.2 0 1 1 4 0H17v4.5a2.2 2.2 0 1 1 0 4V20H4z"/>',
    'mao':        '<path d="M9 11V4.5a1.5 1.5 0 0 1 3 0V10l5.2.9a2 2 0 0 1 1.7 2.2l-.6 5A3.5 3.5 0 0 1 14.8 21H12a4 4 0 0 1-3.3-1.7l-3.4-4.8a1.4 1.4 0 0 1 2.1-1.8L9 14z"/>',
    /* --- preferências --- */
    'tela':       '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    'letras':     '<path d="M3 18L7.5 6h1L13 18M4.8 14h6.4M20.5 18v-5a2.5 2.5 0 0 0-5 0"/><circle cx="18" cy="15.5" r="2.5"/>',
    'teclado':    '<rect x="2" y="6" width="20" height="13" rx="2.5"/><path d="M6 10h1M10 10h1M14 10h1M18 10h1M7 15h10"/>',
    'medalha':    '<circle cx="12" cy="14.5" r="5.5"/><path d="M8.5 3l3.5 6 3.5-6M12 12.5v4M10.5 13.5l1.5-1"/>',
    /* --- passos da rotina do Quarto --- */
    'passo-banho':     '<path d="M3 12h18v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4zM6 12V6a2 2 0 0 1 4 0M6.5 19l-1 2M17.5 19l1 2"/>',
    'passo-camiseta':  '<path d="M8 4L3 7l2 4 2-1v10h10V10l2 1 2-4-5-3a4 4 0 0 1-8 0z"/>',
    'passo-calca':     '<path d="M7 3h10l1 18h-4.5L12 9l-1.5 12H6zM7 6.5h10"/>',
    'passo-meia':      '<path d="M9 3h6v9l3 3a3.5 3.5 0 0 1-5 5l-4-4zM9 7h6"/>',
    'passo-tenis':     '<path d="M3 18v-6l4-1 3-4 3 5 6 2a2.5 2.5 0 0 1 2 2.4V18zM3 15h18M10.5 9.5l1.6-1M12 12l1.6-1"/>',
    'passo-van':       '<path d="M9 16h6M4.5 16H2V8a2 2 0 0 1 2-2h10l5 4 3 1v5h-2.5M14 6v5h6"/><circle cx="6.5" cy="16.5" r="2"/><circle cx="17.5" cy="16.5" r="2"/>',
    'passo-onibus':    '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M3 11h18M9 4v7M15 4v7"/><circle cx="7.5" cy="18.5" r="1.8"/><circle cx="16.5" cy="18.5" r="1.8"/>',
    'passo-bicicleta': '<circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="M6 16l4-8h6l2 8M10 8l3.5 8M9 8h2.5M15 5.5h2.5"/>',
    'passo-carro':     '<path d="M9 16.5h6M5 16.5H3v-3.5l2-5a2 2 0 0 1 2-1.3h10A2 2 0 0 1 19 8l2 5v3.5h-2M3.5 13h17"/><circle cx="7" cy="16.5" r="2"/><circle cx="17" cy="16.5" r="2"/>',
    'passo-dormir':    '<path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5zM15 4h4l-4 4h4"/>',
    'passo-tv':        '<rect x="3" y="7" width="18" height="12" rx="2"/><path d="M8 3l4 4 4-4M9 22h6"/>',
    'passo-videogame': `<path d="M7 8h10a5 5 0 0 1 5 5v1a3.5 3.5 0 0 1-6.3 2.1L15 15H9l-.7 1.1A3.5 3.5 0 0 1 2 14v-1a5 5 0 0 1 5-5zM7 10.5v3M5.5 12h3"/><circle cx="16" cy="11" r="1" ${C}/><circle cx="18.3" cy="13.2" r="1" ${C}/>`,
    'passo-parque':    '<path d="M12 21v-7M12 14a5 5 0 0 1-4.5-7.2 4.5 4.5 0 0 1 9 0A5 5 0 0 1 12 14zM5 21h14"/>',
    'passo-piscina':   '<path d="M3 17c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0 3 1.5 4.5 0M3 21c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0 3 1.5 4.5 0M8 14V6a2 2 0 0 1 4 0M14 14V6a2 2 0 0 1 4 0M8 10h6"/>',
    'passo-filme':     '<rect x="3" y="9" width="18" height="11" rx="2"/><path d="M3.3 9L4.5 5l15.5-2 1 3zM8.5 4.5l1.8 3.3M13.5 3.8l1.8 3.3"/>'
  };

  function tem(nome) { return Object.prototype.hasOwnProperty.call(DESENHOS, nome); }

  /* aria-hidden + focusable="false": o desenho nunca entra na leitura nem no Tab */
  function svg(nome, classe) {
    if (!tem(nome)) return '';
    return `<svg class="ico${classe ? ' ' + classe : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${DESENHOS[nome]}</svg>`;
  }

  /* Preenche os <span data-ico="nome"> da página (ou de um trecho recém-montado) */
  function aplicar(raiz) {
    (raiz || document).querySelectorAll('[data-ico]').forEach(el => {
      if (el.dataset.icoOk === el.dataset.ico) return;
      el.innerHTML = svg(el.dataset.ico);
      el.setAttribute('aria-hidden', 'true');
      el.dataset.icoOk = el.dataset.ico;
    });
  }

  aplicar();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => aplicar());

  return { svg, aplicar, tem };
})();

window.Icones = Icones;
