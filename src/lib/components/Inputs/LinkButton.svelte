<script>
    export let label
    export let slug
    export let external = true
</script>

<!-- <a rel="external" href="/explore/{slug}">{label}</a> -->
{#if external}
    <a rel="external" href={slug}>{label}</a>
{:else}
    <a href={slug}>{label}</a>
{/if}

<style>
    a,
    a:hover,
    a:active,
    a:visited {
        display: inline-block;
        color: var(--tl-colour-font);
        text-decoration: none;
        outline: none;
    }

    a {
        border: 1px solid var(--tl-colour-input-border);
        background: var(--tl-colour-background);
        border-radius: var(--tl-size-border-radius);
        padding: var(--tl-size-input-padding);
    }

    a:hover {
        background-color: var(--tl-colour-input-border);
        color: white;
    }
</style>
