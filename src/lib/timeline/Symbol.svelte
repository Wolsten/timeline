<script>
    // https://bennettfeely.com/clippy/

    import Utils from "../Utils.js"

    export let opIndex // Original point index
    export let sIndex
    export let defaultColour
    // export let symbolIndex
    export let symbols // @todo Not required if wrap in test for symbols
    export let selectedPoint

    // $: console.log('selectedPoint',selectedPoint)

    let active = false
    let colour = ""
    let symbolIndex

    $: symbolIndex =
        selectedPoint.sIndex == sIndex && selectedPoint.opIndex == opIndex
            ? "selected"
            : sIndex % 6

    $: active = selectedPoint && selectedPoint.sIndex == sIndex

    $: {
        colour = "transparent"
        if (symbols) {
            if (selectedPoint == false || active) {
                colour = defaultColour
            }
        } else if (
            selectedPoint.sIndex == sIndex &&
            selectedPoint.opIndex == opIndex
        ) {
            colour = defaultColour
        }
    }
</script>

<!------------------------------------------------------------------------------
@section HTML
-------------------------------------------------------------------------------->

<rect
    class="symbol-{symbolIndex}"
    style:fill={colour}
    x={-Utils.SYMBOL_SIZE / 2}
    y={-Utils.SYMBOL_SIZE / 2}
    width={Utils.SYMBOL_SIZE}
    height={Utils.SYMBOL_SIZE}
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
        clip-path: circle(50% at 50% 50%);
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
