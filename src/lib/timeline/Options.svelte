<script>
    import { createEventDispatcher } from "svelte"

    import Button from "../components/Inputs/Button.svelte"
    import TextSearch from "../components/Inputs/TextSearch.svelte"
    import Toggle from "../components/Inputs/Toggle.svelte"

    // export let categoriesLength
    // export let subCategoriesLength
    export let xRange // Full dataset xRange (not potential options.xRange subset)
    export let seriesLength
    export let eventsLength
    export let options

    const dispatch = createEventDispatcher()

    let sort = false
    let search = ""
    let disabled = false

    // $: sort = options.sort == "category"

    $: disabled = !(
        xRange.start.year != options.xRange.start.year ||
        xRange.end.year != options.xRange.end.year ||
        options.filter != "" ||
        options.search != "" ||
        options.sort != "date" ||
        options.group
    )

    options.zoomIn = () => {
        handleZoomIn(true)
    }

    function handleZoomIn(focus) {
        if (focus) {
            // console.log('Clicked focus')
            // Only respond if selected is set
            if (options.selectedEvent) {
                options.focus(xRange)
                dispatch("optionsChanged", {
                    name: "xRange",
                    data: options.xRange,
                })
            }
        } else {
            dispatch("optionsChanged", {
                name: "reset",
            })
        }
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
        <Toggle
            name="category"
            label="Sort by"
            options={["date", "category"]}
            bind:value={sort}
            on:changed={() => {
                options.sort = sort ? "category" : "date"
                dispatch("optionsChanged", {
                    name: "sort",
                })
            }}
        />

        <TextSearch
            placeholder="Find event"
            bind:search
            on:search={() => {
                dispatch("optionsChanged", {
                    name: "search",
                    data: search,
                })
            }}
            on:clear={() => {
                search = ""
                dispatch("optionsChanged", {
                    name: "search",
                    data: search,
                })
            }}
        />
    {/if}

    <div class="buttons">
        <Button
            label="Reset"
            {disabled}
            on:clicked={() => {
                search = ""
                handleZoomIn(false)
            }}
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

    .buttons {
        display: flex;
        justify-content: flex-end;
        column-gap: 1rem;
        flex-grow: 2;
        padding: 0.5rem;
    }
</style>
