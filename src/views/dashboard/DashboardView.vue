<script setup>
    import { onMounted, ref } from "vue";
    import { getDashboardSummary } from "@/api/dashboard";

    import DashboardCard from '@/components/dashboard/DashboardCard.vue';

    // import API dan component Sales Chart
    import { getDailySalesChart } from "@/api/dashboard";
    import SalesChart from "@/components/dashboard/SalesChart.vue";

    // import API dan component Purchase Chart
    import { getDailyPurchaseChart } from "@/api/dashboard";
    import PurchaseChart from "@/components/dashboard/PurchaseChart.vue";

    // import API TopSellingProducts dan component
    import { getTopSellingProducts } from "@/api/dashboard";
    import TopSellingWidget from "@/components/dashboard/TopSellingWidget.vue"; 

    // import API Low Stock Items dan component
    import { getLowStockItems } from "@/api/dashboard";
    import LowStockItemsWidget from "@/components/dashboard/LowStockItemsWidget.vue";

    // import API recent sales dan component
    import { getRecentSales } from "@/api/dashboard";
    import RecentSalesWidget from "@/components/dashboard/RecentSalesWidget.vue";

    // import dateFormatter untuk x axis di chart
    import { formatShortDate } from "@/utils/dateFormatter";

    // import primevue Button
    import Button from "primevue/button"

    // import computed untuk format date lastUpdated
    import { computed } from "vue"

    /*
    |--------------------------------------------------------------------------
    | Dashboard Summary
    |--------------------------------------------------------------------------
    | Menyimpan seluruh data summary dashboard.
    |--------------------------------------------------------------------------
    */

    const dashboard = ref({
        salesToday: 0,
        purchaseToday: 0,
        profitToday: 0,
        totalProducts: 0,
        totalVariants: 0,
        lowStock: 0
    });

    /*
    |--------------------------------------------------------------------------
    | Loading States untuk tiap widget terpisah
    |--------------------------------------------------------------------------
    */

    const loadingSummary = ref(false);
    const loadingSalesChart = ref(false);
    const loadingPurchaseChart = ref(false);
    const loadingTopSelling = ref(false);
    const loadingLowStock = ref(false);
    const loadingRecentSales = ref(false);

    // state untuk refresh button
    const refreshing = ref(false); // false karena tipenya Boolean

    // state untuk last update
    const lastUpdated = ref(null); // null karena tipenya object, belum ada nilainya

    // warna card
    // penggunaan const cardColors pada tiap <DashboardCard> harus pakai properti :
    // contoh:
    // :iconColor="cardColors.sales.color"
    // bukan iconColor="cardColors.sales.color"
    const cardColors = {
        sales: {
            bg: "#DCFCE7",
            color: "#16A34A"
        },
        purchase: {
            bg: "#DBEAFE",
            color: "#2563EB"
        },
        profit: {
            bg: "#FEF3C7",
            color: "#D97706"
        },
        product: {
            bg: "#F3E8FF",
            color: "#7C3AED"
        },
        variant: {
            bg: "#E0F2FE",
            color: "#0284C7"
        },
        lowStock: {
            bg: "#FEE2E2",
            color: "#DC2626"
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Sales Chart State
    |--------------------------------------------------------------------------
    */
    const salesLabels = ref([]);
    const salesValues = ref([]);

    /*
    |--------------------------------------------------------------------------
    | Purchase Chart State
    |--------------------------------------------------------------------------
    */
    const purchaseLabels = ref([]);
    const purchaseValues = ref([]);

    /*
    |--------------------------------------------------------------------------
    | Top Selling Products, Low Stock Items state, recent 5 sales
    |--------------------------------------------------------------------------
    */
    const topSellingProducts = ref([]);
    const lowStockItems = ref([]);
    const recentSales = ref([]);

    /*
    |--------------------------------------------------------------------------
    | Format date and time lastUpdated at
    |--------------------------------------------------------------------------
    */
    const formattedLastUpdated = computed(() => {
        if (!lastUpdated.value) return "-";
        return lastUpdated.value.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Load Dashboard Summary
    |--------------------------------------------------------------------------
    | Mengambil data summary dari backend.
    |--------------------------------------------------------------------------
    */
    async function loadSummary() {
        loadingSummary.value = true;

        try {
            const response = await getDashboardSummary();
            // DEVELOPMENT ONLY
            // await new Promise(resolve => setTimeout(resolve, 2000));

            const data = response.data.data;

            dashboard.value = {
                salesToday: data.today_sales,
                purchaseToday: data.today_purchase,
                totalProducts: data.total_items,
                totalVariants: data.total_variants,
                lowStock: data.low_stock_count,
                profitToday: data.today_profit // review lagi nanti soal profit
            };
        } catch (err) {
            console.error(err);
        } finally {
            loadingSummary.value=false;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Load Sales Chart
    |--------------------------------------------------------------------------
    | Mengambil data chart dari backend.
    |--------------------------------------------------------------------------
    */
    async function loadSalesChart() {
        loadingSalesChart.value = true;

        try {
            const response = await getDailySalesChart();
            // DEVELOPMENT ONLY
            // await new Promise(resolve => setTimeout(resolve, 2000));

            // Pastikan rows selalu berupa array
            const rows = Array.isArray(response.data.data)
                ? response.data.data
                : []; // jika null, definisikan sebagai empty array

            /*Label X Axis*/
            salesLabels.value = rows.map(item => formatShortDate(item.date));

            /*Nilai Y Axis*/
            salesValues.value = rows.map(item => item.total_sales);
        } catch(err) {
            console.error(err);
        } finally {
            loadingSalesChart.value=false;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Load Purchase Chart
    |--------------------------------------------------------------------------
    | Mengambil data chart dari backend.
    |--------------------------------------------------------------------------
    */
    async function loadPurchaseChart() {
        loadingPurchaseChart.value = true;

        try {
            const response = await getDailyPurchaseChart();
            // DEVELOPMENT ONLY
            // await new Promise(resolve => setTimeout(resolve, 2000));
            
            // const rows = response.data.data;
            // Pastikan rows selalu berupa array
            const rows = Array.isArray(response.data.data)
                ? response.data.data
                : []; // jika null, definisikan sebagai empty array

            /*Label X Axis*/
            purchaseLabels.value = rows.map(item => formatShortDate(item.date));

            /*Nilai Y Axis*/
            purchaseValues.value = rows.map(item => item.total_purchase);
        } catch(err) {
            console.error(err);
        } finally {
            loadingPurchaseChart.value=false;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Load Top Selling Products
    |--------------------------------------------------------------------------
    | Mengambil data dari backend kemudian disimpan di state
    |--------------------------------------------------------------------------
    */
    async function loadTopSellingProducts() {
        loadingTopSelling.value = true;

        try {
            const response = await getTopSellingProducts();
            // DEVELOPMENT ONLY
            //await new Promise(resolve => setTimeout(resolve, 2000));
            
            topSellingProducts.value = response.data.data;
        } catch(err) {
            console.error("Failed to load top selling products", err);
        } finally {
            loadingTopSelling.value=false;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Load Low Stock Items
    |--------------------------------------------------------------------------
    | Mengambil data dari backend kemudian disimpan di state
    |--------------------------------------------------------------------------
    */
    async function loadLowStockItems() {
        loadingLowStock.value = true;

        try {
            const response = await getLowStockItems();
            // DEVELOPMENT ONLY
            //await new Promise(resolve => setTimeout(resolve, 2000));
            
            lowStockItems.value = response.data.data;
        } catch(err) {
            console.error("Failed to load low stock items", err);
        } finally {
            loadingLowStock.value=false;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Recent Sales
    |--------------------------------------------------------------------------
    | Mengambil data dari backend kemudian disimpan di state
    |--------------------------------------------------------------------------
    */
    async function loadRecentSales() {
        loadingRecentSales.value = true;

        try {
            const response = await getRecentSales();
            // DEVELOPMENT ONLY
            //await new Promise(resolve => setTimeout(resolve, 2000));
            
            recentSales.value = response.data.data;
        } catch(err) {
            console.error("Failed to load recent sales", err);
        } finally {
            loadingRecentSales.value=false;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Function untuk Refresh Button
    |--------------------------------------------------------------------------
    | Daripada mengulang pemanggilan API, buat 1 fungsi pusat
    |--------------------------------------------------------------------------
    */
    async function refreshDashboard() {
        refreshing.value = true;

        try {
            await Promise.all([
                loadSummary(),
                loadSalesChart(),
                loadPurchaseChart(),
                loadTopSellingProducts(),
                loadLowStockItems(),
                loadRecentSales()
            ]);

            // simpan waktu last update
            // diletakkan setelah Promise.all karena mau waktu lastUpdated ketika seluruh dashboard selesai ditampilkan
            lastUpdated.value = new Date();

        } finally {
            refreshing.value = false;
        }
    } 

    // load data saat halaman dibuka
    onMounted(async()=>{
        // loading.value = true;
        try {
            await refreshDashboard();
        }
        finally {
            // seluruh request selesai
            loadingLowStock.value = false;
            loadingPurchaseChart.value = false;
            loadingRecentSales.value = false;
            loadingSalesChart.value = false;
            loadingSummary.value = false;
            loadingTopSelling.value = false;
        }
    });
</script>

<template>
    <div class="dashboard-page">
        <div class="dashboard-header">
            <!-- Judul -->
            <h2 class="page-title">
                Dashboard
            </h2>

            <div class="last-updated">
                <i class="pi pi-clock"></i> Last updated at: {{ formattedLastUpdated }}
            </div>

            <!-- Refresh Button -->
            <Button
                :label="refreshing ? 'Refreshing...' : 'Refresh'"
                icon="pi pi-refresh"
                severity="secondary"
                outlined
                :loading="refreshing"
                @click="refreshDashboard"
            />
        </div>
        <!-- Card Summary -->

        <div class="summary-grid">
            <!-- Semua properti diambil dari DashboardCard.vue -->

            <!-- Sales Today -->
            <DashboardCard
                title="Sales Today"
                :loading="loadingSummary"
                :value="dashboard.salesToday"
                format="currency"
                icon="pi pi-shopping-cart"
                :iconBg="cardColors.sales.bg"
                :iconColor="cardColors.sales.color"
            />
            <!-- Purchase Today -->
            <DashboardCard
                title="Purchase Today"
                :loading="loadingSummary"
                :value="dashboard.purchaseToday"
                format="currency"
                icon="pi pi-box"
                :iconBg="cardColors.purchase.bg"
                :iconColor="cardColors.purchase.color"
            />
            <!-- Profit Today -->
            <DashboardCard
                title="Profit Today"
                :loading="loadingSummary"
                :value="dashboard.profitToday"
                format="currency"
                icon="pi pi-wallet"
                :iconBg="cardColors.profit.bg"
                :iconColor="cardColors.profit.color"
            />
            <!-- Total Product -->
            <DashboardCard
                title="Total Product"
                :loading="loadingSummary"
                :value="dashboard.totalProducts"
                format="number"
                icon="pi pi-tags"
                :iconBg="cardColors.product.bg"
                :iconColor="cardColors.product.color"
            />
            <!-- Total Variant -->
            <DashboardCard
                title="Total Variant"
                :loading="loadingSummary"
                :value="dashboard.totalVariants"
                format="number"
                icon="pi pi-sitemap"
                :iconBg="cardColors.variant.bg"
                :iconColor="cardColors.variant.color"
            />
            <!-- Low Stock -->
            <DashboardCard
                title="Low Stock"
                :loading="loadingSummary"
                :value="dashboard.lowStock"
                format="number"
                icon="pi pi-exclamation-triangle"
                :iconBg="cardColors.lowStock.bg"
                :iconColor="cardColors.lowStock.color"
            />
        </div>

        <!-- Sales & Purchase Charts -->
        <div class="chart-grid">
            <!-- Sales Chart -->
            <SalesChart
                :labels="salesLabels"
                :values="salesValues"
                :loading="loadingSalesChart"
            />
           
            <PurchaseChart
                :labels="purchaseLabels"
                :values="purchaseValues"
                :loading="loadingPurchaseChart"
            />
        </div>

        <!-- Top Selling Products Widget -->
        <div class="bottom-grid">
            <TopSellingWidget
                :items="topSellingProducts"
                :loading="loadingTopSelling"
            />
            <LowStockItemsWidget
                :items="lowStockItems"
                :loading="loadingLowStock"
            />
        </div>

        <div class="recent-sales-transaction">
            <RecentSalesWidget
                :items="recentSales"
                :loading="loadingRecentSales"
            />
        </div>
    </div>
</template>

<style scoped>

.dashboard-page{
    padding:24px;
}

.page-title{
    margin-bottom:24px;
    font-size:1.8rem;
    font-weight:700;
}

.summary-grid{
    display:grid;
    gap:20px;
    /* Desktop default */
    grid-template-columns:repeat(3,1fr);
}

/* Tablet */
@media (max-width:1200px){
    .summary-grid{
        grid-template-columns:repeat(2,1fr);
    }
}

/* Mobile */
@media (max-width:768px){
    .summary-grid{
        grid-template-columns:1fr;
    }
}

.chart-grid{
    margin-top:24px;
}

.bottom-grid{
    display:grid;
    grid-template-columns:repeat(2,minmax(0,1fr));
    gap:20px;
    margin-top:24px;
}

/* Responsive */
@media(max-width:992px){
    .bottom-grid{
        grid-template-columns:1fr;
    }
}

.recent-sales-section{
    margin-top:24px;
}

/* =====================================
        Chart Layout
===================================== */

.chart-grid{
    display:grid;
    grid-template-columns:repeat(2, minmax(0, 1fr));
    gap:20px;
    margin-top:24px;
}

/* =====================================
        Responsive
===================================== */

@media (max-width:992px){
    .chart-grid{
        grid-template-columns:1fr;
    }
}

.dashboard-header{
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-bottom:24px;
}

.page-title{
    margin:0;
    font-size:1.8rem;
    font-weight:700;
}
</style>