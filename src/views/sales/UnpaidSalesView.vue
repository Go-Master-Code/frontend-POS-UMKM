<script setup>
    import { onMounted, ref, watch } from 'vue';
    // import method api untuk menampilkan unpaid sales
    import { getUnpaidSales } from '@/api/sales';

    // components
    import Button from 'primevue/button';
    import InputText from "primevue/inputtext";

    // debounce search
    import { useDebounceFn } from '@vueuse/core';

    // import table dan dialog
    import UnpaidSalesTable from './components/UnpaidSalesTable.vue';

    // ============================================================================
    // STATE
    // ============================================================================
    const sales = ref([]);

    const loading = ref(false);
    const error = ref(null);

    const searchKeyword = ref("");

    // pagination
    const page = ref(1);
    const limit = ref(10);
    const totalRecords = ref(0);
    const rows = ref(10);

    // Sort
    const sortField = ref(null);
    const sortOrder = ref(-1);

    // ============================================================================
    // LOAD UNPAID SALES DATA
    // ============================================================================
    async function fetchUnpaidSales() {
        loading.value = true;
        error.value = null;
        
        try {
            const response = await getUnpaidSales({
                page: page.value,
                limit: limit.value,
                search: searchKeyword.value,
                payment_status: "UNPAID",

                sort: sortField.value,
                order: sortOrder.value === 1
                    ? "asc"
                    : "desc",
            });

            sales.value = response.data.data ?? [];
            totalRecords.value = response.data.total ?? 0;

            console.log("UNPAID SALES:", sales.value);
        } catch (err) {
            console.error("Failed to load unpaid sales:",err);

            error.value =
                err.response?.data?.message ||
                "Failed to load unpaid transactions.";

            sales.value = [];
            totalRecords. value = 0;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Search dengan debounce.
     */
    const debouncedSearch = useDebounceFn(() => {
        page.value = 1;

        fetchUnpaidSales();
    }, 400);

    watch(searchKeyword, () => {
        debouncedSearch();
    });

    /**
     * Event pagination dari DataTable.
     */
    function handlePage(event) {
        // PrimeVue page dimulai dari 0
        page.value = event.page + 1;

        // jumlah row
        rows.value = event.rows;

        fetchUnpaidSales();
    }

    /**
     * Event sorting dari DataTable.
     */
    function handleSort(event) {
        console.log("PARENT SORT EVENT:", event);

        sortField.value = event.sortField;
        sortOrder.value = event.sortOrder;

        console.log("SORT FIELD:", sortField.value);
        console.log("SORT ORDER:", sortOrder.value);

        page.value = 1;

        fetchUnpaidSales();
    }

    /**
     * Clear search.
     */
    function clearSearch() {
        page.value = 1;
        searchKeyword.value = "";
    }

    /**
     * Ketika tombol Pay ditekan.
     *
     * Untuk sementara kita log dahulu.
     * Nanti fungsi ini membuka dialog pembayaran.
     */
    function handlePay(sale) {
        console.log("PAY UNPAID SALE:", sale);

        // TODO:
        // buka dialog pembayaran
    }


    /*
    |--------------------------------------------------------------------------
    | Lifecycle
    |--------------------------------------------------------------------------
    */
    onMounted(() => {
        fetchUnpaidSales();
    });
</script>

<template>
    <div class="unpaid-page">
        <!-- HEADER -->
        <div class="page-header">
            <div>
                <h2>Unpaid Transactions</h2>
                <small>Manage and process unpaid transactions</small>
            </div>
        </div>

        <!-- Toolbar -->
        <div class="toolbar">

            <!-- Search -->
            <div class="search-box">
                <i class="pi pi-search search-icon" />

                <InputText
                    v-model="searchKeyword"
                    placeholder="Search invoice or customer..."
                    class="search-input"
                />

                <Button
                    v-if="searchKeyword"
                    icon="pi pi-times"
                    text
                    rounded
                    severity="secondary"
                    class="clear-btn"
                    @click="clearSearch"
                />
            </div>
        </div>

        <!-- Datatable -->
        <UnpaidSalesTable
            :sales="sales"
            :loading="loading"

            :page="page"
            :rows="rows"
            :total-records="totalRecords"

            :sortField="sortField"
            :sortOrder="sortOrder"
            
            @page="handlePage"
            @sort="handleSort"
            @pay="handlePay"
        />
    </div>
</template>

<style scoped>
.page-header{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.toolbar{
    margin-bottom:16px;
}

.search-box{
    position:relative;
    width:320px;
}

.search-input{
    width:100%;
    padding-left:36px;
    padding-right:36px;
}

.search-icon{
    position:absolute;
    left:12px;
    top:50%;
    transform:translateY(-50%);
    color:#9ca3af;
}

.clear-btn{
    position:absolute;
    right:4px;
    top:50%;
    transform:translateY(-50%);
}
</style>