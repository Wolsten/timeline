<script>
    export let title
    export let series
    export let categorised
    export let grouped

    function setComments(g, c) {
        let comments = ""
        if (g && c) {
            comments = "series grouped and coloured by category"
        } else if (c) {
            comments = "individual series, coloured by category"
        } else {
            comments = "individually coloured series"
        }
        return comments
    }
</script>

<figCaption>
    <h3>
        {title}
        {#if series}
            <span class="subtitle">{setComments(grouped, categorised)}</span>
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
    }

    span.subtitle {
        display: block;
        padding: 0;
        font-size: 1rem;
        font-weight: normal;
    }
</style>
