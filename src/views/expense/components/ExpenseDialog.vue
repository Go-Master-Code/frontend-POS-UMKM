<script setup>
    import { computed, onMounted, ref, watch } from 'vue';

    import Button from "primevue/button";
    import Dialog from "primevue/dialog";
    import InputNumber from "primevue/inputnumber";
    import InputText from "primevue/inputtext";
    import Select from "primevue/select";
    import Textarea from "primevue/textarea";
    import Message from "primevue/message";

    // import dari api.js
    import { createExpense } from '@/api/expense';
    // import category expense
    import { getAllExpenseCategories } from '@/api/expense_category';

    // defineProps untuk relasi dengan parent (ExpenseListView.vue)
    const props = defineProps({
        visible: {
            type: Boolean,
            default: false,
        },
    });

    const emit = defineEmits([
        "update:visible",
        "saved",
    ]);

    const paymentMethodOptions = [
        { label: "Cash", value: "CASH" },
        { label: "Transfer", value: "TRANSFER" },
        { label: "QRIS", value: "QRIS" },
    ];

    const expenseCategories = ref([]); // array

    const loadingCategories = ref(false);
    const loading = ref(false);

    const errorMessage = ref("");

    const form = ref({
        payment_method: null,
        notes: "",
        items: [],
    });

    // payload expense item
    const emptyItem = () => ({
        expense_category_id: null,
        description: "",
        qty: 1,
        unit: "",
        unit_price: 0,
    })

    // hitung total keseluruhan (+ all subtotal per row)
    const totalAmount = computed(() => {
        return form.value.items.reduce((total, item) => {
            return total + calculateSubtotal(item);
        }, 0);
    });

    function calculateSubtotal(item) {
        const qty = Number(item.qty) || 0;
        const unitPrice = Number(item.unit_price) || 0;
        
        // return subtotal = qty * unit price
        return qty * unitPrice
    }

    // add new row
    function addItem() {
        form.value.items.push(emptyItem());
    }

    // remove item from table
    function removeItem(index) {
        form.value.items.splice(index, 1);
    }

    function resetForm() {
        form.value = {
            payment_method: null,
            notes: "",
            items: [emptyItem()],
        };

        errorMessage.value = "";
    }

    // close dialog
    function closeDialog() {
        if (loading.value) {
            return;
        }

        emit("update:visible", false);
    }

    // load expense categories untuk ditampilkan di combobox
    async function loadCategories() {
        loadingCategories.value = true;

        try {
            const response = await getAllExpenseCategories({
                is_active: true, // ambil semua expense categories yang is_active nya true
            });

            const result = response.data;

            expenseCategories.value = result.data ?? [];
        } catch (error) {
            console.error(error);

         errorMessage.value =
            error.response?.data?.message ||
            "Failed to load expense categories.";
        } finally {
            loadingCategories.value = false;
        }
    }

    // validate form
    function validateForm() {
        if (!form.value.payment_method) {
            errorMessage.value = "Payment method is required.";
            return false;
        }

        if (!form.value.items.length) { // jika tidak ada expense item
            errorMessage.value = "At least one expense item is required."
            return false;
        }

        // looping ke tiap row data expense item
        for (let i = 0; i < form.value.items.length; i++) {
            const item = form.value.items[i];

            if (!item.expense_category_id) {
                errorMessage.value = `Expense category is required for item ${i + 1}.`;
                return false;
            }

            if (!item.description?.trim()) {
                errorMessage.value = `Description is required for item ${i + 1}.`;
                return false;
            }

            if (!item.qty || item.qty <=0 ) {
                errorMessage.value = `Qty must be greater than 0 for item ${i + 1}.`
                return false
            }

            if (!item.unit?.trim()) {
                errorMessage.value = `Unit is required for item ${i + 1}.`;
                return false;
            }

            if (!item.unit_price < 0) {
                errorMessage.value = `Unit price must be larger than 0 for item ${i + 1}.`;
                return false
            }
        }

        return true;
    }

    async function saveExpense() {
        errorMessage.value = "";

        if (!validateForm()) { // jika bernilai false
            return;
        }

        // jika bernilai true
        loading.value = true;

        try {
            const payload = {
                payment_method: form.value.payment_method,
                notes: form.value.notes,
                items: form.value.items.map((item) => ({
                    expense_category_id: item.expense_category_id,
                    description: item.description.trim(), // hilangkan spasi
                    qty: Number(item.qty),
                    unit: item.unit.trim(),
                    unit_price: Number(item.unit_price),
                })),
            };

            await createExpense(payload);

            emit("saved");
        } catch (error) {
            console.error(error);

            errorMessage.value =
                error.response?.data?.message ||
                "Failed to create expense.";
        } finally {
            loading.value = false;
        }
    }

    // watcher
    watch(
        () => props.visible,
        async (visible) => {
            if (visible) {
                resetForm();

                if (!expenseCategories.value.length) {
                    await loadCategories();
                }
            }
        }
    );

    // saat component di load
    onMounted(() => {
        if (props.visible) {
            resetForm();
            loadCategories();
        }
    });
