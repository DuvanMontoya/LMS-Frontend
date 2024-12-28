
<script>
	import { onMount } from "svelte";
	import { fly } from "svelte/transition";
	import { cubicOut } from "svelte/easing";
	import { goto } from "$app/navigation";
	// import Header from "$lib/components/layout/Header.svelte";
	import Sidebar from "$lib/components/layout/Sidebar.svelte";
	import { sessionStore } from "$lib/stores/sessionStore";
	import { page } from "$app/stores";
	import ToastContainer from "svelte-toasts/src/ToastContainer.svelte";
	// import MathJaxProvider from '$lib/components/extras//MathJaxProvider.svelte';
	

	let isLoading = true;
	let isStudyPage = false;
	let isMobile = false;
	let showSidebar = false;

	$: {
		isStudyPage =
			$page.url.pathname.startsWith("/cursos/") &&
			$page.url.pathname.endsWith("/estudio");
	}

	onMount(async () => {
		if ($sessionStore.isAuthenticated) {
			try {
				const response = await fetch(
					"http://localhost:8000/api/perfil/",
					{
						headers: {
							Authorization: `Bearer ${$sessionStore.access}`,
						},
					},
				);
				if (response.ok) {
					const userData = await response.json();
					sessionStore.setUser(userData.user);
				} else if (response.status === 401) {
					sessionStore.logout();
					goto("/login");
				} else {
					sessionStore.logout();
				}
			} catch (error) {
				console.error("Error fetching user data:", error);
				sessionStore.logout();
			}
		}
		isLoading = false;

		const checkDeviceSize = () => {
			isMobile = window.innerWidth <= 768;
			showSidebar = window.innerWidth > 1024;
		};

		checkDeviceSize();
		window.addEventListener("resize", checkDeviceSize);

		return () => {
			window.removeEventListener("resize", checkDeviceSize);
		};
	});

	function handleLogout() {
		sessionStore.logout();
		goto("/login");
	}

	function toggleSidebar() {
		showSidebar = !showSidebar;
	}
</script>

<svelte:head>
	<link
		href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap"
		rel="stylesheet"
	/>
	<link
		rel="stylesheet"
		href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
	/>
	<link
		href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="app" class:mobile={isMobile}>
	{#if !isStudyPage}
		<!-- <Header on:logout={handleLogout} {isMobile} {toggleSidebar} /> -->
	{/if}
	<main
		class:sidebar-open={$sessionStore.isAuthenticated &&
			!isStudyPage &&
			showSidebar}
	>
		{#if $sessionStore.isAuthenticated && !isStudyPage}
			<Sidebar {isMobile} bind:showSidebar />
		{/if}
		<div
			class="content"
			in:fly={{ y: 20, duration: 300, easing: cubicOut }}
		>
			{#if isLoading}
				<div class="loading">
					<div class="spinner"></div>
				</div>
			{:else}
			<!-- <MathJaxProvider> -->
				<slot />
			<!-- </MathJaxProvider> -->
			{/if}
		</div>
		<ToastContainer position="top-right" />
	</main>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background-color: #f8f9fa;
		font-family: "Poppins", sans-serif;
	}

	main {
		display: flex;
		flex-grow: 1;
		transition: margin-left 0.3s ease;
	}

	.content {
		flex-grow: 1;
		background-color: #ffffff;
		border-radius: 12px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
		padding: 15px;
		margin: 10px;
		transition: all 0.3s ease;
		overflow-x: hidden;
	}

	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 200px;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		border: 4px solid #f3f3f3;
		border-top: 4px solid #3498db;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	/* Responsive styles */
	@media (max-width: 1024px) {
		.sidebar-open .content {
			margin-left: 250px;
		}
	}

	@media (max-width: 768px) {
		main {
			flex-direction: column;
		}

		.content {
			margin: 0;
			padding: 0;
		}

		.sidebar-open .content {
			margin-left: 5px;
		}
	}

	@media (max-width: 480px) {
		.content {
			margin: 0;
			padding: 0;
		}
	}
</style>
