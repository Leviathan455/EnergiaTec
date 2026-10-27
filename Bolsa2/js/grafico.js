// ============================================
// 1. CONFIGURAÇÕES
// ============================================

const AUMENTO_PORTA_ABERTA = 0.10;
const AUMENTO_MODO_QUENTE = 0.35;

const INTERVALO_MS = 500;
const LIMITE_PONTOS = 480;

// ============================================
// 2. ELEMENTOS DO HTML
// ============================================

const botaoEnergia = document.getElementById("gc-power");
const desenhoGeladeira = document.getElementById("gc-fridge");

const statusPorta = document.getElementById("gc-door-status");
const statusEnergia = document.getElementById("gc-power-status");
const pontoStatus = document.getElementById("gc-status-dot");
const valorWatts = document.getElementById("gc-watts");

const formularioPotencia = document.getElementById("gc-power-form");
const entradaPotencia = document.getElementById("gc-power-input");
const erroPotencia = document.getElementById("gc-power-error");

const elementoGrafico = document.getElementById("gc-chart");
const botaoPausaGrafico = document.getElementById("gc-chart-toggle");
const botaoChuveiroQuente = document.getElementById("gc-shower-hot");

const opcoesAparelho = document.querySelectorAll(
  'input[name="gc-appliance"]'
);

const tituloAparelho = document.getElementById("gc-appliance-title");

const descricaoAparelho = document.getElementById(
  "gc-appliance-description"
);

const cenaChuveiro = document.getElementById("gc-shower-scene");

const tituloGrafico = document.querySelector(
  ".gc-chart-header h2"
);

const linhaStatusPorta = statusPorta
  ? statusPorta.closest(".gc-status-item")
  : null;

const labelPotencia = formularioPotencia
  ? formularioPotencia.querySelector(
      'label[for="gc-power-input"]'
    )
  : null;

// Verifica os elementos necessários.

if (
  !botaoEnergia ||
  !desenhoGeladeira ||
  !statusPorta ||
  !statusEnergia ||
  !pontoStatus ||
  !valorWatts ||
  !formularioPotencia ||
  !entradaPotencia ||
  !erroPotencia ||
  !elementoGrafico ||
  !botaoPausaGrafico ||
  !botaoChuveiroQuente ||
  !tituloAparelho ||
  !descricaoAparelho ||
  !cenaChuveiro ||
  !labelPotencia ||
  opcoesAparelho.length === 0
) {
  throw new Error(
    "Confira os IDs dos elementos no HTML da simulação."
  );
}

if (typeof echarts === "undefined") {
  throw new Error("O Apache ECharts não foi carregado.");
}

// ============================================
// 3. ESTADO DOS APARELHOS
// ============================================

const aparelhos = {
  geladeira: {
    ligada: false,
    portaAberta: false,
    potenciaNormal: Number(entradaPotencia.value) || 150
  },

  chuveiro: {
    ligada: false,
    potenciaNormal: 5500,
    quente: false
  }
};

let aparelhoSelecionado = "geladeira";

// Controle da pausa.

let graficoPausado = false;
let tempoAcumuladoMs = 0;
let inicioTrechoMs = Date.now();

// Dados do gráfico.

const tempos = ["00:00"];
const potencias = [0];

// ============================================
// 4. FUNÇÕES AUXILIARES
// ============================================

function obterAparelhoAtual() {
  return aparelhos[aparelhoSelecionado];
}

function formatarTempo(segundos) {
  const minutos = Math.floor(segundos / 60);

  const segundosRestantes = (segundos % 60)
    .toFixed(1)
    .padStart(4, "0");

  return (
    String(minutos).padStart(2, "0") +
    ":" +
    segundosRestantes
  );
}

// ============================================
// 5. CÁLCULO DA POTÊNCIA
// ============================================

function obterPotencia() {
  const aparelho = obterAparelhoAtual();

  // Aparelho desligado: zero watts.
  if (!aparelho.ligada) {
    return 0;
  }

  // CHUVEIRO:
  // Normal = potência informada.
  // Quente = potência informada + 35%.
  if (aparelhoSelecionado === "chuveiro") {
    if (aparelho.quente) {
      return Math.round(
        aparelho.potenciaNormal *
        (1 + AUMENTO_MODO_QUENTE)
      );
    }

    return aparelho.potenciaNormal;
  }

  // GELADEIRA:
  // Porta aberta = aumento estimado de 10%.
  if (aparelho.portaAberta) {
    return Math.round(
      aparelho.potenciaNormal *
      (1 + AUMENTO_PORTA_ABERTA)
    );
  }

  return aparelho.potenciaNormal;
}

