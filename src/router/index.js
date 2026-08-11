import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import LoginView from "@/views/auth/LoginView.vue"
import DashboardView from "@/views/dashboard/DashboardView.vue"

import AuthLayout from '@/layouts/AuthLayout.vue'
import MainLayout from '@/layouts/MainLayout.vue'

// import untuk module bisnis
import UserListView from '@/views/users/UserListView.vue'
import BusinessProfileView from '@/views/settings/BusinessProfileView.vue'
import CatalogCategoryListView from '@/views/catalog_category/CatalogCategoryListView.vue'
import CatalogItemListView from '@/views/catalog_item/CatalogItemListView.vue'

// import untuk kasir POS
import SalesPOSView from '@/views/sales/SalesPOSView.vue'

// membuat instance vue router
const router = createRouter({
    // menggunakan mode history
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            // authentication
            path: '/login',
            component: AuthLayout,

            meta: {
                guestOnly: true,
            },

            children: [
                {
                    path: "",
                    component: LoginView
                }
            ]
        },
        {
            path: '/', // main application
            component: MainLayout,

            meta: {
                requiresAuth: true,
            },

            children: [
                {
                    path: "",
                    component: DashboardView
                },
                {
                    path: "users",
                    component: UserListView,
                    meta: {
                        title: "Users",
                    },
                },
                { // ✅ Business Profile berada di dalam MainLayout
                    path: "settings/business-profile", // berkaitan dengan file config/menu.js, path harus persis sama
                    component: BusinessProfileView,
                    meta: {
                        title: "Business Profile",
                    },
                },
                {
                    path: "catalog_category", // berkaitan dengan file config/menu.js, path harus persis sama
                    component: CatalogCategoryListView,
                    meta: {
                        title: "Catalog Category",
                    },
                },
                {
                    path: "catalog_item", // berkaitan dengan file config/menu.js, path harus persis sama
                    component: CatalogItemListView,
                    meta: {
                        title: "Catalog Item",
                    },
                },
                {
                    path: "/sales", // berkaitan dengan file config/menu.js, path harus persis sama
                    name: "sales",
                    component: SalesPOSView,
                    meta: {
                        requiresAuth: true,
                        title: "Sales",
                    },
                },
                {
                    path: "/catalog/items/:id/variants",
                    name: "catalog-item-variant",
                    component: () =>
                        import("@/views/item_variant/ItemVariantListView.vue"),
                    meta: {
                        requiresAuth: true,
                        title: "Catalog Item Variant",
                    },
                }
            ]
        },
    ],
});

// ==========================================================
// GLOBAL ROUTE GUARD
//
// Semua perpindahan halaman akan melewati sini.
//
// Tugasnya:
//
// 1. Mencegah user yang belum login mengakses halaman private.
// 2. Mencegah user yang sudah login membuka halaman login.
//
// ==========================================================

router.beforeEach((to) => {
    // mengambil auth store
    const authStore = useAuthStore();

    // Halaman yang membutuhkan login
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        return "/login";
    }

     // Halaman yang hanya boleh diakses sebelum login
    if (to.meta.guestOnly && authStore.isAuthenticated) {
        return "/";
    }

    // sudah login, boleh masuk ke halaman tujuan
    return true
})

export default router
