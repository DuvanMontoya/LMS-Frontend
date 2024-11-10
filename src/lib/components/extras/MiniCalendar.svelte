<script>
    import { onMount } from "svelte";
    import { Calendar } from "@fullcalendar/core";
    import dayGridPlugin from "@fullcalendar/daygrid";
    import interactionPlugin from "@fullcalendar/interaction";

    export let calendar;

    let miniCalendarEl;
    let miniCalendar;

    onMount(() => {
        miniCalendar = new Calendar(miniCalendarEl, {
            plugins: [dayGridPlugin, interactionPlugin],
            initialView: "dayGridMonth",
            headerToolbar: {
                left: "prev,next",
                center: "title",
                right: "",
            },
            dateClick: (info) => {
                calendar.gotoDate(info.date);
            },
            height: "auto",
        });

        miniCalendar.render();
    });
</script>

<div bind:this={miniCalendarEl} class="mini-calendar"></div>

<style>
    .mini-calendar {
        margin-bottom: 20px;
    }

    :global(.mini-calendar .fc-view-harness) {
        height: auto !important;
    }

    :global(.mini-calendar .fc-daygrid-body) {
        min-height: auto !important;
    }

    :global(.mini-calendar .fc-daygrid-day) {
        height: 30px !important;
    }

    :global(.mini-calendar .fc-daygrid-day-number) {
        font-size: 0.8em;
    }

    :global(.mini-calendar .fc-toolbar-title) {
        font-size: 1em;
    }
</style>
