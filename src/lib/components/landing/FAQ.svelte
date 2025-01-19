<!-- /lib/components/FAQ.svelte -->
<script>
    import { onMount } from 'svelte';
    import { fade, fly, slide } from 'svelte/transition';
    import SectionTransition from './SectionTransition.svelte';
  
    let isInView = false;
    let activeCategory = 'general';
    let activeQuestion = null;
    let searchQuery = '';
  
    // Categorías con íconos y colores personalizados
    const categories = {
      general: {
        icon: '📚',
        label: 'General',
        color: 'linear-gradient(135deg, #2D3192, #4B50B2)'
      },
      clases: {
        icon: '👨‍🏫',
        label: 'Clases y Metodología',
        color: 'linear-gradient(135deg, #00B0EC, #33C1EF)'
      },
      simulacros: {
        icon: '📝',
        label: 'Simulacros',
        color: 'linear-gradient(135deg, #FFD700, #FFE44D)'
      },
      plataforma: {
        icon: '💻',
        label: 'Plataforma',
        color: 'linear-gradient(135deg, #FF6B6B, #FF9999)'
      },
      pagos: {
        icon: '💳',
        label: 'Pagos y Planes',
        color: 'linear-gradient(135deg, #4CAF50, #69C16D)'
      }
    };
  
    // Array de FAQs ampliado con al menos 7 preguntas por categoría
    const faqs = [
      // Categoría: General
      {
        category: 'general',
        question: '¿Qué necesito para comenzar el curso?',
        answer: `Solo necesitas:
          - Un dispositivo con conexión a internet
          - Conocimientos básicos de matemáticas y física de bachillerato
          - Dedicación y compromiso con tu preparación
          
          Te proporcionaremos todo el material necesario y acceso completo a nuestra biblioteca digital.`,
        relatedTopics: ['Requisitos', 'Material', 'Inicio'],
        relatedQuestions: [2, 3, 4, 5, 6, 7, 8]
      },
      {
        category: 'general',
        question: '¿Cuánto dura el curso?',
        answer: `El curso tiene una duración de 6 meses, divididos en módulos semanales que abarcan todas las áreas fundamentales de matemáticas y física necesarias para el examen de admisión.`,
        relatedTopics: ['Duración', 'Módulos'],
        relatedQuestions: [1, 3, 5, 9, 10, 11, 12]
      },
      {
        category: 'general',
        question: '¿Hay algún requisito previo para inscribirse?',
        answer: `No hay requisitos académicos previos específicos. Nuestro curso está diseñado para adaptarse a estudiantes con diferentes niveles de conocimiento en matemáticas y física.`,
        relatedTopics: ['Requisitos', 'Adaptabilidad'],
        relatedQuestions: [1, 2, 4, 6, 10, 13, 14]
      },
      {
        category: 'general',
        question: '¿Cómo me inscribo en el curso?',
        answer: `Puedes inscribirte directamente a través de nuestra plataforma en línea. Simplemente haz clic en el botón "Comienza Ahora" en la sección de inicio y sigue las instrucciones para completar tu registro.`,
        relatedTopics: ['Inscripción', 'Proceso'],
        relatedQuestions: [1, 2, 3, 5, 7, 15, 16]
      },
      {
        category: 'general',
        question: '¿Ofrecen algún tipo de garantía de satisfacción?',
        answer: `Sí, ofrecemos una garantía de devolución del dinero durante los primeros 30 días si consideras que el curso no cumple con tus expectativas.`,
        relatedTopics: ['Garantía', 'Satisfacción'],
        relatedQuestions: [1, 2, 3, 4, 6, 17, 18]
      },
      {
        category: 'general',
        question: '¿Puedo acceder al curso desde mi dispositivo móvil?',
        answer: `Absolutamente. Nuestra plataforma es totalmente responsiva y puedes acceder a todos los materiales y clases desde cualquier dispositivo con conexión a internet, incluyendo smartphones y tablets.`,
        relatedTopics: ['Accesibilidad', 'Dispositivos'],
        relatedQuestions: [1, 2, 4, 5, 7, 19, 20]
      },
      {
        category: 'general',
        question: '¿Cómo funciona el soporte al estudiante?',
        answer: `Contamos con un equipo de soporte dedicado que está disponible 24/7 para ayudarte con cualquier duda o problema técnico. Además, ofrecemos sesiones de tutoría personalizadas para un apoyo académico adicional.`,
        relatedTopics: ['Soporte', 'Tutoría'],
        relatedQuestions: [1, 3, 4, 5, 6, 21, 22]
      },
      // Categoría: Clases y Metodología
      {
        category: 'clases',
        question: '¿Cómo son las clases en vivo?',
        answer: `Nuestras clases en vivo son:
          - Interactivas y dinámicas
          - Grupos reducidos (máximo 20 estudiantes)
          - 6 horas semanales distribuidas en 3 sesiones
          - Grabadas y disponibles 24/7
          - Con chat en vivo para preguntas
          - Uso de pizarra digital interactiva`,
        relatedTopics: ['Metodología', 'Horarios', 'Clases'],
        relatedQuestions: [1, 5, 8, 23, 24, 25, 26]
      },
      {
        category: 'clases',
        question: '¿Puedo ver las clases grabadas en otro momento?',
        answer: `Sí, todas las clases en vivo son grabadas y estarán disponibles en nuestra plataforma para que puedas revisarlas cuando lo necesites, permitiéndote aprender a tu propio ritmo.`,
        relatedTopics: ['Grabaciones', 'Flexibilidad'],
        relatedQuestions: [2, 5, 8, 27, 28, 29, 30]
      },
      {
        category: 'clases',
        question: '¿Cuál es el tamaño ideal de los grupos?',
        answer: `Mantenemos los grupos reducidos con un máximo de 20 estudiantes por grupo. Esto garantiza una atención personalizada y facilita la interacción entre el instructor y los alumnos.`,
        relatedTopics: ['Grupos Reducidos', 'Atención Personalizada'],
        relatedQuestions: [1, 5, 8, 31, 32, 33, 34]
      },
      {
        category: 'clases',
        question: '¿Qué métodos de enseñanza utilizan?',
        answer: `Utilizamos una combinación de métodos de enseñanza que incluyen:
          - Explicaciones teóricas detalladas
          - Ejercicios prácticos en tiempo real
          - Discusión de problemas y soluciones
          - Uso de herramientas digitales interactivas
          - Evaluaciones periódicas para medir el progreso`,
        relatedTopics: ['Métodos de Enseñanza', 'Interactividad'],
        relatedQuestions: [1, 3, 5, 35, 36, 37, 38]
      },
      {
        category: 'clases',
        question: '¿Hay tareas o ejercicios asignados fuera de clase?',
        answer: `Sí, asignamos ejercicios y tareas semanales para reforzar los conceptos aprendidos en las clases. Además, proporcionamos un banco de ejercicios adicionales para que puedas practicar más y mejorar tus habilidades.`,
        relatedTopics: ['Tareas', 'Práctica'],
        relatedQuestions: [1, 5, 8, 39, 40, 41, 42]
      },
      {
        category: 'clases',
        question: '¿Puedo interactuar con otros estudiantes?',
        answer: `Por supuesto. Fomentamos un ambiente colaborativo donde puedes interactuar con otros estudiantes a través de foros, grupos de estudio y sesiones de discusión en vivo durante las clases.`,
        relatedTopics: ['Colaboración', 'Comunidad'],
        relatedQuestions: [1, 5, 8, 43, 44, 45, 46]
      },
      {
        category: 'clases',
        question: '¿Cómo puedo hacer preguntas durante las clases en vivo?',
        answer: `Durante las clases en vivo, puedes hacer preguntas utilizando el chat en tiempo real. Los instructores responderán tus dudas al final de cada sesión o durante las pausas designadas.`,
        relatedTopics: ['Preguntas', 'Interacción'],
        relatedQuestions: [1, 5, 8, 47, 48, 49, 50]
      },
      // Categoría: Simulacros
      {
        category: 'simulacros',
        question: '¿Cómo funcionan los simulacros?',
        answer: `Los simulacros están diseñados para replicar exactamente el examen UNAL:
          - Mismo formato y estructura
          - Control de tiempo real
          - Retroalimentación inmediata
          - Análisis detallado de resultados
          - Recomendaciones personalizadas
          - Disponibles 24/7 en la plataforma`,
        relatedTopics: ['Exámenes', 'Práctica', 'Evaluación'],
        relatedQuestions: [1, 6, 9, 51, 52, 53, 54]
      },
      {
        category: 'simulacros',
        question: '¿Con qué frecuencia debo realizar simulacros?',
        answer: `Recomendamos realizar al menos un simulacro cada dos semanas para medir tu progreso y adaptarte al formato del examen. Sin embargo, puedes realizar simulacros adicionales según tu disponibilidad y necesidad.`,
        relatedTopics: ['Frecuencia', 'Progreso'],
        relatedQuestions: [2, 6, 9, 55, 56, 57, 58]
      },
      {
        category: 'simulacros',
        question: '¿Recibo retroalimentación después de cada simulacro?',
        answer: `Sí, después de cada simulacro, recibirás un análisis detallado de tus respuestas, identificando tus fortalezas y áreas de mejora. Además, te proporcionaremos recomendaciones personalizadas para optimizar tu estudio.`,
        relatedTopics: ['Retroalimentación', 'Análisis'],
        relatedQuestions: [1, 6, 9, 59, 60, 61, 62]
      },
      {
        category: 'simulacros',
        question: '¿Los simulacros son cronometrados?',
        answer: `Sí, los simulacros están cronometrados para simular las condiciones reales del examen. Esto te ayudará a gestionar mejor tu tiempo durante la prueba y a acostumbrarte al ritmo requerido.`,
        relatedTopics: ['Tiempo', 'Condiciones Reales'],
        relatedQuestions: [1, 6, 9, 63, 64, 65, 66]
      },
      {
        category: 'simulacros',
        question: '¿Puedo revisar mis respuestas después de completar un simulacro?',
        answer: `Absolutamente. Después de completar un simulacro, tendrás acceso completo para revisar tus respuestas, ver las soluciones correctas y entender dónde cometiste errores.`,
        relatedTopics: ['Revisión', 'Aprendizaje'],
        relatedQuestions: [1, 6, 9, 67, 68, 69, 70]
      },
      {
        category: 'simulacros',
        question: '¿Los simulacros están basados en exámenes anteriores de UNAL?',
        answer: `Sí, nuestros simulacros están cuidadosamente diseñados basándose en exámenes anteriores de UNAL y en patrones de preguntas recurrentes, garantizando una preparación efectiva y alineada con el formato real del examen.`,
        relatedTopics: ['Basado en Exámenes', 'Efectividad'],
        relatedQuestions: [1, 6, 9, 71, 72, 73, 74]
      },
      {
        category: 'simulacros',
        question: '¿Puedo repetir un simulacro si no estoy satisfecho con mis resultados?',
        answer: `Por supuesto. Puedes repetir cualquier simulacro tantas veces como desees. Cada intento te brinda una oportunidad adicional para mejorar y afinar tus habilidades.`,
        relatedTopics: ['Repetición', 'Mejora Continua'],
        relatedQuestions: [1, 6, 9, 75, 76, 77, 78]
      },
      // Categoría: Plataforma
      {
        category: 'plataforma',
        question: '¿Cómo accedo a la plataforma?',
        answer: `Puedes acceder a nuestra plataforma a través de cualquier navegador web en [www.tu-plataforma.com](http://www.tu-plataforma.com). Simplemente inicia sesión con tus credenciales una vez que te hayas inscrito en el curso.`,
        relatedTopics: ['Acceso', 'Inicio de Sesión'],
        relatedQuestions: [1, 7, 10, 79, 80, 81, 82]
      },
      {
        category: 'plataforma',
        question: '¿La plataforma es compatible con dispositivos móviles?',
        answer: `Sí, nuestra plataforma es completamente responsiva y puedes acceder a todos los recursos, clases y simulacros desde tu smartphone, tablet o computadora.`,
        relatedTopics: ['Compatibilidad', 'Dispositivos'],
        relatedQuestions: [1, 7, 10, 83, 84, 85, 86]
      },
      {
        category: 'plataforma',
        question: '¿Qué recursos educativos están disponibles en la plataforma?',
        answer: `En nuestra plataforma encontrarás:
          - Clases en vivo y grabadas
          - Material de estudio descargable
          - Banco de ejercicios
          - Simulacros de examen
          - Foros de discusión
          - Tutorías personalizadas
          - Estadísticas de rendimiento`,
        relatedTopics: ['Recursos', 'Características'],
        relatedQuestions: [1, 7, 10, 87, 88, 89, 90]
      },
      {
        category: 'plataforma',
        question: '¿Puedo personalizar mi perfil en la plataforma?',
        answer: `Sí, puedes personalizar tu perfil agregando una foto, actualizando tu información personal y configurando tus preferencias de estudio para una experiencia más personalizada.`,
        relatedTopics: ['Perfil', 'Personalización'],
        relatedQuestions: [1, 7, 10, 91, 92, 93, 94]
      },
      {
        category: 'plataforma',
        question: '¿Cómo funcionan los foros de discusión?',
        answer: `Los foros de discusión te permiten interactuar con otros estudiantes y tutores. Puedes hacer preguntas, compartir recursos, discutir temas específicos y colaborar en problemas de estudio en un ambiente amigable y de apoyo.`,
        relatedTopics: ['Foros', 'Interacción'],
        relatedQuestions: [1, 7, 10, 95, 96, 97, 98]
      },
      {
        category: 'plataforma',
        question: '¿Existe soporte técnico disponible en la plataforma?',
        answer: `Sí, contamos con un equipo de soporte técnico disponible 24/7 para ayudarte con cualquier problema que puedas encontrar en la plataforma. Puedes contactarlos a través del chat en vivo o enviando un correo electrónico a soporte@tu-plataforma.com.`,
        relatedTopics: ['Soporte Técnico', 'Ayuda'],
        relatedQuestions: [1, 7, 10, 99, 100, 101, 102]
      },
      {
        category: 'plataforma',
        question: '¿Cómo se gestionan mis datos personales en la plataforma?',
        answer: `Valoramos tu privacidad y protegemos tus datos personales. Todos los datos se almacenan de forma segura y solo se utilizan para mejorar tu experiencia de aprendizaje. Puedes revisar nuestra política de privacidad en la sección correspondiente de la plataforma.`,
        relatedTopics: ['Privacidad', 'Seguridad'],
        relatedQuestions: [1, 7, 10, 103, 104, 105, 106]
      },
      {
        category: 'plataforma',
        question: '¿Puedo descargar material para usarlo sin conexión?',
        answer: `Sí, puedes descargar ciertos materiales de estudio, como guías y ejercicios, para acceder a ellos sin conexión. Sin embargo, las clases en vivo y los simulacros requieren una conexión a internet para acceder.`,
        relatedTopics: ['Descargas', 'Acceso Offline'],
        relatedQuestions: [1, 7, 10, 107, 108, 109, 110]
      },
      {
        category: 'plataforma',
        question: '¿Cómo puedo actualizar mi suscripción en la plataforma?',
        answer: `Puedes actualizar tu suscripción directamente desde tu perfil en la plataforma. Ve a la sección "Mi Cuenta", selecciona "Suscripción" y elige el plan que mejor se adapte a tus necesidades.`,
        relatedTopics: ['Suscripción', 'Actualización'],
        relatedQuestions: [1, 7, 10, 111, 112, 113, 114]
      },
      {
        category: 'plataforma',
        question: '¿La plataforma ofrece integraciones con otras herramientas?',
        answer: `Sí, nuestra plataforma se integra con diversas herramientas educativas como Google Drive, Microsoft Teams y otras plataformas de gestión de aprendizaje para facilitar tu experiencia de estudio.`,
        relatedTopics: ['Integraciones', 'Herramientas'],
        relatedQuestions: [1, 7, 10, 115, 116, 117, 118]
      },
      // Categoría: Pagos y Planes
      {
        category: 'pagos',
        question: '¿Cuáles son las opciones de pago disponibles?',
        answer: `Ofrecemos varias opciones de pago para tu comodidad:
          - Tarjetas de crédito y débito
          - Transferencias bancarias
          - PayPal
          - Pago en cuotas sin interés`,
        relatedTopics: ['Métodos de Pago', 'Facilidades'],
        relatedQuestions: [1, 8, 11, 119, 120, 121, 122]
      },
      {
        category: 'pagos',
        question: '¿Puedo pagar en cuotas?',
        answer: `Sí, ofrecemos la opción de pagar en cuotas sin interés. Puedes seleccionar esta opción durante el proceso de inscripción en la sección de pagos.`,
        relatedTopics: ['Cuotas', 'Facilidades'],
        relatedQuestions: [1, 8, 11, 123, 124, 125, 126]
      },
      {
        category: 'pagos',
        question: '¿Hay descuentos disponibles?',
        answer: `Sí, ofrecemos descuentos por inscripción anticipada, referidos y paquetes grupales. Revisa nuestra sección de promociones para más detalles y aprovecha las ofertas disponibles.`,
        relatedTopics: ['Descuentos', 'Promociones'],
        relatedQuestions: [1, 8, 11, 127, 128, 129, 130]
      },
      {
        category: 'pagos',
        question: '¿Cómo recibo el comprobante de pago?',
        answer: `Después de completar tu pago, recibirás automáticamente un correo electrónico con el comprobante de pago y los detalles de tu inscripción.`,
        relatedTopics: ['Comprobante', 'Confirmación'],
        relatedQuestions: [1, 8, 11, 131, 132, 133, 134]
      },
      {
        category: 'pagos',
        question: '¿Es seguro realizar pagos en la plataforma?',
        answer: `Sí, nuestra plataforma utiliza encriptación SSL y cumple con los más altos estándares de seguridad para proteger tus datos y garantizar que tus transacciones sean seguras.`,
        relatedTopics: ['Seguridad', 'Confianza'],
        relatedQuestions: [1, 8, 11, 135, 136, 137, 138]
      },
      {
        category: 'pagos',
        question: '¿Puedo cancelar mi suscripción y recibir un reembolso?',
        answer: `Puedes cancelar tu suscripción en cualquier momento a través de tu perfil en la plataforma. Ofrecemos reembolsos completos durante los primeros 30 días después de la inscripción.`,
        relatedTopics: ['Cancelación', 'Reembolsos'],
        relatedQuestions: [1, 8, 11, 139, 140, 141, 142]
      },
      {
        category: 'pagos',
        question: '¿Existen cargos ocultos en el proceso de pago?',
        answer: `No, no hay cargos ocultos. Todos los costos asociados están claramente detallados durante el proceso de inscripción y pago.`,
        relatedTopics: ['Transparencia', 'Cargos'],
        relatedQuestions: [1, 8, 11, 143, 144, 145, 146]
      },
      // Puedes añadir más preguntas siguiendo el mismo patrón para completar cada categoría
      // ...
    ];
  
    let filteredFaqs = faqs;
  
    $: {
      filteredFaqs = faqs.filter(faq => 
        (activeCategory === 'all' || faq.category === activeCategory) &&
        (searchQuery === '' || 
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
  
    // Estadísticas de interacción (simuladas)
    let questionStats = {
      totalQuestions: faqs.length,
      answeredLast24h: 45,
      satisfactionRate: 98,
      responseTime: '< 2 min'
    };
  
    onMount(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            isInView = true;
          }
        },
        { threshold: 0.1 }
      );
  
      const section = document.querySelector('.faq-section');
      if (section) {
        observer.observe(section);
      }
  
      return () => {
        if (section) {
          observer.unobserve(section);
        }
      };
    });
  
    function handleQuestionClick(index) {
      activeQuestion = activeQuestion === index ? null : index;
    }

    // Función para obtener la pregunta por ID, con validación
    function getQuestionById(id) {
      const question = faqs.find(faq => faq.id === id);
      return question ? question.question : 'Pregunta no disponible';
    }
