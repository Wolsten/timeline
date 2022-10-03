<script>
    import { touch } from "../../stores"
    import MinMaxSliderButton from "./MinMaxSliderButton.svelte"

    export let drawingWidth
    export let labels
    export let minIndex
    export let maxIndex

    // The size of the interval in pixels
    let interval // = drawingWidth / labels.length

    // Update interval when the drawing width or labels change
    $: interval = drawingWidth / labels.length
</script>

<!-- <p>
    interval={interval}, Min value = {minIndex}, Max value = {maxIndex}, Range = {labels.length -
        1}
</p> -->

<div class="date-range" class:touch={$touch}>
    <MinMaxSliderButton
        {drawingWidth}
        {interval}
        index={minIndex}
        {labels}
        min={0}
        max={maxIndex - 1}
        type="min"
        on:rangeChanged
    />
    <MinMaxSliderButton
        {drawingWidth}
        {interval}
        index={maxIndex}
        {labels}
        min={minIndex + 1}
        max={labels.length - 1}
        type="max"
        on:rangeChanged
    />
</div>

<style>
    .date-range {
        width: 100%;
        height: 0.5rem;
        position: relative;
        user-select: none;
        background-color: var(--tl-colour-range-slider-fill);
        border-radius: var(--tl-size-border-radius);
    }

    .date-range.touch {
        position: static;
        height: auto;
        background-color: transparent;
        display: flex;
        justify-content: space-between;
    }
</style>
