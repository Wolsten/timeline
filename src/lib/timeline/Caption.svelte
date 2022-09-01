<script>
    export let title
    export let nSeries
    export let categorised
    export let grouped
    export let filter

    function setComments(g, c) {
        let comments = ""
        if (g && c) {
            comments = "series grouped and coloured by category"
        } else if (c) {
            comments = "individual series, coloured by category"
        } else {
            comments = "individually coloured series"
        }
        if (filter) {
            comments = comments + ", highlighting " + filter
        }
        return comments
    }
</script>

<figCaption>
    <h3>
        {title}
        {#if nSeries > 1}
            <span class="subtitle"
                >({setComments(grouped, categorised, filter)})</span
            >
        {/if}
    </h3>
</figCaption>

<style>
    figCaption {
        width: 100%;
        margin-bottom: 1rem;
        font-weight: bold;
        position: relative;
        text-align: center;
    }

    h3 {
        padding: 0;
        margin: 0;
        color: var(--tl-colour-font-titles);
    }

    span.subtitle {
        display: block;
        padding: 0;
        font-size: 0.9rem;
        font-weight: normal;
        color: var(--tl-colour-font);
    }
</style>
