<!-- /lib/components/Testimonials.svelte -->
<script>
    import { onMount, onDestroy } from 'svelte';
    import { fade } from 'svelte/transition';
    import SectionTransition from './SectionTransition.svelte';
    import ScoreChart from './ScoreChart.svelte';

    let isInView = false;
    let activeTestimonial = 0;
    let interval;

    const testimonials = [
        {
            name: 'Carlos Rodríguez',
            program: 'Ingeniería Mecánica',
            score: 875,
            progress: [
                { month: 'Sep', score: 620 },
                { month: 'Oct', score: 680 },
                { month: 'Nov', score: 750 },
                { month: 'Dic', score: 820 },
                { month: 'Ene', score: 875 }
            ],
            studyHours: 240,
            simulacros: 28,
            improvement: 41,
            quote: "PreUNAL transformó mi forma de estudiar. Su metodología única y el apoyo constante fueron clave para mi éxito.",
            achievements: [
                'Mejor puntaje en matemáticas',
                'Admitido en primera opción',
                'Estudiante destacado'
            ]
        },
        {
            name: 'Ana Martínez',
            program: 'Física',
            score: 920,
            progress: [
                { month: 'Sep', score: 650 },
                { month: 'Oct', score: 720 },
                { month: 'Nov', score: 800 },
                { month: 'Dic', score: 870 },
                { month: 'Ene', score: 920 }
            ],
            studyHours: 280,
            simulacros: 32,
            improvement: 45,
            quote: "La calidad del material y la dedicación de los profesores superaron todas mis expectativas. ¡Gracias PreUNAL!",
            achievements: [
                'Puntaje más alto en física',
                'Beca de excelencia',
                'Mejor progreso'
            ]
        },
        {
            name: 'Diego López',
            program: 'Matemáticas',
            score: 890,
            progress: [
                { month: 'Sep', score: 630 },
                { month: 'Oct', score: 700 },
                { month: 'Nov', score: 780 },
                { month: 'Dic', score: 840 },
                { month: 'Ene', score: 890 }
            ],
            studyHours: 260,
            simulacros: 30,
            improvement: 43,
            quote: "El enfoque personalizado y los simulacros realistas me dieron la confianza necesaria para enfrentar el examen.",
            achievements: [
                'Top 5 en simulacros',
                'Admisión directa',
                'Reconocimiento especial'
            ]
        },
        {
            name: 'Lucía Fernández',
            program: 'Biología',
            score: 910,
            progress: [
                { month: 'Sep', score: 610 },
                { month: 'Oct', score: 700 },
                { month: 'Nov', score: 780 },
                { month: 'Dic', score: 850 },
                { month: 'Ene', score: 910 }
            ],
            studyHours: 250,
            simulacros: 25,
            improvement: 40,
            quote: "Gracias a PreUNAL, logré entender conceptos complejos de manera sencilla y eficiente.",
            achievements: [
                'Puntaje sobresaliente en biología',
                'Participación en congresos',
                'Graduada con honores'
            ]
        },
        {
            name: 'Juan Pérez',
            program: 'Química',
            score: 880,
            progress: [
                { month: 'Sep', score: 600 },
                { month: 'Oct', score: 670 },
                { month: 'Nov', score: 750 },
                { month: 'Dic', score: 830 },
                { month: 'Ene', score: 880 }
            ],
            studyHours: 230,
            simulacros: 27,
            improvement: 38,
            quote: "La estructura de los cursos y el apoyo constante hicieron que mi preparación fuera efectiva y sin estrés.",
            achievements: [
                'Mejor rendimiento en química',
                'Beca académica',
                'Reconocido por profesores'
            ]
        },
        {
            name: 'María González',
            program: 'Economía',
            score: 930,
            progress: [
                { month: 'Sep', score: 680 },
                { month: 'Oct', score: 750 },
                { month: 'Nov', score: 820 },
                { month: 'Dic', score: 900 },
                { month: 'Ene', score: 930 }
            ],
            studyHours: 300,
            simulacros: 35,
            improvement: 50,
            quote: "PreUNAL no solo me preparó académicamente, sino que también me brindó las herramientas para desarrollar habilidades críticas.",
            achievements: [
                'Puntaje máximo en economía',
                'Liderazgo en proyectos',
                'Graduada con distinción'
            ]
        },
        {
            name: 'Sofía Ramírez',
            program: 'Ingeniería Civil',
            score: 900,
            progress: [
                { month: 'Sep', score: 630 },
                { month: 'Oct', score: 720 },
                { month: 'Nov', score: 810 },
                { month: 'Dic', score: 890 },
                { month: 'Ene', score: 900 }
            ],
            studyHours: 270,
            simulacros: 29,
            improvement: 42,
            quote: "La dedicación de los instructores y los recursos proporcionados por PreUNAL fueron fundamentales para mi éxito.",
            achievements: [
                'Puntaje excelente en ingeniería',
                'Participación en proyectos de investigación',
                'Reconocimiento académico'
            ]
        }
    ];

    function nextTestimonial() {
        activeTestimonial = (activeTestimonial + 1) % testimonials.length;
    }

    function previousTestimonial() {
        activeTestimonial = (activeTestimonial - 1 + testimonials.length) % testimonials.length;
    }

    onMount(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    isInView = true;
                    // Iniciar rotación automática
                    interval = setInterval(nextTestimonial, 6000);
                }
            },
            { threshold: 0.1 }
        );

        const section = document.querySelector('.testimonials-section');
        if (section) observer.observe(section);

        return () => {
            clearInterval(interval);
            if (section) observer.unobserve(section);
        };
    });

    onDestroy(() => {
        if (interval) clearInterval(interval);
    });
