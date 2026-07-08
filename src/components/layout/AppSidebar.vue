<script setup>
    import { useRouter } from "vue-router"; 
    import { useAuthStore } from "@/stores/auth"; 
    import AppMenu from "@/components/layout/menu/AppMenu.vue";

    const authStore = useAuthStore();
    const router = useRouter();

    // convertMenu() akan mengubah struktur tersebut menjadi format yang dipahami oleh PanelMenu
    function convertMenu(item) {
        return { // mengembalikan objek baru dengan format yang diinginkan oleh PrimeVue
            label: item.label, // salin label
            icon: item.icon, // salin icon

            command: item.route
                ? () => router.push(item.route) // contoh command route = "/users" berarti menjadi router.push("/users")
                : undefined, // Kalau menu tidak memiliki route command = undefined
            items: item.items?.map(convertMenu), // fungsi recursive, misal master data memiliki beberapa child menu
            /*
                Contoh:
                    Master Data
                        - Items
                        - Users
            */
        }
    }
</script>

<template>
    <aside class="sidebar" >

        <div class="sidebar-header">
            <div class="app-name">
                POS UMKM
            </div>
            <div class="tenant-name">
                {{ authStore.user?.tenant_name }}
            </div>
        </div>

        <div class="user-card">
            <div class="avatar">
                <i class="pi pi-user"></i>
            </div>
            <div>
                <div class="user-name">
                    {{ authStore.user?.full_name }}
                </div>
                <div class="user-role">
                    {{ authStore.user?.role }}
                </div>
            </div>
        </div>
        <AppMenu />
    </aside>
</template>

<style scoped>
.sidebar{
    width:260px;
    height:100vh;

    display:flex;
    flex-direction:column;

    background:#fff;

    border-right:1px solid #e5e7eb;

    transition:width .25s ease;

    overflow:hidden;
}
.sidebar-header{
    padding: 20px;
    border-bottom: 1px solid #e5e7eb;
}
.app-name{
    font-size: 22px;
    font-weight: 700;
    color: #2563eb;
}
.tenant-name{
    margin-top: 4px;
    color: #6b7280;
    font-size: 14px;
}
.logo {
    padding: 20px;

    font-size: 22px;
    font-weight: bold;

    text-align: center;
    border-bottom: 1px solid #ddd;
}
.user-card{
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-bottom: 1px solid #e5e7eb;
}
.avatar{
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: #2563eb;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
}
.user-name{
    font-weight: 600;
}
.user-role{
    font-size: 13px;
    color: #6b7280;
}
</style>