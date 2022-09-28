<script>
    import { onMount } from "svelte"

    import Utils from "../Utils.js"
    import TimelineEvent from "../classes/TimelineEvent"
    import TimelineEntry from "../classes/TimelineEntry"
    import TimelineOptions from "../classes/TimelineOptions"
    import Axes from "./Axes.svelte"
    import Events from "./Events.svelte"
    import Canvas from "./Canvas.svelte"
    import Legend from "./Legend.svelte"
    import Options from "./Options.svelte"
    import EventProperties from "./EventProperties.svelte"
    import CanvasProperties from "./CanvasProperties.svelte"
    import Caption from "./Caption.svelte"
    import XRange from "./XRange.svelte"
    // import DebugTimeline from "$lib/timeline/DebugTimeline.svelte"
    import { windowWidth, touch } from "../stores"

    // As pass in by the user
    export let data
    export let settings

    export let viewportWidth

    console.log("viewportWidth", viewportWidth)

    const options = new TimelineOptions(settings)

    // Process the dataset
    const dataset = Utils.initDataset(data, options)
    // console.error("Timeline dataset", dataset)

    // Check of we have an xRange from the user settings and if
    // not set to dataset range
    if (options.xRange.range === 0) {
        options.xRange = dataset.xRange.copy()
    }
    // console.log("options after", options)

    let viewport
    let drawingWidth =
        viewportWidth - Utils.CANVAS_PADDING_LEFT - Utils.CANVAS_PADDING_RIGHT
    let scale = 0

    // Events, series and groups filtered by date range (search and subCats)
    // Filtering by subCats done in canvas component
    let filteredEvents = []
    let filteredSeries = []

    // Wait for window to be mounted to test for touch devices
    onMount(() => {
        const msTouchEnabled = window.navigator.msMaxTouchPoints
        const generalTouchEnabled =
            "ontouchstart" in document.createElement("div")
        $touch = msTouchEnabled || generalTouchEnabled
        // console.log("onMount viewport width", viewport?.clientWidth)
    })

    //
    // Reactive stuff
    //

    $: if ($windowWidth) handleResize()

    $: clickable = options.selectedEvent || options.selectedPoint !== false

    //
    // Functions
    //

    function handleOptions(event) {
        const detail = event.detail
        // console.log('Options changed',detail)
        switch (detail.name) {
            case "selectedPoint":
                options.selectedPoint = detail.data
                console.error("Got new selected point", options.selectedPoint)
                break
            case "selectedEvent":
                options.selectedEvent = detail.data
                break
            case "symbols":
                options.symbols = detail.data
                break
            case "xRange":
                options.xRange = detail.data
                options.selectedEvent = undefined
                options.selectedPoint = false
                scaleX()
                break
            // Filter or just highlight series
            // depending on group settings
            case "filter":
                options.filter = detail.data.value
                options.filterType = detail.data.taxonomy
                options.selectedEvent = undefined
                options.selectedPoint = false
                if (options.group) {
                    filteredSeries = TimelineEntry.process(
                        dataset.series,
                        options.xRange,
                        options.filter,
                        options.filterType,
                        options.group
                    )
                }
                break
            case "group":
                options.filter = ""
                if (options.group) {
                    options.filterType = "sub-category"
                } else {
                    options.filterType = ""
                }
                filteredSeries = TimelineEntry.process(
                    dataset.series,
                    options.xRange,
                    options.filter,
                    options.filterType,
                    options.group
                )
                break
            case "sort":
                options.sort = detail.data
                break
            case "search":
                options.search = detail.data
                filteredEvents = TimelineEvent.process(
                    dataset.events,
                    options.xRange,
                    options.search,
                    dataset.subCategories
                )
                break
            case "reset":
                options.selectedEvent = undefined
                options.selectedPoint = false
                options.search = ""
                options.filter = ""
                options.sort = "x"
                options.xRange = dataset.xRange
                options.symbols = detail.data.symbols
                options.categorise = detail.data.categorise
                options.totalise = detail.data.totalise
                scaleX()
                break
        }
        // @todo why is this required, e.g. for sorting???
        // if (detail.name != "search" && detail.name != "category") {
        //     // options.search = ""
        // }
    }

    function handleClick() {
        // console.error('Handling timeline click in dataset',data.name)
        if (options.selectedPoint !== false) {
            options.selectedPoint = false
        }
    }

    function handleResize() {
        // Handle resizing - debouncing taken care of in App.svelte
        // console.log("Handling resize with viewport", viewport?.clientWidth)
        // Stop if we don;t yet have a viewport
        if (viewport === undefined) return

        // If we have a viewport with a non-zero size use this
        if (viewport.clientWidth !== 0) {
            // Viewport is the main drawing area which includes non-drawing
            // areas in the x-axis which are the left and right padding, though
            // the viewport itself is NOT padded using CSS
            viewportWidth =
                viewport.clientWidth +
                Utils.CANVAS_PADDING_LEFT +
                Utils.CANVAS_PADDING_RIGHT
        }

        // If the width has changed then rescale the x-axis
        if (viewport.clientWidth != viewportWidth) {
            // The drawing width is the clientWidth
            drawingWidth =
                viewportWidth -
                Utils.CANVAS_PADDING_LEFT -
                Utils.CANVAS_PADDING_RIGHT
            scaleX()
            // Non-intuitive behaviour on touch devices
            if ($touch == false) {
                if (options.selectedEvent) {
                    setTimeout(scrollToSelected, 500)
                }
            }
        }
    }

    function scaleX() {
        // console.error("scaleX: viewportWidth", viewportWidth)
        // console.error("scaleX: drawingWidth", drawingWidth)
        // scale in pixels/x-unit
        scale = drawingWidth / options.xRange.range
        // console.log("scaleX: scale (pixels/x unit)", scale)
        // console.log('data.events', data.events);
        filteredEvents = TimelineEvent.process(
            dataset.events,
            options.xRange,
            options.search,
            dataset.subCategories
        )
        // console.log('filteredEvents', filteredEvents);
        console.log("series", dataset.series, "scale", scale)
        if (dataset.series.length > 0)
            filteredSeries = TimelineEntry.process(
                dataset.series,
                options.xRange,
                options.filter,
                options.filterType,
                options.group
            )
        console.log("filtered series", filteredSeries, "scale", scale)
    }

    function scrollToSelected() {
        if (options.selectedEvent) {
            const selectedElement = viewport.querySelector(".selected")
            if (selectedElement) {
                // console.log('scrolling into view')
                selectedElement.scrollIntoView({ block: "start" })
                // console.log('scrolling into view')
            }
        }
    }

    function handleViewportClick() {
        options.selectedEvent = undefined
        options.selectedPoint = false
    }
