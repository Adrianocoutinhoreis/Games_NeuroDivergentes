/* ============================================================
   Home dos jogos — versão de APRESENTAÇÃO (GitHub Pages).
   Reproduz a tela de jogos do aluno, porém sem login, professor,
   perfis ou armazenamento: renderiza os cards e abre cada jogo numa
   camada (overlay) com botão "Voltar aos jogos".

   Os jogos ficam em ./games/<id>/ (cópia autossuficiente) e rodam
   isolados num iframe, com as configurações padrão (nível fácil).
   ============================================================ */

(function () {
    "use strict";

    // Mesmos jogos/ilustrações da home real do aluno (shared/js/student/home.js)
    var JOGOS = [
        {
            id: "soma",
            nome: "Jogo da Soma",
            descricao: "Aprenda a somar arrastando o número correto para o resultado da conta.",
            imagem: "games/assets/mascote/mascote01.png",
            botao: "duo-btn-green"
        },
        {
            id: "subtracao",
            nome: "Jogo da Subtração",
            descricao: "Aprenda a subtrair contando quantos desenhos sobraram e arrastando o número certo.",
            imagem: "games/assets/mascote/soma_mascote.png",
            botao: "duo-btn-blue"
        },
        {
            id: "multiplicacao",
            nome: "Jogo da Multiplicação",
            descricao: "Aprenda a multiplicar contando grupos iguais e arrastando o número certo do total.",
            imagem: "games/assets/mascote/mascote_multipli.png",
            botao: "duo-btn-pink"
        }
    ];

    var CARD_STEP = 418; // 390px do card + 28px de espaço entre eles

    var CHEVRON_ESQ = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
    var CHEVRON_DIR = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';

    function esc(texto) {
        return String(texto == null ? "" : texto)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    // ---------- Render ----------

    function render() {
        var app = document.getElementById("app");

        var cardsHtml = JOGOS.map(function (jogo) {
            return (
                '<div class="duo-game-card">' +
                '<h2 class="duo-card-title">' + esc(jogo.nome) + '</h2>' +
                '<div class="duo-card-illustration"><img src="' + jogo.imagem + '" alt="' + esc(jogo.nome) + '" /></div>' +
                '<p class="duo-card-subtitle">' + esc(jogo.descricao) + '</p>' +
                '<button class="duo-btn-play ' + jogo.botao + '" type="button" data-jogo="' + esc(jogo.id) + '" data-nome="' + esc(jogo.nome) + '">Jogar</button>' +
                '</div>'
            );
        }).join("");

        var dotsHtml = "";
        for (var i = 0; i < JOGOS.length; i++) {
            dotsHtml += '<span class="duo-dot ' + (i === 0 ? "active" : "") + '" data-index="' + i + '"></span>';
        }

        app.innerHTML =
            '<div class="duo-container">' +
            '<div class="duo-header-card">' +
            '<div class="duo-header-user">' +
            '<div class="duo-avatar">🐼</div>' +
            '<h1 class="duo-greeting">Olá! Vamos jogar?</h1>' +
            '</div>' +
            '<div class="duo-header-badges">' +
            '<span class="duo-badge">Atividades: 6 🏆</span>' +
            '<span class="duo-badge points-badge">1200 Pontos 💯</span>' +
            '<span class="duo-badge stars-badge">9 Estrelas ⭐️</span>' +
            '</div>' +
            '</div>' +

            '<div class="duo-carousel-wrapper">' +
            '<button class="duo-carousel-arrow prev" id="carousel-prev" type="button" aria-label="Ver jogo anterior">' + CHEVRON_ESQ + '</button>' +
            '<button class="duo-carousel-arrow next" id="carousel-next" type="button" aria-label="Ver próximo jogo">' + CHEVRON_DIR + '</button>' +
            '<div class="duo-carousel-track" id="carousel-track">' + cardsHtml + '</div>' +
            '<div class="duo-carousel-dots" id="carousel-dots">' + dotsHtml + '</div>' +
            '</div>' +
            '</div>';

        ligarCards();
        ligarCarrossel();
    }

    // ---------- Abrir/fechar o jogo (overlay com iframe) ----------

    function ligarCards() {
        var overlay = document.getElementById("play-overlay");
        var frame = document.getElementById("play-frame");
        var titulo = document.getElementById("play-title");
        var voltar = document.getElementById("play-back");

        document.querySelectorAll(".duo-btn-play").forEach(function (btn) {
            btn.addEventListener("click", function () {
                var id = btn.getAttribute("data-jogo");
                titulo.textContent = btn.getAttribute("data-nome");
                frame.src = "games/" + id + "/index.html";
                overlay.hidden = false;
                document.body.style.overflow = "hidden";
                voltar.focus();
            });
        });

        function fechar() {
            overlay.hidden = true;
            frame.src = "about:blank"; // interrompe som/estado do jogo
            document.body.style.overflow = "";
        }

        voltar.addEventListener("click", fechar);
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && !overlay.hidden) fechar();
        });
    }

    // ---------- Carrossel (setas + dots), igual à home do aluno ----------

    function ligarCarrossel() {
        var track = document.getElementById("carousel-track");
        var dots = document.querySelectorAll(".duo-dot");
        var prevBtn = document.getElementById("carousel-prev");
        var nextBtn = document.getElementById("carousel-next");
        if (!track) return;

        function sincronizar() {
            var index = Math.round(track.scrollLeft / CARD_STEP);
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });

            if (prevBtn && nextBtn) {
                var maxScroll = track.scrollWidth - track.clientWidth;
                var semRolagem = maxScroll <= 4;
                prevBtn.hidden = semRolagem;
                nextBtn.hidden = semRolagem;
                if (!semRolagem) {
                    prevBtn.disabled = track.scrollLeft <= 4;
                    nextBtn.disabled = track.scrollLeft >= maxScroll - 4;
                }
            }
        }

        track.addEventListener("scroll", sincronizar);
        window.addEventListener("resize", sincronizar);

        if (prevBtn) prevBtn.addEventListener("click", function () {
            track.scrollBy({ left: -CARD_STEP, behavior: "smooth" });
        });
        if (nextBtn) nextBtn.addEventListener("click", function () {
            track.scrollBy({ left: CARD_STEP, behavior: "smooth" });
        });

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var index = parseInt(dot.getAttribute("data-index"), 10);
                track.scrollTo({ left: index * CARD_STEP, behavior: "smooth" });
            });
        });

        sincronizar();
    }

    document.addEventListener("DOMContentLoaded", render);
})();
