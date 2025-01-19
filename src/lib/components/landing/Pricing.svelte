<!-- /lib/components/Pricing.svelte -->
<script>
    import { onMount, onDestroy } from 'svelte';
    import { fade, fly, slide } from 'svelte/transition';
    import SectionTransition from './SectionTransition.svelte';
  
    let isInView = false;
    let isModalOpen = false;
    let selectedPlan = null;
    let paymentMethod = 'card';
    let installments = 1;
    let studentDiscount = false;
    let referralCode = '';
    let currentStep = 1;
    let processingPayment = false;
    let paymentSuccess = false;
    let hasScrolled = false;
  
    // SVG para el fondo
    const backgroundPattern = `
      <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.1"/>
          </pattern>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <rect width="50" height="50" fill="url(#smallGrid)"/>
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" stroke-width="1" opacity="0.2"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    `;
  
    const svgCards = `
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="2" y="5" width="20" height="14" rx="2"/>
        <path d="M2 10h20 M7 15h2 M12 15h5"/>
      </svg>
    `;
  
    const svgBank = `
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 21h18M3 10h18M12 3L2 10h20L12 3zM4 10v11M8 10v11M12 10v11M16 10v11M20 10v11"/>
      </svg>
    `;
  
    const svgMobile = `
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="7" y="4" width="10" height="16" rx="2"/>
        <path d="M11 5h2M12 17h.01"/>
      </svg>
    `;
  
    const plans = [
      {
        id: 'basico',
        name: 'Plan Básico',
        price: 799900,
        description: 'Preparación completa y efectiva para el examen',
        features: [
          {
            icon: '📚',
            title: 'Material Completo',
            items: [
              'Acceso a todo el material digital',
              'Guías de estudio descargables',
              'Resúmenes temáticos',
              'Ejercicios resueltos'
            ]
          },
          {
            icon: '👨‍🏫',
            title: 'Clases en Vivo',
            items: [
              '6 horas semanales de clase',
              'Grupos reducidos',
              'Profesores expertos',
              'Grabaciones disponibles 24/7'
            ]
          },
          {
            icon: '📝',
            title: 'Simulacros',
            items: [
              '5 simulacros mensuales',
              'Retroalimentación detallada',
              'Análisis de resultados',
              'Recomendaciones personalizadas'
            ]
          }
        ],
        guarantee: {
          icon: '🎯',
          title: 'Garantía de Mejora',
          description: 'Mejora 100 puntos o recibe el 50% de reembolso'
        },
        recommended: false,
        color: {
          primary: '#2D3192',
          secondary: '#00B0EC'
        }
      },
      {
        id: 'premium',
        name: 'Plan Premium',
        price: 1299900,
        description: 'Maximiza tus posibilidades de admisión',
        features: [
          {
            icon: '🌟',
            title: 'Todo lo del Plan Básico',
            items: [
              'Material completo digital',
              '6 horas semanales de clase',
              '5 simulacros mensuales',
              'Soporte básico'
            ]
          },
          {
            icon: '🎯',
            title: 'Beneficios Extra',
            items: [
              'Simulacros ilimitados',
              'Mentoría personalizada',
              'Clases de refuerzo',
              'Talleres especiales'
            ]
          },
          {
            icon: '📊',
            title: 'Seguimiento VIP',
            items: [
              'Dashboard personalizado',
              'Análisis de progreso',
              'Alertas de rendimiento',
              'Reportes semanales'
            ]
          }
        ],
        guarantee: {
          icon: '💯',
          title: 'Garantía Total',
          description: 'Admisión garantizada o siguiente curso gratis'
        },
        recommended: true,
        color: {
          primary: '#805AD5',
          secondary: '#D53F8C'
        }
      }
    ];
  
    const paymentMethods = [
      {
        id: 'card',
        name: 'Tarjeta de Crédito',
        icon: svgCards,
        installmentsAvailable: true,
        discount: 5
      },
      {
        id: 'pse',
        name: 'PSE',
        icon: svgBank,
        installmentsAvailable: false,
        discount: 8
      },
      {
        id: 'nequi',
        name: 'Nequi / Daviplata',
        icon: svgMobile,
        installmentsAvailable: false,
        discount: 10
      }
    ];
  
    const discounts = {
      student: 15,
      referral: 10
    };
  
    function calculateFinalPrice(plan) {
      if (!plan) return 0;
      let price = plan.price;
      
      if (studentDiscount) {
        price = price * (1 - discounts.student / 100);
      }
      
      if (referralCode) {
        price = price * (1 - discounts.referral / 100);
      }
      
      const methodDiscount = paymentMethods.find(m => m.id === paymentMethod)?.discount || 0;
      price = price * (1 - methodDiscount / 100);
      
      if (installments > 1) {
        price = price * (1 + 0.05 * (installments - 1));
      }
      
      return Math.round(price);
    }
  
    function formatPrice(price) {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(price);
    }
  
    function handleModalClose() {
      isModalOpen = false;
      setTimeout(() => {
        currentStep = 1;
        processingPayment = false;
        paymentSuccess = false;
      }, 300);
    }
  
    onMount(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            isInView = true;
          }
        },
        { threshold: 0.1 }
      );
  
      const section = document.querySelector('.pricing-section');
      if (section) observer.observe(section);
  
      return () => {
        if (section) observer.unobserve(section);
      };
    });
  
    $: monthlyPayment = selectedPlan ? Math.round(calculateFinalPrice(selectedPlan) / installments) : 0;
  </script>
  
  <style>
    /* Contenedor principal */
    .pricing-section {
      position: relative;
      padding: 6rem 2rem;
      background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
      overflow: hidden;
    }
  
    .pricing-pattern {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      opacity: 0.5;
      pointer-events: none;
    }
  
    .pricing-container {
      max-width: 1200px;
      margin: 0 auto;
      position: relative;
      z-index: 2;
    }
  
    .section-header {
      text-align: center;
      margin-bottom: 4rem;
    }
  
    .section-title {
      font-size: 2.5rem;
      font-weight: 800;
      margin-bottom: 1rem;
      background: var(--gradient);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      display: inline-block;
      position: relative;
    }
  
    .section-title::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 4px;
      background: var(--gradient);
      border-radius: 2px;
    }
  
    .section-description {
      font-size: 1.1rem;
      color: var(--text);
      opacity: 0.8;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
    }
  
    /* Grid de planes */
    .plans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin: 0 auto;
      max-width: 1000px;
    }
  
    /* Tarjeta de plan */
    .plan-card {
      background: white;
      border-radius: 1.25rem;
      padding: 2rem;
      position: relative;
      height: 100%;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }
  
    .plan-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
    }
  
    .plan-card::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 1.25rem;
      padding: 2px;
      background: var(--gradient);
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
    }
  
    .recommended-badge {
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--gradient);
      color: white;
      padding: 0.5rem 1.5rem;
      border-radius: 1rem;
      font-weight: 600;
      font-size: 0.9rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  
    .plan-header {
      text-align: center;
      margin-bottom: 2rem;
    }
  
    .plan-name {
      font-size: 1.8rem;
      font-weight: 800;
      margin-bottom: 0.5rem;
      background: var(--gradient);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
  
    .plan-price {
      font-size: 2.5rem;
      font-weight: 800;
      margin: 1rem 0;
      color: var(--primary);
    }
  
    .plan-period {
      font-size: 1rem;
      opacity: 0.7;
    }
  
    .plan-description {
      font-size: 1.1rem;
      color: var(--text);
      opacity: 0.8;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }
  
    /* Features */
    .features-group {
      margin-bottom: 1.5rem;
    }
  
    .features-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
  
    .features-icon {
      font-size: 1.5rem;
    }
  
    .features-list {
      list-style: none;
      padding-left: 1.5rem;
    }
  
    .feature-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0;
      font-size: 0.95rem;
      color: var(--text);
      position: relative;
    }
  
    .feature-item::before {
      content: '✓';
      color: var(--primary);
      position: absolute;
      left: -1.5rem;
      font-weight: bold;
    }
  
    /* Garantía */
    .guarantee-box {
      margin: 2rem 0;
      padding: 1.5rem;
      background: rgba(45, 49, 146, 0.05);
      border-radius: 1rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.3s ease;
    }
  
    .guarantee-box:hover {
      background: rgba(45, 49, 146, 0.08);
    }
  
    .guarantee-icon {
      font-size: 2rem;
    }
  
    .guarantee-content {
      flex: 1;
    }
  
    .guarantee-title {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--primary);
    }
  
    .guarantee-description {
    font-size: 0.9rem;
    opacity: 0.8;
    line-height: 1.5;
  }

  /* Botones */
  .plan-button {
    width: 100%;
    padding: 1rem 2rem;
    border: none;
    border-radius: 1rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    position: relative;
    overflow: hidden;
  }

  .plan-button.primary {
    background: var(--gradient);
    color: white;
  }

  .plan-button.secondary {
    background: rgba(45, 49, 146, 0.1);
    color: var(--primary);
  }

  .plan-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  }

  .plan-button::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.3) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    transform: rotate(45deg);
    transition: all 0.5s ease;
    opacity: 0;
  }

  .plan-button:hover::after {
    opacity: 1;
    transform: rotate(45deg) translate(50%, -50%);
  }

  /* Modal */
  .payment-modal {
    position: fixed;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(8px);
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
  }

  .modal-content {
    background: white;
    border-radius: 1.25rem;
    padding: 2rem;
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  }

  .modal-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text);
    opacity: 0.5;
    transition: all 0.3s ease;
    padding: 0.5rem;
    border-radius: 50%;
  }

  .modal-close:hover {
    opacity: 1;
    background: rgba(0, 0, 0, 0.05);
  }

  /* Payment Steps */
  .payment-steps {
    display: flex;
    justify-content: space-between;
    margin-bottom: 3rem;
    position: relative;
  }

  .payment-step {
    flex: 1;
    text-align: center;
    position: relative;
    z-index: 1;
  }

  .step-number {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    background: white;
    border: 2px solid var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 0.5rem;
    font-weight: 600;
    color: var(--primary);
    transition: all 0.3s ease;
  }

  .payment-step.active .step-number {
    background: var(--primary);
    color: white;
  }

  .payment-step.completed .step-number {
    background: var(--secondary);
    border-color: var(--secondary);
    color: white;
  }

  .step-title {
    font-size: 0.9rem;
    color: var(--text);
    opacity: 0.8;
  }

  .step-line {
    position: absolute;
    top: 17px;
    left: 0;
    right: 0;
    height: 2px;
    background: rgba(45, 49, 146, 0.2);
    z-index: 0;
  }

  .step-progress {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: var(--gradient);
    transition: width 0.3s ease;
  }

  /* Payment Methods */
  .payment-methods {
    display: grid;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .payment-method {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem;
    border: 2px solid rgba(45, 49, 146, 0.1);
    border-radius: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .payment-method:hover {
    border-color: var(--primary);
    background: rgba(45, 49, 146, 0.02);
  }

  .payment-method.selected {
    border-color: var(--primary);
    background: rgba(45, 49, 146, 0.05);
  }

  .method-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(45, 49, 146, 0.1);
    border-radius: 0.75rem;
    color: var(--primary);
    transition: all 0.3s ease;
  }

  .payment-method:hover .method-icon,
  .payment-method.selected .method-icon {
    background: var(--primary);
    color: white;
  }

  .method-info {
    flex: 1;
  }

  .method-name {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .method-description {
    font-size: 0.9rem;
    opacity: 0.8;
  }

  .method-discount {
    background: var(--gradient);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.8rem;
    font-weight: 600;
  }

  /* Installments Section */
  .installments-section {
    margin: 2rem 0;
    padding: 1.5rem;
    background: rgba(45, 49, 146, 0.05);
    border-radius: 1rem;
  }

  .installments-slider {
    width: 100%;
    margin: 1.5rem 0;
    -webkit-appearance: none;
    appearance: none;
    height: 6px;
    background: rgba(45, 49, 146, 0.1);
    border-radius: 3px;
    outline: none;
  }

  .installments-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--primary);
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }

  .installments-slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }

  .installments-value {
    text-align: center;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--primary);
    margin-top: 1rem;
  }

  /* Price Breakdown */
  .price-breakdown {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    margin-top: 2rem;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  }

  .breakdown-item {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 0;
    border-bottom: 1px solid rgba(45, 49, 146, 0.1);
  }

  .breakdown-item:last-child {
    border-bottom: none;
  }

  .breakdown-label {
    color: var(--text);
  }

  .breakdown-value {
    font-weight: 600;
  }

  .breakdown-total {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 2px solid rgba(45, 49, 146, 0.1);
  }

  .total-label {
    font-size: 1.1rem;
    font-weight: 600;
  }

  .total-value {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--primary);
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .pricing-section {
      padding: 4rem 1rem;
    }

    .section-title {
      font-size: 2rem;
    }

    .plans-grid {
      grid-template-columns: 1fr;
    }

    .plan-card {
      max-height: none;
    }

    .payment-steps {
      flex-direction: column;
      gap: 1rem;
    }

    .step-line {
      display: none;
    }

    .modal-content {
      padding: 1.5rem;
    }
  }

  @media (max-width: 480px) {
    .plan-header {
      padding: 1rem;
    }

    .payment-method {
      flex-direction: column;
      text-align: center;
    }

    .method-discount {
      margin-top: 0.5rem;
    }
  }

  /* Animaciones */
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* Estilos adicionales para el modal y formularios */
  .personal-info-form {
    display: grid;
    gap: 1.5rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-group label {
    font-weight: 600;
    color: var(--text);
  }

  .form-group input {
    padding: 0.75rem 1rem;
    border: 2px solid rgba(45, 49, 146, 0.1);
    border-radius: 0.75rem;
    font-size: 1rem;
    transition: all 0.3s ease;
  }

  .form-group input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(45, 49, 146, 0.1);
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }

  .back-button {
    padding: 0.75rem 1.5rem;
    border: 2px solid var(--primary);
    border-radius: 0.75rem;
    background: none;
    color: var(--primary);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .back-button:hover {
    background: rgba(45, 49, 146, 0.1);
  }

  .confirmation-step {
    text-align: center;
    padding: 1rem;
  }

  .confirmation-icon {
    width: 60px;
    height: 60px;
    background: var(--gradient);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
    margin: 0 auto 1rem;
  }

  .confirmation-summary {
    background: rgba(45, 49, 146, 0.05);
    border-radius: 1rem;
    padding: 1.5rem;
    margin: 2rem 0;
  }

  .summary-item {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 0;
    border-bottom: 1px solid rgba(45, 49, 146, 0.1);
  }

  .summary-item:last-child {
    border: none;
  }

  .summary-item.total {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--primary);
  }

  .confirm-button {
    background: var(--gradient);
    color: white;
    padding: 1rem 2rem;
    border: none;
    border-radius: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .confirm-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(45, 49, 146, 0.2);
  }
