<script>
    import { onMount } from "svelte"

    import Utils from "../Utils.js"

    import TimelineEvent from "../classes/TimelineEvent"
    import TimelineSeries from "../classes/TimelineSeries"
    import TimelineOptions from "../classes/TimelineOptions"
    import TimelineXRange from "../classes/TimelineXRange.js"
    import TimelineCategory from "../classes/TimelineCategory.js"
    import TimelineSubCategory from "../classes/TimelineSubCategory.js"
    import TimelineXAxis from "../classes/TimelineXAxis.js"

    import Axes from "./Axes.svelte"
    import Events from "./Events.svelte"
    import Canvas from "./Canvas.svelte"
    import Legend from "./Legend.svelte"
    import Options from "./Options.svelte"
    import EventProperties from "./EventProperties.svelte"
    import CanvasProperties from "./CanvasProperties.svelte"
    import Caption from "./Caption.svelte"
    import XRange from "./XRange.svelte"
    import Info from "./Info.svelte"
    import { windowWidth, touch } from "../stores"

    export let data
    export let settings
    export let viewportWidth

    let viewport
    let filteredEvents = []
    let filteredSeries = []
    let drawingWidth =
        viewportWidth - Utils.CANVAS_PADDING_LEFT - Utils.CANVAS_PADDING_RIGHT
    let xAxis
    let selectedSeries
    let resetXRange = false // Bound to component reset functions

    const options = new TimelineOptions(settings)
    const dataset = initDataset(data, options)
    // console.log("dataset", dataset, "\noptions", options)

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

    $: filteredEvents = TimelineEvent.process(
        dataset.events,
        options.xRange,
        options.search,
        dataset.subCategories
    )

    $: if (xAxis)
        filteredSeries = TimelineSeries.process(
            dataset.series,
            options.xRange,
            options.group
        )

    //
    // Functions
    //

    function handleOptions(event) {
        const eventData = event.detail.data
        switch (event.detail.name) {
            case "selectedPoint":
                options.selectedPoint = eventData
                selectedSeries = filteredSeries[options.selectedPoint.sIndex]
                break
            case "selectedEvent":
                options.selectedEvent = eventData
                break
            case "symbols":
                options.symbols = eventData
                break
            case "start":
                options.xRange.setStart(eventData)
                reScale()
                break
            case "end":
                options.xRange.setEnd(eventData)
                reScale()
                break
            // Filter or just highlight series
            // depending on group settings
            case "filter":
                options.filter = eventData.value
                options.filterType = eventData.taxonomy
                break
            case "group":
                options.filter = ""
                options.group = eventData
                if (options.group != "off") {
                    options.filterType = options.group
                } else {
                    options.filterType = ""
                }
                break
            case "sort":
                options.sort = eventData
                break
            case "search":
                options.search = eventData
                break
            case "focus":
                options.selectedEvent = eventData
                options.setFocus(dataset.xRange)
                reScale()
                break
            case "reset":
                options.reset(dataset.xRange)
                reScale()
                resetXRange = true
                break
            case "info":
                options.info = eventData
                break
        }
        if (event.detail.name !== "selectedPoint") {
            options.selectedPoint = undefined
        }
        if (event.detail.name !== "selectedEvent") {
            options.selectedEvent = undefined
        }
    }

    function handleClick() {
        // console.error('Handling timeline click in dataset',data.name)
        if (options.selectedPoint) {
            options.selectedPoint = undefined
        }
    }

    function handleResize() {
        // Debouncing taken care of in App.svelte
        // console.log("Handling resize with viewport", viewport?.clientWidth)
        if (viewport === undefined) return
        // If we have a viewport with a non-zero size use this
        if (viewport.clientWidth !== 0) {
            viewportWidth = viewport.clientWidth
            // console.error("viewport client width used", viewportWidth)
        }
        reScale()
        // Non-intuitive behaviour on touch devices
        if ($touch == false) {
            if (options.selectedEvent) {
                setTimeout(scrollToSelected, 500)
            }
        }
    }

    // @todo need to set interval based on range years
    function reScale() {
        // The drawing width is the clientWidth
        drawingWidth =
            viewportWidth -
            Utils.CANVAS_PADDING_LEFT -
            Utils.CANVAS_PADDING_RIGHT
        // Get axis and set options.xRange.scale a side effect
        xAxis = new TimelineXAxis(drawingWidth, options.xRange)
        // Reset highlighting
        options.filter = ""
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
        options.selectedPoint = undefined
    }

    /**
     * Convert raw json data ready for manipulating graphically, including
     * synthesising group series based on taxonomy and converting string
     * dates to app dates. This is called once per dataset on app load.
     * @param {Object} data The raw json data read from file
     * @param {TimelineOptions} options The processed user settings
     * @returns {Object} The process data datset
     */
    function initDataset(data, options) {
        // console.log('raw events', data.events)
        // Set taxonomy colours
        data.categories = TimelineCategory.init(data.categories)
        data.subCategories = TimelineSubCategory.init(data.subCategories)
        // Initialise data range for events and series
        data.xRange = new TimelineXRange()
        // console.error("initDataset xRange", data.xRange)
        // Process events
        if (data.events.length > 0) {
            // Optional filtering, set start & end dates, and colours
            // data.xRange is also updated as passed by reference
            data.events = TimelineEvent.init(
                data.xRange,
                data.events,
                options,
                data.categories,
                data.subCategories
            )
        }
        // console.log('data start', data.xRange.start)
        // console.log('data end', data.xRange.end)
        // Process series
        // data.xRange is also updated as passed by reference
        if (data.series.length > 0) {
            data.series = TimelineSeries.init(
                data.xRange,
                data.series,
                options,
                data.categories,
                data.subCategories
            )
            // groupedSeriesLength = data.series.length - rawSeriesLength
        }
        data.xRange.setRange()
        // console.log("dataset", data)
        // console.log("dataset xRange", data.xRange)
        // Check of we have an xRange from the user settings and if
        // not set to dataset range
        if (options.xRange.range === 0) {
            options.xRange = data.xRange.copy()
        }
        // Remove 'other' category and sub-category from dataset so not used in legend
        data.categories = data.categories.filter((cat) => cat.name !== "other")
        data.subCategories = data.subCategories.filter(
            (subCat) => subCat.name !== "other"
        )

        return data
    }
