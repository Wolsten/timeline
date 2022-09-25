<script>
    // SVG inspired by
    // https://www.buymeacoffee.com/lihautan
    // https://www.youtube.com/watch?v=Iin2JvrMOd4
    // https://svelte.dev/repl/fdb2a0fe65e2433fb2f41f8175d44ce2?version=3.29.0

    import { createEventDispatcher } from "svelte"
    import { fade } from "svelte/transition"

    import Utils from "../Utils.js"
    import Symbol from "./Symbol.svelte"

    export let series // Filtered array of series (includes grouped series)
    export let scale
    export let categories
    export let subCategories
    export let options
    export let viewportWidth
    export let drawingWidth

    const dispatch = createEventDispatcher()

    // Set viewport height to be proportional to width upto a max size
    const HEIGHT = Math.min(viewportWidth / 2, Utils.CANVAS_MIN_HEIGHT)

    // SVG coordinates for each series
    let polylines = []
    let data = []

    // Global min and max values
    let global = {
        min: 0,
        max: 0,
        range: 0,
    }

    // Horizontal axes
    let horizontals = []

    // Tooltip handling
    let tooltip
    let tooltipText = ""
    let tooltipLeftArrow = ""
    let tooltipRightArrow = ""

    // Things that can trigger initialisation
    // let totalise = false
    // let categorise = false

    // $: if (
    //     series ||
    //     options.categorise != categorise ||
    //     options.group != group // ||
    //     // options.logScale != logScale ||
    //     // options.subCats.length != subCats.length
    // ) {
    //     init()
    // }

    let group = options.group

    $: if (group != options.group) init()

    init()

    function init() {
        //console.error('initialising canvas with options', options);
        // totalise = options.totalise
        // categorise = options.categorise
        // console.log('items',items)
        console.error("canvas init: series", series)
        // Set vertical range and horizontal axes
        calculateYRange()
        // Copy data from series in options and polylines, scaling y-values
        // and checking category
        // options.series = []
        polylines = []
        data = []
        series.forEach((entry, seriesIndex) => {
            let polyline = ""
            let space = ""
            data[seriesIndex] = []
            entry.filteredPoints.forEach((opIndex) => {
                const originalPoint = entry.points[opIndex]
                const pt = {
                    opIndex,
                    name: entry.name,
                    scaledX: scaledX(originalPoint.x.decimal),
                    scaledY: scaledY(originalPoint.y, global.min),
                }
                // points.push(point)
                polyline += `${space}${pt.scaledX},${pt.scaledY}`
                space = " "
                data[seriesIndex].push(pt)
            })
            polylines.push(polyline)
        })

        console.log("polylines", polylines)
        console.table("y-scaled series", series)
    }

    // @todo here

    function scaledX(x) {
        const scaled = (x - options.xRange.start.decimal) * scale
        return Math.round(Utils.CANVAS_PADDING_LEFT + scaled)
    }

    function calculateYRange() {
        // Global max and min values from the series selected
        global.min = series.reduce(
            (min, entry) => (entry.min < min ? entry.min : min),
            Number.POSITIVE_INFINITY
        )
        global.max = series.reduce(
            (max, entry) => (entry.max > max ? entry.max : max),
            Number.NEGATIVE_INFINITY
        )
        // console.warn("Raw global.min, global.max", global.min, global.max)
        // Normalise the minimum value
        global.range = global.max - global.min
        global.range = Utils.toPrecision(global.range, 1)
        const step = global.range / 10
        // console.log('step, global.min % step',step, global.min % step)
        global.min = Utils.findNormalisedMin(step, global.min)
        console.log(
            "Normalised global min,max,step",
            global.min,
            global.max,
            step
        )
        // Normalise the maximum value and range and get y intervals (horizontals)
        let y = global.min
        horizontals = []
        while (y < global.max) {
            horizontals.push({
                y,
                label: y,
            })
            y += step * 2
        }
        global.max = y
        global.range = global.max - global.min
        // console.warn('horizontals',horizontals)
    }

    /**
     * Return the scaled y value to 0 decimal places
     * @param {number} value
     * @param {Number} min
     * @returns {Number}
     */
    function scaledY(value, min) {
        return Math.round(HEIGHT * (1 - (value - min) / global.range))
    }

    function handleClickedSymbol(point, seriesIndex) {
        // console.warn('clicked point',point)

        if (
            options.selectedPoint === false ||
            options.selectedPoint.index != seriesIndex ||
            options.selectedPoint.opIndex != point.opIndex
        ) {
            // console.log({items})

            options.selectedPoint = {
                // @todo only need the two indices?
                type: "series",
                name: series[seriesIndex].legend || series[seriesIndex].name,
                seriesIndex, // Index into filtered series
                opIndex: point.opIndex, // Index into points in that series or group
                citations: series[seriesIndex].citations,
            }

            // console.error('selected',options.selectedPoint)
        } else {
            options.selectedPoint = false
        }

        dispatch("optionsChanged", {
            name: "selectedPoint",
            data: options.selectedPoint,
        })
    }

    $: if (tooltip) {
        if (options.selectedPoint == false) {
            tooltipText = ""
            tooltip.style = `opacity:0`
        } else if (
            options.selectedPoint.type === "series" &&
            options.selectedPoint.i != -1
        ) {
            if (
                series[options.selectedPoint.index] == undefined ||
                series[options.selectedPoint.index].data == undefined
            ) {
                console.error(
                    "Found undefined series for selected",
                    options.selectedPoint
                )
            }
            const point = series[options.selectedPoint.index].data.find(
                (pt) => pt.i == options.selectedPoint.i
            )
            if (point) {
                // console.warn("point", point)
                tooltipText = `${Utils.formatNumber(point.value)}<br>${
                    point.xLabel
                }`
                // Fit to right of point if there is room
                const top = point.scaledY - 14
                if (viewportWidth - point.scaledX > 120) {
                    const left = point.scaledX + 5
                    tooltip.style = `opacity:1;left:${left}px;top:${top}px; text-align:right;`
                    tooltipLeftArrow = "&larr;"
                    tooltipRightArrow = ""
                } else {
                    const right = viewportWidth - point.scaledX + 10
                    tooltip.style = `opacity:1;right:${right}px;top:${top}px`
                    tooltipLeftArrow = ""
                    tooltipRightArrow = "&rarr;"
                }
            }
        }
    }

    function getColour(selPoint, filter, index) {
        let inActive = false
        // Set the default colour
        let colour = series[index].colour

        // Utils.colour(index, colourIndex, options.categorise)

        // Highlight selected series
        if (selPoint && selPoint.type == "series") {
            if (selPoint.index != index) {
                inActive = true
            }
        } else if (filter !== "") {
            switch (options.filterType) {
                case "single":
                    if (series[index].legend != filter) {
                        inActive = true
                    }
                    break
                case "category":
                    if (series[index].category != filter) {
                        inActive = true
                    } else {
                        colour = categories.find(
                            (cat) => cat.name == filter
                        ).colour
                    }
                    break
                case "sub-category":
                    if (series[index].subCategory != filter) {
                        inActive = true
                    } else {
                        colour = subCategories.find(
                            (subCat) => subCat.name == filter
                        ).colour
                    }
                    break
                default:
            }
        }
        // if (options.totalise) {
        //     if (options.filterType == "category") {
        //         if (series[index].category != filter) {
        //             inActive = true
        //         }
        //     } else if (series[index].subCategory != filter) {
        //         inActive = true
        //     }
        // } else {
        // if (series[index].legend != filter) {
        //     inActive = true
        // }
        // }
        if (inActive) {
            colour = Utils.COLOUR_INACTIVE
        }

        return colour
    }
