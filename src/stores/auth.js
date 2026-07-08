import { defineStore } from "pinia";

import * as authApi from "@/api/auth";
import * as userApi from "@/api/users";

import { saveToken, getToken, removeToken } from "@/utils/token";

/*
|--------------------------------------------------------------------------
| Auth Store
|--------------------------------------------------------------------------
|
| Store ini bertanggung jawab terhadap seluruh proses autentikasi.
|
| Tanggung jawabnya meliputi:
|
| - Login
| - Logout
| - Restore Session
| - Menyimpan data user yang sedang login
|
| Store ini TIDAK bertugas melakukan request HTTP secara langsung.
| Request dilakukan oleh folder api/.
|
|--------------------------------------------------------------------------
*/

// pinia = state management
export const useAuthStore = defineStore("auth", {
    // State adalah data global yang dapat diakses oleh seluruh aplikasi.
    state: () => ({ // store memiliki 3 data utama
        token: getToken(), // saat aplikasi pertama dibuka, token akan langsung diambil dari LocalStorage.
        user: null, // Berisi informasi user yang sedang login.
        loading: false,
    }),

    getters: { // Mengecek apakah user sudah login.
        isAuthenticated: (state) => !!state.token, // jika token ada => true, token kosong => false
    },

    actions: { // Berisi seluruh business logic.
        async login(username, password) {
            this.loading = true;

            try {
                const response = await authApi.login(username, password); // memanggil backend

                const data = response.data
                this.token = data.token; // simpan token
                this.user = response.data.data; // ambil semua response json data

                saveToken(this.token) // simpan doken
            } catch (err) {
                this.logout(); // supaya token lama terhapus
                throw err;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Mengambil profile user berdasarkan JWT
         * Dipanggil saat aplikasi pertama kali dibuka.
         */
        async loadUser() {
            try {
                const response = await userApi.getProfile();
                this.user = response.data.data
            } catch (err) {
                this.logout();
                throw err;
            }
        },

        /*
        |--------------------------------------------------------------------------
        | Logout
        |--------------------------------------------------------------------------
        | Menghapus seluruh session login dari memory dan LocalStorage.
        |--------------------------------------------------------------------------
        */
        logout() {
            // remove token dan data user
            this.token = null;
            this.user = null;
            removeToken();
        },
    },
});

/* ALUR LOGIN KESELURUHAN
    LoginView
        ↓
    auth.js
        ↓
    POST /login
        ↓
    Backend Go
        ↓
    Response
    {
        user,
        token
    }
        ↓
authStore.setAuth()
        ↓
       Pinia
        ↓
    LocalStorage
        ↓
    Dashboard
*/