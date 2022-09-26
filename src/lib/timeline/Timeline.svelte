<script>
    import { onMount } from "svelte"

    import Utils from "../Utils.js"
    import Axes from "./Axes.svelte"
    import Events from "./Events.svelte"
    import CanvasNew from "./CanvasNew.svelte"
    import LegendNew from "./LegendNew.svelte"
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

    // Convert string settings to object
    const userSettings = Utils.initSettings(settings)

    // Process the dataset
    const dataset = Utils.initDataset(data, userSettings)
    // console.error("Timeline dataset", dataset)

    const options = {
        ...userSettings,
        selectedEvent: false,
        selectedPoint: false,
        zoom: 1,
        series: [],
    }

    // Check of we have an xRange from the user settings and if
    // not set to dataset range
    if (options.xRange.range === 0) {
        options.xRange = { ...dataset.xRange }
    }
    // console.log("options", options)

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
        console.log("onMount viewport width", viewport?.clientWidth)
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
            case "group":
                // options.group = detail.data
                if (
                    options.group &&
                    (options.filterType == "" || options.filterType == "single")
                ) {
                    options.filterType = "sub-category"
                    // debugger
                }
                console.log("Set group to", options.group)
                filteredSeries = Utils.processSeries(
                    dataset.series,
                    options.xRange,
                    options.filter,
                    options.filterType,
                    options.group
                )
                break
            // case "totalise":
            //     options.totalise = detail.data
            //     options.filter = ""
            //     break
            case "sort":
                options.sort = detail.data
                break
            case "search":
                options.search = detail.data
                filteredEvents = Utils.processEvents(
                    dataset.events,
                    options.xRange,
                    options.search,
                    dataset.subCategories
                )
                break
            case "reset":
                options.selectedEvent = false
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
            console.log("New viewport width", viewport.clientWidth)

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
            console.log("4. viewport width", viewport.clientWidth)

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
        console.error("scaleX: viewportWidth", viewportWidth)
        console.error("scaleX: drawingWidth", drawingWidth)
        // scale in pixels/x-unit
        scale = drawingWidth / options.xRange.range
        // console.log("scaleX: scale (pixels/x unit)", scale)
        // console.log('data.events', data.events);
        filteredEvents = Utils.processEvents(
            dataset.events,
            options.xRange,
            options.search,
            dataset.subCategories
        )
        // console.log('filteredEvents', filteredEvents);
        console.log("series", dataset.series, "scale", scale)
        if (dataset.series.length > 0)
            filteredSeries = Utils.processSeries(
                dataset.series,
                options.xRange,
                options.filter,
                options.filterType,
                options.group
            )
        console.log("filter series", filteredSeries, "scale", scale)
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
        options.selectedEvent = false
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
        nSeries={dataset.series.length > 1}
        categorised={options.categorise}
        grouped={options.totalise}
        filter={options.filter}
        title={options.title || dataset.name}
    />

    {#if options.readonly === false}
        <Options
            {options}
            categoriesLength={dataset.categories.length}
            subCategoriesLength={dataset.subCategories.length}
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
                <CanvasNew
                    {scale}
                    categories={dataset.categories}
                    subCategories={dataset.subCategories}
                    series={filteredSeries}
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

    <LegendNew
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
