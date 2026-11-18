const { girar, contemNumero } = require('./peca');

const ESQUERDA = 'esquerda';
const DIREITA = 'direita';
const PONTAS = [ESQUERDA, DIREITA];

class Mesa {
  constructor() {
    this.pecas = [];
  }

  estaVazia() {
    return this.pecas.length === 0;
  }

  pontas() {
    if (this.estaVazia()) {
      return null;
    }
    return {
      esquerda: this.pecas[0].a,
      direita: this.pecas[this.pecas.length - 1].b,
    };
  }

  pontasPossiveis(peca) {
    if (this.estaVazia()) {
      return [...PONTAS];
    }
    const pontas = this.pontas();
    return PONTAS.filter((ponta) => contemNumero(peca, pontas[ponta]));
  }

  // Coloca a peça girando-a, se preciso, para que o lado que encosta case com a ponta.
  colocar(peca, ponta) {
    if (this.estaVazia()) {
      this.pecas.push(peca);
      return peca;
    }
    if (!PONTAS.includes(ponta)) {
      throw new Error(`Ponta inválida: ${ponta}. Use "esquerda" ou "direita"`);
    }
    const valor = this.pontas()[ponta];
    if (!contemNumero(peca, valor)) {
      throw new Error(`A peça [${peca.a}|${peca.b}] não encaixa na ponta ${ponta} (${valor})`);
    }
    return ponta === DIREITA ? this.colocarDireita(peca, valor) : this.colocarEsquerda(peca, valor);
  }

  colocarDireita(peca, valor) {
    const orientada = peca.a === valor ? peca : girar(peca);
    this.pecas.push(orientada);
    return orientada;
  }

  colocarEsquerda(peca, valor) {
    const orientada = peca.b === valor ? peca : girar(peca);
    this.pecas.unshift(orientada);
    return orientada;
  }
}

module.exports = { Mesa, ESQUERDA, DIREITA, PONTAS };
