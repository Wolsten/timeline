<script>
    import { createEventDispatcher } from "svelte"

    import Symbol from "./Symbol.svelte"
    import Utils from "../Utils"

    export let series
    export let categories
    export let subCategories
    export let options
    // export let filteredEvents

    // const eventsSubCats = subCategories.filter((item) => item.type === "event")
    // const seriesSubCats = subCategories.filter((item) => item.type === "series")

    const dispatch = createEventDispatcher()

    function handleClickSeries(filter) {
        dispatch("optionsChanged", { name: "filter", data: filter })
    }

    function handleClickSubCat(subCatName) {
        if (subCatName == options.subCategory) {
            subCatName = ""
        }
        dispatch("optionsChanged", { name: "sub-category", data: subCatName })
    }

    function handleClickCat(catName) {
        if (catName == options.category) {
            catName = ""
        }
        dispatch("optionsChanged", { name: "category", data: catName })
    }

    function active(optionsFilter, filter, sel, index) {
        return optionsFilter == filter || (sel && sel.index == index)
    }
</script>

<!------------------------------------------------------------------------------
@section HTML
-------------------------------------------------------------------------------->

{#if series.length > 1}
    <aside class="series">
        <span class="title"
            >{options.totalise ? "Series categories" : "Series"}:</span
        >

        {#each series as entry, index}
            {@const colour = entry.colour}

            <span
                class="series"
                class:active={active(
                    options.search,
                    entry.name,
                    options.selectedPoint,
                    index
                )}
                on:click|stopPropagation={() => handleClickSeries(entry.legend)}
                title="Click to highlight this series"
            >
                {#if options.symbols}
                    <span class="symbol">
                        <svg width="8" height="8">
                            <g transform="translate(4,4)">
                                <Symbol
                                    i={0}
                                    {index}
                                    defaultColour={colour}
                                    symbolIndex={entry.symbolIndex}
                                    symbols={options.symbols}
                                    selectedPoint={false}
                                />
                            </g>
                        </svg>
                    </span>
                {/if}

                <div class="box" style="background-color:{colour};">&nbsp;</div>

                {entry.legend}
            </span>
        {/each}
    </aside>
{/if}

{#if subCategories.length > 0}
    <aside>
        {#each categories as cat, catIndex}
            <span
                class="category title"
                class:active={options.filter == cat}
                on:click|stopPropagation={() => handleClickCat(cat)}
            >
                <div
                    class="box"
                    style="background-color:{Utils.defaultColour(catIndex)};"
                >
                    &nbsp;
                </div>
                {cat}:
            </span>

            {#each subCategories as subCat, subCatIndex}
                {#if subCat.category == cat}
                    <span
                        class="sub-category"
                        class:active={options.subCategory == subCat.name}
                        title="Click to highlight this event category"
                        on:click|stopPropagation={() =>
                            handleClickSubCat(subCat.name)}
                    >
                        <div class="box" style:background-color={subCat.colour}>
                            &nbsp;
                        </div>
                        {subCat.name}
                    </span>
                {/if}
            {/each}
        {/each}
    </aside>
{/if}

<!------------------------------------------------------------------------------
@section STYLES
-------------------------------------------------------------------------------->
<style>
    aside {
        margin-top: 1rem;
        padding: 0.5rem;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        column-gap: 0;
        justify-content: center;
        width: 100%;
        font-size: 0.8rem;
    }

    .box {
        display: inline-block;
        width: 1rem;
        height: 1rem;
        margin-right: 0.3rem;
        outline: none;
    }

    span {
        display: flex;
        align-items: center;
        column-gap: 0;
        padding: 0.5rem 0 0.2rem 0;
        margin: 0 0.4rem;
        border-bottom: 4px solid transparent;
        cursor: pointer;
        transition: all ease-in 300ms;
        text-align: center;
    }

    .symbol {
        margin-right: 0.2rem;
    }

    .title {
        font-weight: bold;
        cursor: default;
    }

    .category {
        cursor: pointer;
    }

    span:hover .box,
    span.active .box {
        outline: solid 0.2rem var(--tl-colour-legend-highlight);
    }
</style>
