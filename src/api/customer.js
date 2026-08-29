import api from "./index"

/*
|--------------------------------------------------------------------------
| customer API
|--------------------------------------------------------------------------
| Berisi seluruh endpoint yang berkaitan dengan data customer.
|--------------------------------------------------------------------------
*/

/**
 * GET /customers
 * Mengambil daftar seluruh customers di tenant saya.
 */

export function getCustomers(params = {}) {
    return api.get("/customers", {
        params,
    });
}

/**
 * GET /customers/id
 * Mengambil data customers by id untuk ditampilkan di dialog edit
 */

export function getCustomerByID(id) {
    return api.get(`/customers/${id}`);
}

/**
* POST /customers
* Membuat customer baru.
*/

export function createCustomer(payload) {
    return api.post("/customers", payload);
}

// /**
//  * PUT /customers/:id
//  * Mengubah data customer.
//  */

export function updateCustomer(id, payload) {
    return api.put(`/customers/${id}`, payload);
}

// /**
//  * DELETE /customers/:id
//  * Menghapus customer.
//  */

export function deleteCustomer(id) {
    return api.delete(`/customers/${id}`);
}