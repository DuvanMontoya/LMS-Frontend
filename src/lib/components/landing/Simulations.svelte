<script>
    import { fade } from 'svelte/transition';
    
    /* Importamos nuestros sub-componentes Premium */
    import StartScreen from './StartScreen.svelte';
    import ExamScreen from './ExamScreen.svelte';
    import ResultsScreen from './ResultsScreen.svelte';
  
    // Vistas posibles
    let currentView = 'start'; // 'start' | 'exam' | 'results'
    
    // Resultados finales una vez termine el examen
    let finalResults = null;
    
    // Lista de 10 preguntas (NO necesitarás cargar nada externo)
    const questions = [
      {
        id: 1,
        subject: 'Matemáticas',
        area: 'Cálculo',
        topic: 'Derivadas',
        difficulty: 'Alta',
        text: `
          Se lanza una partícula verticalmente hacia arriba. 
          La altura $h(t)$ (en metros) después de $t$ segundos está dada por:
          $$
             h(t) = -4.9t^2 + 20t + 1.5
          $$
          ¿En qué momento la partícula alcanza su altura máxima?
        `,
        context: `
          1. La altura máxima ocurre cuando la velocidad es cero.
          2. La velocidad es la derivada de la posición.
          3. Encontrar el tiempo cuando la velocidad es cero.
        `,
        options: [
          { id: 'a', text: '1.5 s' },
          { id: 'b', text: '2.0 s' },
          { id: 'c', text: '2.04 s' },
          { id: 'd', text: '2.5 s' }
        ],
        correct: 'c',
        explanation: `
          $$
          v(t) = h'(t) = -9.8t + 20.
          $$
          Para $v(t) = 0$:
          $$
          -9.8t + 20 = 0 \\ 
          t = \\frac{20}{9.8} \\approx 2.04 \\text{ s}
          $$
        `,
        hint: 'Recuerda: la velocidad es cero en el punto más alto.',
        tags: ['derivadas', 'física', 'optimización']
      },
      {
        id: 2,
        subject: 'Física',
        area: 'Ondas',
        topic: 'Interferencia',
        difficulty: 'Alta',
        text: `
          Un experimento de Young utiliza luz monocromática de longitud de onda 
          $\\lambda = 500\\text{ nm}$. Las rendijas están separadas por 
          $d = 0.1\\text{ mm}$ y la pantalla a $L = 1\\text{ m}$. 
          ¿Cuál es la posición $y$ del tercer máximo ($n=3$) desde el centro?
        `,
        context: `
          1. Para máximos: $y = (n\\lambda L)/d$
          2. Convertir unidades al SI antes de calcular.
        `,
        options: [
          { id: 'a', text: '15.0 mm' },
          { id: 'b', text: '12.5 mm' },
          { id: 'c', text: '10.0 mm' },
          { id: 'd', text: '7.5 mm' }
        ],
        correct: 'a',
        explanation: `
          $$
          y = \\frac{n\\lambda L}{d} = 
               \\frac{3 \\times 5\\times10^{-7} \\times 1}{1\\times10^{-4}} 
            = 0.015\\text{ m} = 15.0\\text{ mm}.
          $$
        `,
        hint: 'Ojo con convertir nm y mm a metros.',
        tags: ['interferencia', 'óptica', 'ondas']
      },
      {
        id: 3,
        subject: 'Matemáticas',
        area: 'Geometría Analítica',
        topic: 'Cónicas',
        difficulty: 'Alta',
        text: `
          Una elipse tiene su centro en el origen y vértices en $(\\pm6, 0)$. 
          Si la distancia entre focos es 8, ¿cuál es la ecuación en forma canónica?
        `,
        context: `
          1. Los vértices dan $a = 6$.
          2. Distancia entre focos $= 2c = 8$, luego $c = 4$.
          3. $b^2 = a^2 - c^2$.
        `,
        options: [
          { id: 'a', text: 'x²/36 + y²/20 = 1' },
          { id: 'b', text: 'x²/25 + y²/16 = 1' },
          { id: 'c', text: 'x²/36 + y²/28 = 1' },
          { id: 'd', text: 'x²/36 + y²/32 = 1' }
        ],
        correct: 'a',
        explanation: `
          $$
          a=6,\\quad c=4 \\implies b^2=36-16=20. 
          \\quad\\text{Ecuación:}\\quad 
          \\frac{x^2}{36} + \\frac{y^2}{20} = 1.
          $$
        `,
        hint: 'Relaciones $a^2 = b^2 + c^2$ en la elipse estándar.',
        tags: ['cónicas', 'elipse', 'geometría analítica']
      },
      {
        id: 4,
        subject: 'Matemáticas',
        area: 'Álgebra',
        topic: 'Logaritmos',
        difficulty: 'Media',
        text: `
          Si $\\log_2(x) = 5$, ¿cuál es el valor de $x$?
        `,
        context: `
          Recordar que $\\log_2(x) = y$ implica que $x = 2^y$.
        `,
        options: [
          { id: 'a', text: '5' },
          { id: 'b', text: '25' },
          { id: 'c', text: '32' },
          { id: 'd', text: '64' }
        ],
        correct: 'c',
        explanation: `
          $\\log_2(x) = 5 \\implies x = 2^5 = 32.
          $ 
        `,
        hint: 'Base 2: $2^5 = 32$.',
        tags: ['logaritmos', 'álgebra']
      },
      {
        id: 5,
        subject: 'Física',
        area: 'Mecánica',
        topic: 'Movimiento Uniforme',
        difficulty: 'Baja',
        text: `
          Un objeto se mueve a 10 m/s de manera constante. ¿Qué distancia recorrerá 
          en 30 segundos?
        `,
        context: `
          Distancia en movimiento uniforme: $d = vt$.
        `,
        options: [
          { id: 'a', text: '100 m' },
          { id: 'b', text: '200 m' },
          { id: 'c', text: '300 m' },
          { id: 'd', text: '400 m' }
        ],
        correct: 'c',
        explanation: `
          $d = vt = 10 \\times 30 = 300\\text{ m}.
        `,
        hint: 'La fórmula es muy directa: Multiplica velocidad por tiempo.',
        tags: ['cinemática', 'física', 'movimiento uniforme']
      },
      {
        id: 6,
        subject: 'Matemáticas',
        area: 'Cálculo',
        topic: 'Integrales',
        difficulty: 'Media',
        text: `
          Calcula la integral:
          $$
          \\int 2x \\, dx.
          $$
        `,
        context: `
          Regla básica: $\\int x^n dx = \\frac{x^{n+1}}{n+1} + C$.
        `,
        options: [
          { id: 'a', text: 'x² + C' },
          { id: 'b', text: '2x² + C' },
          { id: 'c', text: 'x²/2 + C' },
          { id: 'd', text: '4x + C' }
        ],
        correct: 'a',
        explanation: `
          $\\int 2x \\, dx = 2 \\int x \\, dx = 2\\left( \\frac{x^2}{2} \\right) + C = x^2 + C.
        `,
        hint: 'Saca el 2 como factor constante.',
        tags: ['integrales', 'cálculo']
      },
      {
        id: 7,
        subject: 'Física',
        area: 'Fluidos',
        topic: 'Principio de Arquímedes',
        difficulty: 'Media',
        text: `
          Un cuerpo con volumen $0.002\\text{ m}^3$ se sumerge en agua. 
          ¿Cuál es la fuerza de empuje si la densidad del agua es 
          $1000\\text{ kg/m}^3$ y $g = 9.8\\text{ m/s}^2$?
        `,
        context: `
          Fuerza de empuje: $E = \\rho \\cdot V \\cdot g$.
        `,
        options: [
          { id: 'a', text: '19.6 N' },
          { id: 'b', text: '9.8 N' },
          { id: 'c', text: '4.9 N' },
          { id: 'd', text: '2.0 N' }
        ],
        correct: 'a',
        explanation: `
          $$
          E = 1000\\,\\frac{\\text{kg}}{\\text{m}^3} 
              \\times 0.002\\,\\text{m}^3 
              \\times 9.8\\,\\frac{\\text{m}}{\\text{s}^2} 
              = 19.6\\,\\text{N}.
          $$
        `,
        hint: 'Fórmula: $E = \\rho V g$.',
        tags: ['arquímedes', 'fluidos', 'física']
      },
      {
        id: 8,
        subject: 'Matemáticas',
        area: 'Combinatoria',
        topic: 'Permutaciones',
        difficulty: 'Media',
        text: `
          ¿Cuántas formas hay de ordenar las letras de la palabra "CASA"?
        `,
        context: `
          La palabra "CASA" tiene 4 letras, pero con repeticiones: A se repite 2 veces.
        `,
        options: [
          { id: 'a', text: '24' },
          { id: 'b', text: '12' },
          { id: 'c', text: '6' },
          { id: 'd', text: '4' }
        ],
        correct: 'b',
        explanation: `
          Número de permutaciones con repetición: 
          $$ 
            \\frac{4!}{2!} = \\frac{24}{2} = 12.
          $$
        `,
        hint: 'Recuerda dividir por las repeticiones.',
        tags: ['combinatoria', 'permutaciones']
      },
      {
        id: 9,
        subject: 'Física',
        area: 'Termodinámica',
        topic: 'Calorimetría',
        difficulty: 'Alta',
        text: `
          Se mezclan 200 g de agua a $80\\,^{\\circ}C$ con 100 g de agua a 
          $20\\,^{\\circ}C$. ¿Cuál es la temperatura de equilibrio (asumiendo 
          que no hay pérdidas de calor)?
        `,
        context: `
          $m_1 c (T_{eq} - T_1) + m_2 c (T_{eq} - T_2) = 0$, 
          $c$ es el calor específico del agua.
        `,
        options: [
          { id: 'a', text: '$40\\,^{\\circ}C$' },
          { id: 'b', text: '$50\\,^{\\circ}C$' },
          { id: 'c', text: '$60\\,^{\\circ}C$' },
          { id: 'd', text: '$70\\,^{\\circ}C$' }
        ],
        correct: 'c',
        explanation: `
          $$
          T_{eq} = \\frac{200\\cdot80 + 100\\cdot20}{200+100} 
                  = \\frac{16000 + 2000}{300} 
                  = \\frac{18000}{300} 
                  = 60\\,^{\\circ}C.
          $$
        `,
        hint: 'Utiliza la media ponderada en masa y temperaturas.',
        tags: ['termodinámica', 'calorimetría', 'física']
      },
      {
        id: 10,
        subject: 'Matemáticas',
        area: 'Geometría',
        topic: 'Teorema de Pitágoras',
        difficulty: 'Baja',
        text: `
          En un triángulo rectángulo cuyos catetos miden 6 cm y 8 cm, 
          ¿cuál es la longitud de la hipotenusa?
        `,
        context: `
          $c^2 = a^2 + b^2$.
        `,
        options: [
          { id: 'a', text: '6 cm' },
          { id: 'b', text: '8 cm' },
          { id: 'c', text: '10 cm' },
          { id: 'd', text: '14 cm' }
        ],
        correct: 'c',
        explanation: `
          $$
          c = \\sqrt{6^2 + 8^2} 
            = \\sqrt{36 + 64} 
            = \\sqrt{100} 
            = 10\\text{ cm}.
          $$
        `,
        hint: 'Es un triángulo 6-8-10, múltiplo del 3-4-5.',
        tags: ['geometría', 'pitágoras']
      },
    ];
  
    // Callback para iniciar la simulación
    function handleStart() {
      currentView = 'exam';
    }
  
    // Callback cuando finaliza el examen
    function handleExamFinish(results) {
      finalResults = results;
      currentView = 'results';
    }
  
    // Callback para reiniciar todo (regresar a la pantalla de inicio)
    function handleRestart() {
      finalResults = null;
      currentView = 'start';
    }
  </script>
  
  <!-- Contenedor principal con diseño "glass" premium -->
  <div class="simulations-container" in:fade>
    {#if currentView === 'start'}
      <StartScreen on:startExam={handleStart} />
    
    {:else if currentView === 'exam'}
      <ExamScreen 
        questions={questions}
        on:finishExam={handleExamFinish} 
      />
    
    {:else if currentView === 'results'}
      <ResultsScreen 
        results={finalResults} 
        on:restart={handleRestart}
      />
    {/if}
  </div>
  
  <style>
  /* Estilos principales ultra-premium */
  .simulations-container {
    /* Fondo con glassmorphism */
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 2rem;
    border: 1px solid rgba(255,255,255,0.3);
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    max-width: 1200px;
    margin: 0 auto;
    min-height: 80vh;
  }
  </style>  