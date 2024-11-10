<script>
    import { onMount, afterUpdate } from 'svelte';
    import { get } from 'svelte/store';
    import { sessionStore } from '$lib/stores/sessionStore';
    import { Calendar } from '@fullcalendar/core';
    import dayGridPlugin from '@fullcalendar/daygrid';
    import timeGridPlugin from '@fullcalendar/timegrid';
    import listPlugin from '@fullcalendar/list';
    import interactionPlugin from '@fullcalendar/interaction';
    import { 
        fetchCalendarios, fetchEventos, createEvento, updateEvento, deleteEvento,
        asignarPermisoCalendario, asignarPermisoEvento, transferirPropiedadCalendario,
        transferirPropiedadEvento, fetchRoles, createCalendario
    } from '$lib/api/calendario/calendario';
    import Modal from '$lib/components/horario/Modal.svelte';
    import EventoForm from '$lib/components/horario/EventoForm.svelte';
    import CalendarioForm from '$lib/components/horario/CalendarioForm.svelte';
    import PermisoForm from '$lib/components/horario/PermisoForm.svelte';
    import { fade, fly } from 'svelte/transition';
    import { toast } from '@zerodevx/svelte-toast';
    
    let calendar;
    let calendarios = [];
    let eventos = [];
    let eventosFormateados = [];
    let userRol = '';
    let showEventoModal = false;
    let showCalendarioModal = false;
    let showPermisoModal = false;
    let eventoSeleccionado = null;
    let calendarioSeleccionado = null;
    let loading = true;
    let error = null;
    let calendarEl;
    
    onMount(async () => {
        if (!get(sessionStore).isAuthenticated) {
            window.location.href = '/login';
            return;
        }
        await cargarDatos();
    });
    
    afterUpdate(() => {
        if (!loading && !error && calendarEl && !calendar) {
            inicializarCalendario();
        }
    });
    
    async function cargarDatos() {
    try {
        const [calendariosData, eventosData, rolesData] = await Promise.all([
            fetchCalendarios(),
            fetchEventos(),
            fetchRoles()
        ]);
        
        calendarios = calendariosData.results || [];
        eventos = eventosData.results || [];
        
        const rolesArray = rolesData.results || [];
        const currentUserId = get(sessionStore).user.id;
        const userRolObject = rolesArray.find(rol => rol.usuario === currentUserId);
        userRol = userRolObject ? userRolObject.rol : 'user';
        
        formatearEventos();
        
        console.log('Datos cargados:', { calendarios, eventos, userRol, eventosFormateados });
    } catch (err) {
        console.error('Error al cargar datos:', err);
        error = 'Hubo un problema al cargar los datos. Por favor, recarga la página.';
        toast.push(error, { theme: { '--toastBackground': '#F56565', '--toastBarBackground': '#C53030' } });
    } finally {
        loading = false;
    }
}
    
function formatearEventos() {
    eventosFormateados = eventos.map(evento => ({
        id: evento.id,
        title: evento.titulo,
        start: evento.fecha_inicio,
        end: evento.fecha_fin,
        allDay: false, // Asumimos que no son eventos de día completo por defecto
        backgroundColor: evento.color,
        borderColor: evento.color,
        extendedProps: {
            descripcion: evento.descripcion,
            tipo: evento.tipo,
            calendario: evento.calendario
        }
    }));
}
    
