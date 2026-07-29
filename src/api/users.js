import api from "./index"

/*
|--------------------------------------------------------------------------
| User API
|--------------------------------------------------------------------------
| Berisi seluruh endpoint yang berkaitan dengan data user.
| Jangan masukkan login/logout ke sini.
|--------------------------------------------------------------------------
*/

/**
 * GET /users
 * Mengambil daftar seluruh user di tenant saya.
 */

export function getUsers(params = {}) {
    return api.get("/tenant-users", {
        params,
    });
}

/**
 * GET /users/:id
 * Mengambil detail user.
 */

export function getUser(id) {
    return api.get(`/users/${id}`);
}

/**
 * POST /users
 * Membuat user baru.
 */

export function createUser(payload) {
    return api.post("/users", payload);
}

/**
 * PUT /users/:id
 * Mengubah data user.
 */

export function updateUser(id, payload) {
    return api.put(`/users/${id}`, payload);
}

/**
 * DELETE /users/:id
 * Menghapus user.
 */

export function deleteUser(id) {
    return api.delete(`/users/${id}`);
}

/**
 * DELETE /users/change-password
 * Change password.
 */

export function changePassword(data) {
    return api.post("/users/change-password", data);
}

/**
 * Mengambil profile user yang sedang login.
 *
 * Endpoint:
 * GET /users/me
 *
 * Authorization Header akan otomatis ditambahkan
 * oleh Axios Request Interceptor.
 */
export function getProfile() {
    return api.get("/users/me");
}

