<script>
    import { createEventDispatcher } from "svelte"

    import { mobile } from "../../stores.js"

    const dispatch = createEventDispatcher()

    export let placeholder = ""
    export let search = ""
</script>

<div class="holder" class:mobile={$mobile}>
    <input
        type="text"
        bind:value={search}
        {placeholder}
        on:keyup={() => dispatch("search")}
    />

    <div
        class="reset"
        disabled={search == ""}
        on:click={() => {
            search = ""
            dispatch("clear")
        }}
    >
        &#10799;
    </div>
</div>

<style>
    div.holder {
        position: relative;
    }

    div.holder.mobile {
        flex-basis: 100;
        flex-grow: 1;
    }

    input {
        padding: var(--tl-size-input-padding);
        border: 1px solid var(--tl-colour-input-border);
        border-radius: var(--tl-size-border-radius);
        /* font-size: 1rem; */
        width: 100%;
    }

    div.reset {
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;

        width: 1.2rem;
        height: 1.2rem;
        color: var(--tl-colour-font-faint);

        text-align: center;
        margin: 0;
        top: 0.3rem;
        right: 0.5rem;
        padding-bottom: 0.4rem;
        font-size: 2rem;
    }

    div.reset:not([disabled="true"]) {
        color: var(--tl-colour-font);
    }

    div.reset:not([disabled="true"]):hover {
        cursor: pointer;
        color: var(--tl-colour-search-reset-hover);
    }
</style>
