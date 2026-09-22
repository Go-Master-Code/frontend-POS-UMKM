<script setup>
    import { formatCurrency } from "@/utils/formatter";
    import Column from "primevue/column"
    import DataTable from "primevue/datatable";

    // defineProps untuk hubungan dengan parent (ExpenseListView.vue)
    const props = defineProps({
        expenses: {
            type: Array,
            default: () => [],
        },
    });

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

    // func get item summary
    function getItemSummary(items) {
        if (!items?.length) {
            return "-";
        }

        const firstItems = items
            .slice(0, 2)
            .map((item) => item.description)
            .join(", ");

        if (items.length > 2) {
            return `${firstItems} +${items.length - 2} more`;
        }

        return firstItems;
    }
</script>

<template>
    <DataTable
        :value="expenses"
        dataKey="id"
        stripedRows
        responsiveLayout="scroll"
        emptyMessage="No expense data found."
    >
        <!--Expense Number-->
        <Column
            field="expense_number"
            header="Exp Number"
            sortable
        />

        <!-- Created At -->
        <Column
            field="created_at"
            header="Date"
            sortable
        >
            <template #body="{ data }">
                {{ formatDate(data.created_at) }}
            </template>
        </Column>

        <!--Payment Method-->
        <Column
            field="payment_method"
            header="Payment Method"
        >
            <template #body="{ data }">
                <span class="payment-method">
                    {{ data.payment_method }}
                </span>
            </template>
        </Column>

        <!--Items-->
        <Column
            header="Items"
        >
            <template #body="{data}">
                <div class="item-summary">
                    <span class="item-count">
                        {{ data.items?.length ?? 0 }} item(s)
                    </span>

                    <span
                        v-if="data.items?.length"
                        class="item-description"
                    >
                        {{ getItemSummary(data.items) }}
                    </span>
                </div>
            </template>
        </Column>

        <!--Total Amount-->
        <Column
            field="total_amount"
            header="Amount"
            sortable
            bodyClass="amount-column"
        >
            <template #body="{data}">
                {{ formatCurrency(data.total_amount) }}
            </template>
        </Column>

        <!-- emptymessage jika data search tidak ditemukan -->
        <template #empty>
            <div class="empty-state">
                <i class="pi pi-search empty-icon"></i>
                <div class="empty-title">
                    No expenses found
                </div>
                <div class="empty-description">
                    Try changing your search keyword.
                </div>
            </div>
        </template>
    </DataTable>
</template>

<style scoped>
/* CSS jika data pada table kosong */
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

.items-summary {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.item-count {
    font-size: 0.85rem;
    font-weight: 600;
}

.item-description {
    color: var(--p-text-muted-color);
    font-size: 0.85rem;
}

.payment-method {
    font-weight: 500;
}

.amount-column {
    text-align: right;
    font-weight: 600;
}
</style>