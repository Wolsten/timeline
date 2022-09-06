<script>
    import { fade } from "svelte/transition"

    import Utils from "../Utils.js"

    export let xAxis
    export let viewportWidth
    export let drawingWidth

    // console.table(xAxis)

    const AXIS_HEIGHT = 35
    const MAJOR_TICK_Y1 = 0 //-4
    const MAJOR_TICK_HEIGHT = 10
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

    {#each xAxis.ticks as x, majorIndex}
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
            {Utils.formatYear(xAxis.labels[majorIndex])}
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
