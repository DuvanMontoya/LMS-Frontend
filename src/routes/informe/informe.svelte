<!-- src/routes/+page.svelte -->
<script>
    import { onMount } from 'svelte';
  
    let currentSection = 'overview';
  
    const studentData = {
      name: "Juan Pérez",
      id: "12345678",
      date: "22 de julio de 2024",
      overallScore: 78,
      percentile: 85,
      competencies: {
        interpretation: 75,
        formulation: 82,
        argumentation: 68
      },
      contents: {
        statistics: {
          "Representación de datos": 90,
          "Conjuntos": 85,
          "Promedio y rango": 95,
          "Conteos simples": 80,
          "Población y muestra": 75,
          "Estimación del error": 70,
          "Varianza y correlación": 75,
          "Combinaciones": 65
        },
        geometry: {
          "Figuras básicas": 85,
          "Paralelismo": 75,
          "Desigualdad triangular": 70,
          "Coordenadas cartesianas": 80,
          "Sólidos complejos": 60,
          "Congruencia y semejanza": 65,
          "Teoremas clásicos": 80,
          "Transformaciones": 65
        },
        algebra: {
          "Números racionales": 95,
          "Operaciones básicas": 90,
          "Relaciones lineales": 85,
          "Expresiones complejas": 75,
          "Funciones avanzadas": 80,
          "Sucesiones y límites": 70
        }
      },
      progressData: [
        { date: "Ene", score: 65 },
        { date: "Feb", score: 70 },
        { date: "Mar", score: 72 },
        { date: "Abr", score: 75 },
        { date: "May", score: 78 }
      ],
      rankingData: [
        { position: 1, name: "Ana G.", score: 95 },
        { position: 2, name: "Carlos M.", score: 92 },
        { position: 3, name: "Juan Pérez", score: 78, isUser: true },
        { position: 4, name: "María L.", score: 76 },
        { position: 5, name: "Pedro S.", score: 74 }
      ],
      achievements: [
        { name: "Maestro de Estadística", icon: "📊" },
        { name: "Geómetra Prodigio", icon: "📐" },
        { name: "As del Álgebra", icon: "🧮" }
      ]
    };
  
    const competencyDescriptions = {
      interpretation: "Habilidad para comprender y transformar información en diversos formatos.",
      formulation: "Capacidad para plantear y diseñar estrategias de solución a problemas matemáticos.",
      argumentation: "Habilidad para validar o refutar conclusiones, estrategias y soluciones matemáticas."
    };
  
    function generateRecommendations(data) {
      const recommendations = [];
      if (data.competencies.interpretation < 70) {
        recommendations.push("Practica la interpretación de gráficos y tablas complejas.");
      }
      if (data.competencies.formulation < 75) {
        recommendations.push("Enfócate en resolver problemas matemáticos variados y desafiantes.");
      }
      if (data.competencies.argumentation < 65) {
        recommendations.push("Mejora tus habilidades de argumentación matemática y justificación de soluciones.");
      }
      if (data.contents.statistics["Estimación del error"] < 75) {
        recommendations.push("Refuerza tus conocimientos sobre estimación del error en estadística.");
      }
      if (data.contents.geometry["Sólidos complejos"] < 70) {
        recommendations.push("Dedica más tiempo al estudio de sólidos geométricos complejos.");
      }
      if (data.contents.algebra["Sucesiones y límites"] < 80) {
        recommendations.push("Profundiza en el estudio de sucesiones y límites en álgebra.");
      }
      return recommendations;
    }
  
    const recommendations = generateRecommendations(studentData);
  
    onMount(() => {
      // Competencies Chart
      const competenciesChart = () => {
        const data = studentData.competencies;
        const width = 300;
        const height = 300;
        const radius = Math.min(width, height) / 2;
  
        const color = d3.scaleOrdinal()
          .domain(Object.keys(data))
          .range(["#00bcd4", "#ff4081", "#ffd54f"]);
  
        const pie = d3.pie()
          .value(d => d[1])
          .sort(null);
  
        const arc = d3.arc()
          .innerRadius(radius * 0.6)
          .outerRadius(radius * 0.9);
  
        const outerArc = d3.arc()
          .innerRadius(radius * 1.1)
          .outerRadius(radius * 1.1);
  
        const svg = d3.select("#competencies-chart")
          .append("svg")
          .attr("width", width)
          .attr("height", height)
          .append("g")
          .attr("transform", `translate(${width / 2},${height / 2})`);
  
        const arcs = svg.selectAll(".arc")
          .data(pie(Object.entries(data)))
          .enter().append("g")
          .attr("class", "arc");
  
        arcs.append("path")
          .attr("d", arc)
          .attr("fill", d => color(d.data[0]))
          .transition()
          .duration(1000)
          .attrTween("d", function(d) {
            const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
            return function(t) {
              return arc(interpolate(t));
            };
          });
  
        arcs.append("text")
          .attr("transform", d => `translate(${outerArc.centroid(d)})`)
          .attr("dy", ".35em")
          .text(d => `${d.data[0]}: ${d.data[1]}%`)
          .style("font-size", "12px")
          .style("text-anchor", "middle")
          .style("fill", "#fff")
          .style("opacity", 0)
          .transition()
          .duration(1000)
          .style("opacity", 1);
      };
  
      // Radar Chart
      const radarChart = () => {
        const data = {
          ...studentData.competencies,
          ...studentData.contents.statistics,
          ...studentData.contents.geometry,
          ...studentData.contents.algebra
        };
  
        const margin = { top: 50, right: 50, bottom: 50, left: 50 };
        const width = 500 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;
  
        const svg = d3.select("#radar-chart")
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);
  
        const features = Object.keys(data);
        const radialScale = d3.scaleLinear()
          .domain([0, 100])
          .range([0, width / 2]);
  
        const angleSlice = Math.PI * 2 / features.length;
  
        // Dibujar los ejes
        features.forEach((feature, i) => {
          const angle = i * angleSlice;
          const lineCoordinates = getCoordinatesForAngle(angle, width / 2);
          svg.append("line")
            .attr("x1", width / 2)
            .attr("y1", height / 2)
            .attr("x2", lineCoordinates.x + width / 2)
            .attr("y2", lineCoordinates.y + height / 2)
            .attr("stroke", "rgba(255, 255, 255, 0.3)");
  
          svg.append("text")
            .attr("x", lineCoordinates.x * 1.1 + width / 2)
            .attr("y", lineCoordinates.y * 1.1 + height / 2)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .style("font-size", "10px")
            .text(feature);
        });
  
        // Dibujar círculos concéntricos
        const circles = [20, 40, 60, 80, 100];
        circles.forEach(percentage => {
          svg.append("circle")
            .attr("cx", width / 2)
            .attr("cy", height / 2)
            .attr("r", radialScale(percentage))
            .attr("fill", "none")
            .attr("stroke", "rgba(255, 255, 255, 0.3)");
  
          svg.append("text")
            .attr("x", width / 2 + 5)
            .attr("y", height / 2 - radialScale(percentage))
            .attr("fill", "white")
            .attr("font-size", "8px")
            .text(percentage + "%");
        });
  
        // Dibujar el área del radar
        const line = d3.lineRadial()
          .radius(d => radialScale(d))
          .angle((d, i) => i * angleSlice);
  
        const coordinates = features.map(feature => data[feature]);
  
        svg.append("path")
          .datum(coordinates)
          .attr("d", line)
          .attr("stroke-width", 2)
          .attr("stroke", "#00bcd4")
          .attr("fill", "#00bcd4")
          .attr("fill-opacity", 0.3)
          .attr("transform", `translate(${width / 2},${height / 2})`);
  
        // Función auxiliar para obtener coordenadas basadas en ángulo y radio
        function getCoordinatesForAngle(angle, radius) {
          return {
            x: Math.cos(angle - Math.PI / 2) * radius,
            y: Math.sin(angle - Math.PI / 2) * radius
          };
        }
      };
  
      competenciesChart();
      radarChart();
  
      // Animación de contador para la puntuación general
      const counter = document.querySelector('.overall-score');
      const target = studentData.overallScore;
      let current = 0;
      const increment = target / 100;
      const timer = setInterval(() => {
        current += increment;
        counter.textContent = Math.round(current);
        if (current >= target) {
          clearInterval(timer);
          counter.textContent = target;
        }
      }, 20);
    });
  </script>
  
  <svelte:head>
    <title>Informe de Resultados Saber 11° Matemáticas</title>
    <link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;700&display=swap" rel="stylesheet">
    <script src="https://d3js.org/d3.v7.min.js"></script>
  </svelte:head>
  
  <main>
    <header>
      <h1>Informe de Resultados Saber 11° Matemáticas</h1>
      <p class="student-info">
        {studentData.name} | ID: {studentData.id} | Fecha: {studentData.date}
      </p>
    </header>
  
    <nav>
      {#each ['overview', 'competencies', 'contents', 'recommendations', 'progress'] as section}
        <button
          class={currentSection === section ? 'active' : ''}
          on:click={() => currentSection = section}
        >
          {section.charAt(0).toUpperCase() + section.slice(1)}
        </button>
      {/each}
    </nav>
  
    <section class="content">
      {#if currentSection === 'overview'}
        <div class="overview-grid">
          <div class="card overall-score-card">
            <h2>Puntuación General</h2>
            <div class="score-circle">
              <svg viewBox="0 0 36 36" class="circular-chart">
                <path class="circle-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path class="circle"
                  stroke-dasharray="{studentData.overallScore}, 100"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <text x="18" y="20.35" class="overall-score">0</text>
              </svg>
            </div>
            <p>Percentil {studentData.percentile}</p>
          </div>
          <div class="card competencies-card">
            <h2>Resumen de Competencias</h2>
            <div id="competencies-chart"></div>
          </div>
        </div>
        <div class="card radar-card">
          <h2>Visualización de Competencias y Contenidos</h2>
          <div id="radar-chart"></div>
        </div>
      {:else if currentSection === 'competencies'}
        <div class="competencies-grid">
          {#each Object.entries(studentData.competencies) as [key, value]}
            <div class="card competency-card">
              <h2>{key.charAt(0).toUpperCase() + key.slice(1)}</h2>
              <div class="competency-score">{value}%</div>
              <p>{competencyDescriptions[key]}</p>
            </div>
          {/each}
        </div>
      {:else if currentSection === 'contents'}
        <div class="contents-grid">
          {#each Object.entries(studentData.contents) as [category, items]}
            <div class="card content-card">
              <h2>{category.charAt(0).toUpperCase() + category.slice(1)}</h2>
              <ul>
                {#each Object.entries(items) as [item, score]}
                  <li>
                    <span>{item}:</span>
                    <div class="progress-bar">
                      <div class="progress" style="width: {score}%"></div>
                    </div>
                    <span class="score">{score}%</span>
                </li>
                {/each}
              </ul>
            </div>
          {/each}
        </div>
      {:else if currentSection === 'recommendations'}
        <div class="card recommendations-card">
          <h2>Recomendaciones Personalizadas</h2>
          <ul>
            {#each recommendations as rec}
              <li>{rec}</li>
            {/each}
          </ul>
        </div>
      {:else if currentSection === 'progress'}
        <div class="progress-section">
          <div class="card progress-card">
            <h2>Progreso a lo largo del tiempo</h2>
            <div class="progress-chart">
              {#each studentData.progressData as item, index}
                <div class="progress-item" style="--delay: {index * 0.1}s">
                  <div class="progress-bar">
                    <div class="progress" style="height: {item.score}%"></div>
                  </div>
                  <span class="progress-label">{item.date}</span>
                </div>
              {/each}
            </div>
          </div>
          <div class="card ranking-card">
            <h2>Ranking</h2>
            <table>
              <thead>
                <tr>
                  <th>Posición</th>
                  <th>Nombre</th>
                  <th>Puntuación</th>
                </tr>
              </thead>
              <tbody>
                {#each studentData.rankingData as item}
                  <tr class={item.isUser ? "user-row" : ""}>
                    <td>{item.position}</td>
                    <td>{item.name}</td>
                    <td>{item.score}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
        <div class="card achievements-card">
          <h2>Logros y Insignias</h2>
          <div class="achievements-grid">
            {#each studentData.achievements as achievement}
              <div class="achievement">
                <div class="achievement-icon">{achievement.icon}</div>
                <p>{achievement.name}</p>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </section>
  </main>
  
  <style>
    :global(body) {
      font-family: 'Exo 2', sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #e2e8f0;
      margin: 0;
      padding: 0;
      min-height: 100vh;
    }
  
    main {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
  
    header {
      text-align: center;
      margin-bottom: 2rem;
    }
  
    h1 {
      font-size: 2.5rem;
      color: #00bcd4;
      text-shadow: 0 0 10px rgba(0, 188, 212, 0.5);
      margin-bottom: 0.5rem;
    }
  
    .student-info {
      font-size: 1.2rem;
      color: #ff4081;
    }
  
    nav {
      display: flex;
      justify-content: center;
      margin-bottom: 2rem;
    }
  
    nav button {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: #fff;
      padding: 0.75rem 1.5rem;
      margin: 0 0.5rem;
      border-radius: 25px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
  
    nav button:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-3px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
  
    nav button.active {
      background: #00bcd4;
      color: #16213e;
    }
  
    .card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }
  
    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2);
    }
  
    h2 {
      color: #ffd54f;
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }
  
    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }
  
    .overall-score-card {
      text-align: center;
    }
  
    .score-circle {
      width: 200px;
      height: 200px;
      margin: 0 auto;
    }
  
    .circular-chart {
      display: block;
      margin: 10px auto;
      max-width: 80%;
      max-height: 250px;
    }
  
    .circle-bg {
      fill: none;
      stroke: rgba(255, 255, 255, 0.1);
      stroke-width: 3.8;
    }
  
    .circle {
      fill: none;
      stroke-width: 2.8;
      stroke-linecap: round;
      animation: progress 1s ease-out forwards;
      stroke: #00bcd4;
    }
  
    @keyframes progress {
      0% {
        stroke-dasharray: 0 100;
      }
    }
  
    .overall-score {
      fill: #fff;
      font-size: 0.5em;
      text-anchor: middle;
    }
  
    .competencies-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
    }
  
    .competency-card {
      text-align: center;
    }
  
    .competency-score {
      font-size: 3rem;
      font-weight: bold;
      color: #00bcd4;
      margin: 1rem 0;
    }
  
    .contents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }
  
    .content-card ul {
      list-style-type: none;
      padding: 0;
    }
  
    .content-card li {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
    }
  
    .progress-bar {
      flex-grow: 1;
      height: 10px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 5px;
      margin: 0 1rem;
      overflow: hidden;
    }
  
    .progress {
      height: 100%;
      background: #00bcd4;
      border-radius: 5px;
      transition: width 1s ease-in-out;
    }
  
    .score {
      min-width: 40px;
      text-align: right;
    }
  
    .recommendations-card ul {
      padding-left: 1.5rem;
    }
  
    .recommendations-card li {
      margin-bottom: 0.5rem;
    }
  
    .progress-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }
  
    .progress-chart {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      height: 200px;
    }
  
    .progress-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 40px;
    }
  
    .progress-item .progress-bar {
      width: 40px;
      height: 150px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      overflow: hidden;
    }
  
    .progress-item .progress {
      width: 100%;
      background: #ff4081;
      transition: height 1s ease-in-out;
      animation: grow 1s ease-out forwards;
      animation-delay: var(--delay);
    }
  
    @keyframes grow {
      from { height: 0; }
    }
  
    .progress-label {
      margin-top: 0.5rem;
    }
  
    .ranking-card table {
      width: 100%;
      border-collapse: collapse;
    }
  
    .ranking-card th, .ranking-card td {
      padding: 0.75rem;
      text-align: left;
    }
  
    .ranking-card th {
      background: rgba(255, 255, 255, 0.1);
    }
  
    .ranking-card .user-row {
      background: rgba(0, 188, 212, 0.2);
    }
  
    .achievements-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 1rem;
    }
  
    .achievement {
      text-align: center;
    }
  
    .achievement-icon {
      font-size: 3rem;
      margin-bottom: 0.5rem;
    }
  
    @media (max-width: 768px) {
      main {
        padding: 1rem;
      }
  
      nav {
        flex-wrap: wrap;
      }
  
      nav button {
        margin: 0.25rem;
      }
    }
  </style>