function inicializarCalendario() {
    if (!calendarEl) {
        console.error('Elemento del calendario no encontrado');
        return;
    }
    
    calendar = new Calendar(calendarEl, {
        plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },
        events: eventosFormateados,
        editable: true,
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        weekNumbers: true,
        navLinks: true,
        select: handleDateSelect,
        eventClick: handleEventClick,
        eventDrop: handleEventDrop,
        eventResize: handleEventResize,
        loading: function(isLoading) {
            loading = isLoading;
        }
    });
    
    calendar.render();
}

    
    function handleDateSelect(selectInfo) {
        if (!tienePermisoCrearEvento()) {
            toast.push('No tienes permiso para crear eventos en este calendario.', { theme: { '--toastBackground': '#F6E05E', '--toastBarBackground': '#D69E2E' } });
            return;
        }
        eventoSeleccionado = {
            start: selectInfo.startStr,
            end: selectInfo.endStr,
            allDay: selectInfo.allDay,
            calendario: calendarios.length > 0 ? calendarios[0].id : null
        };
        showEventoModal = true;
    }
    
    function handleEventClick(clickInfo) {
        if (!tienePermisoVerEvento(clickInfo.event)) {
            toast.push('No tienes permiso para ver este evento.', { theme: { '--toastBackground': '#F6E05E', '--toastBarBackground': '#D69E2E' } });
            return;
        }
        eventoSeleccionado = { 
            ...clickInfo.event.extendedProps, 
            id: clickInfo.event.id,
            start: clickInfo.event.start,
            end: clickInfo.event.end,
            allDay: clickInfo.event.allDay,
            title: clickInfo.event.title
        };
        showEventoModal = true;
    }
    
    async function handleEventDrop(dropInfo) {
        if (!tienePermisoEditarEvento(dropInfo.event)) {
            toast.push('No tienes permiso para editar este evento.', { theme: { '--toastBackground': '#F6E05E', '--toastBarBackground': '#D69E2E' } });
            dropInfo.revert();
            return;
        }
        try {
            await updateEvento(dropInfo.event.id, {
                start: dropInfo.event.startStr,
                end: dropInfo.event.endStr
            });
            toast.push('Evento actualizado con éxito', { theme: { '--toastBackground': '#68D391', '--toastBarBackground': '#38A169' } });
        } catch (error) {
            console.error('Error al actualizar evento:', error);
            dropInfo.revert();
            toast.push('Error al actualizar el evento', { theme: { '--toastBackground': '#F56565', '--toastBarBackground': '#C53030' } });
        }
    }
    
    async function handleEventResize(resizeInfo) {
        if (!tienePermisoEditarEvento(resizeInfo.event)) {
            toast.push('No tienes permiso para editar este evento.', { theme: { '--toastBackground': '#F6E05E', '--toastBarBackground': '#D69E2E' } });
            resizeInfo.revert();
            return;
        }
        try {
            await updateEvento(resizeInfo.event.id, {
                end: resizeInfo.event.endStr
            });
            toast.push('Evento redimensionado con éxito', { theme: { '--toastBackground': '#68D391', '--toastBarBackground': '#38A169' } });
        } catch (error) {
            console.error('Error al redimensionar evento:', error);
            resizeInfo.revert();
            toast.push('Error al redimensionar el evento', { theme: { '--toastBackground': '#F56565', '--toastBarBackground': '#C53030' } });
        }
    }
    
    async function handleEventoGuardado(event) {
    const eventoData = event.detail;
    try {
        if (eventoData.id) {
            if (!tienePermisoEditarEvento(eventoData)) {
                throw new Error('No tienes permiso para editar este evento.');
            }
            await updateEvento(eventoData.id, eventoData);
        } else {
            if (!tienePermisoCrearEvento()) {
                throw new Error('No tienes permiso para crear eventos en este calendario.');
            }
            await createEvento(eventoData);
        }
        await cargarDatos();
        if (calendar) {
            calendar.removeAllEvents();
            calendar.addEventSource(eventosFormateados);
        }
        showEventoModal = false;
        toast.push('Evento guardado con éxito', { theme: { '--toastBackground': '#68D391', '--toastBarBackground': '#38A169' } });
    } catch (error) {
        console.error('Error al guardar el evento:', error);
        toast.push(`Error al guardar el evento: ${error.message}`, { theme: { '--toastBackground': '#F56565', '--toastBarBackground': '#C53030' } });
    }
}
    
