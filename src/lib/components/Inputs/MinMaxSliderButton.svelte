<script>
    import { touch } from "../../stores"
    import { createEventDispatcher, onMount, afterUpdate } from "svelte"

    export let drawingWidth
    export let index // The current imposed index value for this slider button
    export let min // min index
    export let max // max index
    export let type // "min" or "max"
    export let labels

    const dispatch = createEventDispatcher()

    let buttonWidth = 50 // Default value to use before button loaded on page
    let holder // Bind to the slider button
    let dragging = false
    let left // The left position in pixels of the slider button
    let currentIndex = type == "min" ? min : max
    let value = currentIndex // Value is the decimal version of the index
    let checkReset = false

    onMount(() => {
        // Wait for the dom slider button to be loaded to update the left position accurately
        // setTimeout(updateLeft, 10)
    })

    afterUpdate(() => {
        buttonWidth = boxWidth(holder, buttonWidth)
    })

    // The size in pixels of each range interval
    $: interval = drawingWidth / (labels.length - 1)

    $: if (drawingWidth) updateLeft()

    // Set limits of where the x-drag position can be
    $: minX = min * interval
    $: maxX = max * interval

    $: if (index != -1) {
        // console.warn("Setting new index", index)
        currentIndex = index
        index = -1
        left = currentIndex * interval - buttonWidth / 2
    }

    $: if (labels) resetButton()

    function resetButton() {
        if (checkReset) {
            // console.warn("Resetting", type, "button")
            currentIndex = type == "min" ? min : max
            value = currentIndex
            updateLeft()
        }
        checkReset = true
    }

    function updateLeft() {
        // console.log(
        //     "update",
        //     type,
        //     "left with buttonWidth",
        //     buttonWidth,
        //     "currentIndex",
        //     currentIndex,
        //     "interval",
        //     interval
        // )
        left = currentIndex * interval - buttonWidth / 2
    }

    function box(element) {
        return element.getBoundingClientRect()
    }

    function boxWidth(button, defaultWidth) {
        let width = defaultWidth
        if (button) {
            // console.log("Getting actual size")
            width = box(button).width
            // if (width > defaultWidth) {
            //     width = defaultWidth
            // }
        }
        return width
    }

    function handleDragStart() {
        // Touch devices use clicks not drag
        if ($touch) return
        // Flag drag started
        dragging = true
        // Get the position relative to the viewport
        const xOffset = holder.parentNode.getBoundingClientRect().left
        // Get accurate width since button width may change as label changes
        buttonWidth = boxWidth(holder, buttonWidth)

        // console.log("minX", minX, "maxX", maxX)

        document.body.onmousemove = (moveEvent) => {
            // Get the new delta position within the slider div
            let x = moveEvent.clientX - xOffset
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
            left = x - buttonWidth / 2
            // Get new value correcting for the xOffset (see x above)
            value = (xOffset + left) / interval
            currentIndex = Math.round(value)
            if (currentIndex > labels.length - 1)
                currentIndex = labels.length - 1
            if (currentIndex < 0) currentIndex = 0
            // console.log("left, newValue, index => ", left, value, index)
        }

        const drop = function () {
            dragging = false
            document.body.onmousemove = null
            document.body.onmouseup = null
            document.body.onmouseleave = null
            // Get final index, chacking again for limits in case drag was
            // interrupted, e.g. by going off screen
            currentIndex = Math.floor(value)
            if (currentIndex > labels.length - 1)
                currentIndex = labels.length - 1
            if (currentIndex < 0) currentIndex = 0
            // Dispatch event to XRange component
            dispatch("rangeChanged", {
                type,
                index: currentIndex,
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
        currentIndex--
        dispatch("rangeChanged", {
            type,
            index: currentIndex,
            // value: labels[index],
        })
    }

    function handleTouchUp() {
        currentIndex++
        dispatch("rangeChanged", {
            type,
            index: currentIndex,
            // value: labels[index],
        })
    }
</script>

{#if $touch}
    <div class="touch">
        {#if currentIndex > min}
            <button type="button" on:click|stopPropagation={handleTouchDown}>
                &#9664;
            </button>
        {:else}
            &nbsp;
        {/if}

        {labels[currentIndex]}

        {#if currentIndex < max}
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
        {labels[currentIndex]}
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
