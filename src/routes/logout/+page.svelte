<script>
    import { goto } from '$app/navigation';
    
    async function logoutUser() {
        document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        goto('/login');
    }
</script>

<button on:click={logoutUser}>Logout</button>