</script>

<!------------------------------------------------------------------------------
@section HTML
-------------------------------------------------------------------------------->

{#each data as entry}
    {#each entry as point}
        {#if point.scaledX === undefined || point.scaledY === undefined || point.opIndex === undefined}
            <p>
                entry name {entry.name}, {point.scaledX}, {point.scaledY}
            </p>
        {/if}
    {/each}
{/each}

{#if polylines.length > 0}
    <svg height={HEIGHT} width={viewportWidth}>
        <!-- Y axis -->
        {#each horizontals as h, index}
            <!-- line and label-->
            {#if index != 0}
                {@const scaledHeight = scaledY(h.y, global.min)}
                <line
                    class="y-line"
                    x1={Utils.CANVAS_PADDING_LEFT}
                    x2={Utils.CANVAS_PADDING_LEFT + drawingWidth}
                    y1={scaledHeight}
                    y2={scaledHeight}
                />

                <text class="y-label" x={0} y={scaledHeight - 6}>
                    {Utils.formatNumber(h.label, 2)}
                </text>
            {/if}
        {/each}

        <!-- Date series -->
        {#each data as points, seriesIndex}
            {@const colour = getColour(
                options.selectedPoint,
                options.filter,
                seriesIndex
            )}
            {@const width = colour == Utils.COLOUR_INACTIVE ? 1 : 2}

            <!-- Line -->
            <polyline
                points={polylines[seriesIndex]}
                transition:fade
                style="stroke-width:{width}; stroke:{colour};"
            />

            <!-- Symbols - if no filter or active -->
            {#if width != 1}
                {#each points as point}
                    <g
                        class="symbol"
                        transform="translate({point.scaledX},{point.scaledY})"
                        on:click|stopPropagation={() =>
                            handleClickedSymbol(point, seriesIndex)}
                    >
                        <Symbol
                            opIndex={point.opIndex}
                            {seriesIndex}
                            defaultColour={colour}
                            symbols={options.symbols}
                            selectedPoint={options.selectedPoint}
                        />
                    </g>
                {/each}
            {/if}
        {/each}
    </svg>
{/if}

<span class="tooltip" bind:this={tooltip}>
    <span class="tooltip-arrow">{@html tooltipLeftArrow}</span>
    <span class="tooltip-text">{@html tooltipText}</span>
    <span class="tooltip-arrow">{@html tooltipRightArrow}</span>
</span>

<!------------------------------------------------------------------------------
@section STYLES
-------------------------------------------------------------------------------->
<style>
    svg {
        /* border: 1px solid rgb(218, 177, 177); */
        overflow: hidden;
        position: relative;
        width: 100%;
    }

    polyline {
        fill: none;
        position: relative;
    }

    .y-line {
        stroke-width: 1;
        stroke: var(--tl-colour-faint-lines);
    }

    .y-label {
        font-size: 0.8rem;
    }

    text {
        fill: var(--tl-colour-font);
    }

    .tooltip {
        position: absolute;
        display: flex;
        gap: 0.2rem;
        padding: 0;
        background: transparent;
        z-index: 1000;
        transition: all 0.3s ease-in-out;
    }

    .tooltip > span {
        display: block;
    }

    .tooltip-text {
        background-color: var(--tl-colour-background);
        border: 1px solid var(--tl-colour-faint-lines);
        border-radius: var(--tl-size-border-radius);

        font-size: 0.8rem;
        font-weight: bold;
        padding: 0.3rem;

        opacity: 0.9;
    }

    .tooltip-arrow {
        font-size: 1.4rem;
    }
</style>
