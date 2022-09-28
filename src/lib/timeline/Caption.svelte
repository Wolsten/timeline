<script>
    export let title
    export let multipleSeries
    export let options

    function setComments(group, filter, type) {
        let comments = ""
        if (group) {
            if (type == "category") {
                comments = "series grouped and coloured by category"
            } else if (type == "sub-category") {
                comments = "series grouped and coloured by sub-category"
            }
        } else {
            comments = "individual series"
        }
        if (filter != "") {
            comments = comments + ", highlighting " + filter
        }
        return comments
    }
</script>

<figCaption>
    <h3>
        {title}
        {#if multipleSeries}
            <span class="subtitle"
                >({setComments(
                    options.group,
                    options.filter,
                    options.filterType
                )})</span
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
        font-size: smaller;
        font-weight: normal;
        color: var(--tl-colour-font);
    }
</style>
