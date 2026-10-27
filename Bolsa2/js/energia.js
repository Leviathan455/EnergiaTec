function money(x) {
  return "R$ " + x.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function kg(x) {
  return x.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }) + " kg";
}

// =========================================================
// NAVBAR / SCROLLSPY
// =========================================================

var nav = document.querySelector("nav");
var navLinks = document.querySelectorAll("nav a");
var sections = document.querySelectorAll("section[id]");

// Primeira seção ativa ao abrir a página
if (navLinks.length > 0) {
  navLinks[0].classList.add("active");
}


// Navbar ganha destaque conforme o usuário começa a rolar

window.addEventListener("scroll", function() {
  if (window.scrollY > 40) {
    nav.classList.add("nav-scrolled");
  } else {
    nav.classList.remove("nav-scrolled");
  }
});


// Clique nos botões da navbar com rolagem suave

navLinks.forEach(function(link) {

  link.addEventListener("click", function(event) {

    event.preventDefault();

    var targetId = link.getAttribute("href");
    var target = document.querySelector(targetId);

    if (!target) {
      return;
    }

    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  });

});


// Detecta qual seção está sendo visualizada

var observer = new IntersectionObserver(
  function(entries) {

    entries.forEach(function(entry) {

      if (!entry.isIntersecting) {
        return;
      }

      // Remove o destaque de todos os links
      navLinks.forEach(function(link) {
        link.classList.remove("active");
      });

      // Encontra o link correspondente à seção
      var activeLink = document.querySelector(
        'nav a[href="#' + entry.target.id + '"]'
      );

      if (activeLink) {

        activeLink.classList.add("active");

        // Centraliza somente horizontalmente
        // o botão ativo dentro da navbar
        var navCenter = nav.clientWidth / 2;

        var linkCenter =
          activeLink.offsetLeft +
          activeLink.offsetWidth / 2;

        nav.scrollTo({
          left: linkCenter - navCenter,
          behavior: "smooth"
        });
      }

    });

  },
  {
    root: null,

    // Define uma região central da tela
    // onde a seção será considerada ativa
    rootMargin: "-20% 0px -65% 0px",

    threshold: 0
  }
);


// Começa a observar todas as seções

sections.forEach(function(section) {
  observer.observe(section);
});


// 1. perdas

var PT = 1 - (1 - 0.025) * (1 - 0.072);
// perda técnica combinada ≈9,52%

function calc1() {
  var k = +document.getElementById("kwh1").value;

  document.getElementById("kwhOut1").textContent = k + " kWh";

  var ger = k / (1 - PT);
  var perd = ger - k;

  document.getElementById("gerado").textContent =
    ger.toFixed(1) + " kWh";

  document.getElementById("perdido").textContent =
    perd.toFixed(1) + " kWh";

  document.getElementById("perdidoComp").textContent =
    (perd / 0.73).toFixed(1) + " banhos de chuveiro de 8 min";
}

document.getElementById("kwh1").addEventListener("input", calc1);


// 2. desperdicio

var W = [
  [
    "Modo stand-by",
    "TVs, carregadores e consoles ligados na tomada 24h consomem mesmo 'desligados'."
  ],
  [
    "Lâmpadas incandescentes",
    "Gastam até 80% mais energia que LED para a mesma luminosidade."
  ],
  [
    "Geladeira mal vedada",
    "Borracha da porta gasta deixa o ar frio escapar e o compressor trabalhar mais."
  ],
  [
    "Chuveiro no inverno o dia todo",
    "Posição de maior potência ligada sem necessidade aquece água que esfria antes do banho."
  ],
  [
    "Ar-condicionado mal dimensionado ou sujo",
    "Filtro sujo faz o aparelho consumir bem mais para o mesmo resfriamento."
  ],
  [
    "Equipamentos sem selo Procel",
    "Modelos antigos ou sem etiqueta costumam ser bem menos eficientes."
  ]
];

function calc2() {
  var h = "";

  W.forEach(function(w, i) {
    h +=
      '<label class="chk">' +
        '<input type="checkbox" data-i="' + i + '">' +
        '<span>' +
          '<b>' + w[0] + '</b>' +
          '<span>' + w[1] + '</span>' +
        '</span>' +
      '</label>';
  });

  document.getElementById("waste").innerHTML = h;

  updateTally();
}

function updateTally() {
  var n = document.querySelectorAll("#waste input:checked").length;

  document.getElementById("tally").textContent =
    "Você já evita " + n + " de " + W.length +
    " formas comuns de desperdício.";
}

document.addEventListener("change", function(e) {
  if (e.target.matches("#waste input")) {
    updateTally();
  }
});


// 3. custo

var TARIFA = 1.20;
var PERDA_TOTAL = 0.143;