</script>

<style>
  .faq-section {
    position: relative;
    padding: 8rem 2rem;
    background: var(--background);
    overflow: hidden;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  .faq-pattern {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: radial-gradient(
      circle at 50% 50%,
      rgba(45, 49, 146, 0.05) 0%,
      rgba(0, 176, 236, 0.05) 50%,
      transparent 100%
    );
    z-index: 1;
  }

  .faq-container {
    max-width: 1400px;
    margin: 0 auto;
    position: relative;
    z-index: 2;
  }

  .faq-header {
    text-align: center;
    margin-bottom: 4rem;
  }

  .faq-title {
    font-size: 3rem;
    margin-bottom: 1rem;
    background: var(--gradient);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .faq-description {
    font-size: 1.25rem;
    color: var(--text);
    opacity: 0.8;
    max-width: 800px;
    margin: 0 auto;
    line-height: 1.8;
  }

  .search-container {
    max-width: 600px;
    margin: 0 auto 3rem;
    position: relative;
  }

  .search-input {
    width: 100%;
    padding: 1.5rem 4rem;
    font-size: 1.1rem;
    border: none;
    border-radius: 2rem;
    background: white;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
  }

  .search-input:focus {
    box-shadow: 0 15px 40px rgba(0,0,0,0.15);
    outline: none;
  }

  .search-icon {
    position: absolute;
    left: 1.5rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.5rem;
    color: var(--primary);
  }

  .categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 4rem;
  }

  .category-card {
    background: white;
    border-radius: 1.5rem;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;
    box-shadow: 0 4px 25px rgba(0,0,0,0.1);
  }

  .category-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 35px rgba(0,0,0,0.15);
  }

  .category-card.active {
    border-color: var(--primary);
    transform: translateY(-5px);
    box-shadow: 0 8px 35px rgba(0,0,0,0.15);
  }

  .category-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  .category-label {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text);
  }

  .faq-content {
    display: grid;
    grid-template-columns: 3fr 1fr;
    gap: 4rem;
    align-items: start;
  }

  .questions-list {
    display: grid;
    gap: 1.5rem;
  }

  .question-card {
    background: white;
    border-radius: 1.5rem;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
  }

