<script setup>
    import { ref, onMounted } from "vue";

    import Button from "primevue/button";
    import InputText from "primevue/inputtext";

    import UserTable from "./components/UserTable.vue";

    import { getUsers, getUser, createUser, updateUser, deleteUser } from "@/api/users";
    import { getRoles } from "@/api/roles"

    import { watch } from "vue";
    import { useDebounceFn } from "@vueuse/core";

    import UserDialog from "./components/UserDialog.vue"

    // confirm untuk delete
    import { useConfirm } from "primevue/useconfirm";
    import { useToast } from "primevue/usetoast";
    
    /*
    |--------------------------------------------------------------------------
    | State
    |--------------------------------------------------------------------------
    */

    // Data user
    const users = ref([]);

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

    // id user yang sedang diedit
    const editingUserId = ref(null);

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
    | Form User
    |--------------------------------------------------------------------------
    */
    const userForm = ref(createEmptyUser());

    function createEmptyUser() {
        return {
            full_name: "",
            username: "",
            password: "",
            phone: "",
            role_id: "",
            is_active: true,
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Role Options
    |--------------------------------------------------------------------------
    */
    const roles = ref([]); // sementara diisi kosong dulu

    /**
     * Membuka dialog Add User.
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
        userForm.value = createEmptyUser();
        editingUserId.value = null;
        dialogMode.value = "create";
    }

    /**
     * Search dengan debounce agar tidak request setiap ketikan.
     */
    const debouncedSearch = useDebounceFn(() => {
        page.value = 1;
        loadUsers();
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
    async function loadUsers() {
        if (loading.value) return;
        loading.value = true;

        try {
            const response = await getUsers({
                page: page.value,
                limit: rows.value,
                search: keyword.value,
                sort: sortField.value,
                order: sortOrder.value === 1 ? "asc" : "desc",
            });

            // sesuaikan jika format response backend berbeda
            users.value = response.data.data ?? [];
            totalRecords.value = response.data.meta.total; // ambil meta dari response backend
        } catch (err) {
            console.error(err);
        } finally {
            loading.value = false;
        }

        // log jika diperlukan
        // console.log("users =", users.value);
        // console.log("loading =", loading.value);
        // console.log("totalRecords =", totalRecords.value);
    }

    /**
     * Save User.
     * (sementara hanya console)
     */
    async function saveUser() {
        console.log(dialogMode.value);
        console.log(editingUserId.value);
        console.log(userForm.value);
        saving.value = true;
        try {
            console.log(userForm.value);
            // cek dulu mode dialog create / edit
            if (dialogMode.value === "create") {
                await createUser(userForm.value);
            } else { // jika mode nya update
                await updateUser(
                    editingUserId.value,
                    userForm.value
                );
            }

            backendError.value = ""; // kosongkan error backend
            dialogVisible.value = false;
            resetForm();
            await loadUsers();
        } catch (err) {
            console.log("Error :", err.response?.data);
            backendError.value = err.response?.data?.error ?? "Failed to save data.";
            console.log("Backend error: ", backendError.value)
        } finally {
            saving.value = false;
        }
    }

    /**
     * Mengambil daftar role.
     */
    async function loadRoles() {
        try {
            const response = await getRoles();
            roles.value = response.data.data ?? [];
        } catch (err) {
            console.error(err);
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
        loadUsers();
    }

    // function untuk sort data per kolom
    function handleSort(event) {
        sortField.value = event.sortField;
        sortOrder.value = event.sortOrder;

        page.value = 1; // reset ke page 1 saat sort

        loadUsers(); // load ulang data
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
        loadUsers(); // load user pada saat halaman dimuat
        loadRoles(); // load roles sekali pada saat halaman dimuat
    });

    // 2 function sementara untuk edit dan delete
    async function handleEdit(user) {
        dialogMode.value = "edit";
        editingUserId.value = user.id;
        backendError.value = "";

        try {
            loading.value = true;
            // ambil data terbaru dari backend
            const response = await getUser(user.id);
            // isi form
            Object.assign(userForm.value, response.data.data);
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
    function handleDelete(user) {
        confirm.require({
            header: "Delete User",
            message: `Delete "${user.full_name}"?`,
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
                    await deleteUser(user.id);

                    toast.add({
                        severity: "success",
                        summary: "Deleted",
                        detail: "User deleted successfully.",
                        life: 3000
                    });

                    await loadUsers();
                } catch (err) {
                    toast.add({
                        severity: "error",
                        summary: "Failed",
                        detail:
                            err.response?.data?.error ??
                            "Failed to delete user.",
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
                <h2>User Management</h2>
                <small>Manage All Users On My Tenant</small>
                
            </div>

            <Button
                label="Add User"
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
                    placeholder="Search user..."
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
        <UserTable
            :users="users"
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

    <UserDialog
        v-model:visible="dialogVisible"
        :mode="dialogMode"
        :form="userForm"
        :roles="roles"
        :loading="saving"
        :backendError="backendError"
        @save="saveUser"
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