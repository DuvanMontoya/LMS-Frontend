<!-- /lib/components/Program.svelte -->
<script>
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import SectionTransition from './SectionTransition.svelte';
  
    let isInView = false;
  
    // Iconos SVG mejorados y más específicos para cada módulo
    const moduleIcons = {
      aritmetica: `<svg viewBox="0 0 24 24" width="24" height="24">
        <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M13 17H11V13H7V11H11V7H13V11H17V13H13V17Z" />
      </svg>`,
      conjuntos: `<svg viewBox="0 0 24 24" width="24" height="24">
        <path d="M12,2C17.5,2 22,5.36 22,9.5C22,13.64 17.5,17 12,17C6.5,17 2,13.64 2,9.5C2,5.36 6.5,2 12,2M12,4C7.58,4 4,6.47 4,9.5C4,12.53 7.58,15 12,15C16.42,15 20,12.53 20,9.5C20,6.47 16.42,4 12,4" />
        <path d="M12,8C13.66,8 15,8.9 15,10C15,11.1 13.66,12 12,12C10.34,12 9,11.1 9,10C9,8.9 10.34,8 12,8Z" />
      </svg>`,
      algebra: `<svg viewBox="0 0 24 24" width="24" height="24">
        <path d="M16,14H13V17H11V14H8V12H11V9H13V12H16M3,3H21V21H3V3M5,5V19H19V5H5Z" />
      </svg>`,
      funciones: `<svg viewBox="0 0 24 24" width="24" height="24">
        <path d="M3,3H21V21H3V3M5,5V19H19V5H5M7,7H17V9H7V7M7,11H17V13H7V11M7,15H13V17H7V15Z" />
      </svg>`,
      geometria_plana: `<svg viewBox="0 0 24 24" width="24" height="24">
        <path d="M12,2L1,21H23L12,2M12,6L19.53,19H4.47L12,6M11,10V14H13V10H11M11,16V18H13V16H11Z" />
      </svg>`,
      geometria_espacial: `<svg viewBox="0 0 24 24" width="24" height="24">
        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z" />
      </svg>`,
      trigonometria: `<svg viewBox="0 0 24 24" width="24" height="24">
        <path d="M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5M12,4.15L5,8.09V15.91L12,19.85L19,15.91V8.09L12,4.15M12,6.23L17,9.11V14.89L12,17.77L7,14.89V9.11L12,6.23Z" />
      </svg>`,
      calculo: `<svg viewBox="0 0 24 24" width="24" height="24">
        <path d="M18.5,2A1.5,1.5 0 0,1 20,3.5A1.5,1.5 0 0,1 18.5,5C18.27,5 18.05,4.95 17.85,4.85L14.16,8.55L14.5,9C14.83,9.33 15,9.77 15,10.24V15H17V17H15V19H17V21H7V19H9V17H7V15H9V10.24C9,9.77 9.17,9.33 9.5,9L9.84,8.55L6.15,4.85C5.95,4.95 5.73,5 5.5,5A1.5,1.5 0 0,1 4,3.5A1.5,1.5 0 0,1 5.5,2C5.97,2 6.39,2.21 6.69,2.55L10.72,6.58C11.13,6.21 11.7,6 12.32,6C12.94,6 13.5,6.21 13.91,6.58L17.95,2.55C18.24,2.21 18.67,2 19.14,2H18.5Z" />
      </svg>`,
      estadistica: `<svg viewBox="0 0 24 24" width="24" height="24">
        <path d="M3,3H21V21H3V3M5,5V19H19V5H5M7,7H13V9H7V7M7,11H17V13H7V11M7,15H13V17H7V15Z" />
      </svg>`,
      cinematica: `<svg viewBox="0 0 24 24" width="24" height="24">
        <path d="M12 16C13.66 16 15 14.66 15 13C15 11.88 14.37 10.9 13.47 10.42L15.11 5.85C15.65 5.96 16.17 6 16.76 6C18.83 6 20.67 5.33 22 4.2C19.33 7.47 18 11.27 18 13.5C18 17.36 14.5 19 12 19C10.41 19 9.83 18.8 9.29 18.53L8.11 23.1C7.63 23.05 7.17 23 6.7 23C4.63 23 2.79 23.67 1.46 24.8C4.13 21.53 5.46 17.73 5.46 15.5C5.46 11.64 8.96 10 11.46 10C13.1 10 13.79 10.23 14.5 10.59L12.89 15.03C12.59 15 12.29 15 12 15V16Z" />
      </svg>`,
      dinamica: `<svg viewBox="0 0 24 24" width="24" height="24">
        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z" />
      </svg>`,
      trabajo_energia: `<svg viewBox="0 0 24 24" width="24" height="24">
        <path d="M11.5,20L16.36,10.27H13V4L8,13.73H11.5V20M12,2C14.75,2 17.1,3 19.05,4.95C21,6.9 22,9.25 22,12C22,14.75 21,17.1 19.05,19.05C17.1,21 14.75,22 12,22C9.25,22 6.9,21 4.95,19.05C3,17.1 2,14.75 2,12C2,9.25 3,6.9 4.95,4.95C6.9,3 9.25,2 12,2Z" />
      </svg>`,
      ondas: `<svg viewBox="0 0 24 24" width="24" height="24">
        <path d="M12,12L8,8V6.8L12,10.8L16,6.8V8L12,12M12,4L8,8V6.8L12,2.8L16,6.8V8L12,4M12,20L8,16V14.8L12,18.8L16,14.8V16L12,20Z" />
      </svg>`,
      termodinamica: `<svg viewBox="0 0 24 24" width="24" height="24">
        <path d="M15,13V5A3,3 0 0,0 12,2A3,3 0 0,0 9,5V13A5,5 0 1,0 15,13M12,4A1,1 0 0,1 13,5V8H11V5A1,1 0 0,1 12,4Z" />
      </svg>`,
      electromagnetismo: `<svg viewBox="0 0 24 24" width="24" height="24">
        <path d="M14.69,14.69L13.27,16.11L12,14.84L10.73,16.11L9.31,14.69L10.58,13.42L9.31,12.15L10.73,10.73L12,12L13.27,10.73L14.69,12.15L13.42,13.42L14.69,14.69M21,11H19.97L20.89,9.27L19.11,8.73L18.19,10.46L17.38,9.65L18.3,7.91L16.5,7.37L15.59,9.1L14.21,7.72L15.13,6L13.32,5.46L12.41,7.19L10.47,5.25L9.05,6.67L11,8.62L9.27,9.54L10.92,11.18L10.92,11.18L10.9,11.18L10.92,11.2L11.61,10.5L12.37,11.26H11.81C11.81,11.54 11.85,11.83 11.92,12.11L11,13L9,11L7.59,12.41L9.57,14.39L8.67,16.14L10.5,16.68L11.39,14.96L12.84,16.41L12.35,17.39L14.15,17.93L14.64,16.95L16.36,17.84L16.91,16L15.19,15.12L15.19,15.12L15.17,15.1L15.17,15.1L14.12,14.05L14.3,13.73H15.58L16.35,14.5L17.77,13.08L15.83,11.14L17.55,10.22L16.9,8.57H19V7H16.5L15.57,6.74L13.81,6.16L14.73,4.42L12.93,3.88Z" />
      </svg>`
    };
  
    const programContent = {
      modules: [
        {
          id: 'aritmetica',
          title: 'Aritmética',
          icon: moduleIcons.aritmetica,
          topics: [
            {
              title: 'Números Naturales (6° grado)',
              items: [
                'Operaciones básicas y sus propiedades',
                'Divisibilidad y números primos',
                'Descomposición en factores primos',
                'MCM y MCD',
                'Potenciación y radicación',
                'Problemas de aplicación'
              ]
            },
            {
              title: 'Números Enteros (7° grado)',
              items: [
                'Números positivos y negativos',
                'Valor absoluto y orden',
                'Operaciones con números enteros',
                'Propiedades de los números enteros',
                'Problemas con números enteros',
                'Expresiones algebraicas con enteros'
              ]
            },
            {
              title: 'Números Racionales (7° y 8° grado)',
              items: [
                'Fracciones y operaciones',
                'Números decimales y operaciones',
                'Conversión entre fracciones y decimales',
                'Porcentajes y aplicaciones',
                'Razones y proporciones',
                'Problemas de aplicación real'
              ]
            },
            {
              title: 'Números Reales (8° y 9° grado)',
              items: [
                'Números irracionales',
                'Propiedades de los números reales',
                'Operaciones con radicales',
                'Racionalización',
                'Exponentes y notación científica',
                'Aproximaciones y errores'
              ]
            }
          ]
        },
        {
          id: 'algebra',
          title: 'Álgebra',
          icon: moduleIcons.algebra,
          topics: [
            {
              title: 'Expresiones Algebraicas (8° grado)',
              items: [
                'Términos algebraicos',
                'Monomios y polinomios',
                'Operaciones con polinomios',
                'Productos notables',
                'Factorización completa',
                'Fracciones algebraicas'
              ]
            },
            {
              title: 'Ecuaciones (8° y 9° grado)',
              items: [
                'Ecuaciones lineales',
                'Ecuaciones cuadráticas',
                'Sistemas de ecuaciones 2x2 y 3x3',
                'Métodos de solución de sistemas',
                'Inecuaciones lineales y cuadráticas',
                'Problemas de aplicación'
              ]
            },
            {
              title: 'Funciones (9° grado)',
              items: [
                'Concepto de función',
                'Dominio y rango',
                'Funciones lineales',
                'Funciones cuadráticas',
                'Funciones exponenciales y logarítmicas',
                'Gráficas y transformaciones'
              ]
            },
            {
              title: 'Sucesiones y Series (9° grado)',
              items: [
                'Sucesiones aritméticas',
                'Sucesiones geométricas',
                'Series aritméticas',
                'Series geométricas',
                'Término general y suma',
                'Aplicaciones prácticas'
              ]
            }
          ]
        },
        {
          id: 'geometria',
          title: 'Geometría',
          icon: moduleIcons.geometria_plana,
          topics: [
            {
              title: 'Geometría Básica (6° grado)',
              items: [
                'Puntos, rectas y planos',
                'Ángulos y su clasificación',
                'Rectas paralelas y perpendiculares',
                'Polígonos y sus elementos',
                'Círculo y circunferencia',
                'Construcciones básicas'
              ]
            },
            {
              title: 'Triángulos y Cuadriláteros (7° grado)',
              items: [
                'Clasificación de triángulos',
                'Líneas y puntos notables',
                'Congruencia y semejanza',
                'Teorema de Pitágoras',
                'Cuadriláteros especiales',
                'Áreas y perímetros'
              ]
            },
            {
              title: 'Geometría del Espacio (8° grado)',
              items: [
                'Poliedros regulares',
                'Prismas y pirámides',
                'Cilindros y conos',
                'Esfera y elementos',
                'Áreas y volúmenes',
                'Secciones cónicas'
              ]
            },
            {
              title: 'Geometría Analítica (9° grado)',
              items: [
                'Plano cartesiano',
                'Distancia entre puntos',
                'Ecuación de la recta',
                'Pendiente y paralelismo',
                'Ecuación de la circunferencia',
                'Parábola y elipse'
              ]
            }
          ]
        },
        {
          id: 'trigonometria',
          title: 'Trigonometría (10° grado)',
          icon: moduleIcons.trigonometria,
          topics: [
            {
              title: 'Fundamentos',
              items: [
                'Ángulos y sistemas de medición',
                'Razones trigonométricas',
                'Triángulos rectángulos',
                'Círculo unitario',
                'Identidades fundamentales',
                'Resolución de triángulos'
              ]
            },
            {
              title: 'Funciones Trigonométricas',
              items: [
                'Seno, coseno y tangente',
                'Secante, cosecante y cotangente',
                'Gráficas de funciones trigonométricas',
                'Transformaciones de gráficas',
                'Funciones inversas',
                'Ecuaciones trigonométricas'
              ]
            },
            {
              title: 'Identidades y Fórmulas',
              items: [
                'Identidades pitagóricas',
                'Fórmulas de suma y diferencia',
                'Fórmulas de ángulo doble',
                'Fórmulas de ángulo medio',
                'Transformaciones de productos',
                'Transformaciones de sumas'
              ]
            },
            {
              title: 'Aplicaciones',
              items: [
                'Ley de senos',
                'Ley de cosenos',
                'Área de triángulos',
                'Vectores en el plano',
                'Números complejos',
                'Aplicaciones físicas'
              ]
            }
          ]
        },
        {
          id: 'calculo',
          title: 'Cálculo (11° grado)',
          icon: moduleIcons.calculo,
          topics: [
            {
              title: 'Límites y Continuidad',
              items: [
                'Concepto de límite',
                'Propiedades de los límites',
                'Límites infinitos',
                'Límites al infinito',
                'Continuidad de funciones',
                'Tipos de discontinuidades'
              ]
            },
            {
              title: 'Derivadas',
              items: [
                'Concepto de derivada',
                'Reglas de derivación',
                'Regla de la cadena',
                'Derivadas implícitas',
                'Aplicaciones de la derivada',
                'Optimización'
              ]
            },
            {
              title: 'Integrales',
              items: [
                'Antiderivadas',
                'Integral definida',
                'Teorema fundamental del cálculo',
                'Métodos de integración',
                'Áreas entre curvas',
                'Aplicaciones físicas'
              ]
            }
          ]
        },
        {
          id: 'estadistica',
          title: 'Estadística y Probabilidad',
          icon: moduleIcons.estadistica,
          topics: [
            {
              title: 'Estadística Descriptiva (6° a 8° grado)',
              items: [
                'Población y muestra',
                'Variables estadísticas',
                'Tablas de frecuencia',
                'Gráficos estadísticos',
                'Medidas de tendencia central',
                'Medidas de dispersión'
              ]
            },
            {
              title: 'Probabilidad Básica (9° grado)',
              items: [
                'Experimentos aleatorios',
                'Espacio muestral',
                'Eventos y probabilidad',
                'Probabilidad condicional',
                'Eventos independientes',
                'Técnicas de conteo'
              ]
            },
            {
              title: 'Distribuciones (10° y 11° grado)',
              items: [
                'Distribución binomial',
                'Distribución normal',
                'Distribución de muestreo',
                'Intervalos de confianza',
                'Pruebas de hipótesis',
                'Correlación y regresión'
              ]
            }
          ]
        },
        {
          id: 'mecanica',
          title: 'Mecánica',
          icon: moduleIcons.dinamica,
          topics: [
            {
              title: 'Cinemática (10° grado)',
              items: [
                'Movimiento rectilíneo uniforme',
                'Movimiento uniformemente acelerado',
                'Caída libre y tiro vertical',
                'Movimiento parabólico',
                'Movimiento circular uniforme',
                'Movimiento circular uniformemente acelerado'
              ]
            },
            {
              title: 'Dinámica (10° grado)',
              items: [
                'Leyes de Newton',
                'Fuerzas fundamentales',
                'Diagramas de cuerpo libre',
                'Fricción y fuerzas de rozamiento',
                'Movimiento circular y fuerza centrípeta',
                'Sistemas de partículas'
              ]
            },
            {
              title: 'Trabajo y Energía (10° grado)',
              items: [
                'Trabajo mecánico',
                'Energía cinética y potencial',
                'Conservación de la energía',
                'Potencia mecánica',
                'Colisiones elásticas e inelásticas',
                'Momentum lineal y su conservación'
              ]
            }
          ]
        },
        {
          id: 'ondas_termodinamica',
          title: 'Ondas y Termodinámica',
          icon: moduleIcons.ondas,
          topics: [
            {
              title: 'Ondas Mecánicas (11° grado)',
              items: [
                'Movimiento armónico simple',
                'Ondas longitudinales y transversales',
                'Propiedades de las ondas',
                'Ondas sonoras',
                'Efecto Doppler',
                'Interferencia y resonancia'
              ]
            },
            {
              title: 'Termodinámica (11° grado)',
              items: [
                'Temperatura y calor',
                'Calorimetría',
                'Leyes de los gases',
                'Primera ley de la termodinámica',
                'Segunda ley de la termodinámica',
                'Ciclos termodinámicos'
              ]
            },
            {
              title: 'Fluidos (11° grado)',
              items: [
                'Densidad y presión',
                'Principio de Pascal',
                'Principio de Arquímedes',
                'Ecuación de continuidad',
                'Ecuación de Bernoulli',
                'Tensión superficial'
              ]
            }
          ]
        },
        {
          id: 'electromagnetismo',
          title: 'Electromagnetismo',
          icon: moduleIcons.electromagnetismo,
          topics: [
            {
              title: 'Electrostática (11° grado)',
              items: [
                'Carga eléctrica',
                'Ley de Coulomb',
                'Campo eléctrico',
                'Potencial eléctrico',
                'Capacitancia',
                'Dieléctricos'
              ]
            },
            {
              title: 'Circuitos Eléctricos (11° grado)',
              items: [
                'Corriente eléctrica',
                'Ley de Ohm',
                'Resistencia y resistividad',
                'Circuitos en serie y paralelo',
                'Leyes de Kirchhoff',
                'Potencia eléctrica'
              ]
            },
            {
              title: 'Magnetismo (11° grado)',
              items: [
                'Campo magnético',
                'Fuerza magnética',
                'Ley de Biot-Savart',
                'Ley de Ampère',
                'Inducción electromagnética',
                'Ley de Faraday'
              ]
            }
          ]
        }
      ]
    };
  
    let observer;
    
    onMount(() => {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            isInView = true;
          }
        },
        {
          threshold: 0.1
        }
      );
  
      const section = document.querySelector('.program-section');
    if (section) {
      observer.observe(section);
    }

    return () => {
      if (observer && section) {
        observer.unobserve(section);
      }
    };
  });
