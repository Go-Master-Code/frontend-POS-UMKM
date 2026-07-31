import api from "./index"

/*
|--------------------------------------------------------------------------
| catalog items API
|--------------------------------------------------------------------------
| Berisi seluruh endpoint yang berkaitan dengan data catalog items.
|--------------------------------------------------------------------------
*/

/**
 * GET /catalog_items
 * Mengambil daftar seluruh catalog items di tenant saya.
 */

export function getCatalogItems(params = {}) {
    return api.get("/catalog_items", {
        params,
    });
}

/**
 * GET /catalog_items/id
 * Mengambil data catalog items by id untuk ditampilkan di dialog edit
 */

export function getCatalogItemByID(id) {
    return api.get(`/catalog_items/${id}`);
}

// /**
//  * POST /catalog_items
//  * Membuat catalog item baru.
//  */

export function createCatalogItem(payload) {
    return api.post("/catalog_items", payload);
}

// /**
//  * PUT /catalog_items/:id
//  * Mengubah data catalog item.
//  */

export function updateCatalogItem(id, payload) {
    return api.put(`/catalog_items/${id}`, payload);
}

// /**
//  * DELETE /users/:id
//  * Menghapus catalog item.
//  */

export function deleteCatalogItem(id) {
    return api.delete(`/catalog_items/${id}`);
}

