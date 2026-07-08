<script setup>
// import daftar menu dari config aplikasi
import { menuItems } from "@/config/menu";

// import komponen untuk menampilkan satu buah menu
import AppMenuItem from "./AppMenuItem.vue";

</script>

<template>
    <!-- Container seluruh menu -->
    <nav class="app-menu">
        <!-- Lakukan looping seluruh menu -->
        <AppMenuItem
            v-for="item in menuItems"
            :key="item.key"
            :item="item"
        />
    </nav>
</template>

<style scoped>
.app-menu {
    display: flex;
    flex-direction: column;
    padding: 12px 0;
}
</style>