async function handleEventoEliminado(event) {
    const eventoId = event.detail;
    try {
        if (!tienePermisoEliminarEvento(eventoId)) {
            throw new Error('No tienes permiso para eliminar este evento.');
        }
        const response = await deleteEvento(eventoId);
        if (response.status === 204) {
            // Eliminación exitosa
            await cargarDatos();
            if (calendar) {
                calendar.removeAllEvents();
                calendar.addEventSource(eventosFormateados);
            }
            showEventoModal = false;
            toast.push('Evento eliminado con éxito', { theme: { '--toastBackground': '#68D391', '--toastBarBackground': '#38A169' } });
        } else {
            throw new Error('Error al eliminar el evento');
        }
    } catch (error) {
        console.error('Error al eliminar el evento:', error);
        toast.push(`Error al eliminar el evento: ${error.message}`, { theme: { '--toastBackground': '#F56565', '--toastBarBackground': '#C53030' } });
    }
}
    
    function handleCrearCalendario() {
        if (!tienePermisoCrearCalendario()) {
            toast.push('No tienes permiso para crear un nuevo calendario.', { theme: { '--toastBackground': '#F6E05E', '--toastBarBackground': '#D69E2E' } });
            return;
        }
        showCalendarioModal = true;
    }
    
    async function handleCalendarioGuardado(event) {
        const calendarioData = event.detail;
        try {
            await createCalendario(calendarioData);
            await cargarDatos();
            showCalendarioModal = false;
            toast.push('Calendario creado con éxito', { theme: { '--toastBackground': '#68D391', '--toastBarBackground': '#38A169' } });
        } catch (error) {
            console.error('Error al crear el calendario:', error);
            toast.push(`Error al crear el calendario: ${error.message}`, { theme: { '--toastBackground': '#F56565', '--toastBarBackground': '#C53030' } });
        }
    }
    
    function handleAsignarPermiso(tipo, id) {
        calendarioSeleccionado = tipo === 'calendario' ? calendarios.find(c => c.id === id) : null;
        eventoSeleccionado = tipo === 'evento' ? eventos.find(e => e.id === id) : null;
        showPermisoModal = true;
    }
    
    async function handlePermisoGuardado(event) {
        const permisoData = event.detail;
        try {
            if (calendarioSeleccionado) {
                await asignarPermisoCalendario(calendarioSeleccionado.id, permisoData);
            } else if (eventoSeleccionado) {
                await asignarPermisoEvento(eventoSeleccionado.id, permisoData);
            }
            await cargarDatos();
            showPermisoModal = false;
            toast.push('Permiso asignado con éxito', { theme: { '--toastBackground': '#68D391', '--toastBarBackground': '#38A169' } });
        } catch (error) {
            console.error('Error al asignar permiso:', error);
            toast.push(`Error al asignar permiso: ${error.message}`, { theme: { '--toastBackground': '#F56565', '--toastBarBackground': '#C53030' } });
        }
    }
    
    async function handleTransferirPropiedad(tipo, id, nuevoUsuarioId) {
        try {
            if (tipo === 'calendario') {
                await transferirPropiedadCalendario(id, { nuevo_propietario_id: nuevoUsuarioId });
            } else if (tipo === 'evento') {
                await transferirPropiedadEvento(id, { nuevo_propietario_id: nuevoUsuarioId });
            }
            await cargarDatos();
            toast.push('Propiedad transferida exitosamente', { theme: { '--toastBackground': '#68D391', '--toastBarBackground': '#38A169' } });
        } catch (error) {
            console.error('Error al transferir propiedad:', error);
            toast.push(`Error al transferir propiedad: ${error.message}`, { theme: { '--toastBackground': '#F56565', '--toastBarBackground': '#C53030' } });
        }
    }
    
    function tienePermisoCrearEvento() {
        return userRol === 'admin' || userRol === 'advanced_user' || (userRol === 'user' && calendarios.some(c => c.creador.id === get(sessionStore).user.id));
    }
    
    function tienePermisoVerEvento(evento) {
        return userRol === 'admin' || evento.calendario.tipo === 'publico' || evento.creador.id === get(sessionStore).user.id || calendarios.some(c => c.id === evento.calendario.id && c.creador.id === get(sessionStore).user.id);
    }
    
    function tienePermisoEditarEvento(evento) {
        return userRol === 'admin' || evento.creador.id === get(sessionStore).user.id || (userRol === 'advanced_user' && evento.calendario.tipo !== 'privado');
    }
    
    function tienePermisoEliminarEvento(eventoId) {
        const evento = eventos.find(e => e.id === eventoId);
        return userRol === 'admin' || (evento && evento.creador.id === get(sessionStore).user.id);
    }
    
    function tienePermisoCrearCalendario() {
        return userRol === 'admin' || userRol === 'advanced_user' || (userRol === 'user' && !calendarios.some(c => c.creador.id === get(sessionStore).user.id));
    }
    </script>
    
    <main class="calendar-container" transition:fade={{ duration: 300 }}>
        <h1 class="title">Calendario</h1>
        {#if loading}
            <div class="loading-spinner"></div>
        {:else if error}
            <div class="error-message" transition:fly={{ y: 200, duration: 300 }}>
                {error}
                <button on:click={cargarDatos}>Reintentar</button>
            </div>
        {:else}
            <div bind:this={calendarEl} class="calendar" transition:fade={{ duration: 300 }}></div>
            <button class="create-calendar-btn" on:click={handleCrearCalendario}>
                Crear Calendario
            </button>
        {/if}
    
        <Modal bind:show={showEventoModal}>
            <EventoForm 
            evento={eventoSeleccionado}
            {calendarios}
            {userRol}
            on:guardar={handleEventoGuardado}
            on:eliminar={handleEventoEliminado}
            on:asignarPermiso={(e) => handleAsignarPermiso('evento', e.detail)}
            on:transferirPropiedad={(e) => handleTransferirPropiedad('evento', e.detail.id, e.detail.nuevoUsuarioId)}
        />
    </Modal>

    <Modal bind:show={showCalendarioModal}>
        <CalendarioForm
            {userRol}
            on:guardar={handleCalendarioGuardado}
        />
    </Modal>

    <Modal bind:show={showPermisoModal}>
        <PermisoForm
            calendario={calendarioSeleccionado}
            evento={eventoSeleccionado}
            on:guardar={handlePermisoGuardado}
        />
    </Modal>
</main>

<style>
    .calendar-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }

    .title {
        font-size: 2.5rem;
        font-weight: 700;
        color: #2d3748;
        margin-bottom: 1.5rem;
        text-align: center;
    }

    .calendar {
        background-color: white;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        height: 700px;
        margin-bottom: 1.5rem;
    }

    .create-calendar-btn {
        background-color: #4299e1;
        color: white;
        font-weight: 600;
        padding: 0.75rem 1.5rem;
        border-radius: 0.375rem;
        transition: background-color 0.3s ease;
        box-shadow: 0 4px 6px -1px rgba(66, 153, 225, 0.5), 0 2px 4px -1px rgba(66, 153, 225, 0.3);
    }

    .create-calendar-btn:hover {
        background-color: #3182ce;
    }

    .loading-spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3182ce;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin: 20px auto;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .error-message {
        background-color: #fed7d7;
        border-left: 4px solid #f56565;
        color: #c53030;
        padding: 1rem;
        margin-bottom: 1rem;
        border-radius: 0.375rem;
    }
</style>