<script setup>
    /*
    |--------------------------------------------------------------------------
    | Page Container
    |--------------------------------------------------------------------------
    |
    | Komponen ini menangani tiga kondisi umum:
    |
    | 1. Loading
    | 2. Error
    | 3. Empty
    |
    | Jika ketiga kondisi tersebut tidak terjadi,
    | maka slot utama akan ditampilkan.
    |
    |--------------------------------------------------------------------------
    */
    import Skeleton from 'primevue/skeleton';

    const props = defineProps({
        loading: {
            type: Boolean,
            default: false
        },
        error: {
            type: String,
            default: ""
        },
        empty: {
            type: Boolean,
            default: false
        },
        emptyText: {
            type: String,
            default: "No data available."
        },
        skeletonHeight: {
            type: String,
            default: "220px"
        }
    });
</script>

<template>
    <!--Loading-->
    <div v-if="loading">
        <Skeleton
            width="100%"
            :height="skeletonHeight"
            borderRadius="12px"
        />
    </div>
    <!--Error-->
    <div v-else-if="error" class="state error">
        <i class="pi pi-times-circle"></i>
        <div>{{ error }}</div>
    </div>
    <!--Empty-->
    <div v-else-if="empty" class="state empty">
        <i class="pi pi-inbox"></i>
        <div>{{ emptyText }}</div>
    </div>
    <!--Content-->
    <slot v-else />
</template>

<style scoped>

.state{
    min-height:220px;
    display:flex;
    flex-direction:column;
    justify-content:center;
    align-items:center;
    gap:12px;
    border:1px dashed #D1D5DB;
    border-radius:12px;
}

.state i{
    font-size:2rem;
}

.empty{
    color:#9CA3AF;
}

.error{
    color:#DC2626;
}
</style>