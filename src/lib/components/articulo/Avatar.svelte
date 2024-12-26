<script>
    export let size = 48; // Tamaño por defecto
    export let username = ""; // Nombre de usuario para generar colores
    
    // Función para generar un color basado en el nombre de usuario
    function generateColor(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = '#';
        for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
        }
        return color;
    }
    
    $: userColor = generateColor(username);
    </script>
    
    <svg width={size} height={size} viewBox="0 0 100 100" class="avatar-svg">
        <circle cx="50" cy="50" r="50" fill={userColor} />
        <text
            x="50%"
            y="50%"
            dominant-baseline="central"
            text-anchor="middle"
            fill="white"
            font-size="40"
            font-family="Arial"
        >
            {username.charAt(0).toUpperCase()}
        </text>
    </svg>
    
    <style>
    .avatar-svg {
        border-radius: 50%;
        border: 2px solid var(--primary-color);
    }
    </style>