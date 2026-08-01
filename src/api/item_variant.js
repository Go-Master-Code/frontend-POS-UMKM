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

/**
 * POST /item_variants
 * Menambah item variant dari suatu category item
 */

export function createItemVariant(payload) {
    return api.post("/item_variants", payload);
}