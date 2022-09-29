<script>
    import Utils from "../Utils"
    import Event from "./Event.svelte"

    export let events
    export let options
    export let viewportWidth

    // $: console.error("events", events)
    // console.warn("options.xRange", options.xRange)

    const MIN_HEIGHT = 100
    const EVENT_HEIGHT = 20

    const margin = {
        top: 20,
        left: Utils.CANVAS_PADDING_LEFT,
        right: Utils.CANVAS_PADDING_RIGHT,
        bottom: 20,
    }

    function eventsHeight(size) {
        let h = size * EVENT_HEIGHT + margin.top + margin.bottom
        if (h < MIN_HEIGHT) h = MIN_HEIGHT
        return h
    }
</script>

{#if viewportWidth}
    <svg
        class="events"
        width={viewportWidth}
        height={eventsHeight(events.length)}
    >
        {#each events as event}
            <Event
                {event}
                {margin}
                height={EVENT_HEIGHT}
                {viewportWidth}
                {options}
                on:optionsChanged
            />
        {/each}
    </svg>
{/if}
