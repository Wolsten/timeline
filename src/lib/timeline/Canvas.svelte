<script>
    // SVG inspired by
    // https://www.buymeacoffee.com/lihautan
    // https://www.youtube.com/watch?v=Iin2JvrMOd4
    // https://svelte.dev/repl/fdb2a0fe65e2433fb2f41f8175d44ce2?version=3.29.0

    import { createEventDispatcher } from "svelte"
    import { fade } from "svelte/transition"

    import Utils from "../Utils.js"
    import Symbol from "./Symbol.svelte"

    export let options
    export let series // Array of multiple series
    export let groups // Array of multiple groups
    export let viewportWidth
    export let drawingWidth
    export let paddingLeft

    const dispatch = createEventDispatcher()

    // console.log('series',series)
    // console.log('groups',groups)

    // Set viewport height to be proportional to width upto a max size
    let height = Math.min(viewportWidth / 2, Utils.CANVAS_MIN_HEIGHT)

    // The active series or group depends on options.totalise and options.subCats
    let items = []

    // SVG coordinates for each series
    let polylines = []

    // Global min and max values and horizontal axes
    let globalMin
    let globalMax
    let range = 0
    let horizontals = []

    // Tooltip handling
    let tooltip
    let tooltipText = ""
    let tooltipLeftArrow = ""
    let tooltipRightArrow = ""

    // Things that can trigger initialisation
    let totalise = false
    let categorise = false
    let logScale = false
    let subCats = [...options.subCats]

    $: if (
        series ||
        groups ||
        options.categorise != categorise ||
        options.totalise != totalise ||
        options.logScale != logScale ||
        options.subCats.length != subCats.length
    ) {
        init()
    }

    // init()

    function init() {
        // console.error('initialising canvas with options', options);
        totalise = options.totalise
        categorise = options.categorise
        logScale = options.logScale
        items = totalise ? [...groups] : [...series]

        // console.log('items',items)
        // console.log('canvas init: totalise, series, groups, items',totalise,series,groups,items)

        // Filter by category
        if (options.subCats.length != 0) {
            items = items.filter((entry) =>
                options.subCats.includes(entry.subCategory)
            )
        }

        // Set vertical range and horizontal axes
        calculateYRange()

        // Copy data from series in options and polylines, scaling y-values
        // and checking category
        options.series = []
        polylines = []
        items.forEach((entry, index) => {
            // Set the range allowing for space at the top and bottom
            let min = globalMin

            options.series[index] = {
                name: entry.legend || entry.name,
                colourIndex: entry.colourIndex,
                symbolIndex: entry.symbolIndex,
                citations: entry.citations,
                subCategory: entry.subCategory,
                data: [],
            }
            polylines[index] = ""

            entry.data.forEach((point, i) => {
                let y = point.value

                if (options.logScale) {
                    y = y != 0 ? Math.log10(y) : 1
                }

                options.series[index].data.push(point)

                point.scaledY = yValue(y, min)
                polylines[index] += ` ${point.x},${point.scaledY}`
            })
        })

        // console.log('polylines', polylines);
        console.table("options.series", options.series)
    }

    function calculateYRange() {
        // Max min values from the series selected
        // debugger;
        globalMin = Number.POSITIVE_INFINITY
        globalMax = Number.NEGATIVE_INFINITY
        items.forEach((entry) => {
            if (entry.min < globalMin) globalMin = entry.min
            if (entry.max > globalMax) globalMax = entry.max
        })
        // console.warn('Raw globalMin, globalMax', globalMin, globalMax);

        // Log scale?
        if (options.logScale) {
            if (globalMin <= 0) {
                globalMin = Math.round(Math.log10(globalMin))
            } else {
                globalMin = 1
            }
            globalMax = Math.round(Math.log10(globalMax))
            // console.log('Log globalMin, globalMax',globalMin,globalMax)
        }

        // Normalise the minimum value
        range = globalMax - globalMin
        range = Utils.toPrecision(range, 1)
        const step = options.logScale ? 0.5 : range / 10
        // console.log('step, globalMin % step',step, globalMin % step)

        // globalMin = Utils.toPrecision(globalMin - (globalMin % step), 1)
        globalMin = Utils.findNormalisedMin(step, globalMin)
        // console.log('Normalised global min,max,step', globalMin, globalMax,step)

        // Normalise the maximum value and range and get y intervals (horizontals)
        let y = globalMin
        horizontals = []
        while (y < globalMax) {
            horizontals.push({
                y,
                label: options.logScale ? Math.pow(10, y) : y,
            })
            y += step * 2
        }
        globalMax = y
        range = globalMax - globalMin

        // console.warn('horizontals',horizontals)
    }

    function yValue(value, min) {
        return parseInt(height * (1 - (value - min) / range))
    }

    function handleClickedSymbol(point, index) {
        // console.warn('clicked point',point)

        if (
            options.selectedPoint === false ||
            options.selectedPoint.index != index ||
            options.selectedPoint.i != point.i
        ) {
            // console.log({items})

            options.selectedPoint = {
                type: "series",
                name: items[index].legend || items[index].name,
                index, // Index into filtered options series
                i: point.i, // Index into points in that series or group
                citations: items[index].citations,
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
                options.series[options.selectedPoint.index] == undefined ||
                options.series[options.selectedPoint.index].data == undefined
            ) {
                console.error(
                    "Found undefined series for selected",
                    options.selectedPoint
                )
            }

            const point = options.series[options.selectedPoint.index].data.find(
                (pt) => pt.i == options.selectedPoint.i
            )

            if (point) {
                // console.warn("point", point)
                // tooltipText = `${point.xLabel}, ${Utils.formatNumber(
                //     point.value
                // )}`
                tooltipText = `${Utils.formatNumber(point.value)}<br>${
                    point.xLabel
                }`

                // Fit to right of point if there is room
                const top = point.scaledY - 14
                if (viewportWidth - point.x > 120) {
                    const left = point.x + 5
                    tooltip.style = `opacity:1;left:${left}px;top:${top}px; text-align:right;`
                    tooltipLeftArrow = "&larr;"
                    tooltipRightArrow = ""
                } else {
                    const right = viewportWidth - point.x + 10
                    tooltip.style = `opacity:1;right:${right}px;top:${top}px`
                    tooltipLeftArrow = ""
                    tooltipRightArrow = "&rarr;"
                }
            }
        }
    }

    function getColour(sel, filter, index, colourIndex) {
        let inActive = false
        let colour = Utils.colour(index, colourIndex, options.categorise)
        if (sel && sel.type == "series") {
            if (sel.index != index) {
                inActive = true
            }
        } else if (filter !== "") {
            if (options.totalise) {
                if (items[index].subCategory != filter) {
                    inActive = true
                }
            } else {
                if (items[index].legend != filter) {
                    inActive = true
                }
            }
        }
        if (inActive) {
            colour = Utils.COLOUR_INACTIVE
        }
        return colour
    }