</style>

<section class="pricing-section" id="precios">
  <div class="pricing-pattern">
    {@html backgroundPattern}
  </div>

  <SectionTransition position="top" type="wave" />

  <div class="pricing-container">
    {#if isInView}
      <div class="section-header" in:fade={{ duration: 1000 }}>
        <h2 class="section-title">Invierte en tu Futuro</h2>
        <p class="section-description">
          Elige el plan que mejor se adapte a tus necesidades y comienza tu preparación
          para el examen de admisión. Todos nuestros planes incluyen garantía de satisfacción.
        </p>
      </div>

      <div class="plans-grid">
        {#each plans as plan, index (plan.id)}
          <div 
            class="plan-card"
            class:recommended={plan.recommended}
            style="--primary: {plan.color.primary}; --secondary: {plan.color.secondary}; --gradient: linear-gradient(135deg, {plan.color.primary}, {plan.color.secondary})"
            in:fade={{ duration: 1000, delay: 200 * index }}
          >
            {#if plan.recommended}
              <div class="recommended-badge">Más Popular</div>
            {/if}

            <div class="plan-header">
              <h3 class="plan-name">{plan.name}</h3>
              <div class="plan-price">
                {formatPrice(plan.price)}
                <span class="plan-period">/curso</span>
              </div>
              <p class="plan-description">{plan.description}</p>
            </div>

            {#each plan.features as feature}
              <div class="features-group">
                <div class="features-title">
                  <span class="features-icon">{feature.icon}</span>
                  <h4>{feature.title}</h4>
                </div>
                <ul class="features-list">
                  {#each feature.items as item}
                    <li class="feature-item">{item}</li>
                  {/each}
                </ul>
              </div>
            {/each}

            <div class="guarantee-box">
              <span class="guarantee-icon">{plan.guarantee.icon}</span>
              <div class="guarantee-content">
                <h4 class="guarantee-title">{plan.guarantee.title}</h4>
                <p class="guarantee-description">{plan.guarantee.description}</p>
              </div>
            </div>

            <button
              class="plan-button {plan.recommended ? 'primary' : 'secondary'}"
              on:click={() => {
                selectedPlan = plan;
                isModalOpen = true;
              }}
            >
              Comenzar Ahora
            </button>
          </div>
        {/each}
          </div>
    
        {#if isModalOpen}
          <div
            class="payment-modal"
            role="dialog"
            aria-modal="true"
          >
            <button 
          <button 
            class="modal-overlay"
            on:click={handleModalClose}
            on:keydown={(e) => e.key === 'Escape' && handleModalClose()}
            aria-label="Close modal"
          ></button>
          <div 
            class="modal-content"
            role="document"
            in:fly={{ y: 20, duration: 300 }}
            tabindex="-1"
          >
            <button 
              class="modal-close"
              on:click={handleModalClose}
              aria-label="Cerrar modal"
            >
              ×
            </button>

            <div class="payment-steps">
              <div class="step-line">
                <div 
                  class="step-progress"
                  style="width: {((currentStep - 1) / 2) * 100}%"
                ></div>
              </div>

              {#each Array(3) as _, i}
                <div 
                  class="payment-step"
                  class:active={currentStep === i + 1}
                  class:completed={currentStep > i + 1}
                >
                  <div class="step-number">
                    {#if currentStep > i + 1}
                      ✓
                    {:else}
                      {i + 1}
                    {/if}
                  </div>
                  <div class="step-title">
                    {i === 0 ? 'Método de Pago' : i === 1 ? 'Datos Personales' : 'Confirmación'}
                  </div>
                </div>
              {/each}
            </div>

            {#if currentStep === 1}
              <div class="payment-methods">
                {#each paymentMethods as method}
                  <button
                    type="button"
                    class="payment-method"
                    class:selected={paymentMethod === method.id}
                    on:click={() => paymentMethod = method.id}
                    role="radio"
                    aria-checked={paymentMethod === method.id}
                  >
                    <div class="method-icon">
                      {@html method.icon}
                    </div>
                    <div class="method-info">
                      <div class="method-name">{method.name}</div>
                      {#if method.installmentsAvailable}
                        <div class="method-description">Disponible hasta 12 cuotas</div>
                      {/if}
                    </div>
                    {#if method.discount}
                      <div class="method-discount">
                        {method.discount}% OFF
                      </div>
                    {/if}
                  </button>
                {/each}
              </div>

              {#if paymentMethods.find(m => m.id === paymentMethod)?.installmentsAvailable}
                <div class="installments-section">
                  <h4>Elige tus Cuotas</h4>
                  <input
                    type="range"
                    class="installments-slider"
                    min="1"
                    max="12"
                    bind:value={installments}
                  />
                  <div class="installments-value">
                    {installments} {installments === 1 ? 'pago' : 'cuotas'} de {formatPrice(monthlyPayment)}
                  </div>
                </div>
              {/if}

              <div class="discounts-group">
                <h4>Descuentos Disponibles</h4>
                <label class="discount-option">
                  <div class="checkbox-wrapper">
                    <input
                      type="checkbox"
                      bind:checked={studentDiscount}
                    />
                    <span class="custom-checkbox"></span>
                  </div>
                  <div class="discount-info">
                    <span>Descuento Estudiante</span>
                    <span class="discount-value">-{discounts.student}%</span>
                </label>
                <label for="referralCode">Código de Referido</label>
                <div class="input-group">
                  <input
                    id="referralCode"
                    type="text"
                    placeholder="Ingresa tu código"
                    bind:value={referralCode}
                  />
                  {#if referralCode}
                    <div class="discount-badge">-{discounts.referral}%</div>
                  {/if}
                </div>
              </div>

              <div class="price-breakdown">
                <h4>Resumen de tu Plan</h4>
                <div class="breakdown-item">
                  <span class="breakdown-label">Plan {selectedPlan?.name}</span>
                  <span class="breakdown-value">{formatPrice(selectedPlan?.price || 0)}</span>
                </div>

                {#if studentDiscount}
                  <div class="breakdown-item discount">
                    <span class="breakdown-label">Descuento Estudiante</span>
                    <span class="breakdown-value">-{formatPrice((selectedPlan?.price || 0) * (discounts.student / 100))}</span>
                  </div>
                {/if}

                {#if referralCode}
                  <div class="breakdown-item discount">
                    <span class="breakdown-label">Descuento Referido</span>
                    <span class="breakdown-value">-{formatPrice((selectedPlan?.price || 0) * (discounts.referral / 100))}</span>
                  </div>
                {/if}

                {#if paymentMethods.find(m => m.id === paymentMethod)?.discount}
                  <div class="breakdown-item discount">
                    <span class="breakdown-label">
                      Descuento {paymentMethods.find(m => m.id === paymentMethod)?.name}
                    </span>
                    <span class="breakdown-value">
                      -{formatPrice((selectedPlan?.price || 0) * (paymentMethods.find(m => m.id === paymentMethod)?.discount || 0) / 100)}
                    </span>
                  </div>
                {/if}

                <div class="breakdown-total">
                  <span class="total-label">Total a Pagar</span>
                  <span class="total-value">{formatPrice(calculateFinalPrice(selectedPlan))}</span>
                </div>

                {#if installments > 1}
                  <div class="installments-summary">
                    <span>{installments} cuotas de {formatPrice(monthlyPayment)}</span>
                  </div>
                {/if}
              </div>

              <!-- Botón de Continuar -->
              <button 
                class="proceed-button"
                on:click={() => currentStep = 2}
              >
                Continuar
                <span>→</span>
              </button>

            {:else if currentStep === 2}
              <div class="personal-info-form">
                <h3>Datos Personales</h3>
                
                <div class="form-group">
                  <label for="nombre">Nombre Completo</label>
                  <input 
                    type="text" 
                    id="nombre"
                    placeholder="Ingresa tu nombre completo"
                    required
                  />
                </div>

                <div class="form-group">
                  <label for="email">Correo Electrónico</label>
                  <input 
                    type="email" 
                    id="email"
                    placeholder="tu@email.com"
                    required
                  />
                </div>

                <div class="form-group">
                  <label for="telefono">Teléfono</label>
                  <input 
                    type="tel" 
                    id="telefono"
                    placeholder="Número de contacto"
                    required
                  />
                </div>

                <div class="form-group">
                  <label for="documento">Documento de Identidad</label>
                  <input 
                    type="text" 
                    id="documento"
                    placeholder="Número de documento"
                    required
                  />
                </div>

                <div class="form-actions">
                  <button 
                    class="back-button"
                    on:click={() => currentStep = 1}
                  >
                    ← Volver
                  </button>
                  <button 
                    class="proceed-button"
                    on:click={() => currentStep = 3}
                  >
                    Continuar →
                  </button>
                </div>
              </div>

            {:else}
              <div class="confirmation-step">
                <div class="confirmation-header">
                  <div class="confirmation-icon">✓</div>
                  <h3>Confirma tu Pedido</h3>
                </div>

                <div class="confirmation-summary">
                  <div class="summary-item">
                    <span>Plan Seleccionado</span>
                    <span>{selectedPlan?.name}</span>
                  </div>
                  <div class="summary-item">
                    <span>Método de Pago</span>
                    <span>{paymentMethods.find(m => m.id === paymentMethod)?.name}</span>
                  </div>
                  {#if installments > 1}
                    <div class="summary-item">
                      <span>Forma de Pago</span>
                      <span>{installments} cuotas de {formatPrice(monthlyPayment)}</span>
                    </div>
                  {/if}
                  <div class="summary-item total">
                    <span>Total a Pagar</span>
                    <span>{formatPrice(calculateFinalPrice(selectedPlan))}</span>
                  </div>
                </div>

                <div class="confirmation-actions">
                  <button 
                    class="back-button"
                    on:click={() => currentStep = 2}
                  >
                    ← Volver
                  </button>
                  <button 
                    class="confirm-button"
                    on:click={() => {
                      processingPayment = true;
                      setTimeout(() => {
                        processingPayment = false;
                        paymentSuccess = true;
                      }, 2000);
                    }}
                  >
                    Confirmar y Pagar
                  </button>
                </div>
              </div>
            {/if}

            <div class="modal-footer">
              <div class="secure-payment">
                <span class="secure-icon">🔒</span>
                <span>Pago 100% seguro - Encriptación SSL</span>
              </div>
            </div>
          </div>
        </div>
      {/if}
    {/if}
  </div>

  <SectionTransition position="bottom" type="wave" />
</section>