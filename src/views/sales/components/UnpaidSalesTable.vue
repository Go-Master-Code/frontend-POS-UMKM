<script setup>
    import DataTable from "primevue/datatable";
    import Column from "primevue/column";
    import Button from "primevue/button";

    /*
    |--------------------------------------------------------------------------
    | Props
    |--------------------------------------------------------------------------
    */
    defineProps({
        // data sales
        sales: {
            type: Array,
            default: () => [],
        },
        // loading state
        loading: {
            type: Boolean,
            default: false,
        },
        // halaman aktif (1-based)
        page: {
            type: Number,
            default: 1,
        },
        // jumlah row per halaman
        rows: {
            type: Number,
            default: 10,
        },
        // total seluruh data
        totalRecords: {
            type: Number,
            default: 0,
        },
        // field yang sedang di sort
        sortField: {
            type: String,
            default: "created_at",
        },
        // 1 = asc, -1 = desc (format primevue)
        sortOrder: {
            type: Number,
            default: -1,
        },
    });

    /*
    |--------------------------------------------------------------------------
    | Emit
    |--------------------------------------------------------------------------
    */

    const emit = defineEmits([
        "page",
        "sort",
        "pay",
    ]);

    /**
     * Meneruskan event sort ke parent.
     */
    function handleSort(event) {
        console.log("TABLE SORT EVENT:", event);

        emit("sort", event);
    }

    function handlePage(event) {
    emit("page", event);
}

    /**
     * Meneruskan transaksi yang akan dibayar ke parent.
     */
    function handlePay(sale) {
        emit ("pay", sale);
    }

    // ============================================================
    // FORMAT CURRENCY
    // ============================================================
    function formatCurrency(value) {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value ?? 0);
    }

    // ============================================================
    // FORMAT TANGGAL TRANSAKSI
    // ============================================================
    function formatDate(value) {
        if (!value) return "-";

        return new Intl.DateTimeFormat("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(new Date(value));
    }
</script>

<template>
    <DataTable
        :value="sales"
        :loading="loading"
        size="small"
        lazy

        :sortField="sortField"
        :sortOrder="sortOrder"

        :rows="rows"
        :first="(page - 1) * rows"
        :totalRecords="totalRecords"

        @page="handlePage"
        @sort="handleSort"

        responsiveLayout="scroll"
        stripedRows
        showGridlines
        removableSort
        dataKey="id"

        :rowsPerPageOptions="[10,20,50,100]"

        paginator
        paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
    >

        <!-- Invoice -->
        <Column
            field="invoice_number"
            header="Invoice"
            sortable
        />

        <!-- Customer -->
        <Column
            field="customer_name"
            header="Customer"
            sortable
        />

        <!--Cashier-->
        <Column
            field="cashier_name"
            header="Cashier"
            sortable
        />

        <!--Grand total-->
        <Column
            field="grand_total"
            header="Total"
            sortable
        >
            <template #body="{ data }">
                {{ formatCurrency(data.grand_total) }}
            </template>
        </Column>

        <!-- Payment Method -->
        <Column
            field="payment_method"
            header="Method"
        />

        <!--Payment Status-->
        <Column
            field="payment_status"
            header="Status"
        >
            <template #body="{data}">
                <span class="status unpaid">
                    {{ data.payment_status }}
                </span>
            </template>
        </Column>

        <!--Created At-->
        <Column
            field="created_at"
            header="Date"
            sortable
        >
            <template #body="{data}">
                {{ formatDate(data.created_at) }}
            </template>
        </Column>   

        <!-- Action -->
        <Column
            header="Action"
            style="width: 60px"
        >
            <template #body="{ data }">
                <div class="action-buttons">
                    <Button
                        icon="pi pi-money-bill"
                        text
                        label="Pay"
                        rounded
                        severity="succes"
                        @click="handlePay(data)"
                    />
                </div>
            </template>
        </Column>

        <!-- emptymessage jika data search tidak ditemukan -->
        <template #empty>
            <div class="empty-state">
                <i class="pi pi-search empty-icon"></i>
                <div class="empty-title">
                    No unpaid transactions
                </div>
                <div class="empty-description">
                    There are currently no unpaid transactions.
                </div>
            </div>
        </template>
    </DataTable>
</template>

<style scoped>

.empty-state{
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    padding:48px 16px;
    color:#6b7280;
}

.empty-icon{
    font-size:2rem;
    margin-bottom:12px;
    color:#9ca3af;
}

.empty-title{
    font-size:16px;
    font-weight:600;
    color:#374151;
}

.empty-description{
    margin-top:4px;
    font-size:14px;
}

.action-buttons {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: nowrap;
    white-space: nowrap;
}

.status {
    display: inline-flex;
    align-items: center;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
}

.status.unpaid {
    background: #fff7ed;
    color: #c2410c;
}
</style>