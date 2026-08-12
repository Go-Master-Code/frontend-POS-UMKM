<script setup>
    import Button from "primevue/button";

    /*
    * Daftar kategori sementara untuk kebutuhan UI.
    *
    * Nanti setelah layout dan filtering selesai,
    * data kategori ini akan kita ambil dari API backend.
    */

    // const categories = [
    //     {
    //         id: "all",
    //         name: "All",
    //     },
    //     {
    //         id: "snack",
    //         name: "Snack",
    //     },
    //     {
    //         id: "minuman",
    //         name: "Minuman",
    //     },
    //     {
    //         id: "makanan",
    //         name: "Makanan",
    //     },
    // ];

    // ============================================================================
    // PROPS
    // ============================================================================
    //
    // categories:
    // Daftar kategori yang dikirim oleh SalesPOSView.vue.
    //
    // selectedCategory:
    // ID kategori yang sedang aktif.
    //
    // "all" berarti menampilkan semua produk.
    const props = defineProps({
        categories: {
            type: Array,
            default: () => [],
        },
        selectedCategory: {
            type: [String, null],
            default: "all",
        },
    });

    // ============================================================================
    // EMITS
    // ============================================================================
    //
    // Memberitahukan SalesPOSView.vue ketika category berubah.
    //
    // Event:
    // @change
    //
    // ============================================================================
    const emit = defineEmits(["change"]);

    /**
     * Dipanggil ketika kasir memilih category.
     *
     * Kita mengirim seluruh object category ke parent,
     * sama seperti mekanisme component kamu sebelumnya.
     */
    function selectCategory(category) {
        emit("change", category);
    }
</script>

<template>
    <div class="category-filter">
        <Button
            v-for="category in props.categories"
            :key="category.id"
            :label="category.name"
            :severity="
                props.selectedCategory === category.id
                    ? 'primary'
                    : 'secondary'
            "
            :outlined="props.selectedCategory !== category.id"
            size="small"
            @click="selectCategory(category)"
        />
    </div>
</template>

<style scoped>
.category-filter {
    display: flex;
    align-items: center;
    justify-content: center;

    gap: 8px;

    margin-top: 10px;
    margin-bottom: 14px;

    padding: 0;

    overflow-x: auto;

    scrollbar-width: none;
}

.category-filter::-webkit-scrollbar {
    display: none;
}

</style>