</script>

<template>
    <Dialog
        :visible="visible"
        modal
        header="Add Expense"
        :style="{ width: '1000px' }"
        :closable="!loading"
        :closeOnEscape="!loading"
        @update:visible="emit('update:visible', $event)"
    >
        <Message
            v-if="errorMessage"
            severity="error"
            :closable="false"
            class="form-message"
        >
            {{ errorMessage }}
        </Message>

        <div class="form-section">
            <!-- Payment Method -->
            <div class="form-field">
                <label for="payment-method">
                    Payment Method
                    <span class="required">*</span>
                </label>

                <Select
                    id="payment-method"
                    v-model="form.payment_method"
                    :options="paymentMethodOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select payment method"
                    class="w-full"
                />
            </div>

            <!-- Expense Items -->
            <div class="items-section">
                <div class="section-header">
                    <h3>Expense Items</h3>

                    <Button
                        label="Add Item"
                        icon="pi pi-plus"
                        size="small"
                        severity="secondary"
                        @click="addItem"
                    />
                </div>

                <div
                    v-for="(item, index) in form.items"
                    :key="index"
                    class="expense-item"
                >
                    <div class="item-header">
                        <span>
                            Item {{ index + 1 }}
                        </span>

                        <Button
                            v-if="form.items.length > 1"
                            icon="pi pi-trash"
                            severity="danger"
                            text
                            rounded
                            size="small"
                            @click="removeItem(index)"
                        />
                    </div>

                    <div class="item-grid description-field">
                        <!-- Description -->
                        <div class="form-field description-field">
                            <label>
                                Description
                                <span class="required">*</span>
                            </label>

                            <InputText
                                v-model="item.description"
                                placeholder="e.g. Cooking oil"
                                class="w-full"
                            />
                        </div>

                        <!-- Category -->
                        <div class="form-field category-field">
                            <label>
                                Category
                                <span class="required">*</span>
                            </label>

                            <Select
                                v-model="item.expense_category_id"
                                :options="expenseCategories"
                                optionLabel="name"
                                optionValue="id"
                                placeholder="Select category"
                                :loading="loadingCategories"
                                class="w-full"
                            />
                        </div>

                        <!-- Qty -->
                        <div class="form-field qty-field">
                            <label>
                                Qty
                                <span class="required">*</span>
                            </label>

                            <InputNumber
                                v-model="item.qty"
                                :min="0"
                                :minFractionDigits="0"
                                :maxFractionDigits="3"
                                class="w-full"
                            />
                        </div>

                        <!-- Unit -->
                        <div class="form-field unit-field">
                            <label>
                                Unit
                                <span class="required">*</span>
                            </label>

                            <InputText
                                v-model="item.unit"
                                placeholder="e.g. pcs, kg, liter"
                                class="w-full"
                            />
                        </div>

                        <!-- Unit Price -->
                        <div class="form-field unit-price-field">
                            <label>
                                Unit Price
                                <span class="required">*</span>
                            </label>

                            <InputNumber
                                v-model="item.unit_price"
                                mode="currency"
                                currency="IDR"
                                locale="id-ID"
                                :min="0"
                                :minFractionDigits="0"
                                class="w-full"
                            />
                        </div>

                        <!-- Subtotal -->
                        <div class="form-field subtotal-field">
                            <label>
                                Subtotal
                            </label>

                            <InputNumber
                                :modelValue="calculateSubtotal(item)"
                                mode="currency"
                                currency="IDR"
                                locale="id-ID"
                                :minFractionDigits="0"
                                disabled
                                class="w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Total -->
            <div class="total-section">
                <span>Total Expense</span>

                <strong>
                    {{
                        new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            minimumFractionDigits: 0,
                        }).format(totalAmount)
                    }}
                </strong>
            </div>

            <!-- Notes -->
            <div class="form-field">
                <label for="expense-notes">
                    Notes
                </label>

                <Textarea
                    id="expense-notes"
                    v-model="form.notes"
                    rows="3"
                    placeholder="Additional notes..."
                    class="w-full"
                />
            </div>
        </div>

        <template #footer>
            <Button
                label="Cancel"
                severity="secondary"
                :disabled="loading"
                @click="closeDialog"
            />

            <Button
                label="Save Expense"
                icon="pi pi-save"
                :loading="loading"
                @click="saveExpense"
            />
        </template>
    </Dialog>
