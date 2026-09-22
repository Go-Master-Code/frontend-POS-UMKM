import api from "./index"

/*
    GET /expense-categories
    menampilkan semua data expense categories
*/
export function getAllExpenseCategories(params = {}) {
    return api.get("/expense-categories", {
        params,
    });
}