</script>


<style>
    /* Nueva paleta de colores moderna y elegante */
    :global(:root) {
      /* Colores principales */
      --primary: #2563eb;          /* Azul royal moderno */
      --accent: #0ea5e9;          /* Azul cielo vibrante */
      --background: #f8fafc;      /* Fondo claro y limpio */
      --card-bg: #ffffff;         /* Tarjetas blancas para máxima claridad */
      
      /* Textos */
      --text-primary: #0f172a;    /* Texto principal oscuro */
      --text-secondary: #64748b;  /* Texto secundario más suave */
      --text: #334155;            /* Texto general balanceado */
      
      /* Gradientes */
      --card-gradient-start: #3b82f6;  /* Azul moderno */
      --card-gradient-end: #06b6d4;    /* Cian vibrante */
      
      /* Sombras y efectos */
      --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
      --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
      --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.08);
    }
  
    .program-section {
      position: relative;
      padding: 8rem 2rem;
      background: var(--background);
      overflow: hidden;
      min-height: 100vh;
    }
  
    .program-container {
      max-width: 1400px;
      margin: 0 auto;
      position: relative;
      z-index: 2;
    }
  
    .program-header {
      text-align: center;
      margin-bottom: 6rem;
    }
  
    .program-title {
      font-size: 4rem;
      font-weight: 800;
      margin-bottom: 1.5rem;
      background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      display: inline-block;
      letter-spacing: -0.02em;
    }
  
    .program-subtitle {
      font-size: 1.75rem;
      color: var(--text-primary);
      margin-bottom: 2rem;
      font-weight: 500;
      letter-spacing: -0.01em;
    }
  
    .program-description {
      font-size: 1.25rem;
      color: var(--text);
      max-width: 800px;
      margin: 0 auto;
      line-height: 1.8;
    }
  
    .modules-grid {
      display: grid;
      gap: 2rem;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 400px), 1fr));
    }
  
    .subject-section {
      margin-bottom: 6rem;
    }
  
    .subject-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 3rem;
      color: var(--primary);
      text-align: center;
      position: relative;
    }
  
    .subject-title::after {
      content: '';
      position: absolute;
      bottom: -1rem;
      left: 50%;
      transform: translateX(-50%);
      width: 100px;
      height: 4px;
      background: linear-gradient(90deg, var(--primary), var(--accent));
      border-radius: 2px;
    }
  
    .module-card {
      background: var(--card-bg);
      border-radius: 1.5rem;
      overflow: hidden;
      box-shadow: var(--shadow-md);
      border: 1px solid rgba(148, 163, 184, 0.1);
      transition: all 0.3s ease;
    }
  
    .module-card:hover {
      transform: translateY(-5px);
      box-shadow: var(--shadow-lg);
    }
  
    .module-header {
      padding: 2rem;
      background: linear-gradient(135deg, var(--card-gradient-start) 0%, var(--card-gradient-end) 100%);
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
  
    .module-icon {
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 1rem;
      padding: 1rem;
      backdrop-filter: blur(10px);
    }
  
    .module-icon :global(svg) {
      width: 100%;
      height: 100%;
      fill: white;
    }
  
    .module-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: white;
      margin: 0;
      letter-spacing: -0.01em;
    }
  
    .module-content {
      padding: 2rem;
    }
  
    .topic-grid {
      display: grid;
      gap: 2rem;
    }
  
    .topic-section {
      background: #f8fafc;
      border-radius: 1.25rem;
      padding: 2rem;
      border: 1px solid rgba(148, 163, 184, 0.1);
      transition: all 0.3s ease;
    }
  
    .topic-section:hover {
      background: #f1f5f9;
      transform: translateY(-2px);
    }
  
    .topic-title {
      font-size: 1.3rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      color: var(--primary);
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
  
    .topic-title::before {
      content: '●';
      color: var(--accent);
      font-size: 0.8em;
    }
  
    .topic-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: 1rem;
    }
  
    .topic-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.1rem;
      line-height: 1.5;
      color: var(--text);
      padding: 0.75rem 1rem;
      background: rgba(241, 245, 249, 0.5);
      border-radius: 0.75rem;
      transition: all 0.3s ease;
    }
  
    .topic-item:hover {
      background: rgba(241, 245, 249, 0.8);
      transform: translateX(5px);
    }
  
    .topic-item::before {
      content: '→';
      color: var(--accent);
      font-weight: bold;
    }
  
    .resources-section {
      background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
      border-radius: 2rem;
      padding: 3rem;
      margin-top: 4rem;
      color: white;
      box-shadow: var(--shadow-lg);
    }
  
    .resources-title {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 2rem;
      text-align: center;
    }
  
    .resources-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }
  
    .resource-item {
      background: rgba(255, 255, 255, 0.1);
      padding: 1.5rem;
      border-radius: 1rem;
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
  
    .resource-item:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
    }
  
    .decoration-bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
      opacity: 0.4;
    }
  
    .decoration-item {
      position: absolute;
    }
  
    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(180deg); }
    }
  
    @media (max-width: 768px) {
      .program-title {
        font-size: 2.5rem;
      }
  
      .program-subtitle {
        font-size: 1.3rem;
      }
  
      .module-header {
        flex-direction: column;
        text-align: center;
      }
  
      .resources-grid {
        grid-template-columns: 1fr;
      }
  
      .subject-title {
        font-size: 2rem;
      }
    }
  </style>
  

  <section class="program-section" id="programa">
    <SectionTransition position="top" type="wave" />
  
    <div class="decoration-bg">
        {#each Array(15) as _, i}
          <div
            class="decoration-item"
            style="
              width: {Math.random() * 150 + 50}px;
              height: {Math.random() * 150 + 50}px;
              left: {Math.random() * 100}%;
              top: {Math.random() * 100}%;
              animation: float {15 + Math.random() * 10}s infinite;
              animation-delay: -{Math.random() * 20}s;
              background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
              opacity: 0.03;
              border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
            "
          ></div>
        {/each}
      </div>
  
    <div class="program-container">
      {#if isInView}
        <div class="program-header" in:fade={{ duration: 1000 }}>
          <h2 class="program-title">Programa Académico Integral</h2>
          <h3 class="program-subtitle">Matemáticas y Física</h3>
          <p class="program-description">
            Nuestro programa completo abarca todas las áreas fundamentales de matemáticas y física 
            del currículo colombiano de grados 6° a 11°, diseñado para desarrollar un entendimiento 
            profundo y sistemático de cada tema.
          </p>
        </div>
  
        <div class="subject-section" in:fade={{ duration: 1000, delay: 200 }}>
          <h3 class="subject-title">Matemáticas</h3>
          <div class="modules-grid">
            {#each programContent.modules.filter(m => ['aritmetica', 'algebra', 'geometria', 'trigonometria', 'calculo', 'estadistica'].includes(m.id)) as module}
              <div class="module-card">
                <div class="module-header">
                  <div class="module-icon">
                    {@html module.icon}
                  </div>
                  <h4 class="module-title">{module.title}</h4>
                </div>
                <div class="module-content">
                  <div class="topic-grid">
                    {#each module.topics as topic}
                      <div class="topic-section">
                        <h5 class="topic-title">{topic.title}</h5>
                        <ul class="topic-list">
                          {#each topic.items as item}
                            <li class="topic-item">{item}</li>
                          {/each}
                        </ul>
                      </div>
                    {/each}
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
  
        <div class="subject-section" in:fade={{ duration: 1000, delay: 400 }}>
          <h3 class="subject-title">Física</h3>
          <div class="modules-grid">
            {#each programContent.modules.filter(m => ['mecanica', 'ondas_termodinamica', 'electromagnetismo'].includes(m.id)) as module}
              <div class="module-card">
                <div class="module-header">
                  <div class="module-icon">
                    {@html module.icon}
                  </div>
                  <h4 class="module-title">{module.title}</h4>
                </div>
                <div class="module-content">
                  <div class="topic-grid">
                    {#each module.topics as topic}
                      <div class="topic-section">
                        <h5 class="topic-title">{topic.title}</h5>
                        <ul class="topic-list">
                          {#each topic.items as item}
                            <li class="topic-item">{item}</li>
                          {/each}
                        </ul>
                      </div>
                    {/each}
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
  
        <div class="resources-section" in:fade={{ duration: 1000, delay: 600 }}>
          <h3 class="resources-title">Recursos Educativos Complementarios</h3>
          <div class="resources-grid">
            <div class="resource-item">
              <span>📚</span>
              <span>Guías de estudio detalladas para cada tema</span>
            </div>
            <div class="resource-item">
              <span>💻</span>
              <span>Plataforma interactiva de aprendizaje</span>
            </div>
            <div class="resource-item">
              <span>📝</span>
              <span>Banco de ejercicios y problemas</span>
            </div>
            <div class="resource-item">
              <span>🎯</span>
              <span>Evaluaciones de práctica</span>
            </div>
            <div class="resource-item">
              <span>🎥</span>
              <span>Videos explicativos</span>
            </div>
            <div class="resource-item">
              <span>🔬</span>
              <span>Laboratorios virtuales</span>
            </div>
            <div class="resource-item">
              <span>📊</span>
              <span>Simuladores y herramientas interactivas</span>
            </div>
            <div class="resource-item">
              <span>👥</span>
              <span>Asesorías personalizadas</span>
            </div>
          </div>
        </div>
      {/if}
    </div>
  
    <SectionTransition position="bottom" type="wave" />
  </section>