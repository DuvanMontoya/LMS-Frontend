// logger.js
import log from 'loglevel';

// Establecer el nivel de logging basado en el entorno
if (import.meta.env.MODE === 'production') {
  log.setLevel('silent'); // No mostrar ningún log en producción
} else {
  log.setLevel('debug'); // Mostrar todos los logs en desarrollo
}

export default log;
