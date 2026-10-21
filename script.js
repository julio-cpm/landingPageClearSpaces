const raiz = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const metaCor = document.querySelector('meta[name="theme-color"]');

function aplicarTema(escuro) {
    raiz.classList.toggle("dark-mode", escuro);
    themeToggle.setAttribute("aria-label", escuro ? "Ativar tema claro" : "Ativar tema escuro");
    themeToggle.setAttribute("aria-pressed", String(escuro));
    if (metaCor) metaCor.setAttribute("content", escuro ? "#09141f" : "#f4f8fc");
}

function temaSalvo() {
    try { return localStorage.getItem("tema"); } catch (e) { return null; }
}

function salvarTema(escuro) {
    try { localStorage.setItem("tema", escuro ? "escuro" : "claro"); } catch (e) {}
}

const prefereEscuro = matchMedia("(prefers-color-scheme: dark)");
aplicarTema(temaSalvo() ? temaSalvo() === "escuro" : prefereEscuro.matches);

prefereEscuro.addEventListener("change", function (e) {
    if (!temaSalvo()) aplicarTema(e.matches);
});

/* ===== TRANSIÇÃO CIRCULAR EM TELA CHEIA ===== */
themeToggle.addEventListener("click", function (e) {
    /* Reinicia a animação do botão a cada clique */
    themeToggle.classList.remove("is-changing");
    void themeToggle.offsetWidth;
    themeToggle.classList.add("is-changing");
    themeToggle.addEventListener("animationend", function removerAnimacao(event) {
        if (event.animationName === "themeButtonPulse") {
            themeToggle.classList.remove("is-changing");
            themeToggle.removeEventListener("animationend", removerAnimacao);
        }
    });

    const escuro = !raiz.classList.contains("dark-mode");
    const trocar = function () {
        aplicarTema(escuro);
        salvarTema(escuro);
    };

    /* Se o navegador não suportar View Transitions ou o usuário pedir menos movimento */
    if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) {
        trocar();
        return;
    }

    /* Pega a posição do clique ou do botão */
    const rect = themeToggle.getBoundingClientRect();
    const x = e.clientX || (rect.left + rect.width / 2);
    const y = e.clientY || (rect.top + rect.height / 2);

    /* Raio até o canto mais distante da tela */
    const raioFinal = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
    );

    /* Dispara a transição de tela */
    const transicao = document.startViewTransition(trocar);

    transicao.ready.then(function () {
        raiz.animate(
            {
                clipPath: [
                    "circle(0px at " + x + "px " + y + "px)",
                    "circle(" + raioFinal + "px at " + x + "px " + y + "px)"
                ]
            },
            {
                duration: 700,
                easing: "cubic-bezier(0.4, 0, 0.2, 1)",
                pseudoElement: "::view-transition-new(root)"
            }
        );
    });
});

/* ===== MENU NO CELULAR ===== */
const header = document.querySelector(".header");
const menuToggle = document.getElementById("menuToggle");

function menu(abrir) {
    if (!header || !menuToggle) return;
    header.classList.toggle("menu-open", abrir);
    menuToggle.setAttribute("aria-expanded", String(abrir));
    menuToggle.setAttribute("aria-label", abrir ? "Fechar menu" : "Abrir menu");
}

if (menuToggle) {
    menuToggle.addEventListener("click", function () {
        menu(!header.classList.contains("menu-open"));
    });
}
document.querySelectorAll("#menu a").forEach(function (a) {
    a.addEventListener("click", function () { menu(false); });
});
document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") menu(false);
});

/* Sombra no cabeçalho */
function sombraHeader() {
    if (header) header.classList.toggle("scrolled", scrollY > 8);
}
sombraHeader();
addEventListener("scroll", sombraHeader, { passive: true });

/* ===== ANTES E DEPOIS ===== */
const compare = document.getElementById("compare");
const cmpRange = document.getElementById("cmpRange");

if (compare && cmpRange) {
    cmpRange.addEventListener("input", function () {
        compare.style.setProperty("--p", cmpRange.value + "%");
    });
}

/* ===== DIÁLOGO MODAL ===== */
const botao = document.getElementById("btnMensagem");
const dialogo = document.getElementById("dialogo");

if (botao && dialogo) {
    botao.addEventListener("click", function () { dialogo.showModal(); });
    document.getElementById("dialogoFechar").addEventListener("click", function () { dialogo.close(); });
    dialogo.addEventListener("click", function (e) {
        if (e.target === dialogo) dialogo.close();
    });
}

/* ===== FUNÇÕES DA EQUIPE ===== */
document.querySelectorAll('.team-card').forEach(function (card) {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-expanded', 'false');
    function alternarFuncoes() {
        const role = card.querySelector('.team-role');
        if (!role) return;
        const abrir = role.hidden;
        role.hidden = !abrir;
        card.classList.toggle('active', abrir);
        card.setAttribute('aria-expanded', String(abrir));
    }
    card.addEventListener('click', alternarFuncoes);
    card.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            alternarFuncoes();
        }
    });
});
