<script>
    // SVG inspired by
    // https://www.buymeacoffee.com/lihautan
    // https://www.youtube.com/watch?v=Iin2JvrMOd4
    // https://svelte.dev/repl/fdb2a0fe65e2433fb2f41f8175d44ce2?version=3.29.0

    import { createEventDispatcher } from "svelte"
    import { fade } from "svelte/transition"
    import MinMaxRangeSlider from "../components/Inputs/MinMaxRangeSlider.svelte"

    import Utils from "../Utils.js"
    import SymbolNew from "./SymbolNew.svelte"

    export let filteredSeries // Filtered array of series (includes grouped series)
    export let scale
    export let categories
    export let subCategories
    export let options
    export let viewportWidth
    export let drawingWidth

    const dispatch = createEventDispatcher()

    // Set viewport height to be proportional to width upto a max size
    const HEIGHT = Math.min(viewportWidth / 2, Utils.CANVAS_MIN_HEIGHT)

    let series = []
    let yRange

    // SVG coordinates for each series
    let polylines = []

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

    $: init(filteredSeries)

    function init(s) {
        series = [...s]
        console.error(
            "initialising canvas with options and series",
            options,
            series
        )
        // Create polylines and scaled data
        polylines = []
        // Y range
        yRange = Utils.getYRange(series)
        // Process each set
        series.forEach((entry, sIndex) => {
            let coords = []
            entry.data = []
            // Turn the list of filtered point indices into data attached to the
            // series so can be displayed if required in the canvas properties
            entry.filteredPoints.forEach((opIndex) => {
                const originalPoint = entry.points[opIndex]
                const pt = {
                    sIndex,
                    opIndex,
                    name: entry.name,
                    x: originalPoint.x,
                    xLabel: Utils.formatDate(originalPoint.x),
                    y: originalPoint.y,
                    scaledX: scaledX(originalPoint.x.decimal),
                    scaledY: scaledY(originalPoint.y, yRange.min),
                }
                coords.push(`${pt.scaledX},${pt.scaledY}`)
                entry.data = [...entry.data, pt]
            })
            polylines = [...polylines, coords.join(" ")]
        })

        // // Check the data
        // series.forEach((entry) => {
        //     for (let i = 1; i < entry.data.length; i++) {
        //         if (entry.data[i - 1].scaledX > entry.data[i].scaledX) {
        //             console.error(
        //                 `Point ${i} out of order in series ${entry.name}`
        //             )
        //         }
        //     }
        // })
        console.log("initialised new series", series)
    }

    function scaledX(x) {
        const scaled = (x - options.xRange.start.decimal) * scale
        return Math.round(Utils.CANVAS_PADDING_LEFT + scaled)
    }

    /**
     * Return the scaled y value to 0 decimal places
     * @param {number} value
     * @param {Number} min
     * @returns {Number}
     */
    function scaledY(value, min) {
        return Math.round(HEIGHT * (1 - (value - min) / yRange.range))
    }

    function handleClickedSymbol(point) {
        let newPoint = false
        if (
            options.selectedPoint === false ||
            options.selectedPoint.sIndex != point.sIndex ||
            options.selectedPoint.opIndex != point.opIndex
        ) {
            // console.log({items})
            newPoint = { ...point }
            console.log("selected new point on canvas", newPoint)
        }

        dispatch("optionsChanged", {
            name: "selectedPoint",
            data: newPoint,
        })
    }

    $: if (tooltip) {
        if (options.selectedPoint == false) {
            tooltipText = ""
            tooltip.style = `opacity:0`
        } else {
            tooltipText = `${Utils.formatNumber(options.selectedPoint.y)}
                            <br>${options.selectedPoint.xLabel}`
            console.warn(
                "options.selectedPoint",
                options.selectedPoint,
                tooltipText
            )
            // Fit to right of point if there is room
            const top = options.selectedPoint.scaledY - 14
            if (viewportWidth - options.selectedPoint.scaledX > 120) {
                const left = options.selectedPoint.scaledX + 5
                tooltip.style = `opacity:1;left:${left}px;top:${top}px; text-align:right;`
                tooltipLeftArrow = "&larr;"
                tooltipRightArrow = ""
            } else {
                const right = viewportWidth - options.selectedPoint.scaledX + 10
                tooltip.style = `opacity:1;right:${right}px;top:${top}px`
                tooltipLeftArrow = ""
                tooltipRightArrow = "&rarr;"
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
        if (inActive) {
            colour = Utils.COLOUR_INACTIVE
        }
        return colour
    }

    function getSymbolIndex(filter, sIndex) {
        if (options.group == false) {
            return sIndex
        }
        if (options.filterType == "category") {
            const cIndex = categories.findIndex((cat) => cat.name == filter)
            return cIndex
        }
        const scIndex = subCategories.findIndex(
            (subCat) => subCat.name == filter
        )
        return scIndex
    }
</script>

<!------------------------------------------------------------------------------
@section HTML
-------------------------------------------------------------------------------->

{#if polylines.length > 0}
    <svg height={HEIGHT} width={viewportWidth}>
        <!-- Y axis -->
        {#each yRange.horizontals as h, index}
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

        <!-- Data series -->
        {#each series as entry, sIndex}
            {@const colour = getColour(
                options.selectedPoint,
                options.filter,
                sIndex
            )}
            {@const width = colour == Utils.COLOUR_INACTIVE ? 1 : 2}
            {@const symbolIndex = getSymbolIndex(options.filter, sIndex)}

            <!-- Line -->
            <polyline
                points={polylines[sIndex]}
                transition:fade
                style="stroke-width:{width}; stroke:{colour};"
            />

            <!-- Symbols - if no filter or active -->
            {#if width != 1}
                {#each entry.data as point}
                    <g
                        class="symbol"
                        transform="translate({point.scaledX},{point.scaledY})"
                        on:click|stopPropagation={() =>
                            handleClickedSymbol(point)}
                    >
                        <SymbolNew
                            index={symbolIndex}
                            colour={options.symbols ? colour : "transparent"}
                            wrapped={false}
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
        /* overflow: hidden; */
        overflow: visible;
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
