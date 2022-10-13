<script>
    export let title
    export let multipleSeries
    export let options

    function setComments(group, filter) {
        // console.log("setComments: " "group", group)
        let comments = ""
        if (group == "category") {
            comments = "related series grouped by category"
        } else if (group == "sub-category") {
            comments = "related series grouped by sub-category"
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
        <!-- {#if multipleSeries} -->
        <span class="subtitle"
            >({setComments(options.group, options.filter)})</span
        >
        <!-- {/if} -->
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
