import api from "./index";

// generate sales report pdf
export function generateSalesReportPDF(params = {}) {
    return api.get("/reports/sales/pdf", {
        params: {
            start_date: params.start_date,
            end_date: params.end_date,
        },
        responseType: "blob",
    });
}

// generate expense report pdf
export function generateExpenseReportPDF(params = {}) {
    return api.get("/reports/expenses/pdf", {
        params: {
            start_date: params.start_date,
            end_date: params.end_date,
        },
        responseType: "blob",
    });
}

// generate stock report pdf
export function generateStockReportPDF(params = {}) {
    return api.get("/reports/stock/pdf", {
        params,
        responseType: "blob",
    });
}