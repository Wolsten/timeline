<script>
    import { onMount } from "svelte"

    import Utils from "../Utils.js"
    import Axes from "./Axes.svelte"
    import Events from "./Events.svelte"
    import Canvas from "./Canvas.svelte"
    import CanvasNew from "./CanvasNew.svelte"
    import Legend from "./Legend.svelte"
    import LegendNew from "./LegendNew.svelte"
    import Options from "./Options.svelte"
    import EventProperties from "./EventProperties.svelte"
    import CanvasProperties from "./CanvasProperties.svelte"
    import Caption from "./Caption.svelte"
    import XRange from "./XRange.svelte"
    // import Error from "../components/Error.svelte"
    // import DebugTimeline from "$lib/timeline/DebugTimeline.svelte"
    import { windowWidth, touch } from "../stores"

    // As pass in by the user
    export let data
    export let settings
    export let viewportWidth

    // Copy the object values - spread retains references so cannot be used
    // This ensures that the data is not inadvertently shared across instances
    // of this component
    // const dataset = JSON.parse(JSON.stringify(Utils.processDataset(data)))

    const dataset = Utils.processDataset(data)

    // console.error("Timeline dataset", dataset)

    const userSettings = Utils.initSettings(
        settings,
        dataset.start,
        dataset.end,
        dataset.categories,
        dataset.subCategories.map((item) => item.name)
    )

    const options = {
        ...userSettings,
        selectedEvent: false,
        selectedPoint: false,
        zoom: 1,
        series: [],
    }

    // console.warn("options", options)

    let viewport
    let drawingWidth = 0
    let scale = 0

    // Events, series and groups filtered by date range (search and subCats)
    // Filtering by subCats done in canvas component
    let filteredEvents = []
    let filteredSeries = []
    let filteredGroups = []

    // Wait for window to be mounted to test for touch devices
    onMount(() => {
        const msTouchEnabled = window.navigator.msMaxTouchPoints
        const generalTouchEnabled =
            "ontouchstart" in document.createElement("div")
        $touch = msTouchEnabled || generalTouchEnabled
    })

    //
    // Reactive stuff
    //

    $: if ($windowWidth) handleResize()

    $: clickable =
        options.selectedEvent !== false || options.selectedPoint !== false

    //
    // Functions
    //

    function handleOptions(event) {
        const detail = event.detail
        // console.log('Options changed',detail)
        switch (detail.name) {
            case "selectedPoint":
                options.selectedPoint = detail.data
                break
            case "selectedEvent":
                options.selectedEvent = detail.data
                break
            case "symbols":
                options.symbols = detail.data
                break
            case "logScale":
                options.logScale = detail.data
                break
            case "xRange":
                // console.log('resetting xRange')
                options.xRange = detail.data
                options.selectedEvent = false
                options.selectedPoint = false
                scaleX()
                break
            case "category":
                options.filter = detail.data
                options.filterType = "category"
                options.selectedEvent = false
                options.selectedPoint = false
                break
            case "sub-category":
                options.filter = detail.data
                options.filterType = "sub-category"
                options.selectedEvent = false
                options.selectedPoint = false
                break
            case "filter":
                // console.log('Filtering')
                options.filter = detail.data
                options.filterType = "single"
                options.selectedEvent = false
                options.selectedPoint = false
                break
            case "categorise":
                options.categorise = detail.data
                options.filter = ""
                break
            case "totalise":
                options.totalise = detail.data
                options.filter = ""
                break
            case "sort":
                options.sort = detail.data // x or category
                break
            case "search":
                options.search = detail.data
                scaleX()
                break
        }
        if (detail.name != "search" && detail.name != "category") {
            options.search = ""
        }
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
        // Take off padding to get the drawing width
        drawingWidth =
            viewportWidth -
            Utils.CANVAS_PADDING_LEFT -
            Utils.CANVAS_PADDING_RIGHT
        // scale in pixels/x-unit
        scale = drawingWidth / options.xRange.range
        // console.log("scaleX: scale (pixels/x unit)", scale)
        // @todo
        // Use the options xRange - scalar numbers (of years for dates)
        let xStart = options.xRange.start
        let xEnd = options.xRange.end
        // console.warn('options', options);
        // console.log('data.events', data.events);
        filteredEvents = Utils.processEvents(
            dataset.events,
            scale,
            xStart,
            xEnd,
            dataset.subCategories.map((item) => item.name),
            options.subCats,
            options.search
        )
        // console.log('filteredEvents', filteredEvents);
        // console.log('series',series,'groups',groups,'scale',scale)
        if (dataset.series.length > 0)
            filteredSeries = Utils.processSeries(
                dataset.series,
                scale,
                xStart,
                xEnd,
                options.filter,
                options.filterType,
                options.totalise
            )
        // if (dataset.groups.length > 0)
        //     filteredGroups = Utils.processSeries(
        //         dataset.groups,
        //         scale,
        //         xStart,
        //         xEnd
        //     )
        // Reset the x-axis based on filtered data
        dataset.xAxis = Utils.scaleXAxis(
            dataset.xAxis,
            drawingWidth,
            options.xRange
        )
        // console.log("dataset.xAxis", dataset.xAxis)
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
    <!-- {#if error}
        <Error {error} />
    {/if} -->

    <Caption
        nSeries={dataset.series.length > 1}
        categorised={options.categorise}
        grouped={options.totalise}
        filter={options.filter}
        title={options.title || dataset.name}
    />

    {#if options.readonly === false}
        <Options
            {options}
            xAxis={dataset.xAxis}
            seriesLength={dataset.series.length}
            eventsLength={dataset.events.length}
            on:optionsChanged={handleOptions}
        />
    {/if}

    <div class="viewport" bind:this={viewport}>
        {#if scale !== 0}
            {#if filteredEvents.length > 0}
                <Events
                    categories={dataset.categories}
                    subCategories={dataset.subCategories}
                    events={filteredEvents}
                    size={filteredEvents.length}
                    {viewportWidth}
                    {options}
                    on:optionsChanged={handleOptions}
                />
            {/if}

            {#if filteredSeries.length > 0}
                <!-- <Canvas
                    series={filteredSeries}
                    groups={filteredGroups}
                    {viewportWidth}
                    {drawingWidth}
                    paddingLeft={Utils.CANVAS_PADDING_LEFT}
                    {options}
                    on:optionsChanged={handleOptions}
                /> -->
                <CanvasNew
                    categories={dataset.categories}
                    subCategories={dataset.subCategories}
                    series={filteredSeries}
                    {viewportWidth}
                    {drawingWidth}
                    paddingLeft={Utils.CANVAS_PADDING_LEFT}
                    {options}
                    on:optionsChanged={handleOptions}
                />
            {/if}

            <Axes xAxis={dataset.xAxis} {viewportWidth} {drawingWidth} />
        {/if}
    </div>

    {#if drawingWidth != 0 && scale !== 0 && options.readonly === false}
        <XRange
            {drawingWidth}
            xAxis={dataset.xAxis}
            {options}
            on:optionsChanged={handleOptions}
        />
    {/if}

    <!-- <Legend
        eventsSubCats={dataset.eventsSubCats}
        {filteredEvents}
        {options}
        on:optionsChanged={handleOptions}
    /> -->

    <LegendNew
        series={filteredSeries}
        categories={dataset.categories}
        subCategories={dataset.subCategories}
        {filteredEvents}
        {options}
        on:optionsChanged={handleOptions}
    />

    <EventProperties
        selectedEvent={options.selectedEvent}
        on:optionsChanged={handleOptions}
    />
    <CanvasProperties
        {options}
        {viewportWidth}
        on:optionsChanged={handleOptions}
    />
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
