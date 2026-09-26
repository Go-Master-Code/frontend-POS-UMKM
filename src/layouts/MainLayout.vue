<script setup>
import AppSidebar from "@/components/layout/AppSidebar.vue";
import AppTopbar from "@/components/layout/AppTopbar.vue";
import AppFooter from "@/components/layout/AppFooter.vue";
</script>

<template>
    <div class="layout-wrapper">

        <!-- Sidebar -->
        <AppSidebar />

        <!-- Area utama -->
        <div class="layout-main">

            <AppTopbar />

            <main class="layout-content">
                <router-view />
            </main>

            <AppFooter />

        </div>

    </div>
</template>

<style scoped>
.layout-wrapper{
    display:flex;
    height:100vh;
    width:100vw;
    background:#f5f7fb;
}

.layout-main{
    flex:1;
    display:flex;
    flex-direction:column;
    min-width:0;
    transition:margin-left .25s ease;
}

.layout-content{
    flex:1;
    overflow:auto;
    padding:24px;
}

/* Mobile */
@media (max-width: 900px) {
    :deep(.sidebar) {
        display: none;
    }

    .layout-content {
        padding: 16px;
    }
}
</style>