<script>
    export let title
    export let multiSeries
    export let categorised
    export let grouped

    let subTitle = ""

    $: if (multiSeries) {
        let comments = []
        if (grouped) {
            comments.push("grouped by category")
        } else {
            comments.push("all types")
        }
        if (categorised) {
            comments.push("coloured by category")
        } else {
            comments.push("coloured by series")
        }
        if (comments.length > 0) {
            subTitle = `(${comments.join(", ")})`
        }
    }
</script>

<figCaption>
    <h3>
        {title}

        {#if subTitle}
            <span class="subtitle">{subTitle}</span>
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
