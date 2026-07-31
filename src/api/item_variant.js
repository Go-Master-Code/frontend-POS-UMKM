import api from "./index"

/**
 * GET /item_variants
 * Mengambil daftar seluruh item variants di tenant saya.
 */

export function getItemVariants(params = {}) {
    return api.get("/item_variants", {
        params,
    });
}