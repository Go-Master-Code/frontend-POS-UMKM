<script setup>
    import { ref } from "vue";
    import InputText from "primevue/inputtext";
    import Button from "primevue/button";

    const search = ref("");
    const cartItems = ref([]); // untuk memasukkan product ke dalam cart ketika product pada product grid di klik

    function clearSearch() {
        search.value = "";
    }
</script>

<template>
    <div class="search-bar">
        <div class="search-input">
            <i class="pi pi-search"></i>
            <InputText
                v-model="search"
                placeholder="Search product, SKU, or barcode ..."
                fluid
            />
        </div>
        <Button
            v-if="search"
            icon="pi pi-times"
            severity="secondary"
            text
            rounded
            aria-label="Clear search"
            @click="clearSearch"
        />
    </div>
</template>

<style scoped>
.search-bar {
    display: flex;
    align-items: center;
    gap: 8px;
}

.search-input {
    position: relative;

    flex: 1;
}

.search-input > i {
    position: absolute;

    left: 12px;
    top: 50%;

    transform: translateY(-50%);

    color: #9ca3af;

    z-index: 1;
}

.search-input :deep(.p-inputtext) {
    padding-left: 38px;
}
</style>