function calc3() {
  var k = +document.getElementById("kwh2").value;

  document.getElementById("kwhOut2").textContent =
    k + " kWh";

  var custo = k * TARIFA;

  document.getElementById("custoE").textContent =
    money(custo);

  document.getElementById("custoPerda").textContent =
    money(custo * PERDA_TOTAL);
}

document.getElementById("kwh2").addEventListener("input", calc3);


// 4. CO2

var fatorCO2 = 0.07;

function calc4() {
  var k = +document.getElementById("kwh3").value;

  document.getElementById("kwhOut3").textContent =
    k + " kWh";

  var mes = k * fatorCO2;
  var ano = mes * 12;

  document.getElementById("co2mes").textContent =
    kg(mes);

  document.getElementById("co2ano").textContent =
    kg(ano);

  document.getElementById("co2km").textContent =
    (ano / 0.12).toFixed(0) + " km de carro";
  // ~120g CO2/km carro médio

  calc5(ano);
}

document.getElementById("kwh3").addEventListener("input", calc4);

document.querySelectorAll("#matrizSeg button").forEach(function(b) {
  b.addEventListener("click", function() {

    document
      .querySelectorAll("#matrizSeg button")
      .forEach(function(x) {
        x.classList.remove("on");
      });

    b.classList.add("on");

    fatorCO2 = +b.dataset.f;

    calc4();
  });
});


// 5. clima

function sci(x) {
  var s = x.toExponential(2);
  var parts = s.split("e");

  var mant = parts[0].replace(".", ",");
  var exp = parseInt(parts[1], 10);

  var sup = {
    "-": "⁻",
    "0": "⁰",
    "1": "¹",
    "2": "²",
    "3": "³",
    "4": "⁴",
    "5": "⁵",
    "6": "⁶",
    "7": "⁷",
    "8": "⁸",
    "9": "⁹"
  };

  var expStr = String(exp)
    .split("")
    .map(function(c) {
      return sup[c] || c;
    })
    .join("");

  return mant + " × 10" + expStr;
}

var EMISSAO_GLOBAL_T = 37e9;
// tCO2/ano

var TCRE = 0.45 / 1000;
// °C por GtCO2 => 0.00045 °C/GtCO2

var DROP_FRACTION = 2e-11;
// 1 gota (~0,05 mL) numa piscina olímpica de 2.500.000 L

function calc5(anoKg) {

  var anoT = anoKg / 1000;

  document.getElementById("pegadaAno").textContent =
    kg(anoKg) + " CO₂eq";

  var fracao = anoT / EMISSAO_GLOBAL_T;

  document.getElementById("fracaoGlobal").textContent =
    (fracao * 1e12).toFixed(2) + " por trilhão";

  var gotas = fracao / DROP_FRACTION;

  var txt;

  if (gotas < 1) {
    txt = "Menos que 1 gota de água numa piscina olímpica inteira 🏊";
  } else if (gotas < 1000) {
    txt = "≈" + gotas.toFixed(0) +
      " gotas de água numa piscina olímpica 🏊";
  } else {
    txt = "≈" + (gotas / 1000).toFixed(1) +
      " mil gotas numa piscina olímpica 🏊";
  }

  document.getElementById("deltaT").textContent = txt;

  var dT = (anoT / 1e9) * TCRE;

  document.getElementById("deltaTNote").textContent =
    "Pra quem quer o número exato: isso equivale a " +
    sci(dT) +
    " °C de aquecimento (método TCRE) — quase impossível de medir sozinho, " +
    "por isso a comparação com a piscina.";
}


// 6. sensação térmica

function heatIndexC(tC, rh) {

  var tF = tC * 9 / 5 + 32;

  if (tF < 80) {
    return tC;
  }

  var hi =
    -42.379 +
    2.04901523 * tF +
    10.14333127 * rh -
    0.22475541 * tF * rh -
    0.00683783 * tF * tF -
    0.05481717 * rh * rh +
    0.00122874 * tF * tF * rh +
    0.00085282 * tF * rh * rh -
    0.00000199 * tF * tF * rh * rh;

  return (hi - 32) * 5 / 9;
}

function calc6() {

  var t = +document.getElementById("temp").value;
  var h = +document.getElementById("hum").value;

  document.getElementById("tempOut").textContent =
    t + " °C";

  document.getElementById("humOut").textContent =
    h + "%";

  var hi = heatIndexC(t, h);
  var diff = hi - t;

  document.getElementById("heatIdx").textContent =
    hi.toFixed(1) + " °C";

  document.getElementById("heatDiff").textContent =
    (diff >= 0 ? "+" : "") +
    diff.toFixed(1) + " °C";
}

document.getElementById("temp").addEventListener("input", calc6);
document.getElementById("hum").addEventListener("input", calc6);


// Inicialização

calc1();
calc2();
calc3();
calc4();
calc6();