// ============================================
// 6. CONFIGURAÇÃO DO GRÁFICO
// ============================================

const grafico = echarts.init(elementoGrafico);

grafico.setOption({
  animationDuration: 200,
  animationDurationUpdate: 350,
  animationEasing: "linear",
  animationEasingUpdate: "linear",

  tooltip: {
    trigger: "axis",

    formatter: function (itens) {
      const item = itens[0];

      const valor = Number(item.data).toLocaleString(
        "pt-BR",
        {
          maximumFractionDigits: 1
        }
      );

      return (
        `Tempo: ${item.axisValue}<br>` +
        `Potência estimada: ${valor} W`
      );
    }
  },

  grid: {
    left: 60,
    right: 25,
    top: 30,
    bottom: 55
  },

  xAxis: {
    type: "category",
    name: "Tempo simulado",
    nameLocation: "middle",
    nameGap: 35,
    boundaryGap: false,
    data: [...tempos],

    axisLabel: {
      hideOverlap: true
    }
  },

  yAxis: {
    type: "value",
    name: "Potência estimada (W)",
    min: 0,
    max: 200,
    interval: 50
  },

  series: [
    {
      name: "Potência estimada",
      type: "line",
      smooth: 0.2,
      data: [...potencias],
      showSymbol: false,

      lineStyle: {
        width: 3,
        color: "#16834a"
      },

      areaStyle: {
        color: "rgba(22, 131, 74, 0.12)"
      }
    }
  ]
});

// ============================================
// 7. ATUALIZAÇÃO VISUAL DO GRÁFICO
// ============================================

function renderizarGrafico() {
  const aparelho = obterAparelhoAtual();

  const chuveiroSelecionado =
    aparelhoSelecionado === "chuveiro";

  const cor = chuveiroSelecionado
    ? (aparelho.quente ? "#ea580c" : "#0284c7")
    : "#16834a";

  const corArea = chuveiroSelecionado
    ? (
        aparelho.quente
          ? "rgba(234, 88, 12, 0.12)"
          : "rgba(2, 132, 199, 0.12)"
      )
    : "rgba(22, 131, 74, 0.12)";

  // Considera a potência máxima possível do aparelho.
  const multiplicadorMaximo = chuveiroSelecionado
    ? 1 + AUMENTO_MODO_QUENTE
    : 1 + AUMENTO_PORTA_ABERTA;

  const potenciaMaxima =
    aparelho.potenciaNormal * multiplicadorMaximo;

  const passoEixo = chuveiroSelecionado
    ? (potenciaMaxima > 6000 ? 1000 : 500)
    : 50;

  const limiteEixo = Math.max(
    passoEixo * 4,
    Math.ceil(
      (potenciaMaxima * 1.1) / passoEixo
    ) * passoEixo
  );

  grafico.setOption({
    xAxis: {
      data: [...tempos]
    },

    yAxis: {
      min: 0,
      max: limiteEixo,
      interval: passoEixo,
      name: "Potência estimada (W)"
    },

    series: [
      {
        data: [...potencias],

        lineStyle: {
          width: 3,
          color: cor
        },

        areaStyle: {
          color: corArea
        }
      }
    ]
  });
}

// ============================================
// 8. ATUALIZAÇÃO DO GRÁFICO E CONTADOR
// ============================================

function atualizarGrafico() {
  const potencia = obterPotencia();

  valorWatts.textContent = potencia.toLocaleString(
    "pt-BR",
    {
      maximumFractionDigits: 1
    }
  );

  // Durante a pausa, não altera o histórico.
  if (graficoPausado) {
    return;
  }

  const tempoDecorridoMs =
    tempoAcumuladoMs +
    (Date.now() - inicioTrechoMs);

  const segundos = tempoDecorridoMs / 1000;
  const tempoAtual = formatarTempo(segundos);

  const ultimoIndice = tempos.length - 1;

  // Atualiza o ponto atual ou acrescenta outro.
  if (tempoAtual === tempos[ultimoIndice]) {
    potencias[ultimoIndice] = potencia;
  } else {
    tempos.push(tempoAtual);
    potencias.push(potencia);
  }

  // Mantém apenas os últimos pontos.
  while (tempos.length > LIMITE_PONTOS) {
    tempos.shift();
    potencias.shift();
  }

  renderizarGrafico();
}

