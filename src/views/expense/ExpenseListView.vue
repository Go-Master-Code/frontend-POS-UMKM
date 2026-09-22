<script setup>
    import { onMounted, ref, watch } from 'vue';
    import { useToast } from 'primevue/usetoast';

    // debounce search
    import { useDebounceFn } from '@vueuse/core';

    // import komponen primevue
    import Button from 'primevue/button';
    import InputText from 'primevue/inputtext';
    import Message from 'primevue/message';
    import Paginator from 'primevue/paginator';
    import Select from 'primevue/select';

    // import component table dan expense dialog
    import ExpenseTable from './components/ExpenseTable.vue';
    import ExpenseDialog from './components/ExpenseDialog.vue';
    /*
    import ExpenseTable
    import ExpenseDialog
    */
    
    // import API.js
    import { getAllExpenses } from '@/api/expense';

    // ========================================
    // STATE
    // ========================================
    const toast = useToast();

    const expenses = ref([]); // array
    const loading = ref(false); // bool
    const errorMessage = ref(""); // string

    const search = ref(""); // string
    const paymentMethod = ref(null);

    const page = ref(1);
    const limit = ref(10);
    const totalRecords = ref(0);

    const dialogVisible = ref(false);
    const selectedExpense = ref(null);

    // ========================================
    // OPTIONS
    // ========================================
    const paymentMethodOptions = [
        { label: "Cash", value: "CASH" },
        { label: "QRIS", value: "QRIS" },
        { label: "Transfer", value: "TRANSFER" },
    ];

    // ========================================
    // LOAD EXPENSES
    // ========================================
    async function loadExpenses() {
        console.log("loadExpenses() dipanggil");
        loading.value = true;
        errorMessage.value = "";

        try {
            const response = await getAllExpenses({
                page: page.value,
                limit: limit.value,
                search: search.value || undefined,
                payment_method: paymentMethod.value || undefined,
            });

            console.log("GET expenses response:", response);

            const result = response.data;

            expenses.value = result.data ?? [];
            totalRecords.value = result.total ?? 0;

            page.value = result.page ?? page.value;
            limit.value = result.limit ?? limit.value;
        } catch (error) {
            console.error(error);

            errorMessage.value =
                error.response?.data?.message ||
                "Failed to load expense data.";
        } finally {
            loading.value = false;
        }
    }

    // debounce digunakan agar ada transisi ketika search data
    const debouncedSearch = useDebounceFn(() => {
        page.value = 1;
        loadExpenses();
    }, 400);

    watch(search, () => {
        debouncedSearch();
    });

    // CLEAR SEARCH SAAT TOMBOL X diklik
    function clearSearch() {
        page.value = 1;
        search.value = "";
    }

    // ========================================
    // CREATE
    // ========================================
    function openCreateDialog() {
        dialogVisible.value = true;
    }

    // ========================================
    // SAVE
    // ========================================
    async function onExpenseSaved() {
        dialogVisible.value = false;
        selectedExpense.value = null;

        await loadExpenses();

        toast.add({
            severity: "success",
            summary: "Success",
            detail: "Expense saved successfully.",
            life: 3000,
        });
    }

    // ========================================
    // PAGINATION
    // ========================================

    function onPageChange(event) {
        page.value = event.page + 1;
        limit.value = event.rows;

        loadExpenses();
    }

    // ========================================
    // INITIAL LOAD
    // ========================================

    onMounted(() => {
        console.log("ExpenseListView mounted");
        loadExpenses();
    });
</script>

<template>
    <div class="card">
        <!--Page Header-->
        <div class="page-header">
            <div>
                <h2>Expenses</h2>
                <p class="page-description">
                    Manage expense transactions
                </p>
            </div>

            <Button
                label="Add Expense"
                icon="pi pi-plus"
                @click="openCreateDialog"
            />
        </div>

        <!--Filter-->
        <div class="filter-section">
            <div class="expense-search">
                <i class="pi pi-search search-icon" />

                <InputText
                    v-model="search"
                    placeholder="Search expense no. or amount..."
                    class="search-input"
                />

                <Button
                    v-if="search"
                    icon="pi pi-times"
                    text
                    rounded
                    severity="secondary"
                    class="clear-btn"
                    @click="clearSearch"
                />
            </div>

            <Select
                v-model="paymentMethod"
                :options="paymentMethodOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Payment Method"
                showClear
                class="payment-method-select"
                @change="loadExpenses"
            />

            <!-- BUTTON SEARCH INI SEBENARNYA TIDAK DIPERLUKAN LAGI
            <Button
                label="Search"
                icon="pi pi-search"
                severity="primary"
                @click="loadExpenses"
                class="search-button"
            /> -->
        </div>

        <Message
            v-if="errorMessage"
            severity="error"
            :closable="false"
        >
            {{ errorMessage }}
        </Message>

        <template v-else>
            <ExpenseTable
                :expenses="expenses"
                :loading="loading"
            />

            <Paginator
                v-if="totalRecords > 0"
                :rows="limit"
                :totalRecords="totalRecords"
                :first="(page - 1) * limit"
                :rowsPerPageOptions="[10, 20, 50]"
                @page="onPageChange"
            />
        </template>
    </div>

    <!--Expense Dialog-->
    <ExpenseDialog
        v-model:visible="dialogVisible"
        @saved="onExpenseSaved"
    />

</template>

<style scoped>
.page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
}

.page-header h2 {
    margin: 0;
}

.page-description {
    margin: 4px 0 0;
    color: var(--p-text-muted-color);
}

.filter-section {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
}

.expense-search {
    position: relative;
    width: 280px;
}

.search-input {
    width: 100%;
    height: 36px;
    padding-left: 36px;
    padding-right: 36px;
}

.search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
    z-index: 1;
}

.clear-btn {
    position: absolute;
    right: 4px;
    top: 50%;
    transform: translateY(-50%);
}

.payment-method-select {
    height: 36px;
}

.payment-method-select :deep(.p-select-label) {
    height: 36px;
    display: flex;
    align-items: center;
}

.search-button {
    height: 36px;
}

</style>