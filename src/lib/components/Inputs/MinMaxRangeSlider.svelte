<script>
    import { touch } from "../../stores"
    import MinMaxSliderButton from "./MinMaxSliderButton.svelte"

    export let drawingWidth
    export let labels
    export let startIndex
    export let endIndex
</script>

<!-- <p>
    Min value = {startIndex}, Max value = {endIndex}, Range = {labels.length -
        1}
</p> -->

<div class="date-range" class:touch={$touch}>
    <MinMaxSliderButton
        {drawingWidth}
        index={startIndex}
        {labels}
        min={0}
        max={endIndex - 1}
        type="min"
        on:rangeChanged
    />
    <MinMaxSliderButton
        {drawingWidth}
        index={endIndex}
        {labels}
        min={startIndex + 1}
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
