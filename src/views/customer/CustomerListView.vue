<script setup>
    import { ref, onMounted } from "vue";

    import Button from "primevue/button";
    import InputText from "primevue/inputtext";

    import CustomerTable from "./components/CustomerTable.vue";

    import { getCustomers, getCustomerByID, createCustomer, updateCustomer, deleteCustomer } from "@/api/customer.js";
    
    import { watch } from "vue";
    import { useDebounceFn } from "@vueuse/core";

    import CustomerDialog from "./components/CustomerDialog.vue"

    // confirm untuk delete
    import { useConfirm } from "primevue/useconfirm";
    import { useToast } from "primevue/usetoast";
import { create } from "axios";
    
    /*
    |--------------------------------------------------------------------------
    | State
    |--------------------------------------------------------------------------
    */

    // Data customers
    const customers = ref([]);

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
    const sortField = ref("created_at");
    const sortOrder = ref(-1); // PrimeVue format (1 atau -1)

    // id customer yang sedang diedit
    const editingCustomerID = ref(null);

    // untuk confirm delete
    const confirm = useConfirm();
    const toast = useToast();

    /*
    |--------------------------------------------------------------------------
    | Dialog State
    |--------------------------------------------------------------------------
    */
    // dialog add/edit customer
    const dialogVisible = ref(false);

    // loading tombol save
    const saving = ref(false);

    // mode dialog
    const dialogMode = ref("create");

    /*
    |--------------------------------------------------------------------------
    | Form Customer
    |--------------------------------------------------------------------------
    */
    const customerForm = ref(createEmptyCustomer());

    function createEmptyCustomer() {
        return {
            name: "",
            phone: "",
            is_active: true,
        };
    }

    /**
     * Membuka dialog Add Customer.
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
        customerForm.value = createEmptyCustomer();
        editingCustomerID.value = null;
        dialogMode.value = "create";
    }

    /**
     * Search dengan debounce agar tidak request setiap ketikan.
     */
    const debouncedSearch = useDebounceFn(() => {
        page.value = 1;
        loadCustomers();
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
     * Mengambil daftar customer dari backend.
     */
    async function loadCustomers() {
        if (loading.value) return;
        loading.value = true;

        try {
            const response = await getCustomers({
                page: page.value,
                limit: rows.value,
                search: keyword.value,
                sort: sortField.value,
                order: sortOrder.value === 1 ? "asc" : "desc",
            });

            // sesuaikan jika format response backend berbeda
            customers.value = response.data.data ?? [];
            totalRecords.value = response.data.meta.total; // ambil meta dari response backend
        } catch (err) {
            console.error(err);
        } finally {
            loading.value = false;
        }

        // log jika diperlukan
        // console.log("customers =", customers.value);
        // console.log("loading =", loading.value);
        // console.log("totalRecords =", totalRecords.value);
    }

    /**
     * Save Customer.
     * (sementara hanya console)
     */
    async function saveCustomer() {
        console.log(dialogMode.value);
        console.log(editingCustomerID.value);
        console.log(customerForm.value);
        saving.value = true;
        try {
            console.log(customerForm.value);
            // cek dulu mode dialog create / edit
            if (dialogMode.value === "create") {
                await createCustomer(customerForm.value);
            } else { // jika mode nya update
                await updateCustomer(
                    editingCustomerID.value,
                    customerForm.value
                );
            }

            backendError.value = ""; // kosongkan error backend
            dialogVisible.value = false;
            resetForm();
            await loadCustomers();
        } catch (err) {
            console.log("Error :", err.response?.data);
            backendError.value = err.response?.data?.error ?? "Failed to save data.";
            console.log("Backend error: ", backendError.value)
        } finally {
            saving.value = false;
        }
    }

    /**
     * Event ketika customer berpindah halaman DataTable.
     */
    function handlePage(event) {
        // primevue menggunakan index mulai dari 0
        page.value = event.page + 1;

        // jumlah baris per halaman
        rows.value = event.rows;

        // reload data dari server
        loadCustomers();
    }

    // function untuk sort data per kolom
    function handleSort(event) {
        sortField.value = event.sortField;
        sortOrder.value = event.sortOrder;

        page.value = 1; // reset ke page 1 saat sort

        loadCustomers(); // load ulang data
    }

    /**
     * Menghapus keyword pencarian.
     */
    function clearSearch() {
        page.value = 1;
        keyword.value = "";
        // loadCustomers() tidak perlu dijalankan 2x karena sudah ada di watcher juga
        // loadCustomers();
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
        loadCustomers(); // load customer pada saat halaman dimuat
    });

    // 2 function sementara untuk edit dan delete
    async function handleEdit(customer) {
        dialogMode.value = "edit";
        editingCustomerID.value = customer.id;
        backendError.value = "";

        try {
            loading.value = true;
            // ambil data terbaru dari backend
            const response = await getCustomerByID(customer.id);
            // isi form
            Object.assign(customerForm.value, response.data.data);
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
    function handleDelete(customer) {
        confirm.require({
            header: "Delete Customer",
            message: `Delete "${customer.name}"?`,
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
                    await deleteCustomer(customer.id);

                    toast.add({
                        severity: "success",
                        summary: "Deleted",
                        detail: "Customer deleted successfully.",
                        life: 3000
                    });

                    await loadCustomers();
                } catch (err) {
                    toast.add({
                        severity: "error",
                        summary: "Failed",
                        detail:
                            err.response?.data?.error ??
                            "Failed to delete customer.",
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
                <h2>Customer Management</h2>
                <small>Manage All Customers On My Tenant</small>
                
            </div>

            <Button
                label="Add Customer"
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
                    placeholder="Search customer..."
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
        <CustomerTable
            :customers="customers"
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

    <CustomerDialog
        v-model:visible="dialogVisible"
        :mode="dialogMode"
        :form="customerForm"
        :loading="saving"
        :backendError="backendError"
        @save="saveCustomer"
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