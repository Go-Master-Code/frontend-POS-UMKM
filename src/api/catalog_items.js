import api from "./index"

/*
|--------------------------------------------------------------------------
| catalog items API
|--------------------------------------------------------------------------
| Berisi seluruh endpoint yang berkaitan dengan data catalog items.
|--------------------------------------------------------------------------
*/

    // rg.GET("/catalog_items", h.GetCatalogItems)
	// rg.GET("/catalog_items/:id", h.GetCatalogItemByID)
	// rg.POST("/catalog_items", middleware.AuthRole(constants.RoleOwner, constants.RoleAdmin), h.CreateCatalogItem)
	// rg.PUT("/catalog_items/:id", middleware.AuthRole(constants.RoleOwner, constants.RoleAdmin), h.UpdateCatalogItem)
	// rg.DELETE("/catalog_items/:id", h.DeleteCatalogItem)

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

