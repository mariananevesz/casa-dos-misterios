/* Gera docs/falas-logi.md a partir de assets/js/tutoriais/*.js.  Uso: node docs/gerar-falas-logi.js */
const fs = require('fs'), path = require('path'), vm = require('vm');
const raiz = path.join(__dirname, '..');
const dir = path.join(raiz, 'assets/js/tutoriais');
const ordem = ['sala-f3', 'sala-f1', 'quarto-f1', 'cozinha-f1', 'despensa-f1'];
const defs = {};
const ctx = { Tutorial: { registrar: d => { defs[d.id] = d; } } };
vm.createContext(ctx);
ordem.forEach(id => vm.runInContext(fs.readFileSync(path.join(dir, id + '.js'), 'utf8'), ctx, { filename: id + '.js' }));
const ESTADOS = { falando: 'Falando', apontando: 'Explicando / apontando', dica: 'Dica (lâmpada acende)', comemorando: 'Comemorando', encorajando: 'Encorajando', aguardando: 'Aguardando' };
const esc = s => String(s).replace(/\|/g, '\|');
let md = `# Falas do Logi — lista para gravação dos áudios

> Arquivo gerado a partir de \`assets/js/tutoriais/*.js\` (a fonte da verdade). Se uma fala mudar nos dados, gere este arquivo de novo.

## Como encaixar a voz

1. Grave cada fala e salve como **MP3** em \`assets/audio/logi/\`, com o nome da coluna **Arquivo** (ex.: \`sala-f3-p1.mp3\`).
2. Acrescente o id (sem \`.mp3\`) na lista de \`assets/audio/logi/manifest.js\`, por exemplo \`window.LOGI_AUDIOS = ['sala-f3-p1'];\`.
3. Pronto: o passo toca o áudio e só avança quando ele termina. Fala que **não** estiver na lista continua só com legenda (tempo da coluna **Duração padrão**), sem erro no console e sem voz sintética.
4. A voz respeita *Efeitos sonoros* e *Voz do Logi nos tutoriais* (menu de acessibilidade) e o botão **Voz** do painel do tutorial.

Dica de gravação: as palavras em MAIÚSCULAS são as palavras-chave que ficam destacadas na legenda e acendem o elemento da tela — vale dar um leve destaque na voz.

`;
ordem.forEach(id => {
  const d = defs[id];
  md += `## ${d.titulo} (\`${d.id}\`)\n\n| id | Arquivo | Fala | Momento | Estado do Logi | Duração padrão |\n|---|---|---|---|---|---|\n`;
  const linha = (p, momento) => {
    md += `| ${p.id} | ${p.id}.mp3 | ${esc(p.fala)} | ${esc(momento)} | ${ESTADOS[p.estadoLogi] || p.estadoLogi} | ${((p.duracaoPadrao || p.duracaoPadrao === 0 ? p.duracaoPadrao : (p.tipo === 'vez' ? 0 : 3000)) / 1000).toFixed(1).replace('.0', '')}${p.tipo === 'vez' ? ' (espera a criança)' : ' s'} |\n`;
  };
  d.passos.forEach(p => {
    linha(p, p.momento);
    if (p.erro) {
      const e = Object.assign({ duracaoPadrao: 2500 }, p.erro);
      md += `| ${e.id} | ${e.id}.mp3 | ${esc(e.fala)} | ${esc(e.momento)} | ${ESTADOS[e.estadoLogi]} | 2.5 s |\n`;
    }
  });
  md += '\n';
});
const total = ordem.reduce((n, id) => n + defs[id].passos.reduce((m, p) => m + 1 + (p.erro ? 1 : 0), 0), 0);
md += `**Total:** ${total} falas.\n`;
fs.writeFileSync(path.join(raiz, 'docs/falas-logi.md'), md);
console.log('ok', total);
