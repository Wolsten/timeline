<script>
    import { createEventDispatcher } from "svelte"
    import { fly } from "svelte/transition"

    import { mobile } from "../stores.js"
    import Button from "../components/Inputs/Button.svelte"

    export let selectedEvent

    const dispatch = createEventDispatcher()

    function handleClick() {
        // console.log('Clicking props')
        selectedEvent = undefined
        dispatch("optionsChanged", {
            name: "selectedEvent",
            data: selectedEvent,
        })
    }
</script>

<!------------------------------------------------------------------------------
@section HTML
-------------------------------------------------------------------------------->

{#if selectedEvent}
    <div class="properties" class:mobile={$mobile} transition:fly={{ x: -200 }}>
        <div class="scroller">
            {#if selectedEvent.index != -1}
                <h3>
                    {selectedEvent.name}
                    <!-- <span>{Utils.eventDates(selectedEvent)}</span> -->
                    <span>{selectedEvent.eventDates()}</span>
                </h3>

                <div class="summary">{@html selectedEvent.summary}</div>

                {#if selectedEvent.citations}
                    <h3>Find out more</h3>
                    <div>{@html selectedEvent.citations}</div>
                {/if}
            {/if}
            <div class="padding-top">&nbsp;</div>
            <div class="padding-bottom">&nbsp;</div>
            <div class="button">
                <Button label="Close" on:clicked={handleClick} />
            </div>
        </div>
    </div>
{/if}

<!------------------------------------------------------------------------------
@section STYLES
-------------------------------------------------------------------------------->
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

    h3 span {
        font-size: smaller;
    }

    h3 {
        /* font-size: 1.2rem; */
        font-weight: normal;
    }

    .button {
        position: absolute;
        top: 1rem;
        right: 1rem;
        z-index: 5;
    }
</style>
