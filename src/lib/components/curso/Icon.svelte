<script>
    import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
    import { faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
  
    export let icon;
    export let spin = false;
  
    const iconMap = {
      loader: faSpinner,
      'alert-triangle': faExclamationTriangle,
      // Agrega aquí otros íconos que necesites
    };
  </script>
  
  <FontAwesomeIcon icon={iconMap[icon] || icon} {spin} />