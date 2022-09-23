<script>
    import { createEventDispatcher } from "svelte"

    import Select from "../components/Inputs/Select.svelte"
    import Button from "../components/Inputs/Button.svelte"
    import TextSearch from "../components/Inputs/TextSearch.svelte"
    import Toggle from "../components/Inputs/Toggle.svelte"
    import Utils from "../Utils.js"

    export let categoriesLength
    export let subCategoriesLength
    // export let xAxis
    export let xRange // Original dataset xRange
    export let seriesLength
    export let eventsLength
    export let options

    // console.log('seriesLength',seriesLength)
    console.log("xRange", xRange)

    const dispatch = createEventDispatcher()

    const initialOptions = { ...options }

    options.zoomIn = () => {
        // console.log("Handling zoom in")
        handleZoomIn(true)
    }
    // $: console.error(options.xRange)

    function OLDhandleZoomIn(focus) {
        // console.log("Clicked event zoom in - selected=", options.selectedEvent)

        if (focus) {
            // console.log('Clicked focus')

            if (initialXRange === undefined) {
                initialXRange = { ...options.xRange }
            }

            // Only respond if selected is set
            if (options.selectedEvent) {
                options.xRange.start = options.selectedEvent.start.decimal

                if (options.selectedEvent?.end?.decimal !== undefined) {
                    options.xRange.end = options.selectedEvent.end.decimal
                } else {
                    if (options.selectedEvent?.end === "-") {
                        options.xRange.end = xAxis.majorLast
                    } else {
                        // Calculate a sensible range if no end date
                        let pseudoEnd =
                            options.xRange.start + xAxis.majorRange / 20
                        if (pseudoEnd > xAxis.majorLast) {
                            pseudoEnd = xAxis.majorLast
                        }
                        // options.xRange.end = parseInt(pseudoEnd);
                        options.xRange.end = pseudoEnd
                    }
                }

                options.xRange.range = options.xRange.end - options.xRange.start

                console.log("options.xRange", options.xRange)

                dispatch("optionsChanged", {
                    name: "xRange",
                    data: options.xRange,
                })
            }
        } else {
            options.selectedEvent = false
            options.search = ""
            options.filter = ""
            options.xRange = { ...initialXRange }
            options.symbols = initialSymbols
            options.categorise = initialCategorise
            options.totalise = initialTotalise

            dispatch("optionsChanged", {
                name: "selectedEvent",
                data: options.selectedEvent,
            })
            dispatch("optionsChanged", { name: "xRange", data: options.xRange })
        }

        // console.error('xRange', dateRange)
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

                console.log("options.xRange", options.xRange)

                dispatch("optionsChanged", {
                    name: "xRange",
                    data: options.xRange,
                })
            }
        } else {
            options.selectedEvent = false
            options.search = ""
            options.filter = ""
            options.xRange = { ...xRange }
            options.symbols = initialOptions.symbols
            options.categorise = initialOptions.categorise
            options.totalise = initialOptions.totalise

            dispatch("optionsChanged", {
                name: "selectedEvent",
                data: options.selectedEvent,
            })
            dispatch("optionsChanged", { name: "xRange", data: options.xRange })
        }

        // console.error('xRange', dateRange)
    }
</script>

<h1>TESTING</h1>

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

            <!-- @todo
                The scaling needs updating to handle negative values 
                <Toggle name="logScale" label="Scale" bind:value={options.logScale}
                    options={['Linear','Log']}
                    on:changed={dispatch('optionsChanged', {name:'logScale', data:options.logScale})} /> -->
        {/if}

        {#if seriesLength > 1 || categoriesLength > 1 || subCategoriesLength > 1}
            <Toggle
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
            />

            <Toggle
                name="totalise"
                label="Grouping"
                bind:value={options.totalise}
                on:changed={() => {
                    dispatch("optionsChanged", {
                        name: "totalise",
                        data: options.totalise,
                    })
                    if (options.totalise) {
                        options.categorise = true
                        dispatch("optionsChanged", {
                            name: "categorise",
                            data: options.categorise,
                        })
                    }
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
            disabled={xRange.start.year == options.xRange.start.year &&
                xRange.end.year == options.xRange.end.year &&
                options.filter == "" &&
                options.search == ""}
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
