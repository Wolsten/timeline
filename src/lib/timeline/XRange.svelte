<script>
    import { createEventDispatcher } from "svelte"

    import MinMaxRangeSlider from "../components/Inputs/MinMaxRangeSlider.svelte"
    import Utils from "../Utils.js"

    export let options

    const dispatch = createEventDispatcher()

    let xAxis
    let xRange
    let canvasInterval = 0
    let minValue = 0
    let maxValue = options.xAxis.values.length - 1
    let labels = []
    let start = options.xAxis.majorFirst
    let end = options.xAxis.majorLast

    // Only update the xRange slider when the scaling changes due to the
    // window being resized
    $: if (xRange === undefined || options.xRange.scaleNotSameAs(xRange))
        initXRange()

    function initXRange() {
        console.warn("Resetting xRange with start and end", start, end)
        // Save the new values
        xRange = { ...options.xRange }
        xAxis = { ...options.xAxis }
        canvasInterval = options.xRange.scaledInterval * options.xRange.scale
        labels = xAxis.labels
        // Find the min value in the original axis
        minValue = 0
        for (let i = 0; i < xAxis.values.length - 1; i++) {
            // console.log("Checking for min value", i)
            if (start >= xAxis.values[i]) {
                minValue = i
                start = xAxis.values[i]
            } else {
                break
            }
        }

        // Find the max value - defaults to the last value
        maxValue = xAxis.values.length - 1
        // Loop around all but the last value
        for (let i = xAxis.values.length - 2; i > minValue; i--) {
            // console.log("Checking for max value", i)
            if (end >= xAxis.values[i]) {
                // Find out which interval it is nearest to - this one or the next
                const deltaBefore = end - xAxis.values[i]
                const deltaAfter = xAxis.values[i + 1] - end
                maxValue = deltaBefore <= deltaAfter ? i : i + 1
                end = xAxis.values[maxValue]
                break
            }
        }
        console.error(
            "resetting xRange slider with xAxis",
            start,
            end,
            canvasInterval,
            minValue,
            maxValue
        )
    }

    function handleRange(event) {
        // console.warn("Handling date range changed by child", event.detail)
        if (event.detail.type == "min") {
            minValue = event.detail.value
            start = xAxis.values[minValue]
            options.xRange.setStart(start)
        } else if (event.detail.type == "max") {
            maxValue = event.detail.value
            end = xAxis.values[maxValue]
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
        {canvasInterval}
        {labels}
        {minValue}
        {maxValue}
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
