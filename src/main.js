import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import PrimeVue from 'primevue/config' // mengaktifkan seluruh framework PrimeVue
import Aura from '@primeuix/themes/aura' // memilih tema aura, ada beberapa preset seperti Aura, Lara, Nora, Material

import App from './App.vue'
import router from './router'

import 'primeicons/primeicons.css' // mengaktifkan icon PrimeIcons
import 'primeflex/primeflex.css' // mengaktifkan utility class

import ConfirmationService from "primevue/confirmationservice";
import ToastService from "primevue/toastservice";

import { useAuthStore } from '@/stores/auth'

async function bootstrap() {
    const app = createApp(App);
    const pinia = createPinia();

    app.use(pinia);
    app.use(router);

    // pakai theme primeVue
    app.use(PrimeVue, { // sama seperti router.Use(...) di Gin, artinya seluruh app Vue sekarang menggunakan PrimeVue
        theme: {
            preset: Aura,
        },
    });
    
    app.use(ConfirmationService);
    app.use(ToastService);

    // Restore session jika token masih ada
    const authStore = useAuthStore();

    if (authStore.token) {
        try {
            await authStore.loadUser();
        } catch (err) {
            console.error("Restore session failed.", err);
        }
    }

    app.mount('#app');
}

bootstrap();