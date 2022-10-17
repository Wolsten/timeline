<script>
    import { createEventDispatcher } from "svelte"

    const dispatch = createEventDispatcher()

    export let label = ""
    export let disabled = false
    export let style = ""
</script>

<button
    type="button"
    {disabled}
    {style}
    on:click|stopPropagation={() => dispatch("clicked")}
>
    {label}
</button>

<style>
    button {
        background: var(--tl-colour-background);
        border: 1px solid var(--tl-colour-input-border);
        border-radius: var(--tl-size-border-radius);
        padding: var(--tl-size-input-padding);
        color: var(--tl-colour-font);
        margin: 0;
        cursor: default;
    }

    button:disabled {
        opacity: var(--tl-opacity-faint);
    }

    button:not(:disabled):hover {
        background: var(--tl-colour-toggle-hover);
        color: white;
        cursor: pointer;
    }
</style>
