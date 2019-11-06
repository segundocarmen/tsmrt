<template lang="pug">
    div Country Index
</template>

<script>
export default {
    layout: 'country',
    async fetch({ store, redirect, params}) {
        redirect(`/countries/${params.country}/universities`)
    }
}
</script>

