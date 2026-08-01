<script setup>
    // vue import
    import {ref, onMounted} from "vue";
    import { useRoute, useRouter } from "vue-router";

    // Import API
    import { getCatalogItemByID } from "@/api/catalog_items";
    import { createItemVariant, getItemVariants } from "@/api/item_variant";

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

    // import dialog untuk add / edit data item variant
    import ItemVariantDialog from "./components/ItemVariantDialog.vue"

    // debounce untuk fitur search keyword
    import { watch } from "vue";
    import { useDebounceFn } from "@vueuse/core";

    // confirm untuk delete
    import { useConfirm } from "primevue/useconfirm";
    import { useToast } from "primevue/usetoast";

    // router
    const route = useRoute();
    const router = useRouter();

    /*
    | Catalog Item ID => ID catalog diambil dari parameter route
    */
    const catalogItemID = route.params.id;

    // =========STATE==========
    // Data catalog item
    const item_variant = ref([]);
    const loading = ref(false);

    // search
    const search = ref("");

    // untuk pesan error dialog
    const backendError = ref("");

    // sort column
    // const sortField = ref("created_at"); bisa langsung sort kolom saat halaman berisi tabel dibuka
    const sortField = ref(null);
    const sortOrder = ref(-1); // PrimeVue format (1 atau -1)

    // id item variant yang sedang diedit
    const editingItemVariantId = ref(null);

    // untuk confirm delete
    const confirm = useConfirm();
    const toast = useToast();

    /*
    |--------------------------------------------------------------------------
    | Dialog State
    |--------------------------------------------------------------------------
    */
    // dialog add/edit catalog category
    const dialogVisible = ref(false);

    // loading tombol save
    const saving = ref(false);

    // mode dialog
    const dialogMode = ref("create");

    /*
    |--------------------------------------------------------------------------
    | Form Item Variant
    |--------------------------------------------------------------------------
    */
    const itemVariantForm = ref(createEmptyItemVariant());

    function createEmptyItemVariant() { // default value nya
        return {
            item_id: catalogItemID,
            variant_name: "",
            sku: "",
            barcode: "",
            cost_price: "",
            selling_price: "",
            minimum_stock: "",
            initial_stock: "",
            is_active: true,
        };
    }

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

    /**
     * Menghapus error backend.
     */
    function clearBackendError() {
        backendError.value = "";
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

    /**
     * Save Item Variant
     */
    async function saveItemVariant() {
        saving.value = true;
        try {
            // item_id (catagory_id) sudah diisi di method create empty item variant
            console.log(itemVariantForm.value);
            // cek dulu mode dialog create / edit
            if (dialogMode.value === "create") {
                await createItemVariant(itemVariantForm.value);
            } else { // jika mode nya update
                await updateCatalogItem(
                    editingItemVariantId.value,
                    itemVariantForm.value
                );
            }

            backendError.value = ""; // kosongkan error backend
            dialogVisible.value = false;
            resetForm();
            await loadCatalogItem();
            await loadVariants(); // refresh tabel item variant agar data baru muncul di tabel
        } catch (err) {
            console.log("Error :", err.response?.data);
            backendError.value = err.response?.data?.error ?? "Failed to save data.";
            console.log("Backend error: ", backendError.value)
        } finally {
            saving.value = false;
        }
    }

    /**
     * Membuka dialog Add Item Variant.
     */
    async function openCreateDialog() {
        dialogMode.value = "create";
        resetForm();
        backendError.value=""; // bersihkan error backend
        dialogVisible.value = true;
    }

    /**
     * Reset form menjadi kosong.
     */
    function resetForm() {
        itemVariantForm.value = createEmptyItemVariant();
        editingItemVariantId.value = null;
        dialogMode.value = "create";
    }
</script>

<template>
    <div class="page-container">
        <!-- Page Header -->
        <div class="page-header">
            <Button
                icon="pi pi-arrow-left"
                text
                severity="secondary"
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
                    @click="openCreateDialog"
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

    <ItemVariantDialog
        v-model:visible="dialogVisible"
        :mode="dialogMode"
        :form="itemVariantForm"
        :item_variant="item_variant"
        :loading="saving"
        :backendError="backendError"
        @save="saveItemVariant"
        @clear-error="clearBackendError"
    />
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

.page-header{
    display:flex;
    align-items:flex-start;
    gap:12px;
    margin-bottom:24px;
}

.page-title{
    display:flex;
    flex-direction:column;
}

.page-title h2{
    margin:0;
    font-size:1.5rem;
    font-weight:600;
}

.page-title small{
    margin-top:4px;
    color:#6b7280;
    font-size:.9rem;
}
</style>