import api from "./index"

/**
 * POST /sales
 * Menambah master sales - detil sales - stock_movement
 */

export function createSale(payload) {
    return api.post("/sales", payload);
}