</template>

<style scoped>
.form-message {
    margin-bottom: 20px;
}

.form-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.form-field label {
    font-weight: 500;
}

.required {
    color: var(--p-red-500);
}

.items-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

/* Agar tombol Add Item sticky, tidak perlu scroll up tiap mau tambah item*/
.section-header {
    position: sticky;
    top: 0;
    z-index: 10;

    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 12px 0;
    background: var(--p-dialog-background);
}

.section-header h3 {
    margin: 0;
    font-size: 1rem;
}

.expense-item {
    padding: 20px;
    border: 1px solid var(--p-content-border-color);
    border-radius: 8px;
    box-sizing: border-box;
    width: 100%;
    overflow: hidden;
}

.item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    font-weight: 600;
}

.item-grid {
    display: grid;
    grid-template-columns: 2fr 1.5fr 0.8fr 1fr 1.4fr 1.4fr;
    gap: 12px;
}

.total-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-radius: 8px;
    background: var(--p-surface-100);
    font-size: 1.1rem;
}

.total-section strong {
    font-size: 1.2rem;
}

.w-full {
    width: 100%;
}

/* Ukuran manual lebar field di row expense item */
.unit-field {
    min-width: 120px;
}

.description-field {
    min-width: 180px;
}

.qty-field {
    min-width: 80px;
    max-width: 100px;
}

.qty-field :deep(.p-inputnumber) {
    width: 80px;
}

.qty-field :deep(.p-inputnumber-input) {
    width: 80px;
}

.unit-price-field {
    min-width: 140px;
    max-width: 160px;
}

.unit-price-field :deep(.p-inputnumber) {
    width: 140px;
}

.unit-price-field :deep(.p-inputnumber-input) {
    width: 140px;
}


.subtotal-field {
    min-width: 140px;
    max-width: 160px;
}

.subtotal-field :deep(.p-inputnumber) {
    width: 140px;
}

.subtotal-field :deep(.p-inputnumber-input) {
    width: 140px;
}

.category-field :deep(.p-select) {
    height: 36px;
    min-width: 180px;
    max-width: 180px;
}

@media (max-width: 1000px) {
    .item-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .description-field {
        grid-column: span 1;
    }
}

</style>