<script>
    import { createEventDispatcher } from "svelte"

    import MinMaxRangeSlider from "../components/Inputs/MinMaxRangeSlider.svelte"
    import Utils from "../Utils.js"

    export let drawingWidth
    export let options

    const dispatch = createEventDispatcher()

    let xAxis
    let minIndex = 0
    let maxIndex = 0
    let labels = []
    let start = 0
    let end = 0
    let reset = false

    $: if (options.reSet === true) initXRange()

    initXRange()

    function initXRange() {
        minIndex = 0
        maxIndex = options.xAxis.values.length - 1
        start = options.xAxis.majorFirst
        end = options.xAxis.majorLast

        xAxis = { ...options.xAxis }
        labels = xAxis.labels
        // Find the min index in the original axis
        minIndex = 0
        for (let i = 0; i < xAxis.values.length - 1; i++) {
            // console.log("Checking for min value", i)
            if (start >= xAxis.values[i]) {
                minIndex = i
                console.log("Found matching min index", i)
                start = xAxis.values[i]
            } else {
                break
            }
        }
        // Find the max value - defaults to the last value
        maxIndex = xAxis.values.length - 1
        // Loop around all but the last value
        for (let i = xAxis.values.length - 2; i > minIndex; i--) {
            // console.log("Checking for max value", i)
            if (end >= xAxis.values[i]) {
                // Find out which interval it is nearest to - this one or the next
                const deltaBefore = end - xAxis.values[i]
                const deltaAfter = xAxis.values[i + 1] - end
                maxIndex = deltaBefore <= deltaAfter ? i : i + 1
                end = xAxis.values[maxIndex]
                console.log("Found matching max index", maxIndex)
                break
            }
        }
        reset++
        console.error("Reset xRange", start, end, minIndex, maxIndex)
    }

    function handleRange(event) {
        // console.warn("Handling date range changed by child", event.detail)
        if (event.detail.type == "min") {
            // minIndex = event.detail.value
            // start = xAxis.values[minIndex]
            minIndex = event.detail.index
            start = event.detail.value
            options.xRange.setStart(start)
        } else if (event.detail.type == "max") {
            // maxIndex = event.detail.value
            // end = xAxis.values[maxIndex]
            maxIndex = event.detail.index
            end = event.detail.value
            options.xRange.setEnd(end)
        }
        // console.log("XRange: handleRange", options.xRange)
        dispatch("optionsChanged", { name: "xRange", data: options.xRange })
    }
</script>

<div
    style="padding-left:{Utils.CANVAS_PADDING_LEFT}px; 
	       padding-right:{Utils.CANVAS_PADDING_RIGHT}px;"
>
    <MinMaxRangeSlider
        {drawingWidth}
        {labels}
        {minIndex}
        {maxIndex}
        {reset}
        on:rangeChanged={handleRange}
    />
</div>

<style>
    div {
        width: 100%;
        margin: 0.5rem 0;
        /* border: 1px solid rgb(218, 177, 177); */
    }
</style>
