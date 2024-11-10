<script>
    async function logoutUser() {
      const response = await fetch('/api/logout/', {
        method: 'POST'
      });
      if (response.ok) {
        // Redirect or update UI accordingly
      } else {
        console.error('Logout failed');
      }
    }
  </script>
  
  <button on:click={logoutUser}>Logout</button>
  