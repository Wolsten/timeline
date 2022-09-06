<script>
    import { createEventDispatcher } from "svelte"

    import { mobile, touch } from "../../stores.js"

    const dispatch = createEventDispatcher()

    export let name = "name"
    export let label = ""
    export let options = ["Off", "On"]
    export let value = false
    export let disabled = false
</script>

<!-- <p>Value = {value}</p> -->

<label for={name} class:mobile={$mobile}>
    <span class="label">{label}</span>

    <input
        type="checkbox"
        {name}
        id={name}
        bind:checked={value}
        {disabled}
        on:change={() => dispatch("changed")}
    />

    <span class="holder" class:disabled class:touch={$touch}>
        <span class="toggle off" class:active={value == false}>
            {options[0]}
        </span>

        <span class="toggle on" class:active={value}>
            {options[1]}
        </span>
    </span>
</label>

<style>
    label {
        display: flex;
        align-items: center;
        gap: 0.3rem;
    }

    label.mobile {
        width: 100%;
    }

    label.mobile .label {
        flex-basis: 30%;
    }

    label.mobile .holder {
        flex-basis: 70%;
    }

    input {
        display: none;
    }

    .holder {
        display: flex;
        /* margin-left: 0.3rem; */
    }

    .toggle {
        display: inline-block;
        margin: 0;
        padding: var(--tl-size-input-padding);
        border: 1px solid var(--tl-colour-faint-lines);
        color: var(--tl-colour-font);
        cursor: pointer;
        /* text-transform: uppercase; */
        /* font-size: 0.7rem; */
        transition: all ease-in-out 300ms;
    }

    .off {
        border-radius: var(--tl-size-border-radius) 0 0
            var(--tl-size-border-radius);
        border-right: none;
    }

    .on {
        border-radius: 0 var(--tl-size-border-radius)
            var(--tl-size-border-radius) 0;
        border-left: none;
    }

    .active {
        background: var(--tl-colour-toggle);
        color: white;
    }

    .holder:not(.disabled) span:not(.active):hover {
        background: var(--tl-colour-toggle-hover);
        color: var(--tl-colour-toggle-hover-font);
    }

    .holder.disabled span {
        opacity: var(--opacity-faint);
        cursor: default;
    }
</style>
