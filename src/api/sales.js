import api from "./index"

/**
 * POST /sales
 * Menambah master sales - detil sales - stock_movement
 */

export function createSale(payload) {
    return api.post("/sales", payload);
}

/**
 * GET /sales?payment_status=UNPAID
 * Mengambil daftar transaksi yang belum dibayar.
 */
export function getUnpaidSales(params = {}) {
    return api.get("/sales", {
        params: {
            ...params,
            payment_status: "UNPAID",
        },
    });
}