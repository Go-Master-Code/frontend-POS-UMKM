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