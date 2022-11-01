<script>
    import { createEventDispatcher } from "svelte"

    import Symbol from "./Symbol.svelte"
    // import Utils from "../Utils.js"

    export let events // Filtered events
    export let series // Filtered series
    export let categories
    export let subCategories
    export let options

    $: usedEventCategories = categories.filter((c) =>
        events.find((e) => e.category == c.name)
    )

    $: usedEventSubCategories = subCategories.filter((c) =>
        events.find((e) => e.subCategory == c.name)
    )

    $: usedCategories = [...usedEventCategories, ...usedSeriesCategories]

    $: usedSeriesCategories = categories.filter((c) =>
        series.find((s) => s.category == c.name)
    )

    $: usedSeriesSubCategories = subCategories.filter((c) =>
        series.find((s) => s.subCategory == c.name)
    )

    $: usedSubCategories = [
        ...usedEventSubCategories,
        ...usedSeriesSubCategories,
    ]

    const dispatch = createEventDispatcher()

    function handleClickCategory(value) {
        dispatch("optionsChanged", {
            name: "filter",
            data: { taxonomy: "category", value },
        })
    }

    function handleClickSeries(value) {
        dispatch("optionsChanged", {
            name: "filter",
            data: { taxonomy: "off", value },
        })
    }

    function handleClickSubCat(value) {
        if (value == options.subCategory) {
            value = ""
        }
        dispatch("optionsChanged", {
            name: "filter",
            data: { taxonomy: "sub-category", value },
        })
    }
</script>

<!------------------------------------------------------------------------------
@section HTML
-------------------------------------------------------------------------------->

<!-- Series only -->
{#if options.group == "off" && series.length > 0}
    <aside class="series">
        <span class="title">Series:</span>

        {#each series as entry, sIndex}
            {@const symbolIndex = options.symbols ? sIndex : 0}

            <span
                class="symbol series multiple hoverable"
                class:active={options.filter == entry.legend}
                class:highlighted={options.filter == entry.subCategory}
                on:click|stopPropagation={() => handleClickSeries(entry.legend)}
                title="Click to highlight this series"
            >
                <Symbol
                    index={symbolIndex}
                    colour={entry.colour}
                    wrapped={true}
                />

                {entry.legend}
            </span>
        {/each}
    </aside>
{/if}

<!-- Series grouped by category or filter by series or event categories -->
{#if options.group === "category" || (usedSeriesCategories.length > 1 && usedSeriesCategories.length != series.length) || (usedEventCategories.length > 1 && usedEventCategories.length != events.length)}
    <aside>
        {#if usedCategories.length > 1}
            <span class="title">Categories:</span>
        {/if}

        {#each usedCategories as category, cIndex}
            {@const colour = category.colour}
            {@const hoverable =
                (series.length > 0 && options.group == "off") ||
                usedCategories.length > 1}
            {@const isActive =
                options.filter == category.name && usedCategories.length > 1}
            {@const symbolIndex = options.symbols
                ? options.group == "off"
                    ? 0
                    : cIndex
                : 0}

            <span
                class="symbol"
                class:active={isActive}
                class:hoverable
                title="Click to highlight this category"
                on:click|stopPropagation={() =>
                    handleClickCategory(category.name)}
            >
                <Symbol index={symbolIndex} {colour} wrapped={true} />
                {#if options.group == "category"}Total {/if}{category.name}
            </span>
        {/each}
    </aside>
{/if}

{#if options.group === "sub-category" || (usedSeriesSubCategories.length > 1 && usedSeriesSubCategories.length != series.length) || (usedEventSubCategories.length > 1 && usedEventSubCategories.length != events.length)}
    <aside>
        {#if usedSubCategories.length > 1}
            <span class="title">Sub-categories:</span>
        {/if}

        {#each usedSubCategories as subCategory, scIndex}
            {@const colour = subCategory.colour}
            {@const isActive =
                usedSubCategories.length > 1 &&
                options.filter == subCategory.name}
            {@const hoverable =
                (series.length > 0 && options.group == "off") ||
                usedSubCategories.length > 1}
            {@const symbolIndex = options.symbols
                ? options.group == "off"
                    ? 0
                    : scIndex
                : 0}
            <span
                class="symbol"
                class:active={isActive}
                class:hoverable
                title="Click to highlight this sub category"
                on:click|stopPropagation={() =>
                    handleClickSubCat(subCategory.name)}
            >
                <Symbol index={symbolIndex} {colour} wrapped={true} />
                {#if options.group == "sub-category"}
                    Total
                {/if}
                {subCategory.name}
            </span>
        {/each}
    </aside>
{/if}

<!------------------------------------------------------------------------------
@section STYLES
-------------------------------------------------------------------------------->
<style>
    aside {
        padding: 0.5rem;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        column-gap: 0;
        justify-content: center;
        width: 100%;
    }

    span {
        display: flex;
        align-items: center;
        column-gap: 0;
        padding: 0.1rem 0.2rem;
        margin: 0.2rem 0.4rem;
        /* border-bottom: 4px solid transparent; */

        transition: all ease-in 300ms;
        text-align: center;
    }

    .title {
        font-weight: bold;
        cursor: default;
    }

    .symbol.hoverable:hover {
        outline: solid 0.1rem var(--tl-colour-legend-highlight);
        cursor: pointer;
    }

    .symbol.active {
        outline: solid 0.2rem var(--tl-colour-legend-highlight);
    }

    .symbol.highlighted {
        outline: solid 0.1rem var(--tl-colour-legend-highlight);
    }
</style>
