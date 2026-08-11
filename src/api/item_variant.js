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
 * GET /item_variants/id
 * Mengambil data item variant by id untuk ditampilkan di dialog edit
 */

export function getItemVariantByID(id) {
    return api.get(`/item_variants/${id}`);
}

/**
 * POST /item_variants
 * Menambah item variant dari suatu category item
 */

export function createItemVariant(payload) {
    return api.post("/item_variants", payload);
}

/**
 * DELETE /item_variants/:id
 * Menghapus item variant dari suatu category item
 */

export function deleteItemVariant(id) {
    return api.delete(`/item_variants/${id}`);
}

// /**
//  * PUT /item_variants/:id
//  * Mengubah data item variant.
//  */

export function updateItemVariant(id, payload) {
    return api.put(`/item_variants/${id}`, payload);
}
