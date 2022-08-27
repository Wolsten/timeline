<script>
    import { onMount } from "svelte"
    import Timeline from "./lib/timeline/Timeline.svelte"
    import { windowWidth, mobile, desktop } from "./lib/stores.js"
    import Utils from "./lib/Utils"

    const MAX_ATTEMPTS = 5

    let attempts = 0
    let timelines = []
    let ready = false
    let data = []
    let settings = []

    function handleResize() {
        $windowWidth = window.innerWidth
        $desktop = $windowWidth >= Utils.NAV_BREAK
        $mobile = !$desktop
    }

    function reparentTimelines(timelines) {
        const inserted = document.querySelectorAll("#placeholder .timeline")
        console.log("checking if all inserted")
        if (inserted.length === timelines.length) {
            // move them
            console.log("all inserted")
            inserted.forEach((insert, index) => {
                timelines[index].appendChild(insert)
            })
            attempts = 0
            return
        }
        if (attempts < MAX_ATTEMPTS) {
            attempts++
            setTimeout(() => {
                reparentTimelines(timelines)
            }, 500)
        }
    }

    onMount(() => {
        // find all timelines in the page
        timelines = document.querySelectorAll("time-line")
        console.log(timelines)
        // Process each one
        timelines.forEach((timeline) => {
            // Get custom data
            const slug = timeline.getAttribute("data-slug")
            const dataSettings =
                timeline.getAttribute("data-settings") !== null
                    ? timeline.getAttribute("data-settings")
                    : ""
            console.log(slug, dataSettings)

            // Grab the data
            fetch(`/data/${slug}.json`)
                .then((response) => {
                    return response.json()
                })
                .then((json) => {
                    console.log("data", json)
                    data = [...data, json]
                    settings = [...settings, dataSettings]
                    ready = timelines.length === data.length
                    // When loaded all the data re-parent all timelines to their original elements
                    if (ready) {
                        setTimeout(() => {
                            attempts = 0
                            reparentTimelines(timelines)
                        }, 500)
                    }
                })
        })

        handleResize()
    })
</script>

<div id="placeholder">
    {#if ready}
        {#each data as d, i}
            <svelte:component this={Timeline} data={d} settings={settings[i]} />
        {/each}
    {/if}
</div>

<style>
    /* Hide the timeline components when generated in the placeholder div */
    div {
        display: none;
    }
</style>
