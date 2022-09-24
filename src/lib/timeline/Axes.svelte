<script>
    import { fade } from "svelte/transition"

    import Utils from "../Utils.js"

    // export let xAxis
    export let options
    export let viewportWidth
    export let drawingWidth
    // export let xRange

    // console.table(xAxis)

    const AXIS_HEIGHT = 35
    const MAJOR_TICK_Y1 = 0 //-4
    const MAJOR_TICK_HEIGHT = 10

    $: if (options.xRange) options.xAxis = scaleXAxis(drawingWidth)

    /**
     * Scale and label the axis based on the current data range defined in xAxis
     * and constrained by the options range
     * @param {Number} drawingWidth
     * @returns {Object}
     */
    function scaleXAxis(drawingWidth) {
        // console.warn('scaleXAxis: options x range', optionsXRange)
        // console.log('scaleXAxis: old xAxis')
        // console.table(xAxis)

        // debugger
        const intervals = Math.floor(drawingWidth / Utils.MIN_BOX_WIDTH)
        const canvasInterval = Math.round(drawingWidth / intervals)
        const dataInterval = Math.round(options.xRange.range / intervals)

        // console.log('scaleXAxis: intervals, canvasInterval, dataInterval', intervals, canvasInterval, dataInterval)

        let canvasX = Utils.CANVAS_PADDING_LEFT
        let x = options.xRange.start.year
        let axis = {
            values: [],
            ticks: [],
            labels: [],
            majorFirst: x,
            majorLast: 0,
            majorRange: 0,
        }

        for (let i = 0; i <= intervals; i++) {
            axis.ticks.push(parseInt(canvasX))
            axis.values.push(parseInt(x))
            axis.labels.push(Utils.formatYear(parseInt(x)))
            canvasX += canvasInterval
            x += dataInterval
        }

        axis.majorLast = axis.labels[axis.labels.length - 1]
        axis.majorRange = axis.majorLast - axis.majorFirst

        // console.table(newAxis)

        return axis
    }

    // const MINOR_TICK_Y2 = 14

    // console.log('padding left',paddingLeft)
</script>

<!------------------------------------------------------------------------------
@section HTML
-------------------------------------------------------------------------------->
<!-- <p>viewportWidth={viewportWidth}, drawingWidth={drawingWidth}, nTicks={xAxis.ticks.length}</p> -->

<svg class="axis" width={viewportWidth} height={AXIS_HEIGHT} transition:fade>
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
            {Utils.formatYear(options.xAxis.labels[majorIndex])}
        </text>

        <!-- {#if majorIndex < svgticks.length - 1 && svgMinorTicks.length > 0}
        
            {#each svgMinorTicks as deltaX, minorIndex}

                {#if minorIndex > 0 }
                    <line class="svg-minor-tick" x1="{x+deltaX}" y1="{MAJOR_TICK_Y1}" x2="{x+deltaX}" y2="{MINOR_TICK_Y2}"/>
                {/if}
                
                {#if svgMinorLabels[minorIndex] !== undefined }
                    <text class="svg-minor-label" x="{x+deltaX+minorGap/2-8}" y="{MAJOR_TICK_Y1+12}">{@html svgMinorLabels[minorIndex]}</text>
                {/if}
            {/each}

        {/if} -->
    {/each}
</svg>

<!------------------------------------------------------------------------------
@section STYLES
-------------------------------------------------------------------------------->
<style>
    svg {
        /* border: 1px solid rgb(143, 138, 233); */
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
        font-size: 0.8rem;
    }

    /* .svg-minor-tick {
        stroke-width: 1;
        stroke: gray;
    }

    .svg-minor-label {
        font-size: 0.8rem;
    } */
</style>
