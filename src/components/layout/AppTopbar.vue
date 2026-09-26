<script setup>
import { computed, ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import Button from "primevue/button";
import Menu from "primevue/menu";

import { useAuthStore } from "@/stores/auth";
// useconfirm untuk logout
import { useConfirm } from "primevue/useconfirm"

import { changePassword } from "@/api/users";
import { useToast } from "primevue/usetoast";

import ChangePasswordDialog from "@/components/profile/ChangePasswordDialog.vue";

import { menuItems } from "@/config/menu";
import { findBreadcrumb } from "@/utils/breadcrumb";
import Breadcrumb from "primevue/breadcrumb";

// import untuk breadcrumb
import { getCatalogItemByID } from "@/api/catalog_items";

// import AppMenu untuk navigator menu di mobile mode
import AppMenu from "./menu/AppMenu.vue";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// toast notification
const toast = useToast();

// state untuk menu navigator mobile
const mobileMenuVisible = ref(false);

// change password dialog
const passwordDialogVisible = ref(false);
const passwordSaving = ref(false);
const backendError = ref("");

// const useconfirm
const confirm = useConfirm();

const menu = ref();

// state nama item untuk breadcrumb item variant
const catalogItemName = ref("");

// ============================================================
// Breadcrumb
// ============================================================
const breadcrumbItems = computed(() => {

    if (route.name === "catalog-item-variant") {

        const masterData = menuItems.find(
            item => item.key === "master"
        );

        const itemsMenu = masterData?.items?.find(
            item => item.key === "items"
        );

        return [ // ambil label dan icon dari menu.js
            {
                label: masterData?.label || "Master Data",
                icon: masterData?.icon,
            },
            {
                label: itemsMenu?.label || "Items",
                icon: itemsMenu?.icon,
            },
            {
                label: catalogItemName.value || "Catalog Item",
                icon: "pi pi-tag", // tentukan sendiri iconnya
            },
            {
                label: "Variants",
                icon: "pi pi-sliders-h",
            },
        ];
    }

    return findBreadcrumb(menuItems, route.path);
});

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

// function toggle menu navigator mobile
function toggleMobileMenu() {
    mobileMenuVisible.value = !mobileMenuVisible.value;
}

function closeMobileMenu() {
    mobileMenuVisible.value = false;
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

// function untuk mengambil nama catalog item untuk ditampilkan di breadcrumb
async function loadCatalogItemName() {
    // Hanya diperlukan pada halaman Item Variant
    if (route.name !== "catalog-item-variant") {
        catalogItemName.value = "";
        return;
    }

    const catalogItemID = route.params.id;

    if (!catalogItemID) {
        catalogItemName.value = "";
        return;
    }

    try {
        const response = await getCatalogItemByID(catalogItemID);
        // console.log("Catalog Item Response:", response.data);
        catalogItemName.value = response.data.data.name;
    } catch (err) {
        console.error("Failed to load catalog item:", err);
        catalogItemName.value = "Catalog Item";
    }
}

onMounted(() => {
    loadCatalogItemName();
});

watch(
    () => route.params.id,
    () => {
        loadCatalogItemName();
    }
);

// watcher untuk mobile mode
watch(
    () => route.path,
    () => {
        closeMobileMenu(); // tutup menu ketika navigasi terjadi
    }
);
</script>

<template>
    <header class="topbar">
        <!-- Bagian kiri -->
        <div class="topbar-left">
            <!-- Mobile menu button -->
            <Button
                class="mobile-menu-button"
                icon="pi pi-bars"
                severity="secondary"
                text
                rounded
                aria-label="Open menu"
                @click="toggleMobileMenu"
            />

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

    <!-- Menu drawer untuk mobile version -->
    <div
        v-if="mobileMenuVisible"
        class="mobile-menu-overlay"
        @click.self="closeMobileMenu"
    >
        <aside class="mobile-menu-drawer">

            <div class="mobile-menu-header">
                <div>
                    <div class="mobile-app-name">
                        POS UMKM
                    </div>

                    <div class="mobile-tenant-name">
                        {{ authStore.user?.tenant_name }}
                    </div>
                </div>

                <Button
                    icon="pi pi-times"
                    severity="secondary"
                    text
                    rounded
                    aria-label="Close menu"
                    @click="closeMobileMenu"
                />
            </div>

            <AppMenu />

        </aside>
    </div>

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

/*CSS mobile menu drawer and navigator*/
.mobile-menu-button {
    display: none;
}

.mobile-menu-overlay {
    display: none;
}

@media (max-width: 900px) {
    .topbar {
        height: 56px;
        padding: 0 12px;
    }

    .mobile-menu-button {
        display: inline-flex;
    }

    .mobile-menu-overlay {
        position: fixed;
        inset: 0;
        z-index: 3000;

        display: flex;

        background: rgba(0, 0, 0, 0.35);
    }

    .mobile-menu-drawer {
        width: min(280px, 85vw);
        height: 100%;
        display: flex;
        flex-direction: column;

        background: #ffffff;

        box-shadow: 4px 0 16px rgba(0, 0, 0, 0.12);
    }

    .mobile-menu-header {
        flex-shrink: 0;

        display: flex;
        align-items: center;
        justify-content: space-between;

        padding: 16px;

        border-bottom: 1px solid #e5e7eb;
    }

    .mobile-app-name {
        font-size: 20px;
        font-weight: 700;
        color: #2563eb;
    }

    .mobile-tenant-name {
        margin-top: 3px;
        font-size: 13px;
        color: #6b7280;
    }

    .mobile-menu-drawer :deep(.app-menu) {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
    }
}
</style>