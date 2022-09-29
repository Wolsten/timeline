<script>
    import { touch } from "../../stores"
    import MinMaxSliderButton from "./MinMaxSliderButton.svelte"

    export let canvasInterval
    export let labels
    export let minValue
    export let maxValue
</script>

<p>
    interval={canvasInterval}, Min value = {minValue}, Max value = {maxValue},
    Range = {labels.length - 1}
</p>

<div class="date-range" class:touch={$touch}>
    <MinMaxSliderButton
        {canvasInterval}
        value={minValue}
        {labels}
        min={0}
        max={maxValue - 1}
        type="min"
        on:rangeChanged
    />
    <MinMaxSliderButton
        {canvasInterval}
        value={maxValue}
        {labels}
        min={minValue + 1}
        max={maxValue}
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
