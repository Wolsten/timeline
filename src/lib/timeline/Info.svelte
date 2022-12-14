<script>
    import { createEventDispatcher } from "svelte"
    import { fly } from "svelte/transition"

    import { mobile } from "../stores.js"
    import Button from "../components/Inputs/Button.svelte"

    const dispatch = createEventDispatcher()
</script>

<div class="properties" class:mobile={$mobile} transition:fly={{ x: -200 }}>
    <div class="scroller">
        <h2>How to use timelines</h2>

        <p>There are two types, which may be combined on one chart.</p>

        <ol>
            <li>Data series shown as line graphs</li>
            <li>Event histories shown as waterfall diagrams</li>
        </ol>

        <p>
            In both cases the data can be assigned categories and
            sub-categories, which can be used to highlight, sort and filter.
            Options appear at the top and a legend at the bottom. If you click
            on an item in the legend then the associated information will be
            highlighted.
        </p>

        <p>
            You can adjust the timeline start and end dates using the sliders
            below the timeline.
        </p>

        <p>
            If you change any display options, click the <strong>Reset</strong> button.
        </p>

        <h3>Charts</h3>

        <p>
            Each series is colour-coded and optionally can have symbols
            displayed. If you place the cursor over a data point (easier to see
            with symbols turned on) then you will see a tooltip with the data
            shown. You should also a table appear below the chart with all
            points in the series. Like the chart , points in the table (which is
            scrollable) may be selected to highlight that point on the chart.
        </p>

        <p>
            Charts also provide the option to group data by category and
            non-overlapping sub-categories. For example, a chart with the
            category <q>animals</q>
            might be broken down by multiple <q>species</q>
            sub-categories and clicking on the <q>animals</q> category would then
            shown animals in all species.
        </p>

        <h3>Event Histories</h3>

        <p>
            Event histories display waterfall diagrams of events which may have
            start and end dates, or just a start date (for points in time).
            Events provide the option to sort by date (the default) and by
            category (and sub-category).
        </p>

        <p>
            It is also possible to filter the list of events and find a specific
            one, using the text search box.
        </p>

        <p>
            Clicking on an event brings up the full data for that event.
            Double-clicking an event, focusses the date range on the start and
            end dates for that event.
        </p>
    </div>

    <div class="padding-top">&nbsp;</div>
    <div class="padding-bottom">&nbsp;</div>
    <div class="button">
        <Button
            label="Close"
            on:clicked={() => {
                // console.log("Clicked")
                dispatch("optionsChanged", {
                    name: "info",
                    data: false,
                })
            }}
        />
    </div>
</div>

<style>
    .properties {
        position: fixed;
        bottom: 0;
        left: 0;
        background: white;
        width: 50vw;
        min-width: 200px;
        height: 100vh;
        border: 1px solid var(--tl-colour-box-shadow);
        box-shadow: 0.2rem 0.2rem 0.3rem var(--tl-colour-box-shadow);
        z-index: 2;
    }

    .properties.mobile {
        width: 100vw;
        min-height: 100vh;
        max-height: 100vh;
    }

    .scroller {
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        padding: 2rem;
        z-index: 3;
        overflow-y: scroll;
    }

    .scroller * {
        z-index: inherit;
    }

    .padding-top,
    .padding-bottom {
        position: absolute;
        width: 100%;
        height: 2rem;
        z-index: 4;
        background-color: var(--tl-colour-background);
    }

    .padding-top {
        left: 0rem;
        top: 0rem;
    }

    .padding-bottom {
        left: 0;
        bottom: 0;
    }

    .button {
        position: absolute;
        top: 1rem;
        right: 1rem;
        z-index: 5;
    }
</style>
