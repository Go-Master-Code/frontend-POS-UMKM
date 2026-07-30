import api from "./index"

/*
|--------------------------------------------------------------------------
| catalog category API
|--------------------------------------------------------------------------
| Berisi seluruh endpoint yang berkaitan dengan data catalog category.
|--------------------------------------------------------------------------
*/

    // rg.GET("/catalog_categories", h.GetCatalogCategories)
	// rg.GET("/catalog_categories/:id", h.GetCatalogCategoryByID)
	// rg.POST("/catalog_categories/", middleware.AuthRole(constants.RoleOwner, constants.RoleAdmin), h.CreateCatalogCategory)
	// rg.PUT("/catalog_categories/:id", middleware.AuthRole(constants.RoleOwner, constants.RoleAdmin), h.UpdateCatalogCategory)
	// rg.DELETE("/catalog_categories/:id", h.DeleteCatalogCategory)

/**
 * GET /catalog_categories
 * Mengambil daftar seluruh catalog category di tenant saya.
 */

export function getCatalogCategory(params = {}) {
    return api.get("/catalog_categories", {
        params,
    });
}

/**
 * GET /catalog_categories/id
 * Mengambil data catalog category by id untuk ditampilkan di dialog edit
 */

export function getCatalogCategoryByID(id) {
    return api.get(`/catalog_categories/${id}`);
}

// /**
//  * POST /catalog_categories
//  * Membuat catalog category baru.
//  */

export function createCatalogCategory(payload) {
    return api.post("/catalog_categories", payload);
}

// /**
//  * PUT /catalog_categories/:id
//  * Mengubah data catalog category.
//  */

export function updateCatalogCategory(id, payload) {
    return api.put(`/catalog_categories/${id}`, payload);
}

// /**
//  * DELETE /users/:id
//  * Menghapus catalog category.
//  */

export function deleteCatalogCategory(id) {
    return api.delete(`/catalog_categories/${id}`);
}

