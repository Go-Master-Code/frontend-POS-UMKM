<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

import Button from "primevue/button";
import Menu from "primevue/menu";

import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

import { changePassword } from "@/api/users";
import { useToast } from "primevue/usetoast";

import ChangePasswordDialog from "@/components/profile/ChangePasswordDialog.vue";

import { menuItems } from "@/config/menu";
import { findBreadcrumb } from "@/utils/breadcrumb";
import Breadcrumb from "primevue/breadcrumb";

// useconfirm untuk logout
import { useConfirm } from "primevue/useconfirm"

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// toast notification
const toast = useToast();

// change password dialog
const passwordDialogVisible = ref(false);
const passwordSaving = ref(false);
const backendError = ref("");

// const useconfirm
const confirm = useConfirm();

const menu = ref();

// Judul halaman (sementara)
const breadcrumbItems = computed(() => {
    return findBreadcrumb(menuItems, route.path);
})

// Dropdown menu user
const userMenuItems = ref([
    {
        label: "Profile",
        icon: "pi pi-user",
        command: () => router.push("/profile"),
    },
    {
        label: "Change Password",
        icon: "pi pi-key",
        command: () => openChangePassword(),
    },
    {
        separator: true,
    },
    {
        label: "Logout",
        icon: "pi pi-sign-out",
        command: logout,
    },
]);

function toggleUserMenu(event) {
    menu.value.toggle(event);
}

/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
| Menampilkan konfirmasi sebelum menghapus session.
|--------------------------------------------------------------------------
*/
function logout() {
    confirm.require({
        header: "Logout",
        message: "Are you sure you want to end your current session?",
        icon: "pi pi-sign-out",
        rejectLabel: "Cancel",
        rejectClass: "p-button-secondary",
        acceptLabel: "Logout",
        acceptClass: "p-button-danger",
        accept: () => {
            authStore.logout();
            // notifikasi toast
            toast.add({
                severity: "success",
                summary: "Logout",
                detail: "You have been logged out.",
                life: 3000
            });
            router.push("/login");
        }
    });
}

/*
|--------------------------------------------------------------------------
| Open Change Password Dialog
|--------------------------------------------------------------------------
*/
function openChangePassword() {
    backendError.value = "";
    passwordDialogVisible.value = true;
}

/*
|--------------------------------------------------------------------------
| Save New Password
|--------------------------------------------------------------------------
| Dipanggil setelah dialog mengirim data yang sudah lolos validasi.
|--------------------------------------------------------------------------
*/
async function savePassword(form) {
    passwordSaving.value = true;
    try {
        console.log("Change password payload: ", form);
        await changePassword(form);
        backendError.value = "";
        passwordDialogVisible.value = false;
        toast.add({
            severity: "success",
            summary: "Success",
            detail: "Password changed successfully",
            life: 3000
        });
    } catch (err) {
        console.log(err.response);
        console.log(err.response?.data);
        backendError.value =
            err.response?.data?.error ??
            "Failed to change password.";
    } finally {
        passwordSaving.value = false;
    }
}
</script>

<template>
    <header class="topbar">
        <!-- Bagian kiri -->
        <div class="topbar-left">
            <Breadcrumb
                :model="breadcrumbItems"
            >
                <template #item="{ item }">
                    <span>
                        <i
                            v-if="item.icon"
                            :class="item.icon"
                            class="mr-2"
                        />

                        {{ item.label }}
                    </span>
                </template>
            </Breadcrumb>
        </div>

        <!-- Bagian kanan -->
        <div class="topbar-actions">

            <!-- Notification -->
            <Button
                icon="pi pi-bell"
                severity="secondary"
                text
                rounded
            />

            <!-- User Menu -->
            <Button
                icon="pi pi-user"
                severity="secondary"
                text
                rounded
                @click="toggleUserMenu"
            />

            <Menu
                ref="menu"
                :model="userMenuItems"
                popup
            />

        </div>

    </header>

    <!-- Change password dialog -->
     <ChangePasswordDialog
        v-model:visible="passwordDialogVisible"
        :loading="passwordSaving"
        :backend-error="backendError"
        @save="savePassword"
    />

</template>

<style scoped>
.topbar {
    height: 64px;

    padding: 0 24px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    background: white;

    border-bottom: 1px solid #e5e7eb;
}

.topbar-left {
    display: flex;
    align-items: center;
    gap: 12px;
}

.page-title {
    font-size: 22px;
    font-weight: 600;
}

.topbar-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}
</style>