import axios from "axios";

// membuat instance axios global
const api = axios.create({
    // ambil URL backend dari file .env
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000, // request timeout 10 detik
});

// interceptor akan dieksekusi sebelum request dikirim
api.interceptors.request.use((config) => {
    // ambil token JWT dari local storage
    const token = localStorage.getItem("token");

    // jika token ada
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; // tambahkan authorization header
    }

    return config;
});

// export agar dapat digunakan di seluruh aplikasi
export default api;