import api from "./index"

/*
|--------------------------------------------------------------------------
| Dashboard API
|--------------------------------------------------------------------------
| Berisi seluruh endpoint yang berkaitan dengan data untuk ditampilkan di dashboard.
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Dashboard API
|--------------------------------------------------------------------------
| Seluruh endpoint user ditempatkan di sini.
|--------------------------------------------------------------------------
*/

/**
 * GET /dashboard/summary
 * Menampilkan data summary seperti today's sales, purchase, low stock item, dll.
 */

export function getDashboardSummary() {
    return api.get("/dashboard/summary");
}

/*
|--------------------------------------------------------------------------
| Daily Sales Chart
|--------------------------------------------------------------------------
*/
export function getDailySalesChart() {
    return api.get("/dashboard/chart/sales");
}

/*
|--------------------------------------------------------------------------
| Daily Expense Chart
|--------------------------------------------------------------------------
*/
export function getDailyExpensesChart() {
    return api.get("/dashboard/chart/expenses");
}

/*
|--------------------------------------------------------------------------
| Daily Purchase Chart
|--------------------------------------------------------------------------
*/
export function getDailyPurchaseChart() {
    return api.get("/dashboard/chart/purchase");
}

/*
|--------------------------------------------------------------------------
| Top Selling Products -> Mengambil 5 produk paling laris
|--------------------------------------------------------------------------
*/
export function getTopSellingProducts() {
    return api.get("/dashboard/chart/top-selling-products");
}

/*
|--------------------------------------------------------------------------
| Low Stock Items
|--------------------------------------------------------------------------
| Mengambil daftar item yang stoknya berada di bawah
| atau sama dengan minimum stock.
|--------------------------------------------------------------------------
*/
export function getLowStockItems() {
    return api.get("/item_variants/low-stock");
}

/*
|--------------------------------------------------------------------------
| Get Recent Sales
|--------------------------------------------------------------------------
| Mengambil daftar sales 5 teratas
|--------------------------------------------------------------------------
*/
export function getRecentSales() {
    return api.get("/dashboard/recent-sales");
}