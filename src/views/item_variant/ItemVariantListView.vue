<script setup>
    // vue import
    import {ref, onMounted} from "vue";
    import { useRoute, useRouter } from "vue-router";

    // Import API
    import { getCatalogItemByID } from "@/api/catalog_items";
    import { createItemVariant, getItemVariants, getItemVariantByID, updateItemVariant, deleteItemVariant } from "@/api/item_variant";

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

    // keyword pencarian
    const keyword = ref("");

    // untuk pesan error dialog
    const backendError = ref("");

    // DEFAULT SORT COLUMN
    // const sortField = ref("created_at"); bisa langsung sort kolom saat halaman berisi tabel dibuka
    const sortField = ref("variant_name");
    const sortOrder = ref(1); // // PrimeVue: 1 = ASC, -1 = DESC

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
            current_stock: "",
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
        currentPage.value = 1;
        loadVariants();
    }, 400);

    // watcher saat searbox diketik
    watch(keyword, () => {
        debouncedSearch();
    });

    // function untuk sort data per kolom
    function handleSort(event) {
        sortField.value = event.sortField;
        sortOrder.value = event.sortOrder;

        console.log(event.sortField);
        console.log(event.sortOrder);

        currentPage.value = 1; // reset ke page 1 saat sort

        loadVariants(); // load ulang data
    }

    // function untuk menampilkan data yang hendak diedit di dialog
    async function handleEdit(item_variant) {
        dialogMode.value = "edit";
        editingItemVariantId.value = item_variant.id;
        backendError.value = "";

        try {
            loading.value = true;
            // ambil data terbaru dari backend
            const response = await getItemVariantByID(item_variant.id);
            // isi form
            Object.assign(itemVariantForm.value, response.data.data);
            dialogVisible.value = true
        } catch (err) {
            console.log("Error :", err.response?.data);
            backendError.value = err.response?.data?.error ?? "Failed to save data.";
            console.log("Backend error: ", backendError.value)
        } finally {
            loading.value = false;
        }
    }

    // confirm dialog untuk delete data
    function handleDelete(item_variant) {
        console.log(item_variant);
        confirm.require({
            header: "Delete Item Variant",
            message: `Delete "${item_variant.variant_name}"?`,
            icon: "pi pi-exclamation-triangle",
            rejectLabel: "Cancel",
            acceptLabel: "Delete",
            rejectProps: {
                severity: "secondary",
                outlined: true
            },
            acceptProps: {
                severity: "danger"
            },
            accept: async () => {
                try {
                    await deleteItemVariant(item_variant.id);

                    toast.add({
                        severity: "success",
                        summary: "Deleted",
                        detail: "Item variant deleted successfully.",
                        life: 3000
                    });

                    await loadVariants();
                } catch (err) {
                    toast.add({
                        severity: "error",
                        summary: "Failed",
                        detail:
                            err.response?.data?.error ??
                            "Failed to delete item variant.",
                        life: 4000
                    });
                }
            }
        });
    }

    /**
     * Menghapus keyword pencarian.
     */
    function clearSearch() {
        currentPage.value = 1;
        keyword.value = "";
    }

    /**
     * Menghapus error backend.
     */
    function clearBackendError() {
        backendError.value = "";
    }

    function formatNumber(value) {
        if (value === null || value === undefined || value === "") {
            return "0";
        }

        return new Intl.NumberFormat("id-ID").format(Number(value));
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
                search: keyword.value,
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
                await updateItemVariant(
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
        <div class="toolbar">

            <!-- Search -->
            <div class="search-box">
                <i class="pi pi-search search-icon" />

                <InputText
                    v-model="keyword"
                    placeholder="Search variant..."
                    class="search-input"
                />

                <Button
                    v-if="keyword"
                    icon="pi pi-times"
                    text
                    rounded
                    severity="secondary"
                    class="clear-btn"
                    @click="clearSearch"
                />
            </div>

            <!-- Action -->
            <Button
                icon="pi pi-plus"
                label="Add Variant"
                @click="openCreateDialog"
            />

        </div>

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
                sortable
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
                bodyClass="number-cell"
                sortable
            >
                <template #body="{ data }">
                    {{ formatNumber(data.cost_price) }}
                </template>
            </Column>

            <Column
                field="selling_price"
                header="Selling Price"
                bodyClass="number-cell"
                sortable
            >
                <template #body="{ data }">
                    {{ formatNumber(data.selling_price) }}
                </template>
            </Column>

            <Column
                field="current_stock"
                header="Stock"
                sortable
                bodyClass="number-cell"
            >
                <template #body="{ data }">
                    <span
                        :class="{
                            'stock-low': data.current_stock <= data.minimum_stock
                        }"
                    >
                        {{ formatNumber(data.current_stock) }}
                    </span>
                </template>
            </Column>

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
                <template #body="{ data }">
                    <div class="action-buttons">
                        <Button
                            icon="pi pi-pencil"
                            text
                            @click="handleEdit(data)"
                        />

                        <Button
                            icon="pi pi-trash"
                            text
                            severity="danger"
                            @click="handleDelete(data)"
                        />
                    </div>
                </template>
            </Column>

            <!-- emptymessage jika data search tidak ditemukan -->
            <template #empty>
                <div class="empty-state">
                    <i class="pi pi-search empty-icon"></i>
                    <div class="empty-title">
                        No items found
                    </div>
                    <div class="empty-description">
                        Try changing your search keyword.
                    </div>
                </div>
            </template>
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

.toolbar{
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-top:1rem;
    margin-bottom:16px;
}

.search-box{
    position:relative;
    width:320px;
}

.search-input{
    width:100%;
    padding-left:2.2rem;
    padding-right:2.2rem;
}

.search-icon{
    position:absolute;
    left:.75rem;
    top:50%;
    transform:translateY(-50%);
    color:#6b7280;
}

.clear-btn{
    position:absolute;
    right:.25rem;
    top:50%;
    transform:translateY(-50%);
}

.empty-state{
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    padding:48px 16px;
    color:#6b7280;
}

.empty-icon{
    font-size:2rem;
    margin-bottom:12px;
    color:#9ca3af;
}

.empty-title{
    font-size:16px;
    font-weight:600;
    color:#374151;
}

.empty-description{
    margin-top:4px;
    font-size:14px;
}

.stock-low {
    color: #dc2626;
    font-weight: 600;
}

.action-buttons {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: nowrap;
    white-space: nowrap;
}

/* css rata kanan untuk angka di table */
:deep(.number-cell) { 
    text-align: right;
}
</style>