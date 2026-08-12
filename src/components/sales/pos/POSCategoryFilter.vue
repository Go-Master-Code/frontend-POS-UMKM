<script setup>
    import {ref} from "vue";
    import Button from "primevue/button";

    /*
    * Daftar kategori sementara untuk kebutuhan UI.
    *
    * Nanti setelah layout dan filtering selesai,
    * data kategori ini akan kita ambil dari API backend.
    */

    const categories = [
        {
            id: "all",
            name: "All",
        },
        {
            id: "snack",
            name: "Snack",
        },
        {
            id: "minuman",
            name: "Minuman",
        },
        {
            id: "makanan",
            name: "Makanan",
        },
    ];

    /*
    * Menyimpan kategori yang sedang dipilih.
    *
    * Default:
    * "all" → tampilkan seluruh produk.
    */
    const selectedCategory = ref("all");

    const emit = defineEmits(["change"]);

    /*
    * Dipanggil ketika kasir memilih kategori.
    *
    * Kita update state lokal kemudian
    * memberitahukan parent component bahwa
    * kategori telah berubah.
    */
    function selectCategory(category) {
        selectedCategory.value = category.id;
        emit("change", category);
    }
</script>

<template>
    <div class="category-filter">
        <Button
            v-for="category in categories"
            :key="category.id"
            :label="category.name"
            :severity="
                selectedCategory === category.id
                    ? 'primary'
                    : 'secondary'
            "
            :outlined="selectedCategory !== category.id"
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