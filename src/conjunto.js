const { criarPeca, mesmaPeca, MENOR_LADO, MAIOR_LADO } = require('./peca');

const TOTAL_PECAS = 28;
const PECAS_POR_JOGADOR = 7;
const QUANTIDADE_JOGADORES = 2;

function criarConjunto() {
  const pecas = [];
  for (let a = MENOR_LADO; a <= MAIOR_LADO; a++) {
    for (let b = a; b <= MAIOR_LADO; b++) {
      pecas.push(criarPeca(a, b));
    }
  }
  return pecas;
}

function validarConjunto(pecas) {
  if (!Array.isArray(pecas) || pecas.length !== TOTAL_PECAS) {
    throw new Error(`O conjunto deve ter exatamente ${TOTAL_PECAS} peças`);
  }
  const conferidas = pecas.map((p) => criarPeca(p.a, p.b));
  conferidas.forEach((peca, i) => {
    if (conferidas.slice(0, i).some((anterior) => mesmaPeca(anterior, peca))) {
      throw new Error(`Peça repetida no conjunto: [${peca.a}|${peca.b}]`);
    }
  });
  return conferidas;
}

function embaralhar(pecas, rng) {
  if (typeof rng !== 'function') {
    throw new Error('Informe uma função rng para embaralhar');
  }
  const copia = [...pecas];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// Distribui alternando (0, 1, 0, 1...) as 14 primeiras; o resto vira o monte.
function distribuir(pecas) {
  const conferidas = validarConjunto(pecas);
  const maos = [[], []];
  const distribuidas = PECAS_POR_JOGADOR * QUANTIDADE_JOGADORES;
  conferidas.slice(0, distribuidas).forEach((peca, i) => {
    maos[i % QUANTIDADE_JOGADORES].push(peca);
  });
  return { maos, monte: conferidas.slice(distribuidas) };
}

module.exports = {
  TOTAL_PECAS,
  PECAS_POR_JOGADOR,
  QUANTIDADE_JOGADORES,
  criarConjunto,
  validarConjunto,
  embaralhar,
  distribuir,
};