.question-header {
    padding: 2rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    transition: all 0.3s ease;
    background: #f9fafb;
    width: 100%; /* Added width 100% */
    justify-content: space-between; /* Added space-between */
    box-sizing: border-box; /* Added box-sizing */
    border-radius: 1.5rem 1.5rem 0 0; /* Added rounded corners at top */
}

  .question-card:hover .question-header {
    background: rgba(45, 49, 146, 0.05);
  }

  .question-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
  }

  .question-title {
    font-size: 1.2rem;
    font-weight: 600;
    flex: 1;
    color: var(--text);
  }

  .question-toggle {
    width: 24px;
    height: 24px;
    position: relative;
    transition: transform 0.3s ease;
  }

  .question-toggle::before,
  .question-toggle::after {
    content: '';
    position: absolute;
    background: var(--primary);
    border-radius: 2px;
  }

  .question-toggle::before {
    width: 2px;
    height: 100%;
    left: 50%;
    transform: translateX(-50%);
  }

  .question-toggle::after {
    width: 100%;
    height: 2px;
    top: 50%;
    transform: translateY(-50%);
  }

  .question-card.active .question-toggle::before {
    transform: translateX(-50%) rotate(90deg);
  }

  .question-content {
    padding: 0 2rem 2rem;
  }

  .question-answer {
    font-size: 1.1rem;
    line-height: 1.8;
    color: var(--text);
    opacity: 0.9;
    margin-bottom: 2rem;
  }

  .related-topics {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .topic-tag {
    padding: 0.5rem 1rem;
    background: rgba(45, 49, 146, 0.1);
    border-radius: 2rem;
    font-size: 0.9rem;
    color: var(--primary);
  }

  .related-questions {
    background: rgba(45, 49, 146, 0.05);
    border-radius: 1rem;
    padding: 1.5rem;
  }

  .related-questions h4 {
    margin-bottom: 1rem;
    font-size: 1rem;
    color: var(--primary);
  }

  .related-questions-list {
    display: grid;
    gap: 0.8rem;
  }

  .related-question-link {
    color: var(--text);
    text-decoration: none;
    font-size: 0.95rem;
    opacity: 0.8;
    transition: opacity 0.3s ease;
  }

  .related-question-link:hover {
    opacity: 1;
  }

  .no-results {
    text-align: center;
    padding: 4rem 2rem;
    background: white;
    border-radius: 1.5rem;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }

  .no-results-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .no-results h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: var(--primary);
  }

  .no-results p {
    color: var(--text);
    opacity: 0.8;
  }

  /* Panel de Ayuda Flotante */
  .help-panel {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: white;
    border-radius: 1.5rem;
    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
    width: 300px;
    transform: translateY(200%);
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 100;
  }

  .help-panel.show {
    transform: translateY(0);
  }

  .help-content {
    padding: 2rem;
  }

  .help-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .help-icon {
    font-size: 2rem;
  }

  .help-tips {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 1rem;
  }

  .help-tips li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: var(--text);
    opacity: 0.8;
  }

  .help-tips li::before {
    content: '✓';
    color: var(--primary);
  }

  .help-actions {
    margin-top: 1.5rem;
    text-align: center;
  }

  .help-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    padding: 1rem;
    background: var(--gradient);
    color: white;
    border: none;
    border-radius: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .help-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(45, 49, 146, 0.2);
  }
