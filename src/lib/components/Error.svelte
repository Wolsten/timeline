<script>
    export let error = {
        message: "",
        severity: "", // 'info' | 'warning' | 'danger'
    }
</script>

<div class={error.severity}>
    {@html error.message}
</div>

<style>
    div {
        padding: 1rem;
        color: black;
    }

    div.info {
        background-color: white;
    }

    div.warning {
        background-color: orange;
    }

    div.warning {
        background-color: red;
        color: white;
    }
</style>
