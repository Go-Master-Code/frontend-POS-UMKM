<script setup>
    // vue import
    import {ref, onMounted} from "vue";
    import { useRoute, useRouter } from "vue-router";

    // Import API
    import { getCatalogItemByID } from "@/api/catalog_items";
    import { getItemVariants } from "@/api/item_variant";

    // Import component
    import Button from "primevue/button";
    import Card from "primevue/card";
    import InputIcon from "primevue/inputicon";
    import InputText from "primevue/inputtext";
    import IconField from "primevue/iconfield";
    import Toolbar from "primevue/toolbar";
    import Column from "primevue/column";
    import DataTable from "primevue/datatable";
    import Paginator from "primevue/paginator"

    // debounce untuk fitur search keyword
    import { watch } from "vue";
    import { useDebounceFn } from "@vueuse/core";

    // router
    const route = useRoute();
    const router = useRouter();

    /*
    | Catalog Item ID => ID catalog diambil dari parameter route
    */
    const catalogItemID = route.params.id;

    // state
    const loading = ref(false);

    // search
    const search = ref("");

    // sort column
    // const sortField = ref("created_at"); bisa langsung sort kolom saat halaman berisi tabel dibuka
    const sortField = ref(null);
    const sortOrder = ref(-1); // PrimeVue format (1 atau -1)

    // pagination (default value)
    const currentPage = ref(1);
    const rows = ref(10);
    const totalRecords = ref(0);

    // Catalog Item => nanti akan diisi dari backend
    const item = ref({
        id: "",
        name: "",
        category_name: "",
        description: "",
    });

    // variant list
    const variants = ref([]);

    /**
     * Search dengan debounce agar tidak request setiap ketikan.
     */
    const debouncedSearch = useDebounceFn(() => {
        page.value = 1;
        loadCatalogItem();
    }, 400);

    // watcher saat searbox diketik
    watch(search, () => {
        debouncedSearch();
    });

    // function untuk sort data per kolom
    function handleSort(event) {
        sortField.value = event.sortField;
        sortOrder.value = event.sortOrder;

        page.value = 1; // reset ke page 1 saat sort

        loadCatalogItem(); // load ulang data
    }

    // lifecycle
    // Promise.all() membuat kedua request berjalan paralel sehingga halaman terasa lebih cepat.
    onMounted(async () => {
        await Promise.all([
            loadCatalogItem(),
            loadVariants(),
        ]);
    });

    // go back function
    function goBack() {
        router.back();
    }

    /*
    |--------------------------------------------------------------------------
    | Load Catalog Item
    |--------------------------------------------------------------------------
    */
    async function loadCatalogItem() {
        try {
            const response = await getCatalogItemByID(catalogItemID);
            item.value = response.data.data; // items shows catalog item instance
        } catch (err) {
            console.error(err);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Load Variants
    |--------------------------------------------------------------------------
    */
    async function loadVariants() {
        loading.value = true;

        try {
            const response = await getItemVariants({
                // isi param
                catalog_item_id: catalogItemID,
                page: currentPage.value,
                limit: rows.value,
                search: search.value,
                sort: sortField.value,
                order: sortOrder.value === 1
                    ? "asc"
                    : "desc",
            });
            variants.value = response.data.data;
            totalRecords.value = response.data.meta.total;
        } catch (err) {
            console.error(err);
        } finally {
            loading.value = false;
        }
    }

    // function untuk handling paginator
    async function handlePage(event) {
        currentPage.value =
            event.page + 1;
        rows.value =
            event.rows;
        await loadVariants();
    }
</script>

<template>
    <div class="page-container">
        <!-- Page Header -->
        <div class="page-header">
            <Button
                icon="pi pi-arrow-left"
                label="Back"
                severity="secondary"
                outlined
                @click="goBack"
            />
            <div>
                <h2 class="page-title">
                    Catalog Item Variant
                </h2>

                <p class="page-subtitle">
                    Manage all variants of this catalog item.
                </p>
            </div>
        </div>
        <!-- Item information -->
        <Card class="mt-4">
            <template #title>
                {{ item.name || "-" }}
            </template>
            <template #content>
                <div class="grid">
                    <div class="col-12 md:col-4">
                        <strong>Category</strong>
                        <div>
                            {{ item.category_name || "-" }}
                        </div>
                    </div>
                    <div class="col-12 md:col-8">
                        <strong>Description</strong>
                        <div>
                            {{ item.description || "-" }}
                        </div>
                    </div>
                </div>
            </template>
        </Card>

        <!-- Toolbar -->
        <Toolbar class="mt-4">
            <template #start>
                <IconField>
                    <InputIcon class="pi pi-search" />
                    <InputText placeholder="Search variant ..." />
                </IconField>
            </template>
            <template #end>
                <Button
                    icon="pi pi-plus"
                    label="Add Variant"
                />
            </template>
        </Toolbar>

        <!-- Datatable -->
        <DataTable
            :value="variants"
            :loading="loading"
            size="small"
            lazy

            :sortField="sortField"
            :sortOrder="sortOrder"

            :rows="rows"
            :first="(currentPage - 1) * rows"
            :totalRecords="totalRecords"

            @page="handlePage"
            @sort="handleSort"

            responsiveLayout="scroll"
            stripedRows
            showGridlines
            removableSort
            dataKey="id"

            :rowsPerPageOptions="[10,20,50,100]"

            paginator
            paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
        >
            <Column
                field="variant_name"
                header="Variant"
            />

            <Column
                field="sku"
                header="SKU"
            />

            <Column
                field="barcode"
                header="Barcode"
            />

            <Column
                field="cost_price"
                header="Cost Price"
            />

            <Column
                field="selling_price"
                header="Selling Price"
            />

            <!-- Status -->
            <Column
                field="is_active"
                header="Status"
            >
                <template #body="{ data }">
                    <span
                        :class="[
                            'status-badge',
                            data.is_active
                                ? 'status-active'
                                : 'status-inactive'
                        ]"
                    >
                        {{ data.is_active ? "Active" : "Inactive" }}
                    </span>
                </template>
            </Column>

            <Column header="Action">
                <template #body>
                    <Button
                        icon="pi pi-pencil"
                        text
                    />

                    <Button
                        icon="pi pi-trash"
                        text
                        severity="danger"
                    />
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<style scoped>
.status-badge{
    padding:4px 10px;
    border-radius:20px;
    font-size:13px;
    font-weight:600;
}

.status-active{
    background:#dcfce7;
    color:#166534;
}

.status-inactive{
    background:#fee2e2;
    color:#991b1b;
}
</style>