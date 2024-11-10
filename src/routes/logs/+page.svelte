<script>
    import { onMount } from "svelte";
    let logs = [];
    let logType = "nginx_access";  // Tipo de log por defecto
    let errorMessage = "";

    onMount(async () => {
        await fetchLogs(logType);
    });

    async function fetchLogs(type) {
        try {
            const res = await fetch(`https://backend.laila.icu/api/logs/${type}`);
            if (!res.ok) {
                throw new Error(`Error: ${res.status} ${res.statusText}`);
            }
            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Invalid content-type: Expected JSON");
            }
            const data = await res.json();
            logs = data.logs;
            errorMessage = "";  // Limpiar cualquier error previo
        } catch (error) {
            errorMessage = error.message;
            logs = [];
        }
    }

    function handleLogChange(event) {
        logType = event.target.value;
        fetchLogs(logType);
    }
</script>

<style>
    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    nav {
        background: rgba(0, 0, 0, 0.6);
        padding: 15px;
        border-radius: 10px;
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        border: 1px solid rgba(255, 255, 255, 0.18);
        margin-bottom: 20px;
        width: 100%;
        text-align: center;
    }

    h1 {
        font-size: 2.5rem;
        margin: 0;
        padding: 0;
        color: #ffffff;
    }

    select {
        margin-top: 15px;
        padding: 12px 20px;
        border-radius: 25px;
        border: none;
        background-color: #3b82f6;
        color: #ffffff;
        font-size: 1rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
    }

    select:focus {
        outline: none;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    }

    .logs-view {
        background-color: #111827;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        width: 100%;
        height: 500px;
        overflow-y: auto;
        padding: 20px;
        color: #ffffff;
        margin-top: 20px;
        animation: fadeIn 1s ease;
    }

    .logs-view pre {
        font-family: 'Courier New', Courier, monospace;
        font-size: 0.9rem;
        line-height: 1.6;
    }

    .error-message {
        color: #f87171;
        background-color: rgba(255, 0, 0, 0.1);
        padding: 10px;
        border-radius: 8px;
        margin-top: 20px;
    }

    .loading-spinner {
        border: 8px solid rgba(255, 255, 255, 0.1);
        border-top: 8px solid #ffffff;
        border-radius: 50%;
        width: 60px;
        height: 60px;
        animation: spin 1s linear infinite;
        margin-top: 20px;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
</style>

<div class="container">
    <nav>
        <h1>Visualizador de Logs</h1>
        <select bind:value={logType} on:change={handleLogChange}>
            <option value="nginx_access">Nginx Access Log</option>
            <option value="nginx_error">Nginx Error Log</option>
            <option value="gunicorn_access">Gunicorn Access Log</option>
            <option value="gunicorn_error">Gunicorn Error Log</option>
        </select>
    </nav>

    {#if errorMessage}
        <div class="error-message">{errorMessage}</div>
    {:else}
        <div class="logs-view">
            {#if logs.length > 0}
                <pre>
                    {#each logs as log}
                        {log}
                    {/each}
                </pre>
            {:else}
                <div class="loading-spinner"></div>
            {/if}
        </div>
    {/if}
</div>
