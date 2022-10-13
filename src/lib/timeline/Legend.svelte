<script>
    import { createEventDispatcher } from "svelte"

    import Symbol from "./Symbol.svelte"
    import Utils from "../Utils.js"

    export let events
    export let series
    export let categories
    export let subCategories
    export let options

    // console.log(events)
    // console.log(categories)
    // console.log(subCategories)

    // Get list of event specific categories
    $: eventCategories = categories.filter((category) =>
        events.find((event) => event.category == category.name)
    )
    // console.log(eventCategories)

    // Get list of event specific sub categories
    $: eventSubCategories = subCategories.filter((subCategory) =>
        eventCategories.find(
            (category) => category.name == subCategory.category
        )
    )
    // console.log(eventSubCategories)

    // $: seriesCategories = categories.filter((category) =>{
    //     series.find( entry => {

    //     })
    // })

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
            data: { taxonomy: "single", value },
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

{#if eventCategories.length > 0}
    {#each eventCategories as c}
        <aside class="events">
            {#if eventCategories.length > 1}
                <span
                    class="title symbol"
                    class:active={options.filter == c.name &&
                        options.filterType == "category"}
                    on:click|stopPropagation={() => handleClickCategory(c.name)}
                    title="Click to highlight this category"
                >
                    <Symbol index={0} colour={c.colour} wrapped={true} />
                    {c.name}:
                </span>
            {/if}

            {#each eventSubCategories as sc}
                {#if sc.category == c.name}
                    <span
                        class="symbol events"
                        class:active={options.filter == sc.name}
                        class:highlighted={options.filter == sc.subCategory}
                        on:click|stopPropagation={() =>
                            handleClickSubCat(sc.name)}
                        title="Click to highlight this category"
                    >
                        <Symbol index={0} colour={sc.colour} wrapped={true} />

                        {sc.name}
                    </span>
                {/if}
            {/each}
        </aside>
    {/each}
{/if}

{#if series.length > 1 && options.group == "single"}
    <aside class="series">
        <span class="title">Series:</span>

        {#each series as entry, sIndex}
            {@const symbolIndex = options.symbols ? sIndex : 0}

            <span
                class="symbol series"
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

{#if options.group !== "sub-category" && categories.length > 0}
    {@const multiple = categories.length > 1}
    <aside>
        <span class="title">Categories:</span>

        {#each categories as category, cIndex}
            {@const colour = category.colour}
            {@const isActive = multiple && options.filter == category.name}
            {@const symbolIndex = options.symbols ? cIndex : 0}
            <span
                class="symbol"
                class:multiple
                class:active={isActive}
                title="Click to highlight this category"
                on:click|stopPropagation={() =>
                    multiple && handleClickCategory(category.name)}
            >
                <Symbol index={symbolIndex} {colour} wrapped={true} />
                {Utils.sentenceCase(category.name)}
            </span>
        {/each}
    </aside>
{/if}

{#if options.group !== "category" && subCategories.length > 0}
    {@const multiple = subCategories.length > 1}
    <aside>
        <span class="title">Sub-categories:</span>

        {#each subCategories as subCategory, scIndex}
            {@const colour = subCategory.colour}
            {@const isActive = multiple && options.filter == subCategory.name}
            {@const symbolIndex = options.symbols ? scIndex : 0}
            <span
                class="symbol"
                class:multiple
                class:active={isActive}
                title="Click to highlight this sub category"
                on:click|stopPropagation={() =>
                    handleClickSubCat(subCategory.name)}
            >
                <Symbol index={symbolIndex} {colour} wrapped={true} />
                {Utils.sentenceCase(subCategory.name)}
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

    span.multiple {
        cursor: pointer;
    }

    .title {
        font-weight: bold;
        cursor: default;
    }

    .symbol.multiple:hover {
        outline: solid 0.1rem var(--tl-colour-legend-highlight);
    }

    .symbol.multiple.active {
        outline: solid 0.2rem var(--tl-colour-legend-highlight);
    }

    .symbol.highlighted {
        outline: solid 0.1rem var(--tl-colour-legend-highlight);
    }
</style>
