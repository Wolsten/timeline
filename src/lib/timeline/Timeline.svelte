<script>
    import { onMount } from "svelte"

    import Utils from "../Utils.js"

    import TimelineEvent from "../classes/TimelineEvent"
    import TimelineSeries from "../classes/TimelineSeries"
    import TimelineOptions from "../classes/TimelineOptions"
    import TimelineXRange from "../classes/TimelineXRange.js"
    import TimelineCategory from "../classes/TimelineCategory.js"
    import TimelineSubCategory from "../classes/TimelineSubCategory.js"

    import Axes from "./Axes.svelte"
    import Events from "./Events.svelte"
    import Canvas from "./Canvas.svelte"
    import Legend from "./Legend.svelte"
    import Options from "./Options.svelte"
    import EventProperties from "./EventProperties.svelte"
    import CanvasProperties from "./CanvasProperties.svelte"
    import Caption from "./Caption.svelte"
    import XRange from "./XRange.svelte"
    import { windowWidth, touch } from "../stores"

    export let data
    export let settings
    export let viewportWidth

    const options = new TimelineOptions(settings)
    const dataset = initDataset(data, options)

    let viewport
    let filteredEvents = []
    let filteredSeries = []
    let drawingWidth =
        viewportWidth - Utils.CANVAS_PADDING_LEFT - Utils.CANVAS_PADDING_RIGHT

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

    $: filteredSeries = TimelineSeries.process(
        dataset.series,
        options.xRange,
        options.filter,
        options.filterType,
        options.group
    )

    //
    // Functions
    //

    function handleOptions(event) {
        const dta = event.detail.data
        // console.log('Options changed',detail)
        switch (event.detail.name) {
            case "selectedPoint":
                options.selectedPoint = dta
                break
            case "selectedEvent":
                options.selectedEvent = dta
                break
            case "symbols":
                options.symbols = dta
                break
            case "xRange":
                options.xRange = dta
                reScale(false)
                break
            // Filter or just highlight series
            // depending on group settings
            case "filter":
                options.filter = dta.value
                options.filterType = dta.taxonomy
                break
            case "group":
                options.filter = ""
                if (options.group) {
                    options.filterType = "sub-category"
                } else {
                    options.filterType = ""
                }
                break
            case "sort":
                break
            case "search":
                options.search = dta
                break
            case "reset":
                options.reset()
                // Cannot do this in reset method as reactivity
                // depending on this property does
                // not work - this is a Svelte issue
                options.xRange = dataset.xRange.copy()
                reScale()
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
        // Handle resizing - debouncing taken care of in App.svelte
        console.log("Handling resize with viewport", viewport?.clientWidth)
        // Stop if we don;t yet have a viewport
        if (viewport === undefined) return
        // If we have a viewport with a non-zero size use this
        if (viewport.clientWidth !== 0) {
            viewportWidth = viewport.clientWidth
            console.error("viewport client width used", viewportWidth)
        }
        reScale(true)
        // Non-intuitive behaviour on touch devices
        if ($touch == false) {
            if (options.selectedEvent) {
                setTimeout(scrollToSelected, 500)
            }
        }
    }

    function reScale(reSized) {
        // The drawing width is the clientWidth
        drawingWidth =
            viewportWidth -
            Utils.CANVAS_PADDING_LEFT -
            Utils.CANVAS_PADDING_RIGHT
        // Get the nearest whole no. of data intervals that fits in the range
        options.xRange.scaledIntervals = Math.round(
            drawingWidth / Utils.MIN_BOX_WIDTH
        )
        // Calculate the size of a data interval (rounding up to make sure
        // all data fits in range)
        options.xRange.scaledInterval = Math.ceil(
            options.xRange.range / options.xRange.scaledIntervals
        )
        // Calculate the the new data range based on quantised interval
        options.xRange.scaledRange =
            options.xRange.scaledIntervals * options.xRange.scaledInterval
        // New scale value
        options.xRange.scale = drawingWidth / options.xRange.scaledRange
        // Flag if resized
        options.reSized = reSized
        console.log("new scale", options.xRange.scale)
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
        if (data.series.length > 0) {
            data.series = TimelineSeries.init(
                data.xRange,
                data.series,
                options,
                data.categories,
                data.subCategories
            )
        }
        data.xRange.range = data.xRange.end.year - data.xRange.start.year
        console.log("dataset", data)
        // Check of we have an xRange from the user settings and if
        // not set to dataset range
        if (options.xRange.range === 0) {
            options.xRange = data.xRange.copy()
        }
        return data
    }
</script>

<!------------------------------------------------------------------------------
@section HTML
-------------------------------------------------------------------------------->

<!-- <DebugTimeline {data} {options} /> -->

<figure
    class="timeline timeline-content"
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

            <Axes {options} {viewportWidth} {drawingWidth} />
        {/if}
    </div>

    {#if drawingWidth != 0 && options.xRange.scale !== 0 && options.readonly === false}
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
</style>