// ============================================
// 9. ATUALIZAÇÃO DA INTERFACE
// ============================================

function atualizarInterface() {
  const aparelho = obterAparelhoAtual();

  const chuveiroSelecionado =
    aparelhoSelecionado === "chuveiro";

  const nomeAparelho = chuveiroSelecionado
    ? "chuveiro"
    : "geladeira";

  // Botão principal de energia.
  botaoEnergia.textContent = aparelho.ligada
    ? `Desligar ${nomeAparelho}`
    : `Ligar ${nomeAparelho}`;

  // Estado do aparelho.
  statusEnergia.textContent = aparelho.ligada
    ? (chuveiroSelecionado ? "Ligado" : "Ligada")
    : (chuveiroSelecionado ? "Desligado" : "Desligada");

  pontoStatus.classList.toggle(
    "is-on",
    aparelho.ligada
  );

  // Título e descrição.
  tituloAparelho.textContent = chuveiroSelecionado
    ? "Meu chuveiro"
    : "Minha geladeira";

  descricaoAparelho.textContent = chuveiroSelecionado
    ? "Ligue o chuveiro e alterne entre os modos normal e quente."
    : "Clique na geladeira para abrir ou fechar a porta.";

  // Alterna as ilustrações.
  desenhoGeladeira.hidden = chuveiroSelecionado;
  cenaChuveiro.hidden = !chuveiroSelecionado;

  // A linha de status da porta só aparece na geladeira.
  if (linhaStatusPorta) {
    linhaStatusPorta.style.display =
      chuveiroSelecionado ? "none" : "";
  }

  statusPorta.textContent =
    aparelhos.geladeira.portaAberta
      ? "Porta aberta"
      : "Porta fechada";

  desenhoGeladeira.classList.toggle(
    "is-open",
    aparelhos.geladeira.portaAberta
  );

  desenhoGeladeira.setAttribute(
    "aria-label",
    aparelhos.geladeira.portaAberta
      ? "Fechar a porta da geladeira"
      : "Abrir a porta da geladeira"
  );

  desenhoGeladeira.setAttribute(
    "aria-pressed",
    String(aparelhos.geladeira.portaAberta)
  );

  // Campo de potência: funciona para os dois aparelhos.
  labelPotencia.textContent = chuveiroSelecionado
    ? "Potência normal do chuveiro (W)"
    : "Potência normal da geladeira (W)";

  entradaPotencia.max = chuveiroSelecionado
    ? "10000"
    : "2000";

  entradaPotencia.value = aparelho.potenciaNormal;

  // Botão de temperatura do chuveiro.
  botaoChuveiroQuente.textContent =
    aparelhos.chuveiro.quente
      ? "Usar modo normal (verão)"
      : "Ativar modo quente (inverno)";

  botaoChuveiroQuente.setAttribute(
    "aria-pressed",
    String(aparelhos.chuveiro.quente)
  );

  cenaChuveiro.classList.toggle(
    "is-hot",
    aparelhos.chuveiro.quente
  );

  // Título do gráfico.
  if (tituloGrafico) {
    tituloGrafico.textContent = chuveiroSelecionado
      ? "Gráfico de potência do chuveiro"
      : "Gráfico de potência da geladeira";
  }

  // Explicação contextual.
  const painelInformativo = document.querySelector(
    ".gc-info-panel"
  );

  if (painelInformativo) {
    const tituloInformativo =
      painelInformativo.querySelector("h3");

    const paragrafos =
      painelInformativo.querySelectorAll("p");

    if (tituloInformativo) {
      tituloInformativo.textContent = "Como funciona?";
    }

    if (paragrafos[0]) {
      paragrafos[0].textContent = chuveiroSelecionado
        ? "A potência informada corresponde ao modo normal (verão) do chuveiro."
        : "Com a porta fechada, o gráfico utiliza a potência normal informada.";
    }

    if (paragrafos[1]) {
      paragrafos[1].textContent = chuveiroSelecionado
        ? "No modo quente (inverno), a simulação estima um aumento de 35% na potência."
        : "Com a porta aberta, a simulação estima um aumento de 10% na potência.";
    }
  }

  const aviso = document.querySelector(".gc-disclaimer");

  if (aviso) {
    aviso.textContent = chuveiroSelecionado
      ? "O aumento de 35% é uma estimativa educativa. A diferença real depende do modelo do chuveiro e das condições de uso."
      : "O aumento de 10% é uma estimativa ilustrativa. O consumo real depende do modelo da geladeira e das condições de uso.";
  }

  // Atualiza o valor e o gráfico.
  atualizarGrafico();
}

// ============================================
// 10. BOTÃO DE ÁGUA QUENTE
// ============================================

botaoChuveiroQuente.addEventListener(
  "click",
  function () {
    aparelhos.chuveiro.quente =
      !aparelhos.chuveiro.quente;

    atualizarInterface();
  }
);

// ============================================
// 11. LIGAR E DESLIGAR O APARELHO
// ============================================

botaoEnergia.addEventListener(
  "click",
  function () {
    const aparelho = obterAparelhoAtual();

    // Altera apenas o estado de ligado/desligado.
    // O modo escolhido no chuveiro é preservado.
    aparelho.ligada = !aparelho.ligada;

    atualizarInterface();
  }
);

// ============================================
// 12. ABRIR E FECHAR A PORTA DA GELADEIRA
// ============================================

desenhoGeladeira.addEventListener(
  "click",
  function () {
    if (aparelhoSelecionado !== "geladeira") {
      return;
    }

    aparelhos.geladeira.portaAberta =
      !aparelhos.geladeira.portaAberta;

    atualizarInterface();
  }
);

// ============================================
// 13. ALTERAR A POTÊNCIA
// ============================================

formularioPotencia.addEventListener(
  "submit",
  function (evento) {
    evento.preventDefault();

    const valor = Number(entradaPotencia.value);

    const valorMaximo =
      aparelhoSelecionado === "chuveiro"
        ? 10000
        : 2000;

    if (
      !Number.isFinite(valor) ||
      valor < 1 ||
      valor > valorMaximo
    ) {
      erroPotencia.textContent =
        `Digite uma potência entre 1 e ${valorMaximo} W.`;

      return;
    }

    // Aplica a potência somente ao aparelho selecionado.
    obterAparelhoAtual().potenciaNormal = valor;

    erroPotencia.textContent = "";

    atualizarInterface();
  }
);

// ============================================
// 14. TROCAR ENTRE GELADEIRA E CHUVEIRO
// ============================================

opcoesAparelho.forEach(function (opcao) {
  opcao.addEventListener(
    "change",
    function () {
      if (!opcao.checked) {
        return;
      }

      if (
        opcao.value !== "geladeira" &&
        opcao.value !== "chuveiro"
      ) {
        return;
      }

      if (opcao.value === aparelhoSelecionado) {
        return;
      }

      aparelhoSelecionado = opcao.value;

      // Reinicia o histórico para não misturar aparelhos.
      tempos.splice(0, tempos.length, "00:00");
      potencias.splice(
        0,
        potencias.length,
        obterPotencia()
      );

      tempoAcumuladoMs = 0;
      inicioTrechoMs = Date.now();

      erroPotencia.textContent = "";

      atualizarInterface();
    }
  );
});

// ============================================
// 15. PAUSAR E RETOMAR O GRÁFICO
// ============================================

botaoPausaGrafico.addEventListener(
  "click",
  function () {
    if (!graficoPausado) {
      // Guarda o tempo acumulado antes da pausa.
      tempoAcumuladoMs +=
        Date.now() - inicioTrechoMs;

      graficoPausado = true;

      botaoPausaGrafico.textContent =
        "Retomar gráfico";

      botaoPausaGrafico.setAttribute(
        "aria-pressed",
        "true"
      );

      // Congela o último ponto registrado.
      renderizarGrafico();
    } else {
      // Continua a partir do tempo anterior.
      inicioTrechoMs = Date.now();
      graficoPausado = false;

      botaoPausaGrafico.textContent =
        "Pausar gráfico";

      botaoPausaGrafico.setAttribute(
        "aria-pressed",
        "false"
      );

      atualizarGrafico();
    }
  }
);

// ============================================
// 16. INICIAR A SIMULAÇÃO
// ============================================

atualizarInterface();

const intervaloSimulacao = setInterval(
  function () {
    if (!graficoPausado) {
      atualizarGrafico();
    }
  },
  INTERVALO_MS
);

// Redimensionar o gráfico.
window.addEventListener(
  "resize",
  function () {
    grafico.resize();
  }
);

// Limpar temporizador ao sair da página.
window.addEventListener(
  "pagehide",
  function () {
    clearInterval(intervaloSimulacao);
  }
);