</script>

<!------------------------------------------------------------------------------
@section HTML
-------------------------------------------------------------------------------->

<figure
    class="timeline timeline-content"
    on:click|stopPropagation={handleClick}
>
    <Caption {options} title={options.title || dataset.name} {filteredSeries} />

    {#if options.readonly === false}
        <Options
            {options}
            xRange={dataset.xRange}
            series={dataset.series}
            events={filteredEvents}
            on:optionsChanged={handleOptions}
        />
    {/if}

    <div class="viewport" bind:this={viewport} on:click={handleViewportClick}>
        {#if options.xRange.scale !== 0}
            {#if filteredEvents.length > 0}
                <Events
                    events={filteredEvents}
                    {viewportWidth}
                    {options}
                    on:optionsChanged={handleOptions}
                />
            {/if}

            {#if filteredSeries.length > 0}
                <Canvas
                    categories={dataset.categories}
                    subCategories={dataset.subCategories}
                    {filteredSeries}
                    {viewportWidth}
                    {drawingWidth}
                    {options}
                    on:optionsChanged={handleOptions}
                />
            {/if}

            <Axes {xAxis} {viewportWidth} {drawingWidth} />
        {/if}
    </div>

    {#if drawingWidth != 0 && options.xRange.scale !== 0 && options.readonly === false}
        <XRange
            {xAxis}
            {drawingWidth}
            bind:reset={resetXRange}
            focus={options.focus}
            on:optionsChanged={handleOptions}
        />
    {/if}

    <Legend
        events={filteredEvents}
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

    {#if options.selectedPoint}
        <CanvasProperties
            series={selectedSeries}
            {options}
            {viewportWidth}
            on:optionsChanged={handleOptions}
        />
    {/if}

    {#if options.info}
        <Info on:optionsChanged={handleOptions} />
    {/if}
</figure>

<style>
    figure {
        position: relative;
        margin: 2rem 0;
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
</style>