</script>

<style>
    :root {
        --primary: #2D3192;
        --secondary: #f8f9fa;
        --text: #333;
        --gradient: linear-gradient(135deg, #2D3192 0%, #6C63FF 100%);
        --shadow: rgba(0, 0, 0, 0.1);
        --hover-bg: rgba(45, 49, 146, 0.05);
    }

    .testimonials-section {
        position: relative;
        padding: 6rem 2rem;
        /* background: var(--secondary); */
        overflow: hidden;
        transition: background 0.3s ease;
    }

    .testimonials-container {
        max-width: 1200px;
        margin: 0 auto;
        position: relative;
        z-index: 2;
    }

    .section-header {
        text-align: center;
        margin-bottom: 4rem;
        opacity: 0;
        transform: translateY(20px);
        animation: fadeIn 1s forwards;
    }

    .section-title {
        font-size: 2.5rem;
        font-weight: 800;
        background: var(--gradient);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 1rem;
    }

    .section-description {
        font-size: 1.1rem;
        color: var(--text);
        opacity: 0.8;
        max-width: 600px;
        margin: 0 auto;
    }

    .testimonial-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 3rem;
        margin-bottom: 3rem;
        opacity: 0;
        transform: translateY(20px);
        animation: fadeIn 1s forwards;
        animation-delay: 0.2s;
    }

    .testimonial-content {
        background: white;
        border-radius: 1.5rem;
        padding: 2rem;
        box-shadow: 0 10px 30px var(--shadow);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        cursor: pointer;
    }

    .testimonial-content:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 35px var(--shadow);
    }

    .testimonial-header {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        margin-bottom: 1.5rem;
    }

    .header-info {
        flex: 1;
    }

    .student-name {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--primary);
        margin-bottom: 0.25rem;
    }

    .student-program {
        font-size: 1rem;
        color: var(--text);
        opacity: 0.8;
    }

    .score-badge {
        display: inline-flex;
        align-items: center;
        padding: 0.5rem 1rem;
        background: var(--gradient);
        color: white;
        border-radius: 1rem;
        font-weight: 600;
        font-size: 0.9rem;
        margin-top: 0.5rem;
    }

    .testimonial-quote {
        font-size: 1.1rem;
        line-height: 1.6;
        margin-bottom: 1.5rem;
        padding: 1.5rem;
        background: var(--hover-bg);
        border-radius: 1rem;
        position: relative;
        transition: background 0.3s ease;
    }

    .testimonial-quote::before {
        content: '"';
        position: absolute;
        top: -10px;
        left: 1rem;
        font-size: 3rem;
        color: var(--primary);
        opacity: 0.2;
    }

    .testimonial-content:hover .testimonial-quote {
        background: rgba(45, 49, 146, 0.1);
    }

    .achievements-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        flex-grow: 1;
        padding-top: 1rem;
        opacity: 0;
        transform: translateX(-20px);
        animation: slideIn 0.5s forwards;
        animation-delay: 0.3s;
    }

    .achievement-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 0.95rem;
        color: var(--text);
        position: relative;
    }

    .achievement-item::before {
        content: '✦';
        color: var(--primary);
        font-size: 1rem;
    }

    .progress-card {
        background: white;
        border-radius: 1.5rem;
        padding: 2rem;
        box-shadow: 0 10px 30px var(--shadow);
        display: flex;
        flex-direction: column;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        animation: fadeIn 1s ease forwards;
        animation-delay: 0.2s;
    }

    .progress-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 35px var(--shadow);
    }

    .progress-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--primary);
        margin-bottom: 1.5rem;
        text-align: center;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;
        margin-top: 2rem;
    }

    .stat-card {
        padding: 1.25rem;
        text-align: center;
        background: rgba(45, 49, 146, 0.05);
        border-radius: 1rem;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        position: relative;
    }

    .stat-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 5px 15px var(--shadow);
    }

    .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--primary);
        margin-bottom: 0.25rem;
    }

    .stat-label {
        font-size: 0.9rem;
        color: var(--text);
        opacity: 0.8;
    }

    .navigation-dots {
        display: flex;
        justify-content: center;
        gap: 0.75rem;
        margin-top: 2rem;
        opacity: 0;
        transform: translateY(20px);
        animation: fadeIn 1s forwards;
        animation-delay: 0.4s;
    }

    .nav-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #ccc;
        opacity: 0.6;
        transition: all 0.3s ease;
        cursor: pointer;
        border: none;
        padding: 0;
    }

    .nav-dot.active {
        background: var(--primary);
        opacity: 1;
        transform: scale(1.3);
    }

    .nav-dot:hover {
        opacity: 0.8;
    }

    @media (max-width: 1024px) {
        .testimonial-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
        }

        .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
        }
    }

    @media (max-width: 768px) {
        .testimonials-section {
            padding: 4rem 1rem;
        }

        .section-title {
            font-size: 2rem;
        }

        .testimonial-header {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
        }

        .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
        }
    }

    @media (max-width: 480px) {
        .stats-grid {
            grid-template-columns: 1fr;
        }

        .testimonial-quote {
            font-size: 1rem;
        }
    }

    /* Animaciones */
    @keyframes fadeIn {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes slideIn {
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
</style>

<section class="testimonials-section" id="testimonios">
    <SectionTransition position="top" type="wave" />

    <div class="testimonials-container">
        {#if isInView}
            <div class="section-header" in:fade={{ duration: 1000 }}>
                <h2 class="section-title">Historias de Éxito</h2>
                <p class="section-description">
                    Conoce cómo nuestros estudiantes lograron su sueño de ingresar a la UNAL y cómo nuestra metodología transformó su preparación.
                </p>
            </div>

            <div class="testimonial-grid" in:fade={{ duration: 1000, delay: 200 }}>
                <div class="testimonial-content">
                    <div class="testimonial-header">
                        <div class="header-info">
                            <h3 class="student-name">{testimonials[activeTestimonial].name}</h3>
                            <p class="student-program">{testimonials[activeTestimonial].program}</p>
                            <div class="score-badge">
                                Puntaje Final: {testimonials[activeTestimonial].score}
                            </div>
                        </div>
                    </div>

                    <blockquote class="testimonial-quote">
                        {testimonials[activeTestimonial].quote}
                    </blockquote>

                    <div class="achievements-list">
                        {#each testimonials[activeTestimonial].achievements as achievement, index (achievement)}
                            <div class="achievement-item" style="--index: {index};">
                                {achievement}
                            </div>
                        {/each}
                    </div>
                </div>

                <div class="progress-card">
                    <h4 class="progress-title">Evolución del Puntaje</h4>
                    <ScoreChart progressData={testimonials[activeTestimonial].progress} />

                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-value">{testimonials[activeTestimonial].studyHours}h</div>
                            <div class="stat-label">Horas de Estudio</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">{testimonials[activeTestimonial].simulacros}</div>
                            <div class="stat-label">Simulacros</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">+{testimonials[activeTestimonial].improvement}%</div>
                            <div class="stat-label">Mejora</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="navigation-dots" in:fade={{ duration: 1000, delay: 400 }}>
                {#each testimonials as _, index}
                    <button
                        class="nav-dot {activeTestimonial === index ? 'active' : ''}"
                        aria-label={`Ver testimonio de ${testimonials[index].name}`}
                        on:click={() => {
                            activeTestimonial = index;
                            // Reiniciar el intervalo cuando se hace clic
                            clearInterval(interval);
                            interval = setInterval(nextTestimonial, 7000);
                        }}
                    ></button>
                {/each}
            </div>
        {/if}
    </div>

    <SectionTransition position="bottom" type="wave" />
</section>