<script>
    import { createEventDispatcher } from "svelte"

    import MinMaxRangeSlider from "../components/Inputs/MinMaxRangeSlider.svelte"
    import Utils from "../Utils.js"

    export let drawingWidth
    export let xAxis
    export let focus // Bound to component. Set to options.xRange or undefined
    export let reset // This must be bound to the component to work bi-directionally

    const dispatch = createEventDispatcher()

    // Save the original x axis as this should only be refreshed when the options
    // are reset, i.e the xRange slider always has the full range of xRange
    // values for the dataset
    let oAxis = { ...xAxis }
    // let minIndex = 0
    // let maxIndex = xAxis.values.length - 1
    let startIndex = 0
    let endIndex = xAxis.values.length - 1

    $: if (reset) {
        // console.log("Resetting XRange")
        oAxis = { ...xAxis }
        // minIndex = 0
        // maxIndex = oAxis.values.length - 1
        startIndex = 0
        endIndex = oAxis.values.length - 1
        reset = false
    }

    $: if (focus !== undefined) handleFocus()

    function handleFocus() {
        console.log("focus xRange", focus, "\noAxis", oAxis)
        startIndex = 0
        // Find the start and end indices on the x axis
        for (let i = 0; i < oAxis.values.length; i++) {
            if (focus.start.decimal < oAxis.values[i]) {
                startIndex = i == 0 ? 0 : i - 1
                console.log("xRange set new start index", startIndex)
                break
            }
        }
        endIndex = oAxis.values.length - 1
        for (let i = oAxis.values.length - 1; i > 0; i--) {
            if (focus.end.decimal > oAxis.values[i]) {
                endIndex = i == oAxis.values.length - 1 ? i : i + 1
                console.log("xRange set new end index", endIndex)
                break
            }
        }
    }

    function handleRange(event) {
        const name = event.detail.type == "min" ? "start" : "end"
        const data = oAxis.values[event.detail.index]

        if (name == "start") {
            startIndex = event.detail.index
        } else {
            endIndex = event.detail.index
        }

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
        {startIndex}
        {endIndex}
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
