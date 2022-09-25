<script>
    import { createEventDispatcher } from "svelte"

    import Select from "../components/Inputs/Select.svelte"
    import Button from "../components/Inputs/Button.svelte"
    import TextSearch from "../components/Inputs/TextSearch.svelte"
    import Toggle from "../components/Inputs/Toggle.svelte"
    import Utils from "../Utils.js"

    export let categoriesLength
    export let subCategoriesLength
    export let xRange // Full dataset xRange (not potential options.xRange subset)
    export let seriesLength
    export let eventsLength
    export let options

    // console.log('seriesLength',seriesLength)
    // console.log("xRange", xRange)

    const dispatch = createEventDispatcher()

    const initialOptions = { ...options }

    let reset = false
    $: reset =
        xRange.start.year != options.xRange.start.year ||
        xRange.end.year != options.xRange.end.year ||
        options.filter != "" ||
        options.search != "" ||
        options.sort != "x"

    options.zoomIn = () => {
        handleZoomIn(true)
    }

    function handleZoomIn(focus) {
        // console.log("Clicked event zoom in - selected=", options.selectedEvent)
        if (focus) {
            // console.log('Clicked focus')
            // Only respond if selected is set
            if (options.selectedEvent) {
                if (options.selectedEvent.start === undefined) {
                    options.xRange.start = xRange.start
                } else {
                    options.xRange.start = options.selectedEvent.start
                }
                if (options.selectedEvent.end === undefined) {
                    options.xRange.end = xRange.end
                } else if (
                    options.selectedEvent.start?.decimal ==
                    options.selectedEvent.end.decimal
                ) {
                    // Start end end dates match so calculate a pseudo end date
                    let pseudoEnd =
                        options.xRange.start.year +
                        xRange.range / Utils.MIN_BOX_WIDTH
                    if (pseudoEnd > xRange.end.year) {
                        pseudoEnd = xRange.end.year
                    }
                    options.xRange.end = Utils.setDate(pseudoEnd)
                } else {
                    options.xRange.end = options.selectedEvent.end
                }
                options.xRange.range =
                    options.xRange.end.year - options.xRange.start.year
                // console.log("options.xRange", options.xRange)
                dispatch("optionsChanged", {
                    name: "xRange",
                    data: options.xRange,
                })
            }
        } else {
            dispatch("optionsChanged", {
                name: "reset",
                data: {
                    xRange: { ...xRange },
                    symbols: initialOptions.symbols,
                    categorise: initialOptions.categorise,
                    totalise: initialOptions.totalise,
                },
            })
        }
        // console.error('xRange', dateRange)
    }
</script>

<div class="form">
    {#if options.readonly === false}
        {#if seriesLength > 0}
            <Toggle
                name="symbols"
                label="Symbols"
                bind:value={options.symbols}
                on:changed={() =>
                    dispatch("optionsChanged", {
                        name: "symbols",
                        data: options.symbols,
                    })}
            />
        {/if}

        {#if seriesLength > 1}
            <!-- <Toggle
                name="categorise"
                label="Colour by"
                bind:value={options.categorise}
                options={["Series", "Category"]}
                disabled={options.totalise}
                on:changed={() =>
                    dispatch("optionsChanged", {
                        name: "categorise",
                        data: options.categorise,
                    })}
            /> -->

            <Toggle
                name="group"
                label="Group"
                bind:value={options.group}
                on:changed={() => {
                    dispatch("optionsChanged", {
                        name: "group",
                        data: options.group,
                    })
                }}
            />
        {/if}
    {/if}

    {#if eventsLength > 0}
        <Select
            name="category"
            bind:value={options.sort}
            options={[
                { value: "x", label: `Sort by date` },
                { value: "category", label: "Sort by category" },
            ]}
            on:changed={() =>
                dispatch("optionsChanged", {
                    name: "sort",
                    data: options.sort,
                })}
        />

        <TextSearch
            placeholder="Find event"
            bind:search={options.search}
            on:search={() => {
                dispatch("optionsChanged", {
                    name: "search",
                    data: options.search,
                })
            }}
            on:clear={() => {
                options.selectedEvent = false
                dispatch("optionsChanged", {
                    name: "search",
                    data: options.search,
                })
                dispatch("optionsChanged", {
                    name: "selectedEvent",
                    data: options.selectedEvent,
                })
            }}
        />
    {/if}

    <div class="buttons">
        <Button
            label="Reset"
            disabled={!reset}
            on:clicked={() => handleZoomIn(false)}
        />
    </div>
</div>

<style>
    .form {
        width: 100%;
        display: flex;
        justify-content: space-around;
        flex-wrap: wrap;
        align-items: center;
        margin-bottom: 0.5rem;
        gap: 0.5rem;
    }

    /* .form :global(> *) {
        font-size: 0.8rem;
    } */

    .buttons {
        display: flex;
        justify-content: flex-end;
        column-gap: 1rem;
        flex-grow: 2;
        padding: 0.5rem;
    }
</style>
