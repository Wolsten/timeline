<script>
    import { createEventDispatcher } from "svelte"

    import Button from "../components/Inputs/Button.svelte"
    import TextSearch from "../components/Inputs/TextSearch.svelte"
    import Toggle from "../components/Inputs/Toggle.svelte"
    import Choice from "../components/Inputs/Choice.svelte"

    export let xRange // Full dataset xRange (not potential options.xRange subset)
    export let series // Original series
    export let events // Filtered events
    export let options

    const dispatch = createEventDispatcher()

    let search = ""
    let disabled = false
    let optionsEvent = "optionsChanged"

    $: gOptions = groupOptions(series)

    $: eventSort = eventGroups(events)

    $: sort = options.sort == "category"

    $: disabled = !(
        xRange.start.year != options.xRange.start.year ||
        xRange.end.year != options.xRange.end.year ||
        options.filter != "" ||
        options.search != "" ||
        options.sort != "date" ||
        options.group ||
        options.totals
    )

    function eventGroups(e) {
        let cGroups = []
        let scGroups = []
        e.forEach((evt) => {
            if (cGroups.includes(evt.category) == false)
                cGroups.push(evt.category)
            if (scGroups.includes(evt.subCategory) == false)
                scGroups.push(evt.subCategory)
        })
        return cGroups.length > 1 || scGroups.length > 1
    }

    function groupOptions(s) {
        if (s.length <= 1) return []
        // Default option
        let g = ["off"]
        // Do we have at least 1 category group and sub-category in the original series
        if (series.find((s) => s.type == "category")) g.push("category")
        if (series.find((s) => s.type == "sub-category")) g.push("sub-category")
        return g
    }
</script>

<div class="form">
    {#if options.readonly === false}
        {#if series.length > 0}
            <Toggle
                name="symbols"
                label="Symbols"
                bind:value={options.symbols}
                on:changed={() => {
                    // console.log("Toggled symbols")
                    dispatch("optionsChanged", {
                        name: "symbols",
                        data: options.symbols,
                    })
                }}
            />
        {/if}

        {#if gOptions.length > 1}
            <Choice
                name="group"
                label="Group by"
                options={gOptions}
                bind:value={options.group}
                on:changed={() => {
                    // console.log("Toggled groupBy", options.group)
                    dispatch("optionsChanged", {
                        name: "group",
                        data: options.group,
                    })
                }}
            />
        {/if}
    {/if}

    {#if events.length > 0}
        {#if eventSort}
            <Toggle
                name="category"
                label="Sort by"
                options={["date", "category"]}
                value={sort}
                on:changed={() => {
                    dispatch(optionsEvent, {
                        name: "sort",
                        data: sort ? "date" : "category",
                    })
                }}
            />
        {/if}

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
                sort = false
                dispatch("optionsChanged", {
                    name: "reset",
                })
            }}
        />
        <Button
            label="i"
            style="font-size:1.2rem;font-family:script;color:var(--tl-colour-info);"
            on:clicked={() => {
                dispatch("optionsChanged", {
                    name: "info",
                    data: true,
                })
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
