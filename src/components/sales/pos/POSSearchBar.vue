<script setup>
    import { ref } from "vue";
    import InputText from "primevue/inputtext";
    import Button from "primevue/button";

    // ============================================================================
    // STATE
    // ============================================================================
    const searchKeyword = ref("");

    // ============================================================================
    // EMITS
    // ============================================================================
    const emit = defineEmits([
        "search",
        "barcode",
    ]);

    // ============================================================================
    // SEARCH
    // ============================================================================
    function handleSearch() {
        emit("search", searchKeyword.value);
    }
    
    // CLEAR SEARCH
    function clearSearch() {
        searchKeyword.value = "";
        // Beritahu parent bahwa search sudah dikosongkan.
        emit("search", "");
    }

    // FUNCTION UNTUK SCAN BARCODE
    // Read Barcode -> Press Enter
    function handleKeyDown(event) {
        if (event.key !== "Enter") {
            return;
        }

        const value = searchKeyword.value.trim(); // ambil value di searchKeyword

        if (!value) { // jika value kosong
            return;
        }

        // jika value tidak kosong, emit ke barcode
        emit("barcode", value);
    }

    // Function untuk Clear Search setelah scan barcode berhasil dilakukan
    function clearSearchInput() {
        searchKeyword.value = "";
    }

    // expose function
    defineExpose({
        clearSearchInput,
    });

    // Dengan ini SalesPOSView.vue bisa memanggil:
    // searchBarRef.value.clearSearchInput();
</script>

<template>
    <div class="search-bar">
        <!--Search Input-->
        <div class="search-input">

            <i class="pi pi-search search-icon"></i>

            <InputText
                v-model="searchKeyword"
                placeholder="Search product, SKU, or barcode ..."
                fluid
                @input="handleSearch"
                @keydown="handleKeyDown"
            />
        </div>

        <!--Clear Search-->
        <Button
            v-if="searchKeyword"
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

/*
 * Search icon.
 */
.search-icon {
    position: absolute;

    left: 12px;
    top: 50%;

    transform: translateY(-50%);

    color: var(--text-color-secondary);

    font-size: 14px;

    pointer-events: none;

    z-index: 1;
}

/*
 * Wrapper search input.
 *
 * Dibuat position relative supaya
 * icon bisa diposisikan di dalam input.
 */
.search-input {
    position: relative;

    flex: 1;

    min-width: 0;
}

/*
 * InputText PrimeVue.
 *
 * :deep() diperlukan karena InputText
 * adalah component PrimeVue.
 */
.search-input :deep(.p-inputtext) {
    width: 100%;

    padding-left: 38px;
}

/*
 * Clear button jangan ikut melebar.
 */
.search-bar :deep(.p-button) {
    flex-shrink: 0;
}
</style>