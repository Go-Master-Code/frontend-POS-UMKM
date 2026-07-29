import api from "./index"

/*
|--------------------------------------------------------------------------
| Tenant Service
|--------------------------------------------------------------------------
| Seluruh request yang berkaitan dengan profile tenant.
|--------------------------------------------------------------------------
*/

/**
 * GET /tenant-profile
 * Menampilkan tenant profile secara lengkap sesuai model di backend
 */

export function getTenantProfile() {
    return api.get("/tenant-profile");
}

/*
|--------------------------------------------------------------------------
| Update Business Profile
|--------------------------------------------------------------------------
*/
export function updateTenantProfile(payload) {
    return api.put("/tenant-profile", payload);
}