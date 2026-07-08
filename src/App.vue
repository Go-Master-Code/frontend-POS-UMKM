<script setup>
    console.log(import.meta.env.VITE_API_URL)
    import ConfirmDialog from "primevue/confirmdialog";
    import Toast from "primevue/toast";
</script>

<template>
    <ConfirmDialog />
    <Toast />
    <router-view />
</template>