</style>

<section class="faq-section" id="preguntas">
  <div class="faq-pattern"></div>
  
  <SectionTransition position="top" type="wave" />
  
  <div class="faq-container">
    {#if isInView}
      <div class="faq-header" in:fade={{ duration: 1000 }}>
        <h2 class="faq-title">Preguntas Frecuentes</h2>
        <p class="faq-description">
          Encuentra respuestas a las preguntas más comunes sobre nuestro programa de preparación.
          Si no encuentras lo que buscas, no dudes en contactarnos.
        </p>
      </div>

      <div class="search-container" in:fade={{ duration: 1000, delay: 200 }}>
        <span class="search-icon">🔍</span>
        <input
          type="text"
          class="search-input"
          placeholder="Busca tu pregunta aquí..."
          bind:value={searchQuery}
        />
      </div>

      <div class="categories-grid" in:fade={{ duration: 1000, delay: 400 }}>
        {#each Object.entries(categories) as [key, category]}
          <div
            class="category-card"
            class:active={activeCategory === key}
            style="background: {category.color}"
            on:click={() => (activeCategory = key)}
            on:keydown={(e) => e.key === 'Enter' && (activeCategory = key)}
            role="button"
            tabindex="0"
          >
            <div class="category-icon">{category.icon}</div>
            <div class="category-label">{category.label}</div>
          </div>
        {/each}
      </div>

      <div class="faq-content">
        <div class="questions-list">
          {#each filteredFaqs as faq, index (faq.question)}
            <div 
              class="question-card"
              class:active={activeQuestion === index}
              in:fade={{ duration: 1000, delay: 400 + (index * 100) }}
            >
              <div
                class="question-header"
                on:click={() => handleQuestionClick(index)}
                on:keydown={(e) => e.key === 'Enter' && handleQuestionClick(index)}
                role="button"
                tabindex="0"
              >
                <div class="question-icon">
                  {categories[faq.category].icon}
                </div>
                <h3 class="question-title">{faq.question}</h3>
                <div class="question-toggle"></div>
              </div>

              {#if activeQuestion === index}
                <div class="question-content" transition:slide>
                  <div class="question-answer">
                    {faq.answer}
                  </div>

                  <div class="related-topics">
                    {#each faq.relatedTopics as topic}
                      <span class="topic-tag">{topic}</span>
                    {/each}
                  </div>

                  <div class="related-questions">
                    <h4>Preguntas Relacionadas</h4>
                    <div class="related-questions-list">
                      {#each faq.relatedQuestions as questionId}
                        {#if faqs[questionId - 1]}
                          <a href={`#question-${questionId}`} class="related-question-link">
                            {faqs[questionId - 1].question}
                          </a>
                        {:else}
                          <span class="related-question-link">Pregunta no disponible</span>
                        {/if}
                      {/each}
                    </div>
                  </div>
                </div>
              {/if}
            </div>
          {/each}

          {#if filteredFaqs.length === 0}
            <div class="no-results" in:fade>
              <div class="no-results-icon">🔍</div>
              <h3>No se encontraron resultados</h3>
              <p>Intenta con otros términos de búsqueda o consulta otra categoría.</p>
            </div>
          {/if}
        </div>          
      </div>

      <!-- Panel de ayuda flotante -->
      {#if activeQuestion !== null}
        <div class="help-panel show">
          <div class="help-content">
            <div class="help-header">
              <span class="help-icon">💡</span>
              <h4>Consejos Útiles</h4>
            </div>
            <ul class="help-tips">
              <li>Usa el buscador para encontrar rápidamente tu pregunta</li>
              <li>Filtra por categorías para temas específicos</li>
              <li>Revisa las preguntas relacionadas para más información</li>
              <li>Participa en los foros para interactuar con otros estudiantes</li>
              <li>Aprovecha las sesiones de tutoría personalizadas</li>
            </ul>
            <div class="help-actions">
              <button class="help-button">
                <span>📥</span> Descargar Guía Completa
              </button>
            </div>
          </div>
        </div>
      {/if}
    {/if}
  </div>

  <SectionTransition position="bottom" type="wave" />
</section>