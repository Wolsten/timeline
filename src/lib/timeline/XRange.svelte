<script>
    import { createEventDispatcher } from "svelte"

    import MinMaxRangeSlider from "../components/Inputs/MinMaxRangeSlider.svelte"
    import Utils from "../Utils.js"

    export let drawingWidth
    export let xAxis
    export let reset // This must be bound to the component to work bi-directionally

    const dispatch = createEventDispatcher()

    // Save the original x axis as this should only be refreshed when the options
    // are reset, i.e the xRange slider always has the full range of xRange
    // values for the dataset
    let oAxis = { ...xAxis }
    let minIndex = 0
    let maxIndex = xAxis.values.length - 1

    $: if (reset) {
        console.log("Resetting XRange")
        oAxis = { ...xAxis }
        minIndex = 0
        maxIndex = oAxis.values.length - 1
        reset = false
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