</script>

<!------------------------------------------------------------------------------
@section HTML
-------------------------------------------------------------------------------->

<!-- <DebugTimeline {data} {options} /> -->

<figure
    class="timeline timeline-content"
    class:clickable
    on:click|stopPropagation={handleClick}
>
    <Caption
        multipleSeries={dataset.series.length > 1}
        {options}
        title={options.title || dataset.name}
    />

    {#if options.readonly === false}
        <Options
            {options}
            xRange={dataset.xRange}
            seriesLength={dataset.series.length}
            eventsLength={dataset.events.length}
            on:optionsChanged={handleOptions}
        />
    {/if}

    <div class="viewport" bind:this={viewport} on:click={handleViewportClick}>
        {#if scale !== 0}
            {#if filteredEvents.length > 0}
                <Events
                    events={filteredEvents}
                    {scale}
                    {viewportWidth}
                    {options}
                    on:optionsChanged={handleOptions}
                />
            {/if}

            {#if filteredSeries.length > 0}
                <Canvas
                    {scale}
                    categories={dataset.categories}
                    subCategories={dataset.subCategories}
                    {filteredSeries}
                    {viewportWidth}
                    {drawingWidth}
                    {options}
                    on:optionsChanged={handleOptions}
                />
            {/if}

            <!-- <Axes xAxis={dataset.xAxis} {viewportWidth} {drawingWidth} /> -->
            <Axes {options} {viewportWidth} {drawingWidth} />
        {/if}
    </div>

    {#if drawingWidth != 0 && scale !== 0 && options.readonly === false}
        <XRange {drawingWidth} {options} on:optionsChanged={handleOptions} />
    {/if}

    <Legend
        series={filteredSeries}
        categories={dataset.categories}
        subCategories={dataset.subCategories}
        {options}
        on:optionsChanged={handleOptions}
    />

    <EventProperties
        selectedEvent={options.selectedEvent}
        on:optionsChanged={handleOptions}
    />

    {#if options.selectedPoint?.sIndex}
        {@const series = filteredSeries[options.selectedPoint.sIndex]}
        <CanvasProperties
            {series}
            {options}
            {viewportWidth}
            on:optionsChanged={handleOptions}
        />
    {/if}
</figure>

<style>
    figure {
        position: relative;
        margin: 0;
        padding: 1rem 0.5rem var(--tl-size-figure-padding-bottom) 0.5rem;
        width: 100%;
        background: var(--tl-colour-chart-background);
        border: 1px solid var(--tl-colour-chart-border);
        overflow: hidden;
    }

    .viewport {
        position: relative;
        width: 100%;
        overflow: hidden;
        margin: 0;
        padding: 0;
    }

    /* .clickable {
        cursor: zoom-out;
    } */
</style>
