import api from "./index";

/*
|--------------------------------------------------------------------------
| Authentication API
|--------------------------------------------------------------------------
| Berisi endpoint yang berkaitan dengan proses autentikasi.
|--------------------------------------------------------------------------
*/

/**
 * Login
 *
 * POST /auth/login
 */

export function login(username, password) {
    return api.post("/login", {
        username,
        password,
    });
}