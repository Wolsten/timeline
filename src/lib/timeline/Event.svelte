<script>
    import { createEventDispatcher } from "svelte"

    import Utils from "../Utils"

    export let event
    export let label
    export let options
    export let margin
    export let height
    export let categories
    export let subCategories

    const dispatch = createEventDispatcher()

    let lastClickedMs = 0

    function rectColour(filter) {
        const subCat = subCategories.find(
            (item) => item.name === event.subCategory
        )
        // If filtering then choose colour according to whether
        // filtering by a subcategory or by a category
        if (filter !== "") {
            if (options?.filterType === "sub-category") {
                if (filter == event.subCategory) return subCat.colour
            } else if (options?.filterType === "category") {
                // debugger
                if (event.category === filter) {
                    const index = categories.findIndex((item) => filter == item)
                    return Utils.defaultColour(index)
                }
            }
            // De-emphasise others
            return Utils.COLOUR_INACTIVE
        }
        // Default is to colour by sub-category
        return subCat.colour
    }

    function handleDeferredClick() {
        if (options.selectedEvent) {
            dispatch("optionsChanged", {
                name: "selectedEvent",
                data: options.selectedEvent,
            })
        }
    }

    function handleClick() {
        let clickMs = Date.now()

        // console.log("Handling click")

        // console.log('event handling click to select',event)
        if (
            options.selectedEvent === false ||
            options.selectedEvent.index !== event.index
        ) {
            options.selectedEvent = { ...event }
            lastClickedMs = clickMs
            setTimeout(handleDeferredClick, 500)
        } else {
            // Check for double click in analysis mode
            // console.log(
            //     clickMs,
            //     lastClickedMs,
            //     clickMs - lastClickedMs,
            //     options.selectedEvent
            // )
            if (
                options.readonly === false &&
                lastClickedMs &&
                clickMs - lastClickedMs < 500
            ) {
                // console.log("Double clicked true")
                options.zoomIn()
            } else {
                options.selectedEvent = false
                dispatch("optionsChanged", {
                    name: "selectedEvent",
                    data: options.selectedEvent,
                })
            }

            lastClickedMs = 0
        }
    }
</script>

<!-- svelte-ignore a11y-mouse-events-have-key-events -->
{#if event}
    {@const top =
        margin.top +
        (options.sort == "x" ? event.xOrder : event.cOrder) * height}
    {@const selected =
        options.selectedEvent && options.selectedEvent.index == event.index}
    <g
        transform="translate({event.left},{top})"
        style="--event-rect-colour: {rectColour(options.filter)};"
        class:selected
        on:click|stopPropagation={handleClick}
    >
        <rect x={0} y={-height / 2} width={event.width} height={height * 0.9} />

        <text x={label.x} class={label.text} y={height / 7}>
            {event.name}
        </text>
    </g>
{/if}

<style>
    g {
        transition: transform ease-in-out 500ms;
    }

    g:hover rect {
        cursor: pointer;
        fill: var(--tl-colour-toggle-hover);
    }

    g:hover text {
        font-weight: bold;
        cursor: pointer;
        fill: var(--tl-colour-link);
    }

    g:hover text.middle {
        fill: white;
    }

    /* Using a variable set in the tag style allows the text fill colour to override
	   otherwise text would be same colour as the rectangle */
    rect {
        fill: var(--event-rect-colour);
    }

    text {
        text-anchor: start;
        font-size: 0.8rem;
        fill: var(--tl-colour-text);
    }

    text.middle {
        fill: white;
        text-anchor: middle;
    }

    text.left {
        text-anchor: end;
    }
</style>
