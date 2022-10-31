<script>
    export let title
    export let options
    export let filteredSeries

    function setComments(group, filter) {
        let comments = ""
        // For series only
        if (filteredSeries.length > 0) {
            if (group == "category") {
                comments = "related series grouped by category"
            } else if (group == "sub-category") {
                comments = "related series grouped by sub-category"
            } else {
                comments = "individual series"
            }
        }
        // Show highlighting for events and series
        if (filter != "") {
            if (comments) comments += ", "
            comments += "highlighting " + filter
        }
        return comments ? "(" + comments + ")" : ""
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
