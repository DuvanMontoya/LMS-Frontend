<!-- /lib/components/Hero.svelte -->
<script>
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';

    // Animación de números
    let admittedCount = 0;
    let successRate = 0;
    let examScore = 0;
    let isInView = false;

    // Decorativos matemáticos para el fondo
    const mathSymbols = [
        '∫', '∑', 'π', '√', 'Δ', '∞', '≈', '±', '≠', 'θ', 'λ', 'μ', 'σ', 'Ω', '∂',
        'x²', 'y²', 'dx', 'dy', '∇', '∮', '∏', '→', '↔', '⇒', '∈', '∉', '⊂', '⊃', '∪'
    ];

    let symbols = [];
    let particles = [];

    onMount(() => {
        // Generar símbolos matemáticos aleatorios para el fondo
        for (let i = 0; i < 50; i++) {
            symbols.push({
                symbol: mathSymbols[Math.floor(Math.random() * mathSymbols.length)],
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 20 + 10,
                opacity: Math.random() * 0.5 + 0.1,
                rotation: Math.random() * 360,
                speed: Math.random() * 2 + 0.5
            });
        }

        // Animación de partículas
        for (let i = 0; i < 100; i++) {
            particles.push({
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 3 + 1,
                speed: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.5 + 0.1
            });
        }

        // Animación de números cuando el componente es visible
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    isInView = true;
                    animateNumbers();
                }
            },
            { threshold: 0.1 }
        );

        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            observer.observe(heroSection);
        }

        // Animar símbolos y partículas
        const animateBackground = () => {
            symbols = symbols.map(s => ({
                ...s,
                y: s.y - s.speed,
                y: s.y < 0 ? 100 : s.y,
                rotation: s.rotation + 0.5
            }));

            particles = particles.map(p => ({
                ...p,
                y: p.y - p.speed,
                y: p.y < 0 ? 100 : p.y
            }));

            requestAnimationFrame(animateBackground);
        };
        animateBackground();

        return () => {
            if (heroSection) {
                observer.unobserve(heroSection);
            }
        };
    });

    function animateNumbers() {
        const duration = 2000; // 2 segundos
        const frames = 60;
        const targetAdmitted = 1500;
        const targetSuccess = 95;
        const targetScore = 980;

        let startTime = null;

        function update(currentTime) {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            admittedCount = Math.round(progress * targetAdmitted);
            successRate = Math.round(progress * targetSuccess);
            examScore = Math.round(progress * targetScore);

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }
</script>

<style>
    .hero-section {
        min-height: 100vh;
        position: relative;
        overflow: hidden;
        padding: 7rem 2rem 4rem;
        background: linear-gradient(135deg, #1a1a2e, #16213e, #1a1a2e);
        color: white;
    }

    .hero-container {
        max-width: 1400px;
        margin: 0 auto;
        position: relative;
        z-index: 2;
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        gap: 4rem;
        align-items: center;
    }

    .hero-content {
        position: relative;
    }

    .hero-subtitle {
        display: inline-block;
        background: rgba(255, 255, 255, 0.1);
        padding: 0.5rem 1.5rem;
        border-radius: 2rem;
        font-weight: 500;
        margin-bottom: 2rem;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .hero-title {
        font-size: 4rem;
        line-height: 1.2;
        margin-bottom: 1.5rem;
        font-weight: 800;
        background: linear-gradient(135deg, #ffffff 0%, #a5a5a5 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .hero-description {
        font-size: 1.25rem;
        line-height: 1.8;
        margin-bottom: 3rem;
        opacity: 0.9;
        max-width: 600px;
    }

    .hero-cta {
        display: flex;
        gap: 1.5rem;
        margin-bottom: 4rem;
    }

    .primary-button {
        background: var(--gradient);
        color: white;
        padding: 1rem 2.5rem;
        border-radius: 2rem;
        font-weight: 600;
        text-decoration: none;
        transition: all 0.3s ease;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.1rem;
    }

    .primary-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(45, 49, 146, 0.3);
    }

    .secondary-button {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        padding: 1rem 2.5rem;
        border-radius: 2rem;
        font-weight: 600;
        text-decoration: none;
        transition: all 0.3s ease;
        border: 1px solid rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.1rem;
    }

    .secondary-button:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
    }

    .hero-stats {
        display: flex;
        gap: 3rem;
        padding: 2rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2rem;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .stat-item {
        text-align: center;
    }

    .stat-value {
        font-size: 2.5rem;
        font-weight: 800;
        margin-bottom: 0.5rem;
        background: linear-gradient(135deg, #ffffff, #a5a5a5);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .stat-label {
        font-size: 1rem;
        opacity: 0.9;
    }

    .hero-visual {
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 500px;
    }

    .visual-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .math-symbols {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    .symbol {
        position: absolute;
        transform-origin: center;
        animation: float 20s infinite linear;
        color: rgba(255, 255, 255, 0.2);
    }

    .particle {
        position: absolute;
        background: white;
        border-radius: 50%;
        animation: float 10s infinite linear;
    }

    @keyframes float {
        0% {
            transform: translateY(0) rotate(0deg);
        }
        50% {
            transform: translateY(-20px) rotate(180deg);
        }
        100% {
            transform: translateY(0) rotate(360deg);
        }
    }

    @media (max-width: 1024px) {
        .hero-container {
            grid-template-columns: 1fr;
            text-align: center;
        }

        .hero-description {
            margin-left: auto;
            margin-right: auto;
        }

        .hero-cta {
            justify-content: center;
        }

        .hero-stats {
            justify-content: center;
        }

        .hero-visual {
            display: none;
        }
    }

    @media (max-width: 768px) {
        .hero-title {
            font-size: 3rem;
        }

        .hero-cta {
            flex-direction: column;
            align-items: center;
        }

        .hero-stats {
            flex-direction: column;
            gap: 2rem;
        }
    }
</style>

<section class="hero-section" id="inicio">
    <div class="hero-container">
        <div class="hero-content">
            {#if isInView}
                <div in:fade={{ duration: 1000, delay: 200 }}>
                    <span class="hero-subtitle">
                        🎯 Preparación Especializada UNAL
                    </span>
                </div>

                <h1 class="hero-title" in:fade={{ duration: 1000, delay: 400 }}>
                    Tu Camino al Éxito en el Examen UNAL
                </h1>

                <p class="hero-description" in:fade={{ duration: 1000, delay: 600 }}>
                    Domina matemáticas con nuestro programa premium diseñado específicamente para el examen de admisión. Metodología probada, profesores expertos y recursos exclusivos.
                </p>

                <div class="hero-cta" in:fade={{ duration: 1000, delay: 800 }}>
                    <a href="#pricing" class="primary-button">
                        <span>🚀</span> Comienza Ahora
                    </a>
                    <a href="#metodologia" class="secondary-button">
                        <span>📚</span> Conoce el Método
                    </a>
                </div>

                <div class="hero-stats" in:fade={{ duration: 1000, delay: 1000 }}>
                    <div class="stat-item">
                        <div class="stat-value">{admittedCount}+</div>
                        <div class="stat-label">Estudiantes Admitidos</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">{successRate}%</div>
                        <div class="stat-label">Tasa de Éxito</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">{examScore}</div>
                        <div class="stat-label">Puntaje Más Alto</div>
                    </div>
                </div>
            {/if}
        </div>

        <div class="hero-visual">
            <div class="math-symbols">
                {#each symbols as symbol}
                    <div
                        class="symbol"
                        style="
                            left: {symbol.x}%;
                            top: {symbol.y}%;
                            font-size: {symbol.size}px;
                            opacity: {symbol.opacity};
                            transform: rotate({symbol.rotation}deg);
                        "
                    >
                        {symbol.symbol}
                    </div>
                {/each}
            </div>

            <div class="visual-container">
                {#each particles as particle}
                    <div
                        class="particle"
                        style="
                            left: {particle.x}%;
                            top: {particle.y}%;
                            width: {particle.size}px;
                            height: {particle.size}px;
                            opacity: {particle.opacity};
                        "
                    ></div>
                {/each}
            </div>
        </div>
    </div>
</section>