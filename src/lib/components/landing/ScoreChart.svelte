<!-- /lib/components/ScoreChart.svelte -->
<script>
    import { onMount, onDestroy } from 'svelte';
    import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend } from 'chart.js';

    // Registrar los componentes necesarios de Chart.js
    Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend);

    export let progressData = [];

    let chart;
    let canvas;

    onMount(() => {
        const labels = progressData.map(p => p.month);
        const data = progressData.map(p => p.score);

        chart = new Chart(canvas, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Puntaje',
                    data,
                    borderColor: '#2D3192',
                    backgroundColor: 'rgba(45, 49, 146, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#2D3192',
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    borderWidth: 2,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Puntaje: ${context.parsed.y}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        suggestedMin: Math.min(...data) - 50,
                        suggestedMax: Math.max(...data) + 50,
                        grid: {
                            color: '#e0e0e0'
                        },
                        ticks: {
                            color: '#555',
                            font: {
                                size: 12
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#555',
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    });

    onDestroy(() => {
        if (chart) {
            chart.destroy();
        }
    });
</script>

<style>
    .chart-container {
        position: relative;
        width: 100%;
        height: 250px;
    }

    canvas {
        width: 100% !important;
        height: 100% !important;
    }
</style>

<div class="chart-container">
    <canvas bind:this={canvas}></canvas>
</div>