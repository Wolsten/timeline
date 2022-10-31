<script>
    import { createEventDispatcher } from "svelte"

    import { mobile, touch } from "../../stores.js"

    const dispatch = createEventDispatcher()

    export let name = "name"
    export let label = ""
    export let options = ["Off", "On"]
    export let value = "Off"
    export let disabled = false

    // $: console.log(name, "disabled", disabled)
    // $: console.log(label, value)

    // Must have a unique name for each toggle as otherwise multiple
    // checkboxes in different instances of the component could
    // interfere
    const uniqueName = name + "-" + random_string()

    function random_string(length = 8) {
        const chars =
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        let result = ""
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return result
    }
</script>

<label for={uniqueName} class:mobile={$mobile}>
    <span class="label">{label}</span>

    <span class="holder" class:disabled class:touch={$touch}>
        {#each options as option}
            <span
                class="toggle"
                class:active={option == value}
                on:click={() => {
                    value = option
                    dispatch("changed")
                }}
            >
                {option}
            </span>
        {/each}
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

    .holder {
        display: flex;
    }

    .toggle {
        display: inline-block;
        margin: 0;
        padding: var(--tl-size-input-padding);
        line-height: normal;
        border: 1px solid var(--tl-colour-faint-lines);
        color: var(--tl-colour-font);
        cursor: pointer;
        text-transform: capitalize;
        transition: all ease-in-out 300ms;
    }

    .toggle:first-child {
        border-radius: var(--tl-size-border-radius) 0 0
            var(--tl-size-border-radius);
        border-right: none;
    }

    .toggle:last-child {
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

    .holder.disabled span.active {
        background-color: var(--tl-colour-faint-lines);
        opacity: var(--opacity-faint);
        cursor: default;
    }
</style>
