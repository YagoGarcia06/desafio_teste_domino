const { ehDupla, mesmaPeca, compararPecas, valorPeca, textoPeca } = require('./peca');
const { criarConjunto, embaralhar, distribuir, QUANTIDADE_JOGADORES } = require('./conjunto');
const { Mesa, DIREITA } = require('./mesa');

const BATIDA = 'batida';
const TRANCADO = 'trancado';
const PASSES_PARA_TRANCAR = 2;

class Partida {
  constructor({ rng, ordem, jogadores = QUANTIDADE_JOGADORES } = {}) {
    if (jogadores !== QUANTIDADE_JOGADORES) {
      throw new Error('A partida de dominó exige exatamente 2 jogadores');
    }
    const { maos, monte } = distribuir(Partida.ordemInicial(rng, ordem));
    this.maos = maos;
    this.monte = monte;
    this.mesa = new Mesa();
    this.passesSeguidos = 0;
    this.resultado = null;
    this.definirInicio();
  }

  static ordemInicial(rng, ordem) {
    if (ordem !== undefined) {
      return ordem;
    }
    if (rng === undefined) {
      throw new Error('Informe um rng ou uma ordem de peças para criar a partida');
    }
    return embaralhar(criarConjunto(), rng);
  }

  // Maior duplo nas mãos; sem duplos, a maior peça (soma e, no empate, maior lado).
  definirInicio() {
    const todas = this.maos.flat();
    const duplas = todas.filter(ehDupla);
    const candidatas = duplas.length > 0 ? duplas : todas;
    const maior = candidatas.reduce((atual, peca) => (compararPecas(peca, atual) > 0 ? peca : atual));
    this.primeiraJogada = maior;
    this.jogadorAtual = this.maos.findIndex((mao) => mao.some((p) => mesmaPeca(p, maior)));
  }

  get encerrada() {
    return this.resultado !== null;
  }

  mao(jogador) {
    this.validarJogador(jogador);
    return [...this.maos[jogador]];
  }

  pontas() {
    return this.mesa.pontas();
  }

  pecasNaMesa() {
    return [...this.mesa.pecas];
  }

  pecasNoMonte() {
    return this.monte.length;
  }

  somaMao(jogador) {
    return this.mao(jogador).reduce((total, peca) => total + valorPeca(peca), 0);
  }

  pecasJogaveis(jogador) {
    const mao = this.mao(jogador);
    if (this.mesa.estaVazia()) {
      return mao.filter((peca) => mesmaPeca(peca, this.primeiraJogada));
    }
    return mao.filter((peca) => this.mesa.pontasPossiveis(peca).length > 0);
  }

  temJogada(jogador) {
    return this.pecasJogaveis(jogador).length > 0;
  }

  jogar(jogador, peca, ponta) {
    if (peca === null || typeof peca !== 'object') {
      throw new Error('Informe a peça a jogar');
    }
    this.validarAcao(jogador);
    const indice = this.maos[jogador].findIndex((p) => mesmaPeca(p, peca));
    if (indice === -1) {
      throw new Error(`A peça ${textoPeca(peca)} não está na mão do jogador ${jogador}`);
    }
    const daMao = this.maos[jogador][indice];
    if (this.mesa.estaVazia()) {
      this.validarPrimeiraJogada(daMao);
      this.mesa.colocar(daMao);
    } else {
      this.mesa.colocar(daMao, ponta ?? this.pontaAutomatica(daMao));
    }
    this.maos[jogador].splice(indice, 1);
    this.passesSeguidos = 0;
    if (this.maos[jogador].length === 0) {
      this.encerrar(BATIDA, jogador);
    } else {
      this.passarVez();
    }
  }

  comprar(jogador) {
    this.validarAcao(jogador);
    if (this.temJogada(jogador)) {
      throw new Error(`O jogador ${jogador} tem peça jogável e não pode comprar`);
    }
    if (this.monte.length === 0) {
      throw new Error('O monte está vazio');
    }
    const peca = this.monte.shift();
    this.maos[jogador].push(peca);
    return peca;
  }

  passar(jogador) {
    this.validarAcao(jogador);
    if (this.temJogada(jogador)) {
      throw new Error(`O jogador ${jogador} tem peça jogável e não pode passar`);
    }
    if (this.monte.length > 0) {
      throw new Error('Só é possível passar com o monte vazio');
    }
    this.passesSeguidos += 1;
    if (this.passesSeguidos === PASSES_PARA_TRANCAR) {
      this.encerrarTrancado();
    } else {
      this.passarVez();
    }
  }

  validarJogador(jogador) {
    if (jogador !== 0 && jogador !== 1) {
      throw new Error(`Jogador inválido: ${jogador}. Use 0 ou 1`);
    }
  }

  validarAcao(jogador) {
    if (this.encerrada) {
      throw new Error('A partida já terminou');
    }
    this.validarJogador(jogador);
    if (jogador !== this.jogadorAtual) {
      throw new Error(`Não é a vez do jogador ${jogador}`);
    }
  }

  validarPrimeiraJogada(peca) {
    if (!mesmaPeca(peca, this.primeiraJogada)) {
      throw new Error(`A primeira jogada deve ser ${textoPeca(this.primeiraJogada)}`);
    }
  }

  pontaAutomatica(peca) {
    const possiveis = this.mesa.pontasPossiveis(peca);
    if (possiveis.length === 0) {
      throw new Error(`A peça ${textoPeca(peca)} não encaixa em nenhuma ponta da mesa`);
    }
    const { esquerda, direita } = this.mesa.pontas();
    if (possiveis.length === 2 && esquerda !== direita) {
      throw new Error(`A peça ${textoPeca(peca)} encaixa nas duas pontas: informe "esquerda" ou "direita"`);
    }
    return possiveis.includes(DIREITA) ? DIREITA : possiveis[0];
  }

  passarVez() {
    this.jogadorAtual = 1 - this.jogadorAtual;
  }

  encerrarTrancado() {
    const soma0 = this.somaMao(0);
    const soma1 = this.somaMao(1);
    if (soma0 === soma1) {
      this.encerrar(TRANCADO, null);
    } else {
      this.encerrar(TRANCADO, soma0 < soma1 ? 0 : 1);
    }
  }

  encerrar(motivo, vencedor) {
    const pontos = vencedor === null ? 0 : this.somaMao(1 - vencedor);
    this.resultado = { motivo, vencedor, pontos };
  }
}

module.exports = { Partida, BATIDA, TRANCADO };
