// =====================================================
// CALCULADORA DE CONSUMO DE ENERGIA
// =====================================================


// -----------------------------------------------------
// CONFIGURAÇÃO
// -----------------------------------------------------

// Tarifa padrão utilizada na calculadora (R$/kWh)
const TARIFA_PADRAO = 0.80;


// Potência estimada dos aparelhos em Watts (W)
const aparelhos = {
    geladeira: 450,
    chuveiro: 5500,
    forno: 2000,
    freezer: 200,
    airfryer: 1400,
    microondas: 1200,
    televisao: 120,
    computador: 300,
    ventilador: 100,
    arcondicionado: 1500
};


// -----------------------------------------------------
// ELEMENTOS DO HTML
// -----------------------------------------------------

const aparelho = document.getElementById("aparelho");

const horas = document.getElementById("horas");

const minutos = document.getElementById("minutos");

const tarifa = document.getElementById("tarifa");

const btnCalcular = document.getElementById("btnCalcular");

const potenciaResultado =
    document.getElementById("potenciaResultado");

const tempoResultado =
    document.getElementById("tempoResultado");

const consumoResultado =
    document.getElementById("consumoResultado");

const custoResultado =
    document.getElementById("custoResultado");


// -----------------------------------------------------
// CONFIGURAÇÃO INICIAL
// -----------------------------------------------------

// Define a tarifa padrão
tarifa.value = TARIFA_PADRAO;


// -----------------------------------------------------
// EVENTO DO BOTÃO
// -----------------------------------------------------

btnCalcular.addEventListener("click", calcularEnergia);


// -----------------------------------------------------
// FUNÇÃO PRINCIPAL
// -----------------------------------------------------

function calcularEnergia() {

    // Verifica se um aparelho foi selecionado
    if (aparelho.value === "") {
        alert("Selecione um aparelho.");
        return;
    }


    // Busca a potência do aparelho selecionado
    const potencia = aparelhos[aparelho.value];


    // Converte os valores informados para números
    const horasUso = Number(horas.value);
    const minutosUso = Number(minutos.value);
    const valorTarifa = Number(tarifa.value);


    // -------------------------------------------------
    // VALIDAÇÕES
    // -------------------------------------------------

    // Verifica se os valores são números válidos
    if (
        !Number.isFinite(horasUso) ||
        !Number.isFinite(minutosUso) ||
        !Number.isFinite(valorTarifa)
    ) {
        alert("Preencha todos os campos corretamente.");
        return;
    }


    // Verifica se o tempo é válido
    if (
        horasUso < 0 ||
        minutosUso < 0 ||
        minutosUso > 59
    ) {
        alert("Informe um tempo válido.");
        return;
    }


    // Verifica se a tarifa é válida
    if (valorTarifa < 0) {
        alert("Informe uma tarifa válida.");
        return;
    }


    // Verifica se existe tempo de utilização
    if (horasUso === 0 && minutosUso === 0) {
        alert("Informe um tempo de uso maior que zero.");
        return;
    }


    // -------------------------------------------------
    // CÁLCULO DO TEMPO
    // -------------------------------------------------

    // Converte os minutos para horas
    const tempoEmHoras =
        horasUso + (minutosUso / 60);


    // -------------------------------------------------
    // CÁLCULO DO CONSUMO
    // -------------------------------------------------

    /*
        Fórmula:

        Consumo (kWh) =
        Potência (W) × Tempo (h) ÷ 1000
    */

    const consumo =
        (potencia * tempoEmHoras) / 1000;


    // -------------------------------------------------
    // CÁLCULO DO CUSTO
    // -------------------------------------------------

    /*
        Fórmula:

        Custo =
        Consumo (kWh) × Tarifa (R$/kWh)
    */

    const custo =
        consumo * valorTarifa;


    // -------------------------------------------------
    // ATUALIZAÇÃO DOS RESULTADOS
    // -------------------------------------------------

    // Potência
    potenciaResultado.textContent =
        `${formatarNumero(potencia)} W`;


    // Tempo
    tempoResultado.textContent =
        `${formatarNumero(tempoEmHoras)} h`;


    // Consumo
    consumoResultado.textContent =
        `${formatarNumero(consumo)} kWh`;


    // Custo
    custoResultado.textContent =
        formatarMoeda(custo);
}


// -----------------------------------------------------
// FORMATAÇÃO DE NÚMEROS
// -----------------------------------------------------

function formatarNumero(valor) {

    return valor.toLocaleString("pt-BR", {
        maximumFractionDigits: 2
    });
}


// -----------------------------------------------------
// FORMATAÇÃO DE MOEDA
// -----------------------------------------------------

function formatarMoeda(valor) {

    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}
