import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import LoginView from "@/views/auth/LoginView.vue"
import DashboardView from "@/views/dashboard/DashboardView.vue"

import AuthLayout from '@/layouts/AuthLayout.vue'
import MainLayout from '@/layouts/MainLayout.vue'

// import untuk module bisnis
import UserListView from '@/views/users/UserListView.vue'

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
