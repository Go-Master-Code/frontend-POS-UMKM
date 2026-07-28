<script setup>
    /* Loading wrapper
        Komponen reusable untuk menampilkan Skeleton
        ketika data masih dimuat.

        Penggunaan:
        <LoadingWrapper :Loading="Loading">
            isi komponen...
        </LoadingWrapper>
    */
   import Skeleton from "primevue/skeleton";

   // props
   defineProps({
        loading: {
            type: Boolean,
            default: false
        },
        height: {
            type: String,
            default: "180px"
        }
   });
</script>

<template>
    <!--Jika loading-->
    <div
        v-if="loading"
        class="loading-wrapper"
    >
        <Skeleton
            width="100%"
            :height="height"
            borderRadius="12px"
        />
    </div>
    <!--Jika selesai loading-->
    <slot
        v-else
    />
</template>

<style scoped>

.loading-wrapper{
    width:100%;
}

</style>