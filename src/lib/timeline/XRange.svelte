<script>
    import { createEventDispatcher } from "svelte"

    import MinMaxRangeSlider from "../components/Inputs/MinMaxRangeSlider.svelte"
    import Utils from "../Utils.js"

    export let drawingWidth
    export let xAxis
    export let reset

    const dispatch = createEventDispatcher()

    let minIndex = 0
    let maxIndex = 0
    let start = 0
    let end = 0

    // Save the original x axis as this should only
    // be refreshed when the options are reset, i.e the
    // xRange slider always has the full range of xRange
    // values for the dataset
    let oAxis = { ...xAxis }

    $: if (drawingWidth > 0) init()

    $: if (reset) {
        console.error("Resetting xRange")
        oAxis = { ...xAxis }
        init()
    }

    /**
     * Run this function when:
     * a) first displaying or
     * b) if the window size changes
     */
    function init() {
        minIndex = 0
        maxIndex = oAxis.values.length - 1
        start = oAxis.majorFirst
        end = oAxis.majorLast

        // Find the min index in the original axis
        minIndex = 0
        for (let i = 0; i < oAxis.values.length - 1; i++) {
            // console.log("Checking for min value", i)
            if (start >= oAxis.values[i]) {
                minIndex = i
                console.log("Found matching min index", i)
                start = oAxis.values[i]
            } else {
                break
            }
        }
        // Find the max value - defaults to the last value
        maxIndex = oAxis.values.length - 1
        // Loop around all but the last value
        for (let i = oAxis.values.length - 2; i > minIndex; i--) {
            // console.log("Checking for max value", i)
            if (end >= oAxis.values[i]) {
                // Find out which interval it is nearest to - this one or the next
                const deltaBefore = end - oAxis.values[i]
                const deltaAfter = oAxis.values[i + 1] - end
                maxIndex = deltaBefore <= deltaAfter ? i : i + 1
                end = oAxis.values[maxIndex]
                console.log("Found matching max index", maxIndex)
                break
            }
        }
        console.error("Initialised xRange", start, end, minIndex, maxIndex)
    }

    function handleRange(event) {
        const name = event.detail.type == "min" ? "start" : "end"
        const data = oAxis.values[event.detail.index]
        dispatch("optionsChanged", { name, data })
    }
</script>

<div
    style="padding-left:{Utils.CANVAS_PADDING_LEFT}px; 
	       padding-right:{Utils.CANVAS_PADDING_RIGHT}px;"
>
    <MinMaxRangeSlider
        {drawingWidth}
        labels={oAxis.labels}
        {minIndex}
        {maxIndex}
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
