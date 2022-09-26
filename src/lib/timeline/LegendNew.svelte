<script>
    import { createEventDispatcher } from "svelte"

    import SymbolNew from "./SymbolNew.svelte"
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

    function handleClickCat(catName) {
        if (catName == options.category) {
            catName = ""
        }
        dispatch("optionsChanged", { name: "category", data: catName })
    }

    function handleClickSubCat(subCatName) {
        if (subCatName == options.subCategory) {
            subCatName = ""
        }
        dispatch("optionsChanged", { name: "sub-category", data: subCatName })
    }

    // function active(optionsFilter, filter, sel, index) {
    //     return optionsFilter == filter || (sel && sel.index == index)
    // }
</script>

<!------------------------------------------------------------------------------
@section HTML
-------------------------------------------------------------------------------->

{#if series.length > 1 && options.group == false}
    <!-- Display individual series options if not totalising -->
    <aside class="series">
        <span class="title">Series:</span>

        {#each series as entry, sIndex}
            {@const colour = entry.colour}
            {@const isActive = options.filter == entry.legend}
            {@const symbolIndex = options.symbols ? sIndex : 0}

            <span
                class="symbol series"
                class:active={isActive}
                on:click|stopPropagation={() => handleClickSeries(entry.legend)}
                title="Click to highlight this series"
            >
                <SymbolNew index={symbolIndex} {colour} wrapped={true} />

                {entry.legend}
            </span>
        {/each}
    </aside>
{/if}

{#if subCategories.length > 0}
    <aside>
        {#each categories as category, cIndex}
            {#if categories.length > 1 || options.group}
                {@const colour = category.colour}
                {@const isActive = options.filter == category.name}
                {@const symbolIndex = options.symbols ? cIndex : 0}
                <span
                    class="symbol category title"
                    class:active={isActive}
                    on:click|stopPropagation={() =>
                        handleClickCat(category.name)}
                >
                    <SymbolNew index={symbolIndex} {colour} wrapped={true} />

                    {Utils.sentenceCase(category.name)}:
                </span>
            {:else}
                <span class="title">{Utils.sentenceCase(category.name)}:</span>
            {/if}

            {#each subCategories as subCategory, scIndex}
                {#if subCategory.category == category.name}
                    {@const colour = subCategory.colour}
                    {@const isActive = options.filter == subCategory.name}
                    {@const symbolIndex = options.symbols ? scIndex : 0}
                    <span
                        class="symbol sub-category"
                        class:active={isActive}
                        title="Click to highlight this event category"
                        on:click|stopPropagation={() =>
                            handleClickSubCat(subCategory.name)}
                    >
                        <SymbolNew
                            index={symbolIndex}
                            {colour}
                            wrapped={true}
                        />
                        {Utils.sentenceCase(subCategory.name)}
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
        padding: 0.3rem 0.2rem;
        margin: 0 0.4rem;
        border-bottom: 4px solid transparent;
        cursor: pointer;
        transition: all ease-in 300ms;
        text-align: center;
    }

    svg {
        margin-right: 0.2rem;
    }

    .title {
        font-weight: bold;
        cursor: default;
    }

    .category {
        cursor: pointer;
    }

    .symbol:hover,
    .symbol.active {
        outline: solid 0.2rem var(--tl-colour-legend-highlight);
    }

    /* span:hover .box,
    span.active .box {
        outline: solid 0.2rem var(--tl-colour-legend-highlight);
    } */
</style>
