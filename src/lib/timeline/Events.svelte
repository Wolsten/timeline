<script>
    import { afterUpdate } from "svelte"
    import Utils from "../Utils"
    import Event from "./Event.svelte"

    export let events
    export let options
    export let viewportWidth
    export let size // @todo can probably lose this one
    export let scale

    // console.error('events',events)

    console.warn("options.xRange", options.xRange)

    const MIN_HEIGHT = 100
    const EVENT_HEIGHT = 20

    const margin = {
        top: 20,
        left: Utils.CANVAS_PADDING_LEFT,
        right: Utils.CANVAS_PADDING_RIGHT,
        bottom: 20,
    }

    afterUpdate(() => {})

    function eventsHeight(size) {
        let h = size * EVENT_HEIGHT + margin.top + margin.bottom
        if (h < MIN_HEIGHT) h = MIN_HEIGHT
        // console.log('set height to',h)
        return h
    }
</script>

{#if viewportWidth}
    <svg class="events" width={viewportWidth} height={eventsHeight(size)}>
        {#each events as event}
            <Event
                {scale}
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