</script>

<!------------------------------------------------------------------------------
@section HTML
-------------------------------------------------------------------------------->

{#if options.series.length > 0}
    <svg {height} {viewportWidth}>
        <!-- Y axis -->
        {#each horizontals as h, index}
            <!-- line and label-->
            {#if index != 0}
                <line
                    class="y-line"
                    x1={paddingLeft}
                    x2={paddingLeft + drawingWidth}
                    y1={yValue(h.y, globalMin)}
                    y2={yValue(h.y, globalMin)}
                />

                <text class="y-label" x={0} y={yValue(h.y, globalMin) - 6}>
                    {Utils.formatNumber(h.label, 2)}
                </text>
            {/if}
        {/each}

        <!-- Date series -->
        {#each options.series as entry, index}
            {@const colour = getColour(
                options.selectedPoint,
                options.filter,
                index,
                entry.colourIndex
            )}
            {@const width = colour == Utils.COLOUR_INACTIVE ? 1 : 2}

            <!-- Line -->
            <polyline
                points={polylines[index]}
                transition:fade
                style="stroke-width:{width}; stroke:{colour};"
            />

            <!-- Symbols - if no filter or active -->
            {#if width != 1}
                {#each entry.data as point}
                    <g
                        class="symbol"
                        transform="translate({point.x},{point.scaledY})"
                        on:click|stopPropagation={() =>
                            handleClickedSymbol(point, index)}
                    >
                        {#if options.symbols}
                            <Symbol
                                i={point.i}
                                {index}
                                defaultColour={colour}
                                symbolIndex={entry.symbolIndex}
                                symbols={options.symbols}
                                selectedPoint={options.selectedPoint}
                            />
                        {/if}
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
