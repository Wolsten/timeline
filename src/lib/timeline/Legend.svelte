<script>
    import { createEventDispatcher } from "svelte"

    import Symbol from "./Symbol.svelte"
    import Utils from "../Utils.js"

    export let series
    export let subCategories
    export let options
    export let groupedSeriesLength

    const dispatch = createEventDispatcher()

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

{#if series.length > 1 && options.group == false}
    <!-- Display individual series options if not totalising -->
    <aside class="series">
        <span class="title">Series:</span>

        {#each series as entry, sIndex}
            {@const colour = entry.colour}
            {@const isActive = options.filter == entry.legend}
            {@const isHighlighted = options.filter == entry.subCategory}
            {@const symbolIndex = options.symbols ? sIndex : 0}

            <span
                class="symbol series"
                class:active={isActive}
                class:highlighted={isHighlighted}
                on:click|stopPropagation={() => handleClickSeries(entry.legend)}
                title="Click to highlight this series"
            >
                <Symbol index={symbolIndex} {colour} wrapped={true} />

                {entry.legend}
            </span>
        {/each}
    </aside>
{/if}

{#if groupedSeriesLength > 0}
    <aside>
        <span class="title">Categories:</span>

        {#each subCategories as subCategory, scIndex}
            <!-- {#if subCategory.category == category.name} -->
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
        cursor: pointer;
        transition: all ease-in 300ms;
        text-align: center;
    }

    .title {
        font-weight: bold;
        cursor: default;
    }

    .symbol:hover {
        outline: solid 0.1rem var(--tl-colour-legend-highlight);
    }

    .symbol.active {
        outline: solid 0.2rem var(--tl-colour-legend-highlight);
    }

    .symbol.highlighted {
        outline: solid 0.1rem var(--tl-colour-legend-highlight);
    }
</style>
