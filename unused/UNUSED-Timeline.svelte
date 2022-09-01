<script>
    export let data
    export let options
</script>

<div class="timeline">
    {#if data}
        <h1>Timeline {data.name}</h1>
    {/if}
</div>

<style>
    div {
        width: 100%;
        border: 1px solid green;
    }
    h1 {
        color: red;
    }
</style>
