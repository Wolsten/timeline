<script>
    import { fade } from "svelte/transition"

    import Utils from "../Utils.js"

    export let xAxis
    export let viewportWidth
    export let drawingWidth

    const AXIS_HEIGHT = 35
    const MAJOR_TICK_Y1 = 0
    const MAJOR_TICK_HEIGHT = 10
    const CHAR_WIDTH = 10 // Approx

    $: alignWithTicks = xAxis.units != "months" && xAxis.units != "quarters"
    $: interval = xAxis.ticks[1]

    // $: console.log(xAxis)
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
            class="x-axis"
            x1={Utils.CANVAS_PADDING_LEFT}
            y1={MAJOR_TICK_Y1}
            x2={Utils.CANVAS_PADDING_LEFT + drawingWidth}
            y2={MAJOR_TICK_Y1}
        />

        {#each xAxis.ticks as x, index}
            {@const paddedX = Utils.CANVAS_PADDING_LEFT + x}
            {@const label = xAxis.labels[index]}
            {@const labelWidth = label.length * CHAR_WIDTH}
            {@const offsetX = alignWithTicks
                ? labelWidth / 2
                : -(interval - labelWidth) / 2}

            <line
                class="tick"
                class:major={xAxis.units == "quarters" && label == "Q1"}
                x1={paddedX}
                y1={MAJOR_TICK_Y1}
                x2={paddedX}
                y2={MAJOR_TICK_HEIGHT}
            />

            {#if alignWithTicks || index < xAxis.ticks.length - 1}
                <text
                    class="label"
                    x={paddedX - offsetX}
                    y={MAJOR_TICK_HEIGHT + 16}
                >
                    {label}
                </text>
            {/if}
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

    .x-axis {
        stroke-width: 4;
        stroke: var(--tl-colour-lines);
    }

    .tick {
        stroke-width: 2;
        stroke: var(--tl-colour-lines);
    }

    .tick.major {
        stroke-width: 4;
    }

    .label {
        fill: var(--tl-colour-font);
    }
</style>
