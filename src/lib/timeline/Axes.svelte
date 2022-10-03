<script>
    import { fade } from "svelte/transition"

    import Utils from "../Utils.js"
    import TimelineDate from "../classes/TimelineDate.js"

    export let xAxis
    export let viewportWidth
    export let drawingWidth

    const AXIS_HEIGHT = 35
    const MAJOR_TICK_Y1 = 0
    const MAJOR_TICK_HEIGHT = 10
</script>

<!------------------------------------------------------------------------------
@section HTML
-------------------------------------------------------------------------------->

<!-- <p>viewportWidth={viewportWidth}, drawingWidth={drawingWidth}</p> -->

{#if xAxis}
    <svg
        class="axis"
        width={viewportWidth}
        height={AXIS_HEIGHT}
        transition:fade
    >
        <line
            class="svg-major"
            x1={Utils.CANVAS_PADDING_LEFT}
            y1={MAJOR_TICK_Y1}
            x2={Utils.CANVAS_PADDING_LEFT + drawingWidth}
            y2={MAJOR_TICK_Y1}
        />

        {#each xAxis.ticks as x, majorIndex}
            {@const paddedX = Utils.CANVAS_PADDING_LEFT + x}
            <line
                class="svg-major-tick"
                x1={paddedX}
                y1={MAJOR_TICK_Y1}
                x2={paddedX}
                y2={MAJOR_TICK_HEIGHT}
            />

            <text
                class="svg-major-label"
                x={paddedX - Utils.MIN_BOX_WIDTH / 4}
                y={MAJOR_TICK_HEIGHT + 14}
            >
                {TimelineDate.formatYear(xAxis.labels[majorIndex])}
            </text>
        {/each}
    </svg>
{/if}

<!------------------------------------------------------------------------------
@section STYLES
-------------------------------------------------------------------------------->
<style>
    svg {
        margin-top: 0.5rem;
        position: relative;
        width: 100%;
        z-index: 1;
    }

    .svg-major {
        stroke-width: 4;
        stroke: var(--tl-colour-lines);
    }

    .svg-major-tick {
        stroke-width: 2;
        stroke: var(--tl-colour-lines);
    }

    .svg-major-label {
        fill: var(--tl-colour-font);
        /* font-size: 0.8rem; */
    }

    /* .svg-minor-tick {
        stroke-width: 1;
        stroke: gray;
    }
</style>
