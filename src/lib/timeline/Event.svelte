<script>
    import { createEventDispatcher } from "svelte"

    import Utils from "../Utils"

    export let event
    export let options
    export let margin
    export let height
    export let viewportWidth

    const dispatch = createEventDispatcher()

    let selected = false
    let lastClickedMs = 0
    let props

    // If event changes then get the new properties
    $: if (event) props = getProps()

    // If sorting selecting just need top coordinate
    // $: props.top = getTop(options.sort)
    // If filtering get the new colours
    //$: props.colour = getColour(options.filter)

    // Catch event being selected
    $: selected =
        options.selectedEvent && options.selectedEvent.index == event.index

    function getTop(sort) {
        const top =
            margin.top + (sort == "date" ? event.index : event.scIndex) * height
        // console.log("Getting new top for event", event.name, top)
        return top
    }

    function getProps() {
        // console.log("Getting props for", event.name)
        if (!event || options.xRange.scale === 0)
            return { top: 0, left: 0, right: 0, width: 0 }
        const colour = getColour(options.filter)
        // Top
        const top = getTop(options.sort)
        // Left
        let left = 0
        if (event.start === undefined) {
            left = Math.round(
                options.xRange.start.decimal * options.xRange.scale
            )
        } else {
            left = Math.round(
                (event.start.decimal - options.xRange.start.decimal) *
                    options.xRange.scale
            )
        }
        // Right
        let right = 0
        if (event.end === undefined) {
            right = Math.round(options.xRange.range * options.xRange.scale)
        } else {
            right = Math.round(
                (event.end.decimal - options.xRange.start.decimal) *
                    options.xRange.scale
            )
        }
        // Width
        let width = right - left
        if (width < 5) {
            width = 5
        }
        // Correct for canvas padding
        left += Utils.CANVAS_PADDING_LEFT
        right = left + width
        // Label
        let x = width / 2
        let text = "middle"
        if (right > 0 && right < viewportWidth * 0.7) {
            text = "right"
            x = width + 5
        } else if (left > viewportWidth * 0.3 && left < viewportWidth) {
            text = "left"
            x = -5
        } else if (left < 0 || right > viewportWidth) {
            text = "middle"
            x = viewportWidth / 2 - left
        }
        // console.log(
        //     "scaled event",
        //     event.name,
        //     event,
        //     top,
        //     left,
        //     right,
        //     width,
        //     x,
        //     text
        // )
        return { colour, top, left, right, width, x, text }
    }

    function getColour(filter) {
        if (filter !== "") {
            if (options?.filterType === "category") {
                if (event.category == options.filter) {
                    return event.categoryColour
                }
                return "var(--tl-not-filtered)"
            } else if (options?.filterType === "sub-category") {
                if (event.subCategory == options.filter) {
                    // console.log("returning sub-category colour")
                    return event.subCategoryColour
                }
                return "var(--tl-not-filtered)"
            }
        }
        return event.subCategoryColour
    }

    function handleDeferredClick() {
        if (options.selectedEvent) {
            dispatch("optionsChanged", {
                name: "selectedEvent",
                data: options.selectedEvent,
            })
        }
    }

    function handleClick(evt) {
        // console.log("Event target", evt.target.parentNode.offsetTop)
        let clickMs = Date.now()
        // console.log('event handling click to select',event)
        if (
            options.selectedEvent === undefined ||
            options.selectedEvent.index !== event.index
        ) {
            options.selectedEvent = event.copy()
            // console.log("selected event", options.selectedEvent)
            lastClickedMs = clickMs
            setTimeout(handleDeferredClick, 500)
        } else {
            if (
                options.readonly === false &&
                lastClickedMs &&
                clickMs - lastClickedMs < 500
            ) {
                // console.log("Double clicked true")
                // options.zoomIn()
                dispatch("optionsChanged", {
                    name: "focus",
                    data: options.selectedEvent,
                })
            } else {
                options.selectedEvent = undefined
                dispatch("optionsChanged", {
                    name: "selectedEvent",
                    data: options.selectedEvent,
                })
            }
            lastClickedMs = 0
        }
    }
</script>

<!------------------------------------------------------------------------------
@section HTML
-------------------------------------------------------------------------------->

<!-- svelte-ignore a11y-mouse-events-have-key-events -->
{#if event && props?.top}
    <g
        class="event-group"
        transform="translate({props.left},{props.top})"
        style="--event-rect-colour: {props.colour};"
        class:selected
        on:click|stopPropagation={handleClick}
    >
        <rect x={0} y={-height / 2} width={props.width} height={height * 0.9} />

        <text x={props.x} class={props.text} y={height / 6}>
            {event.name}
        </text>
    </g>
{/if}

<!------------------------------------------------------------------------------
@section Styles
-------------------------------------------------------------------------------->
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
        /* font-size: 0.8rem; */
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
