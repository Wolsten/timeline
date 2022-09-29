<script>
    import { touch } from "../../stores"
    import { createEventDispatcher } from "svelte"

    export let canvasInterval
    // export let drawingWidth
    export let value
    export let min
    export let max
    export let type
    export let labels

    const dispatch = createEventDispatcher()

    const sliderOffset = canvasInterval / 2

    let holder
    let rect
    let xOffset

    $: if (holder) {
        rect = holder.parentNode.getBoundingClientRect()
        xOffset = rect.left
    }

    let dragging = false
    let newValue = value
    let label = value
    let left = (type == "min" ? min : max) * canvasInterval - sliderOffset

    // Update new value when the value changes
    // $: if (value != -1) {
    //     newValue = value
    //     label = value
    // }

    // When drop subtract the offset from the position
    //$: left = canvasInterval * newValue // - (dragging ? 0 : sliderOffset)

    function handleDragStart() {
        if ($touch) {
            return
        }

        dragging = true

        const minX = min * canvasInterval
        const maxX = max * canvasInterval

        // Get the position relative to the viewport
        // const rect = holder.parentNode.getBoundingClientRect()
        // xOffset = rect.left

        document.body.onmousemove = (moveEvent) => {
            // Get the new delta position within the slider div
            // console.log('clientX', moveEvent.clientX)
            let x = moveEvent.clientX - xOffset
            // The dynamic position p is the left hand side
            // since user will typically grab in the middle.
            // i.e. left is the screen coordinate for the
            // left hand side of the slider so that the cursor
            // does not suddenly switch away from the position selected
            left = x - sliderOffset
            // console.log('minX',minX,'maxX',maxX,'left',left)
            // Check against limits and if ok set position
            // Allow for the slider offset
            if (left + sliderOffset < minX) {
                // console.log("hitting low limit")
                left = minX - sliderOffset
            } else if (left + sliderOffset > maxX) {
                // console.log("hitting high limit")
                left = maxX - sliderOffset
            }
            // Get new value correcting for the xOffset (see x above)
            newValue = (xOffset + left) / canvasInterval
            label = `${Math.round(newValue)}`
            // console.log('min, left, max, newValue = ',minX,left,maxX,newValue)
        }

        const drop = function () {
            dragging = false
            document.body.onmousemove = null
            document.body.onmouseup = null
            document.body.onmouseleave = null

            value = Math.floor(newValue)
            // console.log('Drag ended, final value = ',value)

            dispatch("rangeChanged", { type, value })
        }

        document.body.onmouseup = (e) => {
            drop()
        }

        document.body.onmouseleave = (e) => {
            drop()
        }
    }

    function handleTouchDown() {
        value--
        dispatch("rangeChanged", { type, value })
    }

    function handleTouchUp() {
        value++
        dispatch("rangeChanged", { type, value })
    }
</script>

{#if $touch}
    <div class="touch">
        {#if value > min}
            <button type="button" on:click|stopPropagation={handleTouchDown}>
                &#9664;
            </button>
        {:else}
            &nbsp;
        {/if}

        {labels[value]}

        {#if value < max}
            <button type="button" on:click|stopPropagation={handleTouchUp}>
                &#9654;
            </button>
        {:else}
            &nbsp;
        {/if}
    </div>
{:else}
    <div
        bind:this={holder}
        class="draggable"
        class:dragging
        style={`min-width:${canvasInterval}px; left:${left}px`}
        on:mousedown={handleDragStart}
    >
        {labels[label]}
    </div>
{/if}

<style>
    div {
        position: absolute;
        top: 0rem;

        padding: 0.2rem 0.4rem;

        border-radius: var(--tl-size-border-radius);
        border: 1px solid var(--tl-colour-faint-lines);
        background-color: var(--tl-colour-range-slider-fill);
        color: var(--tl-colour-font);

        min-width: 50px;
        /* font-size: 0.8rem; */
        text-align: center;
    }

    div.draggable {
        top: -0.5rem;
    }

    div.touch {
        position: static;
    }

    div.dragging {
        background-color: var(--tl-colour-toggle);
        color: white;
        cursor: col-resize;
    }

    div:hover,
    button:hover {
        background-color: var(--tl-colour-toggle-hover);
        color: white;
    }

    button {
        padding: 0;
        border: none;
        background-color: inherit;
        color: inherit;
        display: inline-block;
        position: static;
        text-align: center;
        /* font-size: 1rem; */
    }
</style>
