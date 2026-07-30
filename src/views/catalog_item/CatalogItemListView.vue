<script setup>
    import { ref, onMounted } from "vue";

    import Button from "primevue/button";
    import InputText from "primevue/inputtext";

    import CatalogItemTable from "./components/CatalogItemTable.vue";
    import CatalogItemDialog from "./components/CatalogItemDialog.vue"

    import { getCatalogItems,getCatalogItemByID,createCatalogItem,updateCatalogItem,deleteCatalogItem } from "@/api/catalog_items";
    import { getCatalogCategory } from "@/api/catalog_categories.js"

    import { watch } from "vue";
    import { useDebounceFn } from "@vueuse/core";

    // confirm untuk delete
    import { useConfirm } from "primevue/useconfirm";
    import { useToast } from "primevue/usetoast";
    
    /*
    |--------------------------------------------------------------------------
    | State
    |--------------------------------------------------------------------------
    */

    // Data catalog item
    const catalog_item = ref([]);

    // Loading tabel
    const loading = ref(false);

    // keyword pencarian
    const keyword = ref("");

    // pagination (default value)
    const page = ref(1);
    const rows = ref(10);
    const totalRecords = ref(0);

    // untuk pesan error dialog
    const backendError = ref("");

    // sort column
    // const sortField = ref("created_at"); bisa langsung sort kolom saat halaman berisi tabel dibuka
    const sortField = ref(null);

    const sortOrder = ref(-1); // PrimeVue format (1 atau -1)

    // id catalog category yang sedang diedit
    const editingCatalogItemId = ref(null);

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
    | Form Catalog Item
    |--------------------------------------------------------------------------
    */
    const catalogItemForm = ref(createEmptyCatalogItem());

    function createEmptyCatalogItem() { // default value nya
        return {
            name: "",
            category_id: "",
            category_name: "",
            description: "",
            is_active: true,
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Role Options
    |--------------------------------------------------------------------------
    */
    const catalog_category = ref([]); // sementara diisi kosong dulu

    /**
     * Membuka dialog Add Catalog Item.
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
        catalogItemForm.value = createEmptyCatalogItem();
        editingCatalogItemId.value = null;
        dialogMode.value = "create";
    }

    /**
     * Search dengan debounce agar tidak request setiap ketikan.
     */
    const debouncedSearch = useDebounceFn(() => {
        page.value = 1;
        loadCatalogItem();
    }, 400);

    // watcher saat searbox diketik
    watch(keyword, () => {
        debouncedSearch();
    });

    /*
    |--------------------------------------------------------------------------
    | Methods
    |--------------------------------------------------------------------------
    */

    /**
     * Mengambil daftar catalog category dari backend.
     */
    async function loadCatalogItem() {
        if (loading.value) return;
        loading.value = true;

        try {
            const response = await getCatalogItems({
                page: page.value,
                limit: rows.value,
                search: keyword.value,
                sort: sortField.value,
                order: sortOrder.value === 1 ? "asc" : "desc",
            });

            console.log(response);
            console.log(response.data);

            // sesuaikan jika format response backend berbeda
            catalog_item.value = response.data.data ?? [];
            totalRecords.value = response.data.meta.total; // ambil meta dari response backend
        } catch (err) {
            console.error(err);
        } finally {
            loading.value = false;
        }

        // log jika diperlukan
        // console.log("Catalog Category =", catalog_category.value);
        // console.log("loading =", loading.value);
        // console.log("totalRecords =", totalRecords.value);
    }

    /**
     * Save Catalog Category.
     * (sementara hanya console)
     */
    async function saveCatalogItem() {
        saving.value = true;
        try {
            console.log(catalogItemForm.value);
            // cek dulu mode dialog create / edit
            if (dialogMode.value === "create") {
                await createCatalogItem(catalogItemForm.value);
            } else { // jika mode nya update
                await updateCatalogItem(
                    editingCatalogItemId.value,
                    catalogItemForm.value
                );
            }

            backendError.value = ""; // kosongkan error backend
            dialogVisible.value = false;
            resetForm();
            await loadCatalogItem();
        } catch (err) {
            console.log("Error :", err.response?.data);
            backendError.value = err.response?.data?.error ?? "Failed to save data.";
            console.log("Backend error: ", backendError.value)
        } finally {
            saving.value = false;
        }
    }

    /**
     * Mengambil daftar catalog category untuk komponen select.
     */
    async function loadCatalogCategory() {
        try {
            const response = await getCatalogCategory();
            console.log("Catalog Categories:", response.data);
            catalog_category.value = response.data.data ?? [];
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * Event ketika catalog category berpindah halaman DataTable.
     */
    function handlePage(event) {
        // primevue menggunakan index mulai dari 0
        page.value = event.page + 1;

        // jumlah baris per halaman
        rows.value = event.rows;

        // reload data dari server
        loadCatalogItem();
    }

    // function untuk sort data per kolom
    function handleSort(event) {
        sortField.value = event.sortField;
        sortOrder.value = event.sortOrder;

        page.value = 1; // reset ke page 1 saat sort

        loadCatalogItem(); // load ulang data
    }

    /**
     * Menghapus keyword pencarian.
     */
    function clearSearch() {
        page.value = 1;
        keyword.value = "";
    }

    /**
     * Menghapus error backend.
     */
    function clearBackendError() {
        backendError.value = "";
    }

    /*
    |--------------------------------------------------------------------------
    | Lifecycle
    |--------------------------------------------------------------------------
    */

    onMounted(() => {
        loadCatalogItem(); // load catalog item pada saat halaman dimuat
        loadCatalogCategory(); // load catalog category sekali pada saat halaman dimuat
    });

    // 2 function sementara untuk edit dan delete
    async function handleEdit(catalog_item) {
        dialogMode.value = "edit";
        editingCatalogItemId.value = catalog_item.id;
        backendError.value = "";

        try {
            loading.value = true;
            // ambil data terbaru dari backend
            const response = await getCatalogItemByID(catalog_item.id);
            // isi form
            Object.assign(catalogItemForm.value, response.data.data);
            dialogVisible.value = true
        } catch (err) {
            console.log("Error :", err.response?.data);
            backendError.value = err.response?.data?.error ?? "Failed to save data.";
            console.log("Backend error: ", backendError.value)
        } finally {
            loading.value = false;
        }
    }

    // confirm dialog
    function handleDelete(catalog_item) {
        confirm.require({
            header: "Delete Catalog Item",
            message: `Delete "${catalog_item.name}"?`,
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
                    await deleteCatalogItem(catalog_item.id);

                    toast.add({
                        severity: "success",
                        summary: "Deleted",
                        detail: "Catalog item deleted successfully.",
                        life: 3000
                    });

                    await loadCatalogItem();
                } catch (err) {
                    toast.add({
                        severity: "error",
                        summary: "Failed",
                        detail:
                            err.response?.data?.error ??
                            "Failed to delete catalog item.",
                        life: 4000
                    });
                }
            }
        });
    }
</script>

<template>
    <div class="card">
        <!-- Header -->
        <div class="page-header">
            <div>
                <h2>Catalog Items</h2>
                <small>Manage All Catalog Items On My Tenant</small>
                
            </div>

            <Button
                label="Add Catalog Item"
                icon="pi pi-plus"
                @click="openCreateDialog"
            />
        </div>

        <!-- Toolbar -->
        <div class="toolbar">
            <div class="search-box">
                <i class="pi pi-search search-icon" />
                <InputText
                    v-model="keyword"
                    placeholder="Search catalog item..."
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
        </div>

        <!-- Datatable -->
        <CatalogItemTable
            :catalog_item="catalog_item"
            :loading="loading"

            :sortField="sortField"
            :sortOrder="sortOrder"
            
            :page="page"
            :rows="rows"
            :total-records="totalRecords"

            @page="handlePage"
            @sort="handleSort"
            @edit="handleEdit"
            @delete="handleDelete"
        />
    </div>

    <CatalogItemDialog
        v-model:visible="dialogVisible"
        :mode="dialogMode"
        :form="catalogItemForm"
        :catalog_category="catalog_category"
        :loading="saving"
        :backendError="backendError"
        @save="saveCatalogItem"
        @clear-error="clearBackendError"
    />
</template>

<style scoped>
.page-header{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.toolbar{
    margin-bottom:16px;
}

.search-box{
    position:relative;
    width:320px;
}

.search-input{
    width:100%;
    padding-left:36px;
    padding-right:36px;
}

.search-icon{
    position:absolute;
    left:12px;
    top:50%;
    transform:translateY(-50%);
    color:#9ca3af;
}

.clear-btn{
    position:absolute;
    right:4px;
    top:50%;
    transform:translateY(-50%);
}
</style>