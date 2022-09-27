<script>
    // https://bennettfeely.com/clippy/

    export let index
    export let colour = "transparent"
    export let wrapped = false // True is using symbol in html not an svg

    const SYMBOL_SIZE = 12
</script>

<!------------------------------------------------------------------------------
@section HTML
-------------------------------------------------------------------------------->

{#if wrapped}
    <svg width={SYMBOL_SIZE} height={SYMBOL_SIZE}>
        <g transform="translate({SYMBOL_SIZE / 2},{SYMBOL_SIZE / 2})">
            <rect
                class="symbol-{index % 6}"
                style="fill:{colour};"
                x={-SYMBOL_SIZE / 2}
                y={-SYMBOL_SIZE / 2}
                width={SYMBOL_SIZE}
                height={SYMBOL_SIZE}
            />
        </g>
    </svg>
{:else}
    <rect
        class="symbol-{index % 6}"
        style="fill:{colour};"
        x={-SYMBOL_SIZE / 2}
        y={-SYMBOL_SIZE / 2}
        width={SYMBOL_SIZE}
        height={SYMBOL_SIZE}
    />
{/if}

<!------------------------------------------------------------------------------
@section STYLES
-------------------------------------------------------------------------------->
<style>
    svg {
        margin-right: 0.3rem;
    }

    rect {
        cursor: pointer;
    }

    /* Smaller square */
    .symbol-0 {
        clip-path: polygon(10% 10%, 90% 10%, 90% 90%, 10% 90%);
    }

    /* Circle */
    .symbol-1 {
        clip-path: circle(50% at 50% 50%);
    }
    /* Diamond */
    .symbol-2 {
        clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    }
    /* Up arrow */
    .symbol-3 {
        clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
    }
    /* Down arrow */
    .symbol-4 {
        clip-path: polygon(0% 0%, 100% 0%, 50% 100%);
    }
    /* Right arrow */
    .symbol-5 {
        clip-path: polygon(0% 0%, 100% 50%, 0% 100%);
    }
    /* Left arrow */
    .symbol-6 {
        clip-path: polygon(0% 50%, 100% 0%, 100% 100%);
    }
</style>
