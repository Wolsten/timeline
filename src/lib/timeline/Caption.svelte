<script>
    export let title
    export let options

    function setComments(group, filter) {
        let comments = ""
        // Show highlighting for events and series
        if (filter != "") {
            comments = "highlighting " + filter
            return "(" + comments + ")"
        }
        return ""
    }
</script>

<figCaption>
    <h3>
        {title}
        <span class="subtitle">
            {setComments(options.group, options.filter)}
        </span>
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
        font-size: smaller;
        font-weight: normal;
        color: var(--tl-colour-font);
    }
</style>
