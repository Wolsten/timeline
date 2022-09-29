<script>
    import { fade } from "svelte/transition"

    import Utils from "../Utils.js"
    import TimelineDate from "../classes/TimelineDate.js"

    export let options
    export let viewportWidth
    export let drawingWidth

    const AXIS_HEIGHT = 35
    const MAJOR_TICK_Y1 = 0
    const MAJOR_TICK_HEIGHT = 10

    $: options.xAxis = scaleXAxis(drawingWidth, options.xRange)

    /**
     * Scale and label the axis based on the current data range defined in xAxis
     * and constrained by the options range
     * @param {Number} drawingWidth
     * @returns {Object}
     */
    function scaleXAxis(drawingWidth, xRange) {
        console.warn(
            "\nscaleXAxis: options x range",
            xRange.start.year,
            xRange.end.year,
            xRange.range,
            "\nscaled intervals",
            xRange.scaledIntervals,
            "\nscaled interval",
            xRange.scaledInterval,
            "\nscaled range",
            xRange.scaledRange,
            "\ndrawingWidth",
            drawingWidth
        )
        // Canvas interval
        const canvasInterval = drawingWidth / xRange.scaledIntervals
        // console.log("canvasInterval", canvasInterval)
        let canvasX = Utils.CANVAS_PADDING_LEFT
        let x = xRange.start.year
        const axis = {
            values: [],
            ticks: [],
            labels: [],
            majorFirst: x,
            majorLast: 0,
            majorRange: 0,
        }

        for (let i = 0; i <= xRange.scaledIntervals; i++) {
            const tick = canvasX //Math.round(canvasX)
            const value = x //(Math.round(x)
            const label = TimelineDate.formatYear(x) //TimelineDate.formatYear(Math.round(x))
            axis.ticks = [...axis.ticks, tick]
            axis.values = [...axis.values, value]
            axis.labels = [...axis.labels, label]
            canvasX += canvasInterval
            x += xRange.scaledInterval
        }

        axis.majorLast = axis.labels[axis.labels.length - 1]
        axis.majorRange = axis.majorLast - axis.majorFirst

        console.table(axis)

        return axis
    }
</script>

<!------------------------------------------------------------------------------
@section HTML
-------------------------------------------------------------------------------->

<!-- <p>viewportWidth={viewportWidth}, drawingWidth={drawingWidth}</p> -->

{#if drawingWidth > 0}
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

        {#each options.xAxis.ticks as x, majorIndex}
            <line
                class="svg-major-tick"
                x1={x}
                y1={MAJOR_TICK_Y1}
                x2={x}
                y2={MAJOR_TICK_HEIGHT}
            />

            <text
                class="svg-major-label"
                x={x - Utils.MIN_BOX_WIDTH / 4}
                y={MAJOR_TICK_HEIGHT + 14}
            >
                {TimelineDate.formatYear(options.xAxis.labels[majorIndex])}
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
