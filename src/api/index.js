import axios from "axios";
import { getToken } from "@/utils/token";

// membuat satu instance axios
// semua request API di project menggunakan object ini.
const api = axios.create({
    // alamat backend
    baseURL: "http://localhost:8080/api",
    timeout: 10000, // timeout maksimal request
});

// ==========================================================
// REQUEST INTERCEPTOR
//
// Fungsi ini dijalankan SEBELUM request dikirim ke backend.
//
// Alur:
//
// View
//    ↓
// authApi
//    ↓
// Axios Interceptor
//    ↓
// Backend
//
// Di sinilah kita otomatis menambahkan JWT.
// ==========================================================
api.interceptors.request.use(
    (config) => {
        // ambil token dari localStorage
        const token = getToken();
        // kalau user sudah login
        if (token) {
            // tambahkan Authorization Header
            config.headers.Authorization = `Bearer ${token}`;
        }
        // lanjutkan request
        return config;
    },
    (error) => Promise.reject(error) // kalau terjadi error sebelum request dikirim
);

// ==========================================================
// RESPONSE INTERCEPTOR
//
// Berjalan SETELAH backend memberikan response.
//
// Sangat berguna untuk:
//
// - token expired
// - refresh token
// - global error handler
// =========================================================
api.interceptors.response.use(
    (response) => response, // response normal
    (error) => { // response error
        if (error.response?.status === 401) { // JWT tidak valid
            localStorage.removeItem("access_token"); // hapus token
            window.location.href = "/login"; // paksa kembali ke login
        }
        return Promise.reject(error)
    }
);

export default api;