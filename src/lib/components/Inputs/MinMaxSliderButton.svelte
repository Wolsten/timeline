<script>
    import { touch } from "../../stores"
    import { createEventDispatcher } from "svelte"

    export let drawingWidth
    export let index // The current index value for this slider button
    export let min // min index
    export let max // max index
    export let type // "min" or "max"
    export let labels
    export let interval

    const dispatch = createEventDispatcher()

    let buttonWidth = drawingWidth / (labels.length - 1)
    let buttonOffset = buttonWidth / 2
    let holder
    let dragging = false
    let x = 0
    let value = index // Value is the decimal version of the index
    let left = index * buttonWidth - buttonOffset
    let minX = min * interval
    let maxX = max * interval + buttonWidth

    $: if (drawingWidth) updateLeft()

    function updateLeft() {
        buttonWidth = boxWidth(holder)
        if (buttonWidth > interval) {
            buttonWidth = interval
        }
        console.log(
            "Updated button",
            type,
            "width",
            buttonWidth,
            "interval",
            interval
        )
        buttonOffset = buttonWidth / 2
        minX = min * interval
        maxX = max * interval + buttonWidth
        left = index * interval + (type == "min" ? -1 : 1) * buttonOffset
    }

    function box(element) {
        return element.getBoundingClientRect()
    }

    function boxWidth(button) {
        if (button) {
            return box(button).width
        }
        return drawingWidth / (labels.length - 1)
    }

    function handleDragStart() {
        // Touch devices use clicks not drag
        if ($touch) return
        // Flag drag started
        dragging = true
        // Get the position relative to the viewport
        const xOffset = holder.parentNode.getBoundingClientRect().left
        // Get accurate width and offset
        buttonWidth = holder.getBoundingClientRect().width
        buttonOffset = buttonWidth / 2

        document.body.onmousemove = (moveEvent) => {
            // Get the new delta position within the slider div
            x = moveEvent.clientX - xOffset
            // Check against limits
            if (x < minX) {
                // console.log("hitting low limit", x)
                x = minX
            } else if (x > maxX) {
                // console.log("hitting high limit", x)
                x = maxX
            }
            // The dynamic position p is the left hand side
            // since user will typically grab in the middle.
            left = x - buttonOffset
            // Get new value correcting for the xOffset (see x above)
            value = (xOffset + left) / interval
            index = Math.round(value)
            if (index > labels.length - 1) index = labels.length - 1
            if (index < 0) index = 0
            // console.log("left, newValue, index => ", left, value, index)
        }

        const drop = function () {
            dragging = false
            document.body.onmousemove = null
            document.body.onmouseup = null
            document.body.onmouseleave = null
            // Get final index, chacking again for limits in case drag was
            // interrupted, e.g. by going off screen
            index = Math.floor(value)
            if (index > labels.length - 1) index = labels.length - 1
            if (index < 0) index = 0
            // Dispatch event to XRange component
            dispatch("rangeChanged", {
                type,
                index,
                // value: labels[index],
            })
        }

        document.body.onmouseup = (e) => {
            drop()
        }

        document.body.onmouseleave = (e) => {
            drop()
        }
    }

    function handleTouchDown() {
        index--
        dispatch("rangeChanged", {
            type,
            index,
            // value: labels[index],
        })
    }

    function handleTouchUp() {
        index++
        dispatch("rangeChanged", {
            type,
            index,
            // value: labels[index],
        })
    }
</script>

{#if $touch}
    <div class="touch">
        {#if index > min}
            <button type="button" on:click|stopPropagation={handleTouchDown}>
                &#9664;
            </button>
        {:else}
            &nbsp;
        {/if}

        {labels[index]}

        {#if index < max}
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
        style={`left:${left}px`}
        on:mousedown={handleDragStart}
    >
        {labels[index]}
    </div>
{/if}

<style>
    div {
        position: absolute;
        top: 0;

        padding: 0.2rem 0.4rem;

        border-radius: var(--tl-size-border-radius);
        border: 1px solid var(--tl-colour-faint-lines);
        background-color: var(--tl-colour-range-slider-fill);
        color: var(--tl-colour-font);

        min-width: 40px;
        text-align: center;
    }

    div.draggable {
        top: -0.7rem;
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
