<script setup>
    import { ref, onMounted } from "vue";

    import Button from "primevue/button";
    import InputText from "primevue/inputtext";

    import RoleTable from "./components/RoleTable.vue";

    import { getRoles, getRoleByID, createRole, updateRole, deleteRole } from "@/api/roles";

    import { watch } from "vue";
    import { useDebounceFn } from "@vueuse/core";

    import RoleDialog from "./components/RoleDialog.vue"

    // confirm untuk delete
    import { useConfirm } from "primevue/useconfirm";
    import { useToast } from "primevue/usetoast";
    
    /*
    |--------------------------------------------------------------------------
    | State
    |--------------------------------------------------------------------------
    */

    // Data roles
    const roles = ref([]);

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

    // id role yang sedang diedit
    const editingRoleId = ref(null);

    // untuk confirm delete
    const confirm = useConfirm();
    const toast = useToast();

    /*
    |--------------------------------------------------------------------------
    | Dialog State
    |--------------------------------------------------------------------------
    */
    // dialog add/edit user
    const dialogVisible = ref(false);

    // loading tombol save
    const saving = ref(false);

    // mode dialog
    const dialogMode = ref("create");

    /*
    |--------------------------------------------------------------------------
    | Form Role
    |--------------------------------------------------------------------------
    */
    const roleForm = ref(createEmptyRole());

    function createEmptyRole() {
        return {
            name: "",
        };
    }

    /**
     * Membuka dialog Add Role.
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
        roleForm.value = createEmptyRole();
        editingRoleId.value = null;
        dialogMode.value = "create";
    }

    /**
     * Search dengan debounce agar tidak request setiap ketikan.
     */
    const debouncedSearch = useDebounceFn(() => {
        page.value = 1;
        loadRoles();
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
     * Mengambil daftar user dari backend.
     */
    async function loadRoles() {
        if (loading.value) return;
        loading.value = true;

        try {
            const response = await getRoles({
                page: page.value,
                limit: rows.value,
                search: keyword.value,
                sort: sortField.value,
                order: sortOrder.value === 1 ? "asc" : "desc",
            });

            // sesuaikan jika format response backend berbeda
            roles.value = response.data.data ?? [];
            totalRecords.value = response.data.meta.total; // ambil meta dari response backend
        } catch (err) {
            console.error(err);
        } finally {
            loading.value = false;
        }
    }

    /**
     * Save Role.
     */
    async function saveRole() {
        console.log(dialogMode.value);
        console.log(editingRoleId.value);
        console.log(roleForm.value);
        saving.value = true;
        try {
            console.log(roleForm.value);
            // cek dulu mode dialog create / edit
            if (dialogMode.value === "create") {
                await createRole(roleForm.value);
            } else { // jika mode nya update
                await updateRole(
                    editingRoleId.value,
                    roleForm.value
                );
            }

            backendError.value = ""; // kosongkan error backend
            dialogVisible.value = false;
            resetForm();
            await loadRoles();
        } catch (err) {
            console.log("Error :", err.response?.data);
            backendError.value = err.response?.data?.error ?? "Failed to save data.";
            console.log("Backend error: ", backendError.value)
        } finally {
            saving.value = false;
        }
    }

    /**
     * Event ketika user berpindah halaman DataTable.
     */
    function handlePage(event) {
        // primevue menggunakan index mulai dari 0
        page.value = event.page + 1;

        // jumlah baris per halaman
        rows.value = event.rows;

        // reload data dari server
        loadRoles();
    }

    // function untuk sort data per kolom
    function handleSort(event) {
        sortField.value = event.sortField;
        sortOrder.value = event.sortOrder;

        page.value = 1; // reset ke page 1 saat sort

        loadRoles(); // load ulang data
    }

    /**
     * Menghapus keyword pencarian.
     */
    function clearSearch() {
        page.value = 1;
        keyword.value = "";
        // loadUsers() tidak perlu dijalankan 2x karena sudah ada di watcher juga
        // loadUsers();
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
        loadRoles(); // load roles pada saat halaman dimuat
    });

    // 2 function sementara untuk edit dan delete
    async function handleEdit(role) {
        dialogMode.value = "edit";
        editingRoleId.value = role.id;
        backendError.value = "";

        try {
            loading.value = true;
            // ambil data terbaru dari backend
            const response = await getRoleByID(role.id);
            // isi form
            Object.assign(roleForm.value, response.data.data);
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
    function handleDelete(role) {
        confirm.require({
            header: "Delete Role",
            message: `Delete "${role.name}"?`,
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
                    await deleteRole(role.id);

                    toast.add({
                        severity: "success",
                        summary: "Deleted",
                        detail: "Role deleted successfully.",
                        life: 3000
                    });

                    await loadRoles();
                } catch (err) {
                    toast.add({
                        severity: "error",
                        summary: "Failed",
                        detail:
                            err.response?.data?.error ??
                            "Failed to delete role.",
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
                <h2>Role Management</h2>
                <small>Manage All User's Roles On My Tenant</small>
                
            </div>

            <Button
                label="Add Role"
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
                    placeholder="Search role..."
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
        <RoleTable
            :roles="roles"
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

    <RoleDialog
        v-model:visible="dialogVisible"
        :mode="dialogMode"
        :form="roleForm"
        :loading="saving"
        :backendError="backendError"
        @save="saveRole"
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