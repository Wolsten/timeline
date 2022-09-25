<script>
    // https://bennettfeely.com/clippy/

    export let opIndex // Original point index
    export let seriesIndex
    export let defaultColour
    // export let symbolIndex
    export let symbols // @todo Not required if wrap in test for symbols
    export let selectedPoint

    // $: console.log('selectedPoint',selectedPoint)

    const symbolSize = 10

    let active = false
    let colour = ""
    let sIndex //= symbolIndex

    $: sIndex =
        selectedPoint.index == seriesIndex && selectedPoint.opIndex == opIndex
            ? "selected"
            : seriesIndex % 6

    $: active = selectedPoint && selectedPoint.index == seriesIndex

    $: {
        colour = "transparent"
        if (symbols) {
            if (selectedPoint == false || active) {
                colour = defaultColour
            }
        } else if (
            selectedPoint.index == seriesIndex &&
            selectedPoint.i == opIndex
        ) {
            colour = defaultColour
        }
    }
</script>

<!------------------------------------------------------------------------------
@section HTML
-------------------------------------------------------------------------------->

<rect
    class="symbol-{sIndex}"
    style:fill={colour}
    x={-symbolSize / 2}
    y={-symbolSize / 2}
    width={symbolSize}
    height={symbolSize}
/>

<!------------------------------------------------------------------------------
@section STYLES
-------------------------------------------------------------------------------->
<style>
    rect {
        cursor: pointer;
    }
    rect:hover {
        outline: 2px solid var(--tl-colour-font-titles);
    }

    .symbol-selected {
        outline: 2px solid transparent;
    }

    .symbol-0 {
        clip-path: polygon(
            10% 10%,
            90% 10%,
            90% 90%,
            10% 90%
        ); /* Smaller square */
    }
    .symbol-1 {
        clip-path: circle(50% at 0 0);
    }
    .symbol-2 {
        clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); /* Diamond */
    }
    .symbol-3 {
        clip-path: polygon(50% 0%, 100% 100%, 0% 100%); /* Up arrow */
    }
    .symbol-4 {
        clip-path: polygon(0% 0%, 100% 0%, 50% 100%); /* Down arrow */
    }
    .symbol-5 {
        clip-path: polygon(0% 0%, 100% 50%, 0% 100%); /* Right arrow */
    }
    .symbol-6 {
        clip-path: polygon(0% 50%, 100% 0%, 100% 100%); /* Left arrow */
    }
</style>
