import api from "./index"

/**
 * POST /expenses
 * Menambah master expense - detil expense
 */
export function createExpense(payload) {
    return api.post("/expenses", payload);
}

/*
    GET /expenses
    menampilkan semua data expenses
*/
export function getAllExpenses(params = {}) {
    return api.get("/expenses", {
        params,
    });
}

/*
    GET /expenses/id
    Mengambil detail expenses berdasarkan ID
*/
export function getExpenseByID(expenseID) {
    return api.get(`/expenses/${expenseID}`);
}