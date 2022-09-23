<script>
    import { createEventDispatcher } from "svelte"

    // import Utils from './Utils.js';
    import MinMaxRangeSlider from "../components/Inputs/MinMaxRangeSlider.svelte"
    import Utils from "../Utils.js"

    export let drawingWidth
    export let options

    // console.table(options)

    const dispatch = createEventDispatcher()

    // Save the original axis
    let axis = { ...options.xAxis }

    // console.warn('fullAxis', fullAxis, '\noptions', options);
    //console.table(fullAxis);

    let minValue = 0
    let maxValue = axis.values.length - 1
    let startYear = 0
    let endYear = 0

    $: if (options.xAxis) setValues()

    function setValues() {
        // labels = xAxis.labels
        startYear = options.xRange.start.year
        endYear = options.xRange.end.year

        // console.log('max',maxValue)
        // console.log('start', start);
        // console.log('end', end);

        // Find the min value in the original axis
        for (let i = 0; i < axis.values.length - 1; i++) {
            if (startYear >= axis.values[i]) {
                minValue = i
            }
        }
        // Find the max value - defaults to the last value
        maxValue = axis.values.length - 1
        // Loop around all but the last value
        for (let i = axis.values.length - 2; i > minValue; i--) {
            if (endYear >= axis.values[i]) {
                // Find out which interval it is nearest to - this one or the next
                const deltaBefore = endYear - axis.values[i]
                const deltaAfter = axis.values[i + 1] - endYear
                maxValue = deltaBefore <= deltaAfter ? i : i + 1
                break
            }
        }
        // console.log('max value', maxValue);
    }

    function handleRange(event) {
        // console.warn("Handling date range changed by child", event.detail)

        if (event.detail.type == "min") {
            // console.log("new start value", event.detail.value)
            minValue = event.detail.value
            startYear = axis.values[minValue]
            options.xRange.start = Utils.setDate(startYear)
            options.xRange.range = options.xRange.end.year - startYear
        } else if (event.detail.type == "max") {
            // console.log("new end value", event.detail.value)
            maxValue = event.detail.value
            endYear = axis.values[maxValue]
            options.xRange.end = Utils.setDate(endYear)
            options.xRange.range = endYear - options.xRange.start.year
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
        labels={axis.labels}
        {minValue}
        {maxValue}
        on:rangeChanged={handleRange}
    />
</div>

<style>
    div {
        width: 100%;
        margin-top: 0.3rem;
    }
</style>
