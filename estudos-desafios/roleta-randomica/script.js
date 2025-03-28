document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("whell");
    const ctx = canvas ? canvas.getContext("2d") : null;
    const premiosTextarea = document.getElementById("roletapremios");
    const botaoRoleta = document.getElementById("botaoRoleta");
    const botaoGirar = document.getElementById("botaoGirar");
    const botaoTelaInicial = document.getElementById("botaoTelaInicial");
    const popup = document.getElementById("popup");
    const popupAlerta = document.getElementById("popupAlerta");
    const fecharPopup = document.getElementById("fecharPopup");
    const resultElement = document.getElementById("result");  
    let premios = [];
    let anguloAtual = 0;
    let girando = false;

    if (!canvas || !ctx) {
        console.error("Canvas não encontrado ou contexto não disponível.");
        return;
    }

    fecharPopup.addEventListener("click", function () {
        popup.classList.remove("abrirPopup");
    });

    botaoRoleta.addEventListener("click", function () {
        premios = premiosTextarea.value.split("\n").filter(item => item.trim() !== "");
        if (premios.length > 1) {
            desenharRoleta();
            document.getElementById('container-entrada').style.display = 'none'; 
            document.getElementById('roletaContainer').classList.remove('oculto');
        } else {
            popupAlerta.innerHTML = `<strong>Por favor, insira pelo menos dois prêmios válidos.</strong>`;
            popup.classList.add("abrirPopup");
        }
    });

    // Função para desenhar a roleta
    function desenharRoleta() {
        const numPremios = premios.length;
        const tamanhoPorcao = 2 * Math.PI / numPremios;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        premios.forEach((premio, i) => {
            const anguloInicial = i * tamanhoPorcao;
            const anguloFinal = anguloInicial + tamanhoPorcao;
            // Define a cor aleatória
            ctx.fillStyle = `hsl(${i * (360 / numPremios)}, 100%, 70%)`;

            // Desenha cada fatia da roleta
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, canvas.height / 2);
            ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, anguloInicial, anguloFinal);
            ctx.lineTo(canvas.width / 2, canvas.height / 2);
            ctx.fill();

            // Adiciona o texto de cada prêmio, ajustando o tamanho da fonte dinamicamente
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(anguloInicial + tamanhoPorcao / 2);
            ctx.textAlign = "right";
            ctx.fillStyle = "#000";
            ctx.font = `${Math.min(20, canvas.width / 15)}px Arial`; 
            ctx.fillText(premio, canvas.width / 2 - 10, 10);
            ctx.restore();
        });
    }

    // Função  para suavizar a rotação
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    botaoGirar.addEventListener("click", function () {
        if (girando) return; // Evita múltiplos cliques
        girando = true;
        botaoGirar.disabled = true; 
        audioRoleta.play();

        const tempoRotacao = 6400; 
        //Math.random() * 360 um valor aleatório entre 0 e 360, para garantir que a roleta pare em uma posição aleatória.
        const anguloRotacao = Math.random() * 360 + 360 * 10; 
        
        const anguloFinal = (anguloAtual + anguloRotacao) % 360;

        const inicio = performance.now();
        requestAnimationFrame(function animar(timestamp) {
            const progresso = easeOutCubic((timestamp - inicio) / tempoRotacao);
            const angulo = anguloAtual + progresso * anguloRotacao;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((angulo * Math.PI) / 180);
            ctx.translate(-canvas.width / 2, -canvas.height / 2);
            desenharRoleta();
            ctx.restore();

            if (progresso < 1) {
                requestAnimationFrame(animar);
            } else {
                anguloAtual = anguloFinal;
                mostrarResultado();
                girando = false;
                botaoGirar.disabled = false; 
            }
        });
    });

    function mostrarResultado() {
        const numPremios = premios.length;
        const anguloPorPremio = 360 / numPremios;
        const premioIdx = Math.floor((360 - anguloAtual) / anguloPorPremio) % numPremios;
        const premio = premios[premioIdx];

        resultElement.innerHTML = `🎉<strong>${premio}</strong>🎉`;
        botaoGirar.addEventListener("click", function(){
            resultElement.innerText = '';
        })
        triggerConfetti();
    }

    botaoTelaInicial.addEventListener('click', function () {
        document.getElementById('container-entrada').style.display = 'flex'; 
        document.getElementById('roletaContainer').classList.add('oculto'); 
        resultElement.innerText = '';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        premios = [];
        document.querySelectorAll('input').forEach((input) => (input.value = ''));
    });

    function triggerConfetti() {
        let params = {
            particleCount: 500, 
            spread: 90, 
            startVelocity: 70, 
            origin: { x: 0, y: 0.5 }, 
            angle: 45 
        };
        confetti(params);
        params.origin.x = 1;
        params.angle = 135;
        confetti(